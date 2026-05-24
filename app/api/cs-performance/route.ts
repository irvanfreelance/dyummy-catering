import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [year, mon] = month.split("-");

  const client = await pool.connect();
  try {
    // Monthly summary per CS
    const monthRes = await client.query(`
      SELECT
        u.id, u.name,
        COUNT(l.id) AS total_leads,
        COUNT(CASE WHEN l.status='Closing' THEN 1 END) AS total_closing,
        ROUND(COUNT(CASE WHEN l.status='Closing' THEN 1 END)::numeric / NULLIF(COUNT(l.id),0) * 100, 1) AS closing_rate
      FROM users u
      LEFT JOIN leads l ON l.pic_id = u.id
        AND EXTRACT(YEAR FROM l.lead_date) = $1
        AND EXTRACT(MONTH FROM l.lead_date) = $2
      WHERE u.role = 'CS / Sales' AND u.status = 'Aktif'
      GROUP BY u.id, u.name
      ORDER BY closing_rate DESC NULLS LAST`,
      [year, mon]
    );

    // Weekly breakdown (4 weeks of the month)
    const csIds = monthRes.rows.map((r: any) => r.id);
    const weeklyData: Record<number, any[]> = {};

    for (const csId of csIds) {
      const weeks = [];
      for (let w = 1; w <= 4; w++) {
        const dayFrom = (w - 1) * 7 + 1;
        const dayTo = w === 4 ? 31 : w * 7;
        const wRes = await client.query(`
          SELECT
            COUNT(*) AS leads,
            COUNT(CASE WHEN status='Closing' THEN 1 END) AS closing
          FROM leads
          WHERE pic_id = $1
            AND EXTRACT(YEAR FROM lead_date) = $2
            AND EXTRACT(MONTH FROM lead_date) = $3
            AND EXTRACT(DAY FROM lead_date) >= $4
            AND EXTRACT(DAY FROM lead_date) <= $5`,
          [csId, year, mon, dayFrom, dayTo]
        );
        const row = wRes.rows[0];
        const leads = Number(row.leads);
        const closing = Number(row.closing);
        weeks.push({
          week: `Pekan ${w}`,
          leads,
          closing,
          rate: leads > 0 ? Number(((closing / leads) * 100).toFixed(1)) : 0,
        });
      }
      weeklyData[csId] = weeks;
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
    const chartData = [1, 2, 3, 4].map((w) => {
      const row: Record<string, any> = { week: `Pekan ${w}` };
      for (const cs of csData) {
        row[cs.name.split(" ")[0]] = cs.weekly[w - 1]?.rate || 0;
      }
      return row;
    });

    return NextResponse.json({ csData, chartData, month });
  } finally { client.release(); }
}
