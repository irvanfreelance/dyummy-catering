import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { date, source, name, phone, pic_id } = req.body;

  if (!date || !source || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Check if customer exists by phone, or create them
    let customerId;
    const { rows: existingCustomer } = await pool.query(
      'SELECT id FROM customers WHERE phone = $1',
      [phone]
    );

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
    } else {
      const { rows: newCustomer } = await pool.query(
        'INSERT INTO customers (name, phone, type) VALUES ($1, $2, $3) RETURNING id',
        [name || 'Anonim', phone, 'Personal']
      );
      customerId = newCustomer[0].id;
    }

    // 2. Create the lead
    const { rows: newLead } = await pool.query(
      \`INSERT INTO leads (customer_id, pic_id, lead_date, source, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *\`,
      [customerId, pic_id || 1, date, source, 'New Lead']
    );
    
    res.status(201).json(newLead[0]);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
