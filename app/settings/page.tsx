"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'CS / Sales', status: 'Aktif' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    fetch('/api/users/get-list')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isEditing ? '/api/users/update' : '/api/users/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user: any) => {
    setFormData({ ...user, password: '' });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus user ini?')) return;
    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(u => {
    const s = searchQuery.toLowerCase();
    return (u.name && u.name.toLowerCase().includes(s)) || (u.email && u.email.toLowerCase().includes(s));
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800 transition-colors">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Nama Lengkap *</label>
                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 transition-colors" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Email *</label>
                 <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 transition-colors" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Password {isEditing ? '(Kosongkan jika tidak diubah)' : '*'}</label>
                 <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEditing} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 transition-colors" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Peran (Role) *</label>
                 <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 transition-colors">
                    <option value="Super Admin">Super Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="CS / Sales">CS / Sales</option>
                    <option value="Finance">Finance</option>
                 </select>
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Status *</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400 transition-colors">
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                 </select>
              </div>
           </div>
           <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-md text-slate-600 font-medium hover:bg-slate-100 transition-colors">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">Simpan Pengguna</button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Manajemen Pengguna</h2>
           <p className="text-sm text-slate-500 mt-1">Kelola data user, hak akses (role), dan status akun.</p>
        </div>
        <button onClick={() => { setFormData({ id: '', name: '', email: '', password: '', role: 'CS / Sales', status: 'Aktif' }); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah User
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium">Nama Lengkap</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                 <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                 <tr><td colSpan={6} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((u, idx) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4 font-medium text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                     <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                       {u.role}
                     </span>
                  </td>
                  <td className="p-4">
                     {u.status === 'Aktif' ? (
                        <span className="text-emerald-600 flex items-center font-medium text-xs"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Aktif</span>
                     ) : (
                        <span className="text-rose-600 flex items-center font-medium text-xs"><XCircle className="w-3.5 h-3.5 mr-1" /> Nonaktif</span>
                     )}
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => handleEdit(u)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
