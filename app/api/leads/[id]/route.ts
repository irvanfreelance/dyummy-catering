import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT l.*, c.name as customer_name, u.name as pic_name
       FROM leads l JOIN customers c ON l.customer_id = c.id
       LEFT JOIN users u ON l.pic_id = u.id
       WHERE l.id = $1`, [id]
    );
    if (!result.rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } finally { client.release(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status, tags, notes, pic_id } = body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE leads SET status=$1, tags=$2, notes=$3, pic_id=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [status, tags, notes, pic_id, id]
    );
    return NextResponse.json(result.rows[0]);
  } finally { client.release(); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM leads WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } finally { client.release(); }
}
