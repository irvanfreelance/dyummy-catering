"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', category: 'Nasi Box', description: '', price: '', status: 'Aktif' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products/get-list')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isEditing ? '/api/products/update' : '/api/products/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: Number(formData.price) })
      });
      if (res.ok) {
        setShowForm(false);
        fetchProducts();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prod: any) => {
    setFormData({ ...prod, price: prod.price.toString() });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Nama Paket / Produk *</label>
                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Kategori</label>
                 <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400">
                    <option>Nasi Box</option><option>Snack Box</option><option>Prasmanan</option>
                 </select>
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Harga Jual (Rp) *</label>
                 <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400">
                    <option>Aktif</option><option>Nonaktif</option>
                 </select>
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Deskripsi</label>
                 <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
              </div>
           </div>
           <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-md text-slate-600 font-medium hover:bg-slate-100 transition-colors">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">Simpan</button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Master Data Produk & Harga</h2>
           <p className="text-sm text-slate-500 mt-1">Kelola katalog paket catering dan harga jual ke pelanggan.</p>
        </div>
        <button onClick={() => { setFormData({ id: '', name: '', category: 'Nasi Box', description: '', price: '', status: 'Aktif' }); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama produk..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Kategori --</option>
            <option value="Nasi Box">Nasi Box</option>
            <option value="Snack Box">Snack Box</option>
            <option value="Prasmanan">Prasmanan</option>
          </select>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Status --</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium">ID Produk</th>
                <th className="p-4 font-medium">Nama Paket / Produk</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Harga Jual</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                 <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                 <tr><td colSpan={7} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((prod, idx) => (
                <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4 text-slate-500">{prod.id}</td>
                  <td className="p-4 font-medium text-slate-800">{prod.name}</td>
                  <td className="p-4 text-slate-600">{prod.category}</td>
                  <td className="p-4 font-medium text-slate-800">{formatRp(Number(prod.price))}</td>
                  <td className="p-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${prod.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{prod.status}</span>
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => handleEdit(prod)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(prod.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
