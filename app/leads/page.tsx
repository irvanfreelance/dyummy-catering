"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '2026-05-19', source: 'WhatsApp', name: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLeads = () => {
    setLoading(true);
    fetch('/api/leads/get-list')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isEditing ? '/api/leads/update' : '/api/leads/create';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchLeads();
      } else {
        alert('Gagal menyimpan lead');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (lead: any) => {
    setFormData({ 
      id: lead.id, 
      date: lead.date, 
      source: lead.source, 
      name: lead.name || '', 
      phone: lead.phone || '',
      status: lead.status || 'New Lead',
      pic_id: 1 // Default or map actual ID
    } as any);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus lead ini?')) return;
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        alert('Gagal menghapus lead');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredLeads = leads.filter(l => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (l.name && l.name.toLowerCase().includes(searchLower)) || 
                          (l.phone && l.phone.includes(searchLower));
    const matchesSource = sourceFilter ? l.source === sourceFilter : true;
    const matchesStatus = statusFilter ? l.status === statusFilter : true;
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const currentItems = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">Form Entry / Edit Lead (CRM)</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Tanggal Masuk Lead *</label>
                 <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" required />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Sumber Lead *</label>
                 <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" required>
                    <option>WhatsApp</option><option>Instagram</option><option>Google Ads</option>
                 </select>
              </div>
              {!isEditing && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Nama Customer</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth: PT. ABC / Bpk Budi" className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1">Nomor WhatsApp / Telepon *</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08xxxxxxxxxx" className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" required />
                  </div>
                </>
              )}
              {isEditing && (
                <div>
                   <label className="text-sm font-medium text-slate-600 block mb-1">Status Lead *</label>
                   <select value={(formData as any).status || ''} onChange={e => setFormData({...formData, status: e.target.value} as any)} className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" required>
                      <option>New Lead</option><option>Follow Up</option><option>Closed Won</option><option>Closed Lost</option>
                   </select>
                </div>
              )}
           </div>
           <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-md text-slate-600 font-medium hover:bg-slate-100 transition-colors">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">Simpan Data Lead</button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Daftar Leads</h2>
        <button onClick={() => { setFormData({ date: new Date().toISOString().split('T')[0], source: 'WhatsApp', name: '', phone: '' }); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Tambah Lead Baru
        </button>
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
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Sumber --</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Google Ads">Google Ads</option>
          </select>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Status --</option>
            <option value="New Lead">New Lead</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium">ID Lead</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Customer/Nama</th>
                <th className="p-4 font-medium">No. WA</th>
                <th className="p-4 font-medium">Sumber</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((lead, idx) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4 text-slate-500">L-{lead.id}</td>
                  <td className="p-4 text-slate-500">{lead.date}</td>
                  <td className="p-4 font-medium text-slate-800">{lead.name}</td>
                  <td className="p-4">{lead.phone}</td>
                  <td className="p-4">{lead.source}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      lead.status === 'Closed Won' ? 'bg-emerald-100 text-emerald-700' :
                      lead.status === 'Closed Lost' ? 'bg-rose-100 text-rose-700' :
                      lead.status === 'Follow Up' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => handleEdit(lead)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(lead.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
          totalItems={filteredLeads.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
