"use client";
import { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { fmt, statusBadgeColor } from "@/lib/utils";
import { exportToExcel } from "@/lib/export";
import { Badge } from "@/components/ui/Badge";

const STATUS_PO = ["Menunggu Belanja", "Diproses", "Selesai Belanja"];
const STATUS_COST = ["Safe", "Overbudget"];

export default function PurchasingPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [fStatusPO, setFStatusPO] = useState("");
  const [fStatusCost, setFStatusCost] = useState("");

  const buildQs = useCallback((page = 1, lim = meta.limit) => {
    const p = new URLSearchParams({ page: String(page), limit: String(lim) });
    if (fStatusPO) p.set("status_po", fStatusPO);
    if (fStatusCost) p.set("status_cost", fStatusCost);
    return p.toString();
  }, [fStatusPO, fStatusCost]);

  const fetchPOs = useCallback((page = 1, lim = meta.limit) => {
    setLoading(true);
    fetch(`/api/purchase-orders?${buildQs(page, lim)}`)
      .then(r => r.json())
      .then(d => { setRows(d.data || []); setMeta({ total: d.total, page: d.page, limit: d.limit, totalPages: d.totalPages }); })
      .finally(() => setLoading(false));
  }, [buildQs, meta.limit]);

  useEffect(() => { fetchPOs(1, meta.limit); }, [fetchPOs]);

  const handleExport = async () => {
    const p = new URLSearchParams({ page: "1", limit: "1000" });
    if (fStatusPO) p.set("status_po", fStatusPO);
    if (fStatusCost) p.set("status_cost", fStatusCost);
    const res = await fetch(`/api/purchase-orders?${p}`);
    const d = await res.json();
    exportToExcel(d.data || [], "Data_PurchaseOrders");
  };

  return (
    <div>
      <PageHeader title="Purchasing & Cost Control" subtitle={`${meta.total} dokumen PO terdaftar`} 
        actions={<button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Excel</button>}
      />

      <div className="erp-card" style={{ marginBottom: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={fStatusPO} onChange={e => setFStatusPO(e.target.value)} style={{ width: 180 }}>
            <option value="">Semua Status PO</option>
            {STATUS_PO.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={fStatusCost} onChange={e => setFStatusCost(e.target.value)} style={{ width: 180 }}>
            <option value="">Semua Status Biaya</option>
            {STATUS_COST.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFStatusPO(""); setFStatusCost(""); }}>Reset</button>
        </div>
      </div>

      <div className="erp-card-flush">
        {loading ? <p style={{ padding: 24, color: "#6b7280", fontSize: 13 }}>Memuat...</p> : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>No.</th><th>PO No</th><th>Tgl PO</th><th>Untuk Prod.</th><th>Estimasi (PR)</th><th>Aktual Belanja</th><th>Variance</th><th>Cost Status</th><th>Status Belanja</th><th>PIC Finance</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Tidak ada dokumen PO</td></tr>
                  ) : rows.map((r: any, idx: number) => {
                    const variance = Number(r.estimated_cost) - Number(r.total_actual_cost);
                    const isOver = variance < 0;
                    return (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12, color: "#6b7280" }}>{(meta.page - 1) * meta.limit + idx + 1}</td>
                        <td style={{ fontWeight: 700, fontSize: 12, color: "#378ADD" }}>PO-{String(r.id).padStart(4, "0")}</td>
                        <td style={{ fontSize: 12 }}>{String(r.po_date).slice(0, 10)}</td>
                        <td style={{ fontSize: 12, color: "#6b7280" }}>{String(r.target_date).slice(0, 10)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(r.estimated_cost)}</td>
                        <td style={{ fontWeight: 700, color: r.total_actual_cost > 0 ? (isOver ? "#E24B4A" : "#1D9E75") : "#6b7280" }}>{fmt(r.total_actual_cost)}</td>
                        <td style={{ fontWeight: 700, color: isOver ? "#E24B4A" : "#1D9E75" }}>{r.total_actual_cost > 0 ? (isOver ? "" : "+") + fmt(variance) : "-"}</td>
                        <td><Badge color={statusBadgeColor(r.status_cost)}>{r.status_cost}</Badge></td>
                        <td><Badge color={statusBadgeColor(r.status_po)}>{r.status_po}</Badge></td>
                        <td style={{ fontSize: 12 }}>{r.finance_name || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination 
              page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} 
              onChange={(p) => fetchPOs(p, meta.limit)} 
              onLimitChange={(lim) => fetchPOs(1, lim)}
            />
          </>
        )}
      </div>
    </div>
  );
}
