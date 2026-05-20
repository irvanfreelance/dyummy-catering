import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, product_id, ingredients, standard_cost } = req.body;

  if (!id || !product_id || !ingredients || !standard_cost) {
    return res.status(400).json({ message: 'ID, product_id, ingredients, and standard cost are required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE recipes 
       SET product_id = $1, ingredients = $2, standard_cost = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [product_id, ingredients, standard_cost, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
