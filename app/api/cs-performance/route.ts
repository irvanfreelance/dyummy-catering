import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const todayStr = new Date().toISOString().slice(0, 10);
  const mtdStr = todayStr.slice(0, 8) + '01'; // YYYY-MM-01
  const startDate = searchParams.get("startDate") || mtdStr;
  const endDate = searchParams.get("endDate") || todayStr;

  const client = await pool.connect();
  try {
    // 1. Daily Stats (now Range Stats)
    const dailyLeadsRes = await client.query(`SELECT COUNT(*) FROM leads WHERE lead_date >= $1 AND lead_date <= $2`, [startDate, endDate]);
    const dailyOrdersRes = await client.query(`SELECT COUNT(*) FROM orders WHERE order_date >= $1 AND order_date <= $2`, [startDate, endDate]);
    const dailyRevenueRes = await client.query(`SELECT SUM(grand_total) FROM orders WHERE order_date >= $1 AND order_date <= $2`, [startDate, endDate]);
    
    const dailyLeads = Number(dailyLeadsRes.rows[0].count) || 0;
    const dailyOrders = Number(dailyOrdersRes.rows[0].count) || 0;
    const dailyRevenue = Number(dailyRevenueRes.rows[0].sum) || 0;
    const closingRate = dailyLeads > 0 ? ((dailyOrders / dailyLeads) * 100).toFixed(1) : 0;

    const dailyStats = {
      leads: dailyLeads,
      orders: dailyOrders,
      closingRate: Number(closingRate),
      revenue: dailyRevenue
    };

    // 2. Recent Customers
    const recentCustomersRes = await client.query(`
      SELECT c.id, c.name, c.phone, 
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as total_order
      FROM customers c
      WHERE DATE(c.created_at) >= $1 AND DATE(c.created_at) <= $2
      ORDER BY c.created_at DESC LIMIT 5
    `, [startDate, endDate]);

    // 3. Recent Orders
    const recentOrdersRes = await client.query(`
      SELECT o.id, c.name as customer, o.grand_total as harga, o.delivery_date,
        (SELECT COALESCE(SUM(quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) as porsi
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.order_date >= $1 AND o.order_date <= $2
      ORDER BY o.created_at DESC LIMIT 5
    `, [startDate, endDate]);

    // Summary per CS (Range)
    const monthRes = await client.query(`
      SELECT
        u.id, u.name,
        COUNT(l.id) AS total_leads,
        COUNT(CASE WHEN l.status='Closing' THEN 1 END) AS total_closing,
        ROUND(COUNT(CASE WHEN l.status='Closing' THEN 1 END)::numeric / NULLIF(COUNT(l.id),0) * 100, 1) AS closing_rate
      FROM users u
      LEFT JOIN leads l ON l.pic_id = u.id
        AND l.lead_date >= $1 AND l.lead_date <= $2
      WHERE u.role = 'CS / Sales' AND u.status = 'Aktif'
      GROUP BY u.id, u.name
      ORDER BY closing_rate DESC NULLS LAST`,
      [startDate, endDate]
    );

    // Weekly breakdown inside range
    const weeklyChartRes = await client.query(`
      SELECT 
        date_trunc('week', l.lead_date)::date::text AS week_start,
        u.id as cs_id,
        u.name as cs_name,
        COUNT(l.id) as leads,
        COUNT(CASE WHEN l.status='Closing' THEN 1 END) as closing
      FROM users u
      LEFT JOIN leads l ON l.pic_id = u.id AND l.lead_date >= $1 AND l.lead_date <= $2
      WHERE u.role = 'CS / Sales' AND u.status = 'Aktif'
      GROUP BY date_trunc('week', l.lead_date), u.id, u.name
      ORDER BY week_start ASC
    `, [startDate, endDate]);

    const weeksSet = new Set<string>();
    weeklyChartRes.rows.forEach(r => { if (r.week_start) weeksSet.add(r.week_start); });
    const sortedWeeks = Array.from(weeksSet).sort();

    const weeklyData: Record<number, any[]> = {};
    for (const cs of monthRes.rows) {
      weeklyData[cs.id] = sortedWeeks.map((week_start, i) => {
        const row = weeklyChartRes.rows.find(r => r.cs_id === cs.id && r.week_start === week_start);
        const leads = row ? Number(row.leads) : 0;
        const closing = row ? Number(row.closing) : 0;
        return {
          week: `Pekan ${i + 1}`,
          leads,
          closing,
          rate: leads > 0 ? Number(((closing / leads) * 100).toFixed(1)) : 0
        };
      });
    }

    const csData = monthRes.rows.map((cs: any) => ({
      id: cs.id,
      name: cs.name,
      monthLeads: Number(cs.total_leads),
      monthClosing: Number(cs.total_closing),
      monthRate: Number(cs.closing_rate) || 0,
      weekly: weeklyData[cs.id] || [],
    }));

    // Chart data for line chart
    const chartData = sortedWeeks.map((week_start, i) => {
      const row: Record<string, any> = { week: `Pekan ${i + 1}` };
      for (const cs of csData) {
        row[cs.name.split(" ")[0]] = cs.weekly[i]?.rate || 0;
      }
      return row;
    });

    return NextResponse.json({ 
      csData, 
      chartData, 
      dailyStats,
      recentCustomers: recentCustomersRes.rows,
      recentOrders: recentOrdersRes.rows,
      startDate,
      endDate
    });
  } finally { client.release(); }
}
