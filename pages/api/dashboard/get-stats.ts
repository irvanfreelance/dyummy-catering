import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Total Omset (YTD) & Total Biaya
    const { rows: financialRows } = await pool.query(`
      SELECT 
        COALESCE(SUM(grand_total), 0) AS total_omset,
        COALESCE(SUM(actual_cost), 0) AS total_biaya
      FROM orders
      WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    const totalOmset = Number(financialRows[0]?.total_omset || 0);
    const totalBiaya = Number(financialRows[0]?.total_biaya || 0);
    const netMargin = totalOmset > 0 ? ((totalOmset - totalBiaya) / totalOmset) * 100 : 0;

    // 2. Avg Closing Rate
    const { rows: leadStats } = await pool.query(`
      SELECT 
        COUNT(id) as total_leads,
        COUNT(CASE WHEN status = 'Closed Won' THEN 1 END) as closed_leads
      FROM leads
    `);
    const totalLeads = Number(leadStats[0]?.total_leads || 0);
    const closedLeads = Number(leadStats[0]?.closed_leads || 0);
    const avgClosingRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    // 3. Lead Sources (Pie Chart)
    const { rows: leadSources } = await pool.query(`
      SELECT source as name, COUNT(id) as value
      FROM leads
      GROUP BY source
    `);

    // 4. CS Performance (Bar Chart)
    const { rows: csPerformance } = await pool.query(`
      SELECT 
        u.name,
        COUNT(l.id) as total_handled,
        COUNT(CASE WHEN l.status = 'Closed Won' THEN 1 END) as total_closed
      FROM users u
      LEFT JOIN leads l ON u.id = l.pic_id
      WHERE u.role = 'CS / Sales'
      GROUP BY u.name
    `);
    
    const csPerformanceData = csPerformance.map(cs => {
      const handled = Number(cs.total_handled);
      const closed = Number(cs.total_closed);
      return {
        name: cs.name,
        closingRate: handled > 0 ? Math.round((closed / handled) * 100) : 0,
        target: 30
      };
    });

    res.status(200).json({
      financial: {
        totalOmset,
        totalBiaya,
        netMargin: Math.round(netMargin),
      },
      crm: {
        avgClosingRate: Math.round(avgClosingRate * 10) / 10,
        leadSources: leadSources.map(r => ({ name: r.name, value: Number(r.value) })),
        csPerformanceData
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
