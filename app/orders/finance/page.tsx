"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function FinanceOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [costInput, setCostInput] = useState<string>('');

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders/get-list-finance')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSaveCost = async (order: any) => {
    const actualCost = Number(costInput);
    const estBudget = Number(order.estBudget);
    const statusCost = actualCost > estBudget ? 'Overbudget' : 'Safe';

    try {
      const res = await fetch('/api/orders/update-cost', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          actual_cost: actualCost,
          status_cost: statusCost
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchOrders();
      } else {
        alert('Gagal mengupdate biaya');
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
    const matchesStatus = statusFilter ? o.statusCost === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Cost Control (Finance)</h2>
          <p className="text-sm text-slate-500 mt-1">Input aktual belanja HPP dan monitor overbudget.</p>
        </div>
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
            <option value="Safe">Safe</option>
            <option value="Overbudget">Overbudget</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-medium pl-6 w-16">No.</th>
                <th className="p-4 font-medium">ID Order</th>
                <th className="p-4 font-medium">Customer & Paket</th>
                <th className="p-4 font-medium">Omset (Revenue)</th>
                <th className="p-4 font-medium bg-amber-50">Est. Budget HPP</th>
                <th className="p-4 font-medium bg-rose-50">Actual Cost</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-4">Tidak ada data.</td></tr>
              ) : currentItems.map((order, idx) => {
                const isOverbudget = order.statusCost === 'Overbudget';
                const diff = Number(order.actualCost) - Number(order.estBudget);
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                    <td className="p-4 pl-6 text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4">ORD-{order.id}<br/><span className="text-xs text-slate-400">{order.date}</span></td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800 block">{order.customer}</span>
                      <span className="text-xs text-slate-500">{order.package}</span>
                    </td>
                    <td className="p-4 font-medium">{formatRp(Number(order.revenue))}</td>
                    <td className="p-4 bg-amber-50/30 text-amber-800 font-medium">{formatRp(Number(order.estBudget))}</td>
                    <td className={`p-4 ${isOverbudget ? 'bg-rose-50/50 text-rose-700 font-medium' : 'text-slate-800'}`}>
                      {editingId === order.id ? (
                        <input 
                          type="number" 
                          value={costInput} 
                          onChange={(e) => setCostInput(e.target.value)} 
                          className="p-1 border border-blue-400 rounded-md w-28 text-sm outline-none"
                          autoFocus
                        />
                      ) : (
                        <>
                          {Number(order.actualCost) > 0 ? formatRp(Number(order.actualCost)) : '-'}
                          {isOverbudget && <span className="block text-xs text-rose-600 mt-1">+( {formatRp(diff)} )</span>}
                        </>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center w-max ${
                        order.statusCost === 'Safe' ? 'bg-emerald-100 text-emerald-700' :
                        order.statusCost === 'Overbudget' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {order.statusCost === 'Overbudget' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {order.statusCost || 'Belum Diinput'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {editingId === order.id ? (
                        <div className="flex space-x-2 justify-center">
                          <button onClick={() => handleSaveCost(order)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs transition-colors"><Check className="w-4 h-4"/></button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-md text-xs transition-colors">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(order.id); setCostInput(order.actualCost || ''); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-xs transition-colors border border-slate-200">
                          Input Cost
                        </button>
                      )}
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
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
