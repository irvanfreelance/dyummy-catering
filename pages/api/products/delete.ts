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
    // Delete cascade handles recipes and order items, but wait, order items have ON DELETE RESTRICT in schema.
    // So if a product is used in an order, we can't delete it.
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ message: 'Cannot delete product because it is referenced in an order.' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
