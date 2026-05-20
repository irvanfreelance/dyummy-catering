import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id, customer_id, delivery_date, venue, departure_time, status_order, notes, items } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let grand_total = 0;
    let est_budget = 0;

    if (items && items.length > 0) {
      grand_total = items.reduce((sum: number, item: any) => sum + Number(item.total_price), 0);
      est_budget = grand_total * 0.7; // mockup estimate
    }

    const { rows } = await client.query(
      `UPDATE orders 
       SET delivery_date = COALESCE($1, delivery_date), 
           venue = COALESCE($2, venue), 
           departure_time = COALESCE($3, departure_time), 
           status_order = COALESCE($4, status_order), 
           order_notes = COALESCE($5, order_notes),
           customer_id = COALESCE($6, customer_id),
           grand_total = CASE WHEN $7 > 0 THEN $7 ELSE grand_total END,
           estimated_budget = CASE WHEN $8 > 0 THEN $8 ELSE estimated_budget END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [delivery_date, venue, departure_time, status_order, notes, customer_id, grand_total, est_budget, id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only update items if items array is passed
    if (items && items.length > 0) {
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, item.product_id, item.quantity, item.unit_price, item.total_price]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
