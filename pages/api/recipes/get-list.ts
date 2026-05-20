import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT r.id, p.id as product_id, p.name as product_name, r.ingredients, r.standard_cost, p.price as selling_price
      FROM recipes r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
