import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, name, phone, email, type, address, notes } = req.body;

  if (!id || !name || !phone) {
    return res.status(400).json({ message: 'ID, name, and phone are required' });
  }

  try {
    const { rows } = await pool.query(
      \`UPDATE customers 
       SET name = $1, phone = $2, email = $3, type = $4, address = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *\`,
      [name, phone, email, type, address, notes, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Phone number already exists on another customer' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
