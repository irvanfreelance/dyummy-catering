import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { customer_id, order_date, delivery_date, venue, departure_time, notes, items } = req.body;
  // items should be [{ product_id, quantity, unit_price, total_price }]

  if (!customer_id || !delivery_date || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calculate grand_total
    const grand_total = items.reduce((sum: number, item: any) => sum + Number(item.total_price), 0);

    // Estimate cost (Standard cost from recipe * quantity)
    // For simplicity, we just use 70% of grand total as mock estimated budget if recipes aren't joined properly right now
    const est_budget = grand_total * 0.7;

    // Create Order
    const { rows: newOrder } = await client.query(
      `INSERT INTO orders (customer_id, order_date, delivery_date, venue, departure_time, order_notes, grand_total, estimated_budget, status_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [customer_id, order_date || new Date().toISOString(), delivery_date, venue, departure_time, notes, grand_total, est_budget, 'Baru']
    );

    const orderId = newOrder[0].id;

    // Create Order Items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(newOrder[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
