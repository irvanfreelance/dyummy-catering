import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { product_id, ingredients, standard_cost } = req.body;

  if (!product_id || !ingredients || !standard_cost) {
    return res.status(400).json({ message: 'Product ID, ingredients, and standard cost are required' });
  }

  try {
    const { rows } = await pool.query(
      \`INSERT INTO recipes (product_id, ingredients, standard_cost)
       VALUES ($1, $2, $3) RETURNING *\`,
      [product_id, ingredients, standard_cost]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    if (error.code === '23505') { // Unique violation if any, though not enforced by schema. 
      // Typically a product should have only 1 recipe. We don't have a unique constraint, but good to know.
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
