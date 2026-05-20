import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.phone, 
        c.email, 
        c.type, 
        c.address, 
        c.notes,
        COUNT(o.id) as total_orders
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
