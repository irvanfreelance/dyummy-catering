import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, phone, email, type, address, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (name, phone, email, type, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, phone, email, type, address, notes]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
