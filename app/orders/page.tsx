"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Printer, Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageHeader, FormRow, FormField } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { fmt, statusBadgeColor } from "@/lib/utils";
import { exportToExcel } from "@/lib/export";

const STATUS_ORDER = ["Baru","Diproses","Selesai","Batal"];
const STATUS_PAY = ["Belum Lunas","DP 50%","Lunas"];

const emptyItem = () => ({ product_id: "", product_name: "", price: 0, quantity: 50, discount: 0, subtotal: 0 });
const emptyForm = () => ({ customer_id: "", pic_id: "", order_date: new Date().toISOString().split("T")[0], delivery_date: "", departure_time: "", venue: "", order_notes: "", status_payment: "Belum Lunas", items: [emptyItem()] });

export default function OrdersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [fStatus, setFStatus] = useState("");
  const [fPay, setFPay] = useState("");
  const [search, setSearch] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");

  const buildQs = useCallback((page = 1, lim = meta.limit) => {
    const p = new URLSearchParams({ page: String(page), limit: String(lim) });
    if (search) p.set("search", search);
    if (fStatus) p.set("status_order", fStatus);
    if (fPay) p.set("status_payment", fPay);
    if (fDateFrom) p.set("date_from", fDateFrom);
    if (fDateTo) p.set("date_to", fDateTo);
    return p.toString();
  }, [search, fStatus, fPay, fDateFrom, fDateTo]);

  const fetchOrders = useCallback((page = 1, lim = meta.limit) => {
    setLoading(true);
    fetch(`/api/orders?${buildQs(page, lim)}`)
      .then(r => r.json())
      .then(d => { setRows(d.data || []); setMeta({ total: d.total, page: d.page, limit: d.limit, totalPages: d.totalPages }); })
      .finally(() => setLoading(false));
  }, [buildQs, meta.limit]);

  useEffect(() => { fetchOrders(1, meta.limit); }, [fetchOrders]);

  useEffect(() => {
    fetch("/api/customers?limit=100").then(r => r.json()).then(d => setCustomers(d.data || []));
    fetch("/api/users").then(r => r.json()).then(setUsers);
    fetch("/api/products?limit=100").then(r => r.json()).then(d => setProducts(d.data || []));
  }, []);

  const totalRevenue = rows.reduce((s, o) => s + Number(o.grand_total || 0), 0);
  const activeCount = rows.filter(o => o.status_order !== "Selesai" && o.status_order !== "Batal").length;
  const unpaidCount = rows.filter(o => o.status_payment === "Belum Lunas").length;

  const updateItem = (idx: number, field: string, val: any) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    if (field === "product_id") {
      const p = products.find((p: any) => String(p.id) === String(val));
      if (p) { items[idx].price = Number(p.price); items[idx].product_name = p.name; }
    }
    items[idx].subtotal = Number(items[idx].price) * Number(items[idx].quantity) - Number(items[idx].discount || 0);
    setForm(f => ({ ...f, items }));
  };

  const grandTotal = form.items.reduce((s, i) => s + (i.subtotal || 0), 0);

  const handleSave = async () => {
    if (!form.customer_id || !form.delivery_date) return alert("Customer dan tanggal kirim wajib");
    if (!form.items.some(i => i.product_id)) return alert("Minimal 1 item produk");
    const validItems = form.items.filter(i => i.product_id);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, items: validItems }) });
    if (res.ok) { setShowModal(false); setForm(emptyForm()); fetchOrders(1); }
  };

  const handleExport = async () => {
    const p = new URLSearchParams({ page: "1", limit: "1000" });
    if (search) p.set("search", search);
    if (fStatus) p.set("status_order", fStatus);
    if (fPay) p.set("status_payment", fPay);
    if (fDateFrom) p.set("date_from", fDateFrom);
    if (fDateTo) p.set("date_to", fDateTo);
    const res = await fetch(`/api/orders?${p}`);
    const d = await res.json();
    exportToExcel(d.data || [], "Data_Orders");
  };

  return (
    <div>
      <PageHeader title="Rekap Order" subtitle={`${meta.total} total order`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Excel</button>
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm()); setShowModal(true); }}><Plus size={14} /> Buat Order</button>
          </div>
        }
      />

      {/* Summary mini cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total Nilai (halaman ini)", val: fmt(totalRevenue), color: "#1D9E75" },
          { label: "Order Aktif", val: activeCount, color: "#378ADD" },
          { label: "Belum Lunas", val: unpaidCount, color: "#E24B4A" },
        ].map(c => (
          <div key={c.label} style={{ background: "white", border: "0.5px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
            <p style={{ fontSize: 12, color: "#6b7280" }}>{c.label}:</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="erp-card" style={{ marginBottom: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Customer / venue..." style={{ width: 200 }} />
          <SearchableSelect 
            value={fStatus} onChange={setFStatus} 
            options={[{ value: "", label: "Semua Status Order" }, ...STATUS_ORDER.map(s => ({ value: s, label: s }))]} 
            style={{ width: 160 }} 
          />
          <SearchableSelect 
            value={fPay} onChange={setFPay} 
            options={[{ value: "", label: "Semua Pembayaran" }, ...STATUS_PAY.map(s => ({ value: s, label: s }))]} 
            style={{ width: 160 }} 
          />
          <input type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} style={{ width: 140 }} title="Kirim dari" />
          <input type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} style={{ width: 140 }} title="Kirim sampai" />
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setFStatus(""); setFPay(""); setFDateFrom(""); setFDateTo(""); }}>Reset</button>
        </div>
      </div>

      <div className="erp-card-flush">
        {loading ? <p style={{ padding: 24, color: "#6b7280", fontSize: 13 }}>Memuat...</p> : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>No.</th><th>No. Order</th><th>Customer</th><th>PIC CS</th><th>Tgl Kirim</th><th>Item</th><th>Total</th><th>Status</th><th>Bayar</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>Tidak ada order</td></tr>
                  ) : rows.map((o: any, idx: number) => (
                    <tr key={o.id}>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{(meta.page - 1) * meta.limit + idx + 1}</td>
                      <td style={{ fontWeight: 700, color: "#1D9E75", fontSize: 12 }}>ORD-{String(o.id).padStart(3, "0")}</td>
                      <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{o.pic_name || "-"}</td>
                      <td style={{ fontSize: 12 }}>{String(o.delivery_date || "").slice(0, 10)}</td>
                      <td style={{ fontSize: 11, color: "#6b7280" }}>{(o.items || []).length} item</td>
                      <td style={{ fontWeight: 700, color: "#1D9E75" }}>{fmt(o.grand_total)}</td>
                      <td><Badge color={statusBadgeColor(o.status_order)}>{o.status_order}</Badge></td>
                      <td><Badge color={statusBadgeColor(o.status_payment)}>{o.status_payment}</Badge></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.open(`/print/order/${o.id}`, "_blank")} title="Print">
                          <Printer size={11} /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination 
              page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} 
              onChange={(p) => fetchOrders(p, meta.limit)} 
              onLimitChange={(lim) => fetchOrders(1, lim)}
            />
          </>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Buat Order Baru" width={680}>
        <FormRow>
          <FormField label="Customer">
            <SearchableSelect 
              value={form.customer_id} onChange={v => setForm(f => ({ ...f, customer_id: v }))}
              options={[
                { value: "", label: "-- Pilih Customer --" },
                ...customers.map((c: any) => ({ value: c.id, label: c.name }))
              ]}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
          <FormField label="PIC CS">
            <SearchableSelect 
              value={form.pic_id} onChange={v => setForm(f => ({ ...f, pic_id: v }))}
              options={[
                { value: "", label: "-- Pilih CS --" },
                ...users.filter((u: any) => u.role === "CS / Sales").map((u: any) => ({ value: u.id, label: u.name }))
              ]}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Tanggal Order"><input type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} /></FormField>
          <FormField label="Tanggal Kirim"><input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} /></FormField>
        </FormRow>
        <FormRow>
          <FormField label="Jam Berangkat"><input type="time" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} /></FormField>
          <FormField label="Status Bayar">
            <SearchableSelect 
              value={form.status_payment} onChange={v => setForm(f => ({ ...f, status_payment: v }))}
              options={STATUS_PAY.map(s => ({ value: s, label: s }))}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </FormField>
        </FormRow>
        <FormField label="Venue / Lokasi" style={{ marginBottom: 14 }}>
          <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Gedung, alamat lengkap..." />
        </FormField>

        {/* Multi-Item Table */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700 }}>Item Pesanan</p>
            <button className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }))}>+ Tambah Baris</button>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <table>
              <thead><tr><th>Produk</th><th>Qty</th><th>Harga/Unit</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <SearchableSelect 
                        value={item.product_id} onChange={v => updateItem(idx, "product_id", v)} 
                        options={[
                          { value: "", label: "-- Pilih Produk --" },
                          ...products.map((p: any) => ({ value: p.id, label: p.name }))
                        ]}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        style={{ minWidth: 150 }}
                      />
                    </td>
                    <td><input type="number" value={item.quantity} min={1} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} style={{ border: "none", textAlign: "center", width: 70, padding: "4px 0" }} /></td>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fmt(item.price)}</td>
                    <td style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{fmt(item.subtotal)}</td>
                    <td>
                      {form.items.length > 1 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f9fafb" }}>
                  <td colSpan={3} style={{ fontWeight: 700, fontSize: 13 }}>GRAND TOTAL</td>
                  <td style={{ fontWeight: 700, color: "#1D9E75", fontSize: 15 }}>{fmt(grandTotal)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <FormField label="Catatan Order" style={{ marginBottom: 14 }}>
          <textarea rows={2} value={form.order_notes} onChange={e => setForm(f => ({ ...f, order_notes: e.target.value }))} />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave}>Simpan Order</button>
        </div>
      </Modal>
    </div>
  );
}
