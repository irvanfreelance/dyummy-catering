import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT o.*, c.name as customer_name, u.name as pic_name,
        (SELECT json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'price', oi.price,
          'quantity', oi.quantity, 'discount', oi.discount, 'subtotal', oi.subtotal,
          'product_name', p.name
        )) FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id) as items
       FROM orders o JOIN customers c ON o.customer_id = c.id
       LEFT JOIN users u ON o.pic_id = u.id WHERE o.id = $1`, [id]
    );
    if (!res.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } finally { client.release(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status_order, status_payment, venue, order_notes, delivery_date } = body;
  const client = await pool.connect();
  try {
    const res = await client.query(
      `UPDATE orders SET status_order=$1, status_payment=$2, venue=$3, order_notes=$4,
       delivery_date=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
      [status_order, status_payment, venue, order_notes, delivery_date, id]
    );
    return NextResponse.json(res.rows[0]);
  } finally { client.release(); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM orders WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } finally { client.release(); }
}
