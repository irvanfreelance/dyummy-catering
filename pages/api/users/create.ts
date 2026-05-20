import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Mock hashing for now
  const password_hash = password; 

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status`,
      [name, email, password_hash, role, status || 'Aktif']
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // unique violation
      res.status(409).json({ message: 'Email sudah terdaftar' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
