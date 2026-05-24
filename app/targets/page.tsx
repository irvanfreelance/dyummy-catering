"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageHeader, FormRow, FormField } from "@/components/ui/PageHeader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { fmt } from "@/lib/utils";

const C = { primary: "#1D9E75", danger: "#E24B4A", warning: "#BA7517", success: "#639922" };

const initTargets = [
  { id: 1, periode: "Mei 2026", jenis: "Revenue", target: 60000000, realisasi: 49200000, satuan: "Rp" },
  { id: 2, periode: "Mei 2026", jenis: "Closing Rate", target: 30, realisasi: 26.9, satuan: "%" },
  { id: 3, periode: "Mei 2026", jenis: "Order Count", target: 25, realisasi: 18, satuan: "order" },
  { id: 4, periode: "Mei 2026", jenis: "Gross Margin", target: 45, realisasi: 46.6, satuan: "%" },
  { id: 5, periode: "Mei 2026", jenis: "Lead Masuk", target: 100, realisasi: 90, satuan: "lead" },
];

// Gauge SVG component
function GaugeChart({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 45;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = arc - (pct / 100) * arc;
  const gaugeColor = pct >= 100 ? C.primary : pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={120} height={90} viewBox="0 0 110 82">
        <path d="M 10 78 A 45 45 0 1 1 100 78" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 78 A 45 45 0 1 1 100 78" fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={arc} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        <text x="55" y="68" textAnchor="middle" fontSize="15" fontWeight="700" fill={gaugeColor} fontFamily="inherit">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textAlign: "center" }}>{label}</p>
    </div>
  );
}

export default function TargetsPage() {
  const [targets, setTargets] = useState(initTargets);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ periode: "Mei 2026", jenis: "Revenue", target: "", realisasi: "", satuan: "Rp" });

  const openAdd = () => { setEditItem(null); setForm({ periode: "Mei 2026", jenis: "Revenue", target: "", realisasi: "", satuan: "Rp" }); setShowModal(true); };
  const openEdit = (t: any) => { setEditItem(t); setForm({ periode: t.periode, jenis: t.jenis, target: String(t.target), realisasi: String(t.realisasi), satuan: t.satuan }); setShowModal(true); };
  const handleDelete = (id: number) => setTargets((prev) => prev.filter((t) => t.id !== id));
  const handleSave = () => {
    if (editItem) {
      setTargets((prev) => prev.map((t) => t.id === editItem.id ? { ...t, ...form, target: Number(form.target), realisasi: Number(form.realisasi) } : t));
    } else {
      setTargets((prev) => [...prev, { id: Date.now(), ...form, target: Number(form.target), realisasi: Number(form.realisasi) }]);
    }
    setShowModal(false);
  };

  const chartData = targets.map((t) => ({
    name: t.jenis, Target: t.target, Realisasi: t.realisasi,
    pct: ((t.realisasi / t.target) * 100).toFixed(1),
  }));

  const fmtVal = (t: any, v: number) => t.satuan === "Rp" ? fmt(v) : v + (t.satuan || "");

  return (
    <div>
      <PageHeader
        title="Target & Realisasi"
        subtitle="CRUD target KPI, chart realisasi, dan scorecard capaian"
        actions={<button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Tambah Target</button>}
      />

      {/* Gauge Scorecard */}
      <div className="erp-card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Scorecard Capaian — Gauge Persentase</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
          {targets.map((t) => (
            <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px", border: "0.5px solid #f3f4f6", borderRadius: 10, background: "#fafafa" }}>
              <GaugeChart value={t.realisasi} max={t.target} label={t.jenis} />
              <div style={{ marginTop: 4, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#6b7280" }}>Real: <b style={{ color: "#1a1a1a" }}>{fmtVal(t, t.realisasi)}</b></p>
                <p style={{ fontSize: 11, color: "#6b7280" }}>Target: <b style={{ color: "#1a1a1a" }}>{fmtVal(t, t.target)}</b></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="erp-card">
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Chart Target vs Realisasi</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi" fill={C.primary} name="Realisasi" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="erp-card">
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Persentase Capaian (%)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 130]} tickFormatter={(v) => v + "%"} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v: any) => v + "%"} />
              <Bar dataKey="pct" name="Capaian %" radius={[0, 4, 4, 0]} fill={C.primary}
                label={{ position: "right", fontSize: 10, formatter: (v: any) => v + "%", fill: "#6b7280" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CRUD Table */}
      <div className="erp-card-flush">
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700 }}>Tabel Target KPI</p>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={12} /> Tambah</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Periode</th><th>KPI</th><th>Target</th><th>Realisasi</th><th>Capaian</th><th>Progress</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {targets.map((t) => {
                const pct = ((t.realisasi / t.target) * 100);
                const statusLabel = pct >= 100 ? "Tercapai" : pct >= 80 ? "Hampir" : pct >= 50 ? "On Track" : "Di Bawah";
                const statusColor = pct >= 100 ? "green" : pct >= 80 ? "teal" : pct >= 50 ? "yellow" : "red";
                const barColor = pct >= 100 ? C.primary : pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger;
                return (
                  <tr key={t.id}>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{t.periode}</td>
                    <td style={{ fontWeight: 600 }}>{t.jenis}</td>
                    <td style={{ fontWeight: 600 }}>{fmtVal(t, t.target)}</td>
                    <td style={{ fontWeight: 600, color: C.primary }}>{fmtVal(t, t.realisasi)}</td>
                    <td style={{ fontWeight: 700, color: barColor }}>{pct.toFixed(1)}%</td>
                    <td style={{ minWidth: 100 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: Math.min(pct, 100) + "%", background: barColor }} />
                      </div>
                    </td>
                    <td><Badge color={statusColor as any}>{statusLabel}</Badge></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}><Edit2 size={11} /></button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t.id)}><Trash2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editItem ? "Edit Target" : "Tambah Target KPI"}>
        <FormRow>
          <FormField label="Periode"><input value={form.periode} onChange={(e) => setForm((f) => ({ ...f, periode: e.target.value }))} placeholder="Mei 2026" /></FormField>
          <FormField label="Jenis KPI">
            <SearchableSelect 
              value={form.jenis} onChange={v => setForm((f) => ({ ...f, jenis: v }))}
              options={["Revenue", "Closing Rate", "Order Count", "Gross Margin", "Lead Masuk", "BPP %"].map(j => ({ value: j, label: j }))}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Target (Angka)"><input type="number" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} placeholder="60000000" /></FormField>
          <FormField label="Realisasi (Angka)"><input type="number" value={form.realisasi} onChange={(e) => setForm((f) => ({ ...f, realisasi: e.target.value }))} placeholder="49200000" /></FormField>
        </FormRow>
        <FormField label="Satuan" style={{ marginBottom: 14 }}>
          <SearchableSelect 
            value={form.satuan} onChange={v => setForm((f) => ({ ...f, satuan: v }))}
            options={[
              { value: "Rp", label: "Rp (Rupiah)" },
              { value: "%", label: "% (Persen)" },
              { value: "order", label: "order" },
              { value: "lead", label: "lead" }
            ]}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>{editItem ? "Update Target" : "Simpan Target"}</button>
        </div>
      </Modal>
    </div>
  );
}
