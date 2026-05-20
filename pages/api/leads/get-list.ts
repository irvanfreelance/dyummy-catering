import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT 
        l.id, 
        to_char(l.lead_date, 'YYYY-MM-DD') as date, 
        c.name, 
        c.phone, 
        l.source, 
        l.status, 
        u.name as pic
      FROM leads l
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON l.pic_id = u.id
      ORDER BY l.created_at DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
