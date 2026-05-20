import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, actual_cost, status_cost } = req.body;

  if (!id || actual_cost === undefined) {
    return res.status(400).json({ message: 'ID and actual_cost are required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE orders 
       SET actual_cost = $1, 
           status_cost = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [actual_cost, status_cost, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error updating order cost:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
