import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    // 1. Total Revenue from orders
    const revRes = await client.query(`SELECT SUM(grand_total) as total FROM orders WHERE status_order != 'Batal'`);
    const totalRevenue = Number(revRes.rows[0]?.total || 0);

    // 2. Leads today
    const leadRes = await client.query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status='Closing' THEN 1 END) as total_closing
      FROM leads WHERE DATE(lead_date) = CURRENT_DATE
    `);
    const totalLeadsToday = Number(leadRes.rows[0]?.total_leads || 0);
    const closingToday = Number(leadRes.rows[0]?.total_closing || 0);

    // 3. Follow Up needed
    const followupRes = await client.query(`SELECT COUNT(*) as count FROM leads WHERE status IN ('Follow Up', 'Negosiasi', 'Prospek')`);
    const followUp = Number(followupRes.rows[0]?.count || 0);

    // 4. Active Orders
    const orderRes = await client.query(`SELECT COUNT(*) as count FROM orders WHERE status_order IN ('Baru', 'Diproses')`);
    const activeOrders = Number(orderRes.rows[0]?.count || 0);

    // 5. P&L Chart (7 days)
    // We'll calculate Revenue from orders delivery_date, BPP from production_schedules actuals, Overhead from overheads
    // To make it simple, we aggregate by date over the last 7 days
    const chartRes = await client.query(`
      WITH dates AS (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS date
      ),
      rev AS (
        SELECT delivery_date as date, SUM(grand_total) as rev FROM orders WHERE status_order != 'Batal' GROUP BY delivery_date
      ),
      bpp AS (
        SELECT po.po_date as date, SUM(po.total_actual_cost) as bpp 
        FROM purchase_orders po
        WHERE po.status_po = 'Selesai Belanja'
        GROUP BY po.po_date
      ),
      ovh AS (
        SELECT expense_date as date, SUM(amount) as overhead FROM overheads GROUP BY expense_date
      )
      SELECT 
        TO_CHAR(d.date, 'DD Mon') as date_str,
        d.date,
        COALESCE(r.rev, 0) as revenue,
        COALESCE(b.bpp, 0) as bpp,
        COALESCE(o.overhead, 0) as overhead,
        COALESCE(r.rev, 0) - COALESCE(b.bpp, 0) - COALESCE(o.overhead, 0) as gross_profit,
        CASE WHEN COALESCE(r.rev, 0) > 0 THEN 
          ROUND(((COALESCE(r.rev, 0) - COALESCE(b.bpp, 0) - COALESCE(o.overhead, 0)) / COALESCE(r.rev, 0) * 100)::numeric, 1)
        ELSE 0 END as margin
      FROM dates d
      LEFT JOIN rev r ON d.date = r.date
      LEFT JOIN bpp b ON d.date = b.date
      LEFT JOIN ovh o ON d.date = o.date
      ORDER BY d.date ASC
    `);

    // 6. Alerts
    const schedAlertsRes = await client.query(`
      SELECT id, TO_CHAR(target_date, 'DD Mon YYYY') as target_date, total_estimated_hpp, budget_limit, status
      FROM production_schedules
      WHERE status = 'Overbudget Warning'
      LIMIT 5
    `);
    
    const poAlertsRes = await client.query(`
      SELECT id, variance_notes
      FROM purchase_orders
      WHERE status_cost = 'Overbudget'
      LIMIT 5
    `);

    return NextResponse.json({
      totalRevenue,
      totalLeadsToday,
      closingToday,
      followUp,
      activeOrders,
      plChart: chartRes.rows.map(r => ({
        date: r.date_str,
        revenue: Number(r.revenue),
        bpp: Number(r.bpp),
        overhead: Number(r.overhead),
        gross_profit: Number(r.gross_profit),
        margin: Number(r.margin)
      })),
      scheduleAlerts: schedAlertsRes.rows,
      poAlerts: poAlertsRes.rows
    });
  } finally {
    client.release();
  }
}
