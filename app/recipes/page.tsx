"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Select from 'react-select';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', product_id: '', ingredients: '', standard_cost: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/recipes/get-list').then(r => r.json()),
      fetch('/api/products/get-list').then(r => r.json())
    ]).then(([recipesData, productsData]) => {
      setRecipes(recipesData);
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
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isEditing ? '/api/recipes/update' : '/api/recipes/create';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, standard_cost: Number(formData.standard_cost), product_id: Number(formData.product_id) })
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

  const handleEdit = (recipe: any) => {
    setFormData({ ...recipe, product_id: recipe.product_id.toString(), standard_cost: recipe.standard_cost.toString() });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus resep BOM ini?')) return;
    try {
      const res = await fetch('/api/recipes/delete', {
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

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Filter Logic
  const filteredRecipes = recipes.filter(r => {
    return r.product_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const currentItems = filteredRecipes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
           <button onClick={() => setShowForm(false)} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
           <h2 className="text-lg font-semibold text-slate-800">{isEditing ? 'Edit Resep BOM' : 'Tambah Resep BOM Baru'}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Produk *</label>
                 <Select 
                    options={products.map(p => ({ value: p.id, label: p.name }))}
                    value={formData.product_id ? { value: formData.product_id, label: products.find(p => p.id.toString() === formData.product_id)?.name } : null}
                    onChange={(selected: any) => setFormData({...formData, product_id: selected ? selected.value.toString() : ''})}
                    placeholder="-- Cari & Pilih Produk --"
                    isClearable
                    required
                    className="text-sm"
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                 />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-600 block mb-1">Standard Cost / HPP (Rp) *</label>
                 <input type="number" value={formData.standard_cost} onChange={e => setFormData({...formData, standard_cost: e.target.value})} required className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="md:col-span-2">
                 <label className="text-sm font-medium text-slate-600 block mb-1">Komposisi / Bahan</label>
                 <textarea rows={4} value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} required placeholder="Contoh: Nasi Putih, Ayam Bakar, Box..." className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-400"></textarea>
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
           <h2 className="text-xl font-semibold text-slate-800">Master Recipes (BOM) & HPP</h2>
           <p className="text-sm text-slate-500 mt-1">Kelola standar harga pokok modal dan bahan per paket.</p>
        </div>
        <button onClick={() => { setFormData({ id: '', product_id: '', ingredients: '', standard_cost: '' }); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Buat Resep (BOM)
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama paket/produk..." 
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
                <th className="p-4 font-medium">Paket (Produk)</th>
                <th className="p-4 font-medium">Bahan / Komposisi</th>
                <th className="p-4 font-medium">Std. Cost (HPP)</th>
                <th className="p-4 font-medium">Margin Bruto</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {loading ? (
                 <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                 <tr><td colSpan={6} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((rec, idx) => {
                const marginAmount = Number(rec.selling_price) - Number(rec.standard_cost);
                const marginPercent = Number(rec.selling_price) > 0 ? (marginAmount / Number(rec.selling_price)) * 100 : 0;
                return (
                  <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4 font-medium text-slate-800">{rec.product_name}</td>
                    <td className="p-4 text-slate-600 italic max-w-sm">{rec.ingredients}</td>
                    <td className="p-4 font-medium text-amber-700">{formatRp(Number(rec.standard_cost))}</td>
                    <td className="p-4">
                       <span className="block font-medium text-emerald-600">{marginPercent.toFixed(1)}%</span>
                       <span className="text-xs text-slate-500">({formatRp(marginAmount)})</span>
                    </td>
                    <td className="p-4 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(rec)} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(rec.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredRecipes.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
