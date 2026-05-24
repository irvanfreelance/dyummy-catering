"use client";
import { useEffect, useState, Fragment } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, BarChart2, Target } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

const C = { primary: "#1D9E75", danger: "#E24B4A", warning: "#BA7517", secondary: "#378ADD", purple: "#7F77DD" };
const COLORS = [C.primary, C.danger, C.secondary, C.purple, C.warning];

export default function CSPerformancePage() {
  const [data, setData] = useState<any>({ csData: [], chartData: [] });
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cs-performance?month=${month}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [month]);

  const { csData = [], chartData = [] } = data;
  const best = csData.length ? csData.reduce((a: any, b: any) => a.monthRate > b.monthRate ? a : b) : null;
  const worst = csData.length ? csData.reduce((a: any, b: any) => a.monthRate < b.monthRate ? a : b) : null;
  const avgRate = csData.length ? (csData.reduce((s: number, c: any) => s + c.monthRate, 0) / csData.length).toFixed(1) : "0";
  const totalClosing = csData.reduce((s: number, c: any) => s + c.monthClosing, 0);

  return (
    <div>
      <PageHeader title="Performa CS" subtitle="Closing rate & evaluasi per CS — dari database real"
        actions={
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px", fontSize: 13 }} />
        }
      />

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 82, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 16 }}>
          <StatCard label="CS Terbaik" value={best?.name?.split(" ")[0] || "-"} sub={`CR: ${best?.monthRate || 0}%`} icon={TrendingUp} color={C.primary} />
          <StatCard label="Perlu Perhatian" value={worst?.name?.split(" ")[0] || "-"} sub={`CR: ${worst?.monthRate || 0}%`} icon={AlertTriangle} color={C.danger} />
          <StatCard label="Avg Closing Rate" value={avgRate + "%"} sub="Target: ≥30%" icon={BarChart2} color={C.secondary} />
          <StatCard label="Total Closing" value={totalClosing + " order"} icon={Target} color={C.purple} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="erp-card">
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Tren Closing Rate (%) per Pekan</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 60]} tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => Number(v).toFixed(1) + "%"} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {csData.map((cs: any, i: number) => (
                  <Line key={cs.id} type="monotone" dataKey={cs.name.split(" ")[0]}
                    stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }}
                    strokeDasharray={i > 0 ? "4 2" : undefined} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "#6b7280", fontSize: 12 }}>Tidak ada data</p>}
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Target minimum: 30% (garis batas)</p>
        </div>

        <div className="erp-card">
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Ringkasan Bulanan</p>
          <table>
            <thead><tr><th>CS</th><th>Lead</th><th>Closing</th><th>Rate</th><th>Status</th></tr></thead>
            <tbody>
              {csData.map((cs: any) => {
                const r = cs.monthRate;
                const perf = r >= 30 ? { label: "Bagus", color: "green" as const } : r >= 25 ? { label: "Standar", color: "yellow" as const } : { label: "Under Perform", color: "red" as const };
                return (
                  <tr key={cs.id}>
                    <td style={{ fontWeight: 500 }}>{cs.name}</td>
                    <td style={{ textAlign: "center" }}>{cs.monthLeads}</td>
                    <td style={{ textAlign: "center" }}>{cs.monthClosing}</td>
                    <td style={{ fontWeight: 700, color: r >= 30 ? C.primary : r >= 25 ? C.warning : C.danger }}>{r}%</td>
                    <td><Badge color={perf.color}>{perf.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {csData.filter((c: any) => c.monthRate < 25 && c.monthLeads > 0).map((cs: any) => (
            <div key={cs.id} className="alert-danger" style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#A32D2D" }}>⚠ Alert: {cs.name}</p>
              <p style={{ fontSize: 11, color: "#A32D2D", marginTop: 4 }}>
                CR {cs.monthRate}% — di bawah target 30%. Jadwalkan coaching 1-on-1.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Detail */}
      <div className="erp-card">
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Detail Per Pekan</p>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nama CS</th>
                {[1, 2, 3, 4].map(w => (
                  <Fragment key={`wk-${w}`}>
                    <th>P{w} Lead</th>
                    <th>Closing</th>
                    <th>Rate</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {csData.map((cs: any) => (
                <tr key={cs.id}>
                  <td style={{ fontWeight: 600 }}>{cs.name}</td>
                  {(cs.weekly || []).map((w: any, i: number) => (
                    <Fragment key={`cell-${cs.id}-${i}`}>
                      <td style={{ textAlign: "center" }}>{w.leads}</td>
                      <td style={{ textAlign: "center" }}>{w.closing}</td>
                      <td style={{ textAlign: "center", fontWeight: 600, color: w.rate >= 30 ? C.primary : w.rate >= 25 ? C.warning : C.danger }}>
                        {w.rate}%
                      </td>
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
