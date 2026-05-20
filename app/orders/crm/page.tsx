"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Printer, Edit, Trash2, Search, X } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Select from 'react-select';

export default function CRMOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const defaultItems = [{ product_id: '', quantity: 1, unit_price: 0, total_price: 0 }];
  const [formData, setFormData] = useState({
    id: '', customer_id: '', delivery_date: '', venue: '', departure_time: '', 
    status_order: 'Baru', notes: '', items: defaultItems
  });

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/orders/get-list-crm').then(res => res.json()),
      fetch('/api/customers/get-list').then(res => res.json()),
      fetch('/api/products/get-list').then(res => res.json())
    ]).then(([ordersData, customersData, productsData]) => {
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) return alert('Silakan pilih customer');
    if (formData.items.length === 0 || formData.items.some(i => !i.product_id || i.quantity <= 0)) {
      return alert('Silakan tambahkan minimal 1 produk dengan quantity valid');
    }

    const endpoint = isEditing ? '/api/orders/update' : '/api/orders/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customer_id: Number(formData.customer_id)
        })
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Gagal menyimpan order: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (order: any) => {
    let parsedItems = defaultItems;
    if (order.items_json && Array.isArray(order.items_json)) {
      parsedItems = order.items_json.map((i: any) => ({
        product_id: i.product_id.toString(),
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price
      }));
    }

    setFormData({
      id: order.id,
      customer_id: order.customer_id?.toString() || '',
      delivery_date: order.delivery_date,
      venue: order.venue || '',
      departure_time: order.time || '',
      status_order: order.status || 'Baru',
      notes: order.notes || '',
      items: parsedItems
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus pesanan ini?')) return;
    try {
      const res = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchData();
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } else {
        alert('Gagal menghapus order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (o.customer && o.customer.toLowerCase().includes(searchLower)) || 
                          (o.id && o.id.toString().includes(searchLower));
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dynamic Items Logic
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'product_id') {
      const p = products.find(prod => prod.id.toString() === value);
      if (p) {
        item.unit_price = Number(p.price);
        item.total_price = item.unit_price * item.quantity;
      }
    } else if (field === 'quantity') {
      item.total_price = item.unit_price * Number(value);
    }
    
    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0, total_price: 0 }] });
  };

  const removeItemRow = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const currentGrandTotal = formData.items.reduce((sum, item) => sum + item.total_price, 0);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Pesanan (CRM)' : 'Buat Pesanan Baru (CRM)'}</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600 block mb-1">Customer *</label>
                <Select 
                    options={customers.map(c => ({ value: c.id.toString(), label: `${c.name} (${c.phone})` }))}
                    value={formData.customer_id ? { value: formData.customer_id, label: customers.find(c => c.id.toString() === formData.customer_id)?.name } : null}
                    onChange={(selected: any) => setFormData({...formData, customer_id: selected ? selected.value : ''})}
                    placeholder="-- Cari & Pilih Customer --"
                    isClearable
                    className="text-sm"
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                 />
              </div>

              {isEditing && (
                <div className="md:col-span-2">
                   <label className="text-sm font-medium text-slate-600 block mb-1">Status Order *</label>
                   <select value={formData.status_order} onChange={e => setFormData({...formData, status_order: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 bg-white">
                      <option>Baru</option><option>Diproses</option><option>Selesai</option><option>Batal</option>
                   </select>
                </div>
              )}

              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Tanggal Pengiriman *</label>
                 <input type="date" value={formData.delivery_date} onChange={e => setFormData({...formData, delivery_date: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Waktu Keberangkatan (Jam) *</label>
                 <input type="time" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Venue / Alamat Pengiriman *</label>
                 <textarea rows={2} value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Catatan Tambahan</label>
                 <textarea rows={1} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
              </div>
           </div>

           <div className="border border-blue-100 rounded-lg overflow-hidden">
             <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
               <h3 className="font-semibold text-blue-900 text-sm">Daftar Produk / Paket</h3>
               <button type="button" onClick={addItemRow} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium flex items-center">
                 <Plus className="w-3 h-3 mr-1" /> Tambah Baris
               </button>
             </div>
             <div className="p-4 space-y-3 bg-white">
               {formData.items.map((item, idx) => (
                 <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-start pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-[250px]">
                      <Select 
                        options={products.map(p => ({ value: p.id.toString(), label: `${p.name} - ${formatRp(Number(p.price))}` }))}
                        value={item.product_id ? { value: item.product_id, label: products.find(p => p.id.toString() === item.product_id)?.name } : null}
                        onChange={(selected: any) => handleItemChange(idx, 'product_id', selected ? selected.value : '')}
                        placeholder="Pilih Produk..."
                        className="text-sm"
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    </div>
                    <div className="w-24">
                      <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" placeholder="Qty" required />
                    </div>
                    <div className="w-32 py-2 text-sm font-medium text-slate-700 text-right">
                       {formatRp(item.total_price)}
                    </div>
                    <button type="button" onClick={() => removeItemRow(idx)} disabled={formData.items.length === 1} className="p-2 text-rose-500 hover:bg-rose-50 rounded-md disabled:opacity-30 transition-colors">
                       <X className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               <div className="flex justify-end pt-2">
                 <div className="text-right">
                   <span className="text-xs text-slate-500 block mb-1">Total Estimasi Nilai Order</span>
                   <span className="text-xl font-bold text-slate-800">{formatRp(currentGrandTotal)}</span>
                 </div>
               </div>
             </div>
           </div>

           <div className="pt-4 flex justify-end space-x-3 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-md text-slate-600 font-medium hover:bg-slate-100 transition-colors border border-slate-200">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">Simpan Pesanan</button>
           </div>
        </form>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
           <button onClick={() => setSelectedOrder(null)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center">&larr; Kembali ke Daftar Order</button>
           <button onClick={() => window.open(`/print/${selectedOrder.id}`, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">
              <Printer className="w-4 h-4 mr-2" /> Cetak Konfirmasi PDF
           </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-1">Detail Order: ORD-{selectedOrder.id}</h2>
                <div className="flex space-x-3 mt-2">
                   <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">Status: {selectedOrder.status}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Tanggal Transaksi</p>
                <p className="font-medium text-slate-800">{selectedOrder.date}</p>
              </div>
           </div>

           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
              <div className="space-y-3">
                 <div className="grid grid-cols-3"><span className="text-slate-500">Customer:</span> <span className="col-span-2 font-medium text-blue-700">{selectedOrder.customer}</span></div>
                 <div className="grid grid-cols-3"><span className="text-slate-500">Telepon:</span> <span className="col-span-2">{selectedOrder.phone}</span></div>
                 <div className="grid grid-cols-3"><span className="text-slate-500">Kirim:</span> <span className="col-span-2">{selectedOrder.delivery_date}</span></div>
                 <div className="grid grid-cols-3"><span className="text-slate-500">Jam Berangkat:</span> <span className="col-span-2">{selectedOrder.time || '10:00'}</span></div>
              </div>
              <div className="space-y-3">
                 <div className="grid grid-cols-1"><span className="text-slate-500 mb-1 block">Venue / Alamat Kirim:</span> <span className="bg-slate-50 p-3 rounded-md border border-slate-100 block">{selectedOrder.venue}</span></div>
                 {selectedOrder.notes && (
                   <div className="grid grid-cols-1"><span className="text-slate-500 mb-1 block">Catatan:</span> <span className="text-amber-700 italic block">{selectedOrder.notes}</span></div>
                 )}
              </div>
           </div>

           <div className="p-6 border-t border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Detail Paket Pemesanan</h3>
              <div className="overflow-x-auto border border-blue-200 rounded-md">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-blue-500 text-white text-xs uppercase tracking-wider">
                      <th className="p-3 font-medium">Paket</th>
                      <th className="p-3 font-medium">Harga Satuan</th>
                      <th className="p-3 font-medium">Jumlah</th>
                      <th className="p-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {selectedOrder.items_json?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3">{formatRp(Number(item.unit_price))}</td>
                        <td className="p-3">{item.quantity} pax</td>
                        <td className="p-3 font-medium text-right">{formatRp(Number(item.total_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                 <div className="text-right">
                    <span className="text-slate-500 text-sm block mb-1">Grand Total</span>
                    <span className="text-2xl font-bold text-slate-800">{formatRp(Number(selectedOrder.total))}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Daftar Orders (CRM)</h2>
           <p className="text-sm text-slate-500 mt-1">CS Area - Monitor status dan konfirmasi pesanan.</p>
        </div>
        <button onClick={() => { setFormData({id: '', customer_id: '', delivery_date: '', venue: '', departure_time: '', status_order: 'Baru', notes: '', items: defaultItems}); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2"/> Order Baru
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID atau customer..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Status --</option>
            <option value="Baru">Baru</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Batal">Batal</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium">Tanggal Kirim</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Paket & Total Porsi</th>
                <th className="p-4 font-medium">Total Nilai</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((order, idx) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4 text-slate-500">
                    <span className="block">{order.delivery_date}</span>
                    <span className="text-xs text-blue-500 font-medium">ORD-{order.id}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{order.customer}</td>
                  <td className="p-4">
                     <span className="block text-slate-700 max-w-xs truncate" title={order.package}>{order.package}</span>
                     <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{order.qty} pax total</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{formatRp(Number(order.total))}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                       order.status === 'Baru' ? 'bg-blue-100 text-blue-700' : 
                       order.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                       order.status === 'Batal' ? 'bg-rose-100 text-rose-700' :
                       'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center items-center space-x-2">
                    <button onClick={() => setSelectedOrder(order)} className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors" title="Lihat"><Printer className="w-4 h-4"/></button>
                    <button onClick={() => handleEdit(order)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(order.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
