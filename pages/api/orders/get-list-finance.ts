import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        o.id, 
        to_char(o.delivery_date, 'YYYY-MM-DD') as date,
        c.name as customer, 
        string_agg(p.name, ', ') as package,
        o.grand_total as revenue,
        o.estimated_budget as "estBudget",
        o.actual_cost as "actualCost",
        o.status_cost as "statusCost"
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, c.name
      ORDER BY o.delivery_date DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching finance orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
