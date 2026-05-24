import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const schedRes = await client.query(`SELECT * FROM production_schedules WHERE id = $1`, [id]);
    if (!schedRes.rows.length) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    const schedule = schedRes.rows[0];

    if (schedule.status !== "Approved") {
      return NextResponse.json({ error: "Schedule must be Approved before generating PR" }, { status: 400 });
    }

    const existingPR = await client.query(`SELECT id FROM purchase_requests WHERE schedule_id = $1`, [id]);
    if (existingPR.rows.length) {
      return NextResponse.json({ error: "PR already exists for this schedule", pr_id: existingPR.rows[0].id }, { status: 409 });
    }

    const prRes = await client.query(
      `INSERT INTO purchase_requests (schedule_id, chef_id, total_pr_value, status)
       VALUES ($1,$2,$3,'Sent to Purchasing') RETURNING *`,
      [id, schedule.chef_id, schedule.total_estimated_hpp]
    );
    const prId = prRes.rows[0].id;

    const menusRes = await client.query(
      `SELECT sm.quantity_pax, sm.hpp_subtotal, r.menu_name, r.standard_cost
       FROM schedule_menus sm JOIN recipes r ON sm.recipe_id = r.id WHERE sm.schedule_id = $1`, [id]
    );

    for (const menu of menusRes.rows) {
      await client.query(
        `INSERT INTO pr_items (pr_id, item_name, quantity, uom, estimated_price, subtotal)
         VALUES ($1,$2,$3,'porsi',$4,$5)`,
        [prId, menu.menu_name, menu.quantity_pax, menu.standard_cost, menu.hpp_subtotal]
      );
    }
    await client.query("COMMIT");
    return NextResponse.json(prRes.rows[0], { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally { client.release(); }
}
