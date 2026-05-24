"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageHeader, FormRow, FormField } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { statusBadgeColor } from "@/lib/utils";
import { exportToExcel } from "@/lib/export";

const STATUSES = ["Prospek","Follow Up","Negosiasi","Konfirmasi","Closing","Reject"];
const SOURCES = ["WhatsApp","Instagram","Website","Referral","Walk-in"];

export default function LeadsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSource, setFSource] = useState("");
  const [fPic, setFPic] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");

  const [form, setForm] = useState({ customer_id: "", pic_id: "", lead_date: new Date().toISOString().split("T")[0], source: "WhatsApp", status: "Prospek", tags: "", notes: "" });

  const buildQs = useCallback((page = 1, lim = meta.limit) => {
    const p = new URLSearchParams({ page: String(page), limit: String(lim) });
    if (search) p.set("search", search);
    if (fStatus) p.set("status", fStatus);
    if (fSource) p.set("source", fSource);
    if (fPic) p.set("pic_id", fPic);
    if (fDateFrom) p.set("date_from", fDateFrom);
    if (fDateTo) p.set("date_to", fDateTo);
    return p.toString();
  }, [search, fStatus, fSource, fPic, fDateFrom, fDateTo]);

  const fetchLeads = useCallback((page = 1, lim = meta.limit) => {
    setLoading(true);
    fetch(`/api/leads?${buildQs(page, lim)}`)
      .then(r => r.json())
      .then(d => { setRows(d.data || []); setMeta({ total: d.total, page: d.page, limit: d.limit, totalPages: d.totalPages }); })
      .finally(() => setLoading(false));
  }, [buildQs, meta.limit]);

  useEffect(() => { fetchLeads(1, meta.limit); }, [fetchLeads]);

  useEffect(() => {
    fetch("/api/customers?limit=100").then(r => r.json()).then(d => setCustomers(d.data || []));
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  const handleSave = async () => {
    if (!form.customer_id) return alert("Pilih customer");
    const url = editItem ? `/api/leads/${editItem.id}` : "/api/leads";
    const method = editItem ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); setEditItem(null); fetchLeads(1); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/leads/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchLeads(meta.page, meta.limit);
  };

  const statusCounts: Record<string, number> = {};
  STATUSES.forEach(s => { statusCounts[s] = 0; });

  const handleExport = async () => {
    const p = new URLSearchParams({ page: "1", limit: "1000" });
    if (search) p.set("search", search);
    if (fStatus) p.set("status", fStatus);
    if (fSource) p.set("source", fSource);
    if (fPic) p.set("pic_id", fPic);
    if (fDateFrom) p.set("date_from", fDateFrom);
    if (fDateTo) p.set("date_to", fDateTo);
    const res = await fetch(`/api/leads?${p}`);
    const d = await res.json();
    exportToExcel(d.data || [], "Data_Leads");
  };
  
  return (
    <div>
      <PageHeader title="Lead Harian" subtitle={`${meta.total} total leads — semua terhubung database`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Excel</button>
            <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ customer_id: "", pic_id: "", lead_date: new Date().toISOString().split("T")[0], source: "WhatsApp", status: "Prospek", tags: "", notes: "" }); setShowModal(true); }}><Plus size={14} /> Tambah Lead</button>
          </div>
        }
      />

      {/* Filters */}
      <div className="erp-card" style={{ marginBottom: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama, tag, catatan..." style={{ width: 200 }} />
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ width: 140 }}>
            <option value="">Semua Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={fSource} onChange={e => setFSource(e.target.value)} style={{ width: 140 }}>
            <option value="">Semua Sumber</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={fPic} onChange={e => setFPic(e.target.value)} style={{ width: 160 }}>
            <option value="">Semua CS</option>
            {users.filter((u: any) => u.role === "CS / Sales").map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} style={{ width: 140 }} title="Dari tanggal" />
          <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} style={{ width: 140 }} title="Sampai tanggal" />
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setFStatus(""); setFSource(""); setFPic(""); setFDateFrom(""); setFDateTo(""); }}>Reset</button>
        </div>
      </div>

      {/* Status Summary Badges */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {STATUSES.map(s => {
          const cnt = rows.filter((r: any) => r.status === s).length;
          return (
            <button key={s} onClick={() => setFStatus(fStatus === s ? "" : s)}
              className="badge" style={{ cursor: "pointer", opacity: fStatus && fStatus !== s ? 0.4 : 1 }}
              data-color={statusBadgeColor(s)}>
              {s}: {cnt}
            </button>
          );
        })}
      </div>

      <div className="erp-card-flush">
        {loading ? <p style={{ padding: 24, color: "#6b7280", fontSize: 13 }}>Memuat...</p> : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>No.</th><th>Tanggal</th><th>Customer</th><th>Sumber</th><th>Status</th><th>CS PIC</th><th>Tags</th><th>Catatan</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Tidak ada data</td></tr>
                  ) : rows.map((r: any, idx: number) => (
                    <tr key={r.id}>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{(meta.page - 1) * meta.limit + idx + 1}</td>
                      <td style={{ fontSize: 12 }}>{String(r.lead_date).slice(0, 10)}</td>
                      <td style={{ fontWeight: 500 }}>{r.customer_name}</td>
                      <td><Badge color="blue">{r.source}</Badge></td>
                      <td>
                        <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                          style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, width: "auto", color: r.status === "Closing" ? "#1D9E75" : r.status === "Reject" ? "#E24B4A" : "#374151" }}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: 12 }}>{r.pic_name || "-"}</td>
                      <td style={{ fontSize: 11 }}>{r.tags || "-"}</td>
                      <td style={{ fontSize: 11, color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes || "-"}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(r); setForm({ customer_id: r.customer_id, pic_id: r.pic_id || "", lead_date: String(r.lead_date).slice(0,10), source: r.source, status: r.status, tags: r.tags || "", notes: r.notes || "" }); setShowModal(true); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination 
              page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} 
              onChange={(p) => fetchLeads(p, meta.limit)} 
              onLimitChange={(lim) => fetchLeads(1, lim)}
            />
          </>
        )}
      </div>

      <Modal show={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Lead" : "Tambah Lead"}>
        <FormRow>
          <FormField label="Customer">
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">-- Pilih --</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="CS PIC">
            <select value={form.pic_id} onChange={e => setForm(f => ({ ...f, pic_id: e.target.value }))}>
              <option value="">-- Pilih CS --</option>
              {users.filter((u: any) => u.role === "CS / Sales").map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Tanggal Lead"><input type="date" value={form.lead_date} onChange={e => setForm(f => ({ ...f, lead_date: e.target.value }))} /></FormField>
          <FormField label="Sumber">
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Status">
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Tags"><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="pernikahan, korporat..." /></FormField>
        </FormRow>
        <FormField label="Catatan" style={{ marginBottom: 14 }}>
          <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>{editItem ? "Update" : "Simpan"}</button>
        </div>
      </Modal>
    </div>
  );
}
