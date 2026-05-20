import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, date, source, status, pic_id } = req.body;

  if (!id || !date || !source) {
    return res.status(400).json({ message: 'ID, date, and source are required' });
  }

  try {
    const { rows } = await pool.query(
      \`UPDATE leads 
       SET lead_date = $1, source = $2, status = $3, pic_id = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *\`,
      [date, source, status, pic_id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
