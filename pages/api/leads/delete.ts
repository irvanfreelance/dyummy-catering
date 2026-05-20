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
    await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    if (error.code === '23503') { // Foreign key violation (e.g. from orders if they reference lead_id, though they don't in current schema, but just in case)
      res.status(400).json({ message: 'Cannot delete lead because it is referenced elsewhere.' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
