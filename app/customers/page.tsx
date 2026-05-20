"use client";
import React, { useState, useEffect } from 'react';
import { Search, Edit, Plus, Trash2 } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', phone: '', email: '', type: 'Personal', address: '', notes: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers/get-list')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isEditing ? '/api/customers/update' : '/api/customers/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cust: any) => {
    setFormData({ 
      id: cust.id, 
      name: cust.name || '', 
      phone: cust.phone || '', 
      email: cust.email || '', 
      type: cust.type || 'Personal', 
      address: cust.address || '', 
      notes: cust.notes || '' 
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus customer ini? Semua data leads dari customer ini juga akan terhapus.')) return;
    try {
      const res = await fetch('/api/customers/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchCustomers();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  };

  // Filter Logic
  const filteredCustomers = customers.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (c.name && c.name.toLowerCase().includes(searchLower)) || 
                          (c.phone && c.phone.includes(searchLower));
    const matchesType = typeFilter ? c.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentItems = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Customer' : 'Tambah Customer Baru'}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Nama Customer *</label>
                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Nomor Telepon / WA *</label>
                 <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Email</label>
                 <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Tipe Customer</label>
                 <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400">
                    <option>Personal</option><option>Instansi</option><option>Corporate</option>
                 </select>
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Alamat</label>
                 <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Catatan Khusus</label>
                 <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
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
        <h2 className="text-xl font-semibold text-slate-800">Database Customers</h2>
        <div className="flex space-x-2">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">Export CSV</button>
          <button onClick={() => { setFormData({ id: '', name: '', phone: '', email: '', type: 'Personal', address: '', notes: '' }); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Tambah Customer
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau telepon..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Tipe --</option>
            <option value="Personal">Personal</option>
            <option value="Instansi">Instansi</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium w-12"></th>
                <th className="p-4 font-medium">Nama Customer</th>
                <th className="p-4 font-medium">No. Telepon / WA</th>
                <th className="p-4 font-medium">Total Order</th>
                <th className="p-4 font-medium">Catatan Khusus</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((cust, idx) => (
                <tr key={cust.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                        {getInitials(cust.name)}
                     </div>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{cust.name}</td>
                  <td className="p-4 text-slate-600">{cust.phone}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">{cust.total_orders}x Order</span>
                  </td>
                  <td className="p-4 text-slate-500 italic max-w-xs truncate">{cust.notes}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => handleEdit(cust)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit Profil"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cust.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
