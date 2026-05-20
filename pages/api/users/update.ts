import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, name, email, password, role, status } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    let query = `
      UPDATE users 
      SET name = COALESCE($1, name), 
          email = COALESCE($2, email), 
          role = COALESCE($3, role), 
          status = COALESCE($4, status),
          updated_at = CURRENT_TIMESTAMP
    `;
    const values: any[] = [name, email, role, status];

    if (password && password.trim() !== '') {
      query += `, password_hash = $5 WHERE id = $6 RETURNING id, name, email, role, status`;
      values.push(password, id);
    } else {
      query += ` WHERE id = $5 RETURNING id, name, email, role, status`;
      values.push(id);
    }

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === '23505') { // unique violation
      res.status(409).json({ message: 'Email sudah terdaftar' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
