import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT pr.*, u.name as chef_name, ps.target_date,
        (SELECT json_agg(json_build_object(
          'id', pi.id, 'item_name', pi.item_name, 'quantity', pi.quantity,
          'uom', pi.uom, 'estimated_price', pi.estimated_price, 'subtotal', pi.subtotal
        )) FROM pr_items pi WHERE pi.pr_id = pr.id) as items
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.chef_id = u.id
      LEFT JOIN production_schedules ps ON pr.schedule_id = ps.id
      ORDER BY pr.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } finally { client.release(); }
}
