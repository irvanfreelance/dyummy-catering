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
        o.customer_id,
        to_char(o.order_date, 'YYYY-MM-DD') as date, 
        to_char(o.delivery_date, 'YYYY-MM-DD') as delivery_date, 
        c.name as customer, 
        c.phone, 
        o.venue,
        o.order_notes as notes,
        to_char(o.departure_time, 'HH24:MI') as time,
        o.status_order as status, 
        o.grand_total as total,
        string_agg(p.name, ', ') as package,
        sum(oi.quantity) as qty,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.price,
            'total_price', oi.subtotal
          )
        ) as items_json
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, c.name, c.phone
      ORDER BY o.delivery_date DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
