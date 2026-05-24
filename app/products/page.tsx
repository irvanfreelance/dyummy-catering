"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageHeader, FormRow, FormField } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { fmt } from "@/lib/utils";
import { exportToExcel } from "@/lib/export";

const CATEGORIES = ["Nasi Box", "Snack Box", "Prasmanan", "Tumpeng", "Coffee Break"];

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [form, setForm] = useState({ name: "", category: "Nasi Box", price: 0, description: "", status: "Aktif" });

  const buildQs = useCallback((page = 1, lim = meta.limit) => {
    const p = new URLSearchParams({ page: String(page), limit: String(lim) });
    if (search) p.set("search", search);
    if (fCategory) p.set("category", fCategory);
    return p.toString();
  }, [search, fCategory]);

  const fetchProducts = useCallback((page = 1, lim = meta.limit) => {
    setLoading(true);
    fetch(`/api/products?${buildQs(page, lim)}`)
      .then(r => r.json())
      .then(d => { setRows(d.data || []); setMeta({ total: d.total, page: d.page, limit: d.limit, totalPages: d.totalPages }); })
      .finally(() => setLoading(false));
  }, [buildQs, meta.limit]);

  useEffect(() => { fetchProducts(1, meta.limit); }, [fetchProducts]);

  const handleSave = async () => {
    if (!form.name || form.price <= 0) return alert("Nama dan harga wajib diisi valid");
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); setForm({ name: "", category: "Nasi Box", price: 0, description: "", status: "Aktif" }); fetchProducts(meta.page); }
  };

  const handleExport = async () => {
    const p = new URLSearchParams({ page: "1", limit: "1000" });
    if (search) p.set("search", search);
    if (fCategory) p.set("category", fCategory);
    const res = await fetch(`/api/products?${p}`);
    const d = await res.json();
    exportToExcel(d.data || [], "Data_Products");
  };

  return (
    <div>
      <PageHeader title="Katalog Produk" subtitle={`${meta.total} produk terdaftar`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Excel</button>
            <button className="btn btn-primary" onClick={() => { setForm({ name: "", category: "Nasi Box", price: 0, description: "", status: "Aktif" }); setShowModal(true); }}><Plus size={14} /> Tambah Produk</button>
          </div>
        }
      />

      <div className="erp-card" style={{ marginBottom: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama produk..." style={{ width: 250 }} />
          <SearchableSelect 
            value={fCategory} onChange={setFCategory} 
            options={[{ value: "", label: "Semua Kategori" }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} 
            style={{ width: 160 }} 
          />
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setFCategory(""); }}>Reset</button>
        </div>
      </div>

      <div className="erp-card-flush">
        {loading ? <p style={{ padding: 24, color: "#6b7280", fontSize: 13 }}>Memuat...</p> : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>No.</th><th>ID</th><th>Nama Produk</th><th>Kategori</th><th>Harga Jual</th><th>Deskripsi</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Tidak ada produk</td></tr>
                  ) : rows.map((r: any, idx: number) => (
                    <tr key={r.id}>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{(meta.page - 1) * meta.limit + idx + 1}</td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>PRD-{String(r.id).padStart(3, "0")}</td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td><Badge color="blue">{r.category}</Badge></td>
                      <td style={{ fontWeight: 600, color: "#1D9E75" }}>{fmt(r.price)}</td>
                      <td style={{ fontSize: 11, color: "#6b7280", maxWidth: 200, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{r.description || "-"}</td>
                      <td><Badge color={r.status === "Aktif" ? "green" : "red"}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination 
              page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} 
              onChange={(p) => fetchProducts(p, meta.limit)} 
              onLimitChange={(lim) => fetchProducts(1, lim)}
            />
          </>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Tambah Produk">
        <FormRow>
          <FormField label="Nama Produk"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormField>
          <FormField label="Kategori">
            <SearchableSelect 
              value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Harga Jual (Rp)"><input type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} /></FormField>
          <FormField label="Status">
            <SearchableSelect 
              value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))}
              options={["Aktif", "Nonaktif"].map(s => ({ value: s, label: s }))}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
        </FormRow>
        <FormField label="Deskripsi" style={{ marginBottom: 14 }}>
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
