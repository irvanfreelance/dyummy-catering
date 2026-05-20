import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === '23503') { // foreign key violation
      res.status(409).json({ message: 'User tidak dapat dihapus karena masih terkait dengan data lain (misal: order/lead).' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
