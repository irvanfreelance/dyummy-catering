import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, category, description, price, status } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const { rows } = await pool.query(
      \`INSERT INTO products (name, category, description, price, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *\`,
      [name, category, description, price, status || 'Aktif']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
