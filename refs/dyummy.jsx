import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Users, UserCircle, ShoppingBag, DollarSign, 
  TrendingUp, Settings, LogOut, Menu, Bell, Search, Plus, 
  Edit, Trash2, ChevronDown, CheckCircle, AlertTriangle, FileText, Printer, X, Eye,
  Package, BookOpen, UserCog
} from 'lucide-react';

// --- MOCK DATA SEEDS ---

const financialData = [
  { month: 'Jan', omset: 120, biaya: 80, margin: 40 },
  { month: 'Feb', omset: 150, biaya: 95, margin: 55 },
  { month: 'Mar', omset: 180, biaya: 110, margin: 70 },
  { month: 'Apr', omset: 140, biaya: 100, margin: 40 },
  { month: 'Mei', omset: 210, biaya: 130, margin: 80 },
  { month: 'Jun', omset: 250, biaya: 145, margin: 105 },
];

const leadSourceData = [
  { name: 'WhatsApp', value: 450 },
  { name: 'Instagram', value: 300 },
  { name: 'Google Ads', value: 200 },
  { name: 'Referral', value: 50 },
];
const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1']; 

const csPerformanceData = [
  { name: 'Siti (CS 1)', closingRate: 35, target: 30 },
  { name: 'Budi (CS 2)', closingRate: 28, target: 30 },
  { name: 'Ayu (CS 3)', closingRate: 42, target: 30 },
  { name: 'Deni (CS 4)', closingRate: 20, target: 30 },
];

const targetAchievementData = [
  { name: 'Target', value: 100, fill: '#f1f5f9' }, 
  { name: 'Omset', value: 85, fill: '#3b82f6' }    
];

const mockLeads = [
  { id: 'L001', date: '2026-05-19', name: 'PT. Maju Jaya', phone: '08123456789', source: 'WhatsApp', status: 'Follow Up', pic: 'Siti' },
  { id: 'L002', date: '2026-05-19', name: 'Ibu Rina (Anonim)', phone: '085711223344', source: 'Instagram', status: 'New Lead', pic: 'Budi' },
  { id: 'L003', date: '2026-05-18', name: 'Acara Kampus UI', phone: '081199887766', source: 'Referral', status: 'Closed Won', pic: 'Ayu' },
  { id: 'L004', date: '2026-05-17', name: 'Bapak Ahmad', phone: '089655443322', source: 'Google Ads', status: 'Closed Lost', pic: 'Deni' },
];

const mockOrdersCRM = [
  { id: 'ORD-001', date: '2026-05-19', customer: 'Ressa', phone: '085220073373', qty: 60, status: 'Repeat', total: 1620000, package: 'Nasi Box Paket Lengkap', venue: 'Kantor Kelurahan Cisaranten Kidul', time: '11:00' },
  { id: 'ORD-002', date: '2026-05-19', customer: 'APTIKOM', phone: '081233445566', qty: 51, status: 'Repeat', total: 1250000, package: 'Snack Box Premium', venue: 'Gedung APTIKOM Pusat', time: '09:00' },
  { id: 'ORD-003', date: '2026-05-19', customer: 'TINY HERNAWATI', phone: '081254314639', qty: 10, status: 'Baru', total: 350000, package: 'Bento Ayam Teriyaki', venue: 'Jl. Melati No 45', time: '12:00' },
  { id: 'ORD-004', date: '2026-05-31', customer: 'BETTY BANIARTY', phone: '089988776655', qty: 150, status: 'Baru', total: 4500000, package: 'Prasmanan VIP', venue: 'Gedung Serbaguna', time: '18:00' },
];

const mockOrdersFinance = [
  { id: 'ORD-001', date: '2026-05-19', customer: 'Ressa', package: 'Nasi Box Premium', revenue: 1620000, estBudget: 1000000, actualCost: 950000, statusCost: 'Safe' },
  { id: 'ORD-002', date: '2026-05-19', customer: 'APTIKOM', package: 'Prasmanan VIP', revenue: 7500000, estBudget: 4000000, actualCost: 4500000, statusCost: 'Overbudget' },
  { id: 'ORD-004', date: '2026-05-31', customer: 'BETTY BANIARTY', package: 'Snack Box', revenue: 3000000, estBudget: 1500000, actualCost: 0, statusCost: 'Pending Input' },
];

const mockCustomers = [
  { id: 'C001', name: 'TINY HERNAWATI', phone: '081254314639', notes: 'Sering pesan bento', orders: 2 },
  { id: 'C002', name: 'IKHA FAKHA', phone: '085695946913', notes: 'Alergi seafood', orders: 1 },
  { id: 'C003', name: 'KAMAL BKSTM', phone: '085714768633', notes: '-', orders: 5 },
  { id: 'C004', name: 'SHANTI', phone: '08158803123', notes: 'Minta nota kosong', orders: 3 },
  { id: 'C005', name: 'RESSA', phone: '085220073373', notes: 'Klien prioritas instansi', orders: 12 },
];

const mockProducts = [
  { id: 'PRD-001', name: 'Nasi Box Paket Lengkap', category: 'Nasi Box', price: 27000, status: 'Aktif' },
  { id: 'PRD-002', name: 'Snack Box Premium', category: 'Snack Box', price: 15000, status: 'Aktif' },
  { id: 'PRD-003', name: 'Prasmanan VIP', category: 'Prasmanan', price: 75000, status: 'Aktif' },
];

const mockRecipes = [
  { id: 'REC-001', product: 'Nasi Box Paket Lengkap', ingredients: 'Nasi, Ayam Serundeng, Cah Buncis, Perkedel, Box', stdCost: 18000, margin: '33.3%' },
  { id: 'REC-002', product: 'Snack Box Premium', ingredients: 'Lontong Ayam, Risoles, Brownies, Air Cup, Box', stdCost: 8000, margin: '46.6%' },
];

const mockUsers = [
  { id: 'USR-001', name: 'Siti (CS 1)', role: 'CS / Sales', email: 'siti@catering.com', status: 'Aktif' },
  { id: 'USR-002', name: 'Budi (CS 2)', role: 'CS / Sales', email: 'budi@catering.com', status: 'Aktif' },
  { id: 'USR-003', name: 'Andi Finance', role: 'Finance', email: 'finance@catering.com', status: 'Aktif' },
  { id: 'USR-004', name: 'Super Admin', role: 'Owner', email: 'admin@catering.com', status: 'Aktif' },
];

const formatRp = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// Helper for Avatars
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // States for Detail and Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');
      body { font-family: 'Source Sans Pro', sans-serif; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setActiveTab('order_detail');
  };

  const openPrintModal = (order) => {
    setSelectedOrder(order);
    setIsPrintModalOpen(true);
  };

  // --- VIEWS ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Financial & CRM Target Overview</h2>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center border border-emerald-200">
          <CheckCircle className="w-4 h-4 mr-2" />
          Status Bisnis: Sehat (Margin {'>'} 20%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Total Omset (YTD)</span>
          <span className="text-2xl font-semibold text-slate-800">Rp 1.050 M</span>
          <span className="text-emerald-600 text-xs font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +15% dari bulan lalu</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Total Biaya (Actual Cost)</span>
          <span className="text-2xl font-semibold text-rose-600">Rp 640 Jt</span>
          <span className="text-rose-500 text-xs font-medium mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> 2 order overbudget</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Net Margin</span>
          <span className="text-2xl font-semibold text-emerald-600">39%</span>
          <span className="text-slate-500 text-xs font-medium mt-2 block">Target minimal: 30%</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Avg Closing Rate</span>
          <span className="text-2xl font-semibold text-blue-600">31.2%</span>
          <span className="text-blue-600 text-xs font-medium mt-2 flex items-center">SLA Terpenuhi ({'>'}30%)</span>
        </div>
      </div>

      {/* 4 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Tren Omset vs Biaya vs Margin</h3>
          <div className="h-72 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="omset" name="Omset" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="biaya" name="Biaya" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="margin" name="Margin" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Performa CS (Closing Rate %)</h3>
          <div className="h-72 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={csPerformanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="closingRate" name="Closing Rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="target" name="Target (30%)" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Sumber Leads (Volume)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gauge Chart (RadialBar) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Pencapaian Target Omset Tahunan</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={24} data={targetAchievementData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center mt-12">
              <span className="text-4xl font-semibold text-blue-600">85%</span>
              <span className="text-sm text-slate-500 mt-1">Rp 1.05M / Rp 1.2M</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderCustomersList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Database Customers</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">Export CSV</button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input type="text" placeholder="Cari nama atau telepon..." className="pl-9 pr-4 py-2 border border-slate-300 rounded text-sm w-64 outline-none focus:border-blue-500 transition-colors" />
          </div>
          <select className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
            <option>-- Semua CS --</option>
            <option>Siti</option>
            <option>Budi</option>
          </select>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-medium transition-colors">Terapkan Filter</button>
        </div>
      </div>

      {/* Intutive Table Design for Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-medium w-12"></th>
                <th className="p-4 font-medium">Nama Customer</th>
                <th className="p-4 font-medium">No. Telepon / WA</th>
                <th className="p-4 font-medium">Total Order</th>
                <th className="p-4 font-medium">Catatan Khusus</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {mockCustomers.map((cust, idx) => (
                <tr key={cust.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                        {getInitials(cust.name)}
                     </div>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{cust.name}</td>
                  <td className="p-4 text-slate-600">{cust.phone}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">{cust.orders}x Order</span>
                  </td>
                  <td className="p-4 text-slate-500 italic max-w-xs truncate">{cust.notes}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors" title="Lihat Riwayat"><Eye className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit Profil"><Edit className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50">
          <span>Menampilkan 5 dari 1,204 Customer</span>
          <div className="flex space-x-1">
             <button className="px-2 py-1 text-slate-400 hover:text-slate-800 disabled:opacity-50" disabled>&larr; Prev</button>
             <button className="px-2 py-1 text-slate-600 hover:text-slate-800 font-medium">Next &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersCRM = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Daftar Orders</h2>
           <p className="text-sm text-slate-500 mt-1">CS Area - Monitor status dan konfirmasi pesanan.</p>
        </div>
        <button onClick={() => setActiveTab('form_order_crm')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2"/> Order Baru
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Status Order</label>
            <select className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
              <option>-- Semua Status --</option>
              <option>Order Baru</option>
              <option>Repeat Order</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Periode Dari</label>
            <input type="date" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Sampai</label>
            <input type="date" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded text-sm font-medium transition-colors border border-slate-200">Terapkan Filter</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6">Tanggal</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Paket & Porsi</th>
                <th className="p-4 font-medium">Total Nilai</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi (Detail/Print)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {mockOrdersCRM.map((order, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{order.date}</td>
                  <td className="p-4 font-medium text-slate-800">{order.customer}</td>
                  <td className="p-4">
                     <span className="block text-slate-700">{order.package}</span>
                     <span className="text-xs text-slate-500">{order.qty} pax</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{formatRp(order.total || 0)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                       order.status === 'Baru' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status === 'Baru' ? 'New Order' : 'Repeat Order'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center items-center space-x-2">
                    <button onClick={() => viewOrderDetail(order)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200">Detail</button>
                    <button onClick={() => openPrintModal(order)} className="bg-slate-100 text-slate-600 px-2 py-1.5 rounded text-xs hover:bg-slate-200 transition-colors border border-slate-200" title="Cetak Konfirmasi PDF"><Printer className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrderDetail = () => {
     if (!selectedOrder) return null;
     
     return (
       <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
             <button onClick={() => setActiveTab('orders_crm')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center">&larr; Kembali ke Daftar Order</button>
             <button onClick={() => openPrintModal(selectedOrder)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center shadow-sm">
                <Printer className="w-4 h-4 mr-2" /> Cetak Konfirmasi PDF
             </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">Detail Order: {selectedOrder.id}</h2>
                <div className="flex space-x-3 mt-3">
                   <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-xs font-medium">Status: Closing</span>
                   <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded text-xs font-medium">Payment: Lunas</span>
                   <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-medium">Tipe: {selectedOrder.status}</span>
                </div>
             </div>

             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
                <div className="space-y-3">
                   <div className="grid grid-cols-3"><span className="text-slate-500">Customer:</span> <span className="col-span-2 font-medium">{selectedOrder.customer}</span></div>
                   <div className="grid grid-cols-3"><span className="text-slate-500">Telepon:</span> <span className="col-span-2">{selectedOrder.phone}</span></div>
                   <div className="grid grid-cols-3"><span className="text-slate-500">Tanggal Order:</span> <span className="col-span-2">{selectedOrder.date}</span></div>
                   <div className="grid grid-cols-3"><span className="text-slate-500">Jam Berangkat:</span> <span className="col-span-2">{selectedOrder.time || '10:00'}</span></div>
                   <div className="grid grid-cols-3"><span className="text-slate-500">Jam Tiba:</span> <span className="col-span-2">{(selectedOrder.time && parseInt(selectedOrder.time) + 1 + ':00') || '11:00'}</span></div>
                </div>
                <div className="space-y-3">
                   <div className="grid grid-cols-1"><span className="text-slate-500 mb-1 block">Venue / Alamat Kirim:</span> <span className="bg-slate-50 p-3 rounded border border-slate-100 block">{selectedOrder.venue}</span></div>
                   <div className="grid grid-cols-1"><span className="text-slate-500 mb-1 block">Note Tambahan:</span> <span className="bg-slate-50 p-3 rounded border border-slate-100 block min-h-[3rem] italic">Tolong diantar tepat waktu.</span></div>
                </div>
             </div>

             <div className="p-6 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Detail Paket Pemesanan</h3>
                <div className="overflow-x-auto border border-blue-200 rounded">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-500 text-white text-xs uppercase tracking-wider">
                        <th className="p-3 font-medium">No</th>
                        <th className="p-3 font-medium">Paket</th>
                        <th className="p-3 font-medium">Harga</th>
                        <th className="p-3 font-medium">Jumlah</th>
                        <th className="p-3 font-medium">Diskon</th>
                        <th className="p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">1</td>
                        <td className="p-3 font-medium">{selectedOrder.package}</td>
                        <td className="p-3">{formatRp(selectedOrder.total / selectedOrder.qty)}</td>
                        <td className="p-3">{selectedOrder.qty} pax</td>
                        <td className="p-3">Rp 0</td>
                        <td className="p-3 font-medium">{formatRp(selectedOrder.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end">
                   <div className="text-right">
                      <span className="text-slate-500 text-sm block mb-1">Grand Total</span>
                      <span className="text-2xl font-bold text-slate-800">{formatRp(selectedOrder.total)}</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
     );
  }

  // --- MODAL FOR PRINT ---
  const renderPrintModal = () => {
    if (!isPrintModalOpen || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto font-sans">
        <div className="bg-white max-w-2xl w-full rounded shadow-2xl relative my-8">
          
          {/* Header Action Modal */}
          <div className="absolute -top-12 right-0 flex space-x-2">
             <button onClick={() => window.print()} className="bg-white text-slate-800 px-4 py-2 rounded shadow text-sm font-medium hover:bg-slate-100 flex items-center">
                <Printer className="w-4 h-4 mr-2" /> Print (A4 -{'>'} 2xA5 logic)
             </button>
             <button onClick={() => setIsPrintModalOpen(false)} className="bg-rose-500 text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-rose-600">Tutup</button>
          </div>

          {/* Simulated A5 Print Canvas */}
          <div className="p-8 pb-12 bg-white" id="print-canvas">
             <div className="border-b-2 border-slate-800 mb-6 pb-2">
                <h1 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Konfirmasi Pemesanan - Catering</h1>
             </div>
             
             <table className="w-full border-collapse border border-slate-800 text-sm mb-6">
                <tbody>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold w-1/3">Nama Pemesan</td>
                      <td className="border border-slate-800 p-2 uppercase">{selectedOrder.customer}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold">Instansi</td>
                      <td className="border border-slate-800 p-2"></td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold">No. HP</td>
                      <td className="border border-slate-800 p-2">{selectedOrder.phone}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold">Hari / Tanggal</td>
                      <td className="border border-slate-800 p-2">{selectedOrder.date}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold">Jam Berangkat</td>
                      <td className="border border-slate-800 p-2">{selectedOrder.time || '10:00'}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold">Jam Sampai Lokasi</td>
                      <td className="border border-slate-800 p-2">{(selectedOrder.time && parseInt(selectedOrder.time) + 1 + ':00') || '11:00'}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold align-top">Kirim ke</td>
                      <td className="border border-slate-800 p-2">{selectedOrder.venue}</td>
                   </tr>
                   <tr>
                      <td className="border border-slate-800 p-2 font-semibold align-top">Jenis Paket</td>
                      <td className="border border-slate-800 p-2">{selectedOrder.package}<br/>({selectedOrder.qty} Porsi)</td>
                   </tr>
                </tbody>
             </table>

             <div className="border border-slate-800 mb-8">
                <div className="bg-slate-100 border-b border-slate-800 p-2 font-semibold text-sm">
                   Daftar Menu: {selectedOrder.package} ({selectedOrder.qty})
                </div>
                <div className="p-2 text-sm uppercase">
                   <p>1. Nasi Putih</p>
                   <p className="mt-1">2. Olahan Daging / Ayam Menu Utama</p>
                   <p className="mt-1">3. Tumisan Sayur</p>
                   <p className="mt-1">4. Lauk Pendamping</p>
                   <p className="mt-1">5. Kerupuk & Sambal</p>
                   <p className="mt-1">6. Buah</p>
                </div>
                <div className="border-t border-slate-800 p-2 text-sm flex">
                   <span className="font-semibold w-1/3">Catatan:</span>
                   <span>Mohon dicek kembali kesesuaian menu.</span>
                </div>
             </div>

             <div className="flex justify-between text-sm mt-12 px-8">
                <div className="text-center">
                   <p className="mb-12">Pemesan,</p>
                   <p className="font-semibold underline uppercase">({selectedOrder.customer})</p>
                </div>
                <div className="text-center">
                   <p className="mb-12">Admin,</p>
                   <p className="font-semibold underline">( __________________ )</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER HELPERS ---
  
  const renderOrdersFinance = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Cost Control (Finance)</h2>
          <p className="text-xs text-slate-500 mt-1">Input aktual belanja HPP dan monitor overbudget.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
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
            {mockOrdersFinance.map((order) => {
              const isOverbudget = order.statusCost === 'Overbudget';
              const diff = order.actualCost - order.estBudget;
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-4">{order.id}<br/><span className="text-xs text-slate-400">{order.date}</span></td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800 block">{order.customer}</span>
                    <span className="text-xs text-slate-500">{order.package}</span>
                  </td>
                  <td className="p-4">{formatRp(order.revenue)}</td>
                  <td className="p-4 bg-amber-50/30 text-amber-800">{formatRp(order.estBudget)}</td>
                  <td className={`p-4 ${isOverbudget ? 'bg-rose-50/50 text-rose-700 font-medium' : 'text-slate-800'}`}>
                    {order.actualCost > 0 ? formatRp(order.actualCost) : '-'}
                    {isOverbudget && <span className="block text-xs text-rose-600 mt-1">+( {formatRp(diff)} )</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center w-max ${
                      order.statusCost === 'Safe' ? 'bg-emerald-100 text-emerald-700' :
                      order.statusCost === 'Overbudget' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {order.statusCost === 'Overbudget' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {order.statusCost}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded text-xs transition-colors border border-slate-200">Input Cost</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLeadsList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Daftar Leads</h2>
        <button onClick={() => setActiveTab('form_lead')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Tambah Lead Baru
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-medium pl-6">ID</th>
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Customer/Nama</th>
              <th className="p-4 font-medium">No. WA</th>
              <th className="p-4 font-medium">Sumber</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">PIC</th>
              <th className="p-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {mockLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                <td className="p-4 pl-6 text-slate-500">{lead.id}</td>
                <td className="p-4 text-slate-500">{lead.date}</td>
                <td className="p-4 font-medium text-slate-800">{lead.name}</td>
                <td className="p-4">{lead.phone}</td>
                <td className="p-4">{lead.source}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                    lead.status === 'Closed Won' ? 'bg-emerald-100 text-emerald-700' :
                    lead.status === 'Closed Lost' ? 'bg-rose-100 text-rose-700' :
                    lead.status === 'Follow Up' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{lead.pic}</td>
                <td className="p-4 flex justify-center space-x-2">
                  <button onClick={() => setActiveTab('form_lead')} className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFormLead = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-6">
       <div className="flex items-center mb-6 border-b border-slate-100 pb-4">
          <button onClick={() => setActiveTab('leads')} className="mr-4 text-slate-400 hover:text-slate-800">&larr; Kembali</button>
          <h2 className="text-lg font-semibold text-slate-800">Form Entry / Edit Lead (CRM)</h2>
       </div>
       <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Tanggal Masuk Lead *</label>
                <input type="date" defaultValue="2026-05-19" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
             </div>
             <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Sumber Lead *</label>
                <select className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400">
                   <option>WhatsApp</option><option>Instagram</option><option>Google Ads</option>
                </select>
             </div>
             <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Nama Customer</label>
                <input type="text" placeholder="Cth: PT. ABC / Bpk Budi" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
             </div>
             <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Nomor WhatsApp / Telepon *</label>
                <input type="tel" placeholder="08xxxxxxxxxx" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
             </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
             <button onClick={() => setActiveTab('leads')} className="px-5 py-2 rounded text-slate-600 font-medium hover:bg-slate-100 transition-colors">Batal</button>
             <button onClick={() => setActiveTab('leads')} className="px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">Simpan Data Lead</button>
          </div>
       </div>
    </div>
  );

  const renderFormOrderCRM = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Create Order</h2>
        <button onClick={() => setActiveTab('orders_crm')} className="text-sm text-slate-500 hover:text-slate-800">&larr; Kembali</button>
      </div>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setActiveTab('orders_crm'); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 block">CS ID</label>
            <input type="text" disabled defaultValue="1" className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 block">Nama / No HP Customer</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600 block">Telepon</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600 block">Tanggal kirim</label>
            <input type="date" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 block">Jam Berangkat</label>
            <input type="time" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 block">Jam Tiba</label>
            <input type="time" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600 block">Alamat kirim</label>
            <textarea rows="2" placeholder="Alamat / Venue" className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400 resize-none"></textarea>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600 block">Catatan</label>
            <textarea rows="2" placeholder="Isi Jika perlu..." className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-400 resize-none"></textarea>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-base font-semibold text-slate-800 mb-3">Detail Paket</h3>
          <div className="overflow-x-auto border border-blue-200 rounded">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-blue-500 text-white text-xs text-center uppercase tracking-wider">
                  <th className="p-2.5 font-medium border-r border-blue-400">Paket</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Menu</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Harga</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Jumlah</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Diskon</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Biaya</th>
                  <th className="p-2.5 font-medium border-r border-blue-400">Total</th>
                  <th className="p-2.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                  <td className="p-2 align-top border-r border-slate-200">
                    <select className="w-full p-1.5 border border-slate-300 rounded text-xs outline-none bg-white">
                      <option>Bento 25.000 - Rp 25.000</option>
                      <option>Nasi Box Premium - Rp 35.000</option>
                    </select>
                  </td>
                  <td className="p-2 align-top border-r border-slate-200">
                    <textarea rows="3" defaultValue="1. Nasi Putih&#10;2. Ayam Goreng&#10;3. Sambal" className="w-full p-1.5 border border-slate-300 rounded text-xs outline-none resize-none"></textarea>
                  </td>
                  <td className="p-2 align-top border-r border-slate-200"><input type="text" className="w-full p-1.5 border border-slate-300 rounded text-xs" /></td>
                  <td className="p-2 align-top border-r border-slate-200"><input type="number" defaultValue="1" className="w-full p-1.5 border border-slate-300 rounded text-xs" /></td>
                  <td className="p-2 align-top border-r border-slate-200"><input type="number" defaultValue="0" className="w-full p-1.5 border border-slate-300 rounded text-xs" /></td>
                  <td className="p-2 align-top border-r border-slate-200"><input type="number" defaultValue="0" className="w-full p-1.5 border border-slate-300 rounded text-xs" /></td>
                  <td className="p-2 align-top border-r border-slate-200"><input type="text" disabled className="w-full p-1.5 border border-slate-200 rounded text-xs bg-slate-100" /></td>
                  <td className="p-2 align-top text-center">
                    <button type="button" className="bg-rose-500 text-white p-1.5 rounded hover:bg-rose-600"><X className="w-4 h-4"/></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button type="button" className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded shadow-sm text-xs font-medium transition-colors">
              + Tambah Paket
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-start space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Grand Total: Rp 0</h3>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded shadow-sm text-sm font-medium transition-colors">
            Simpan Order
          </button>
        </div>
      </form>
    </div>
  );

  const renderPnL = () => (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Laporan Laba Rugi (Profit & Loss)</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-700">Periode: Mei 2026</div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Total Pendapatan (Omset)</span>
            <span className="font-semibold text-slate-800">Rp 210.000.000</span>
          </div>
          <div className="border-b border-slate-200"></div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Harga Pokok Penjualan (HPP Aktual)</span>
            <span className="text-rose-600">(Rp 110.000.000)</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
            <span className="font-medium text-slate-800">Laba Kotor (Gross Profit)</span>
            <span className="font-semibold text-slate-800">Rp 100.000.000</span>
          </div>
          
          <div className="border-b border-slate-200 mt-4 mb-2"></div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Biaya Operasional (Gaji, Listrik, Marketing)</span>
            <span className="text-rose-600">(Rp 20.000.000)</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg mt-2 text-base border border-emerald-100">
            <span className="font-semibold text-emerald-800">Laba Bersih (Net Profit)</span>
            <span className="font-semibold text-emerald-800">Rp 80.000.000</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHR = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-semibold text-slate-800">Performa CS (SLA Tracking)</h2>
         <select className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
            <option>Bulan Ini (Mei)</option>
            <option>Bulan Lalu (Apr)</option>
         </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-medium pl-6">Nama CS</th>
                  <th className="p-4 font-medium">Total Leads</th>
                  <th className="p-4 font-medium">Closing Order</th>
                  <th className="p-4 font-medium">Closing Rate</th>
                  <th className="p-4 font-medium">Status SLA</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm">
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-medium pl-6 text-slate-800">Ayu (CS 3)</td>
                  <td className="p-4 text-slate-500">100</td>
                  <td className="p-4 text-slate-500">42</td>
                  <td className="p-4 font-medium text-emerald-600">42.0%</td>
                  <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">Excellent</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-medium pl-6 text-slate-800">Siti (CS 1)</td>
                  <td className="p-4 text-slate-500">120</td>
                  <td className="p-4 text-slate-500">42</td>
                  <td className="p-4 font-medium text-emerald-600">35.0%</td>
                  <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">Excellent</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-medium pl-6 text-slate-800">Budi (CS 2)</td>
                  <td className="p-4 text-slate-500">150</td>
                  <td className="p-4 text-slate-500">42</td>
                  <td className="p-4 font-medium text-amber-600">28.0%</td>
                  <td className="p-4"><span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">Standard</span></td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-medium pl-6 text-slate-800">Deni (CS 4)</td>
                  <td className="p-4 text-slate-500">80</td>
                  <td className="p-4 text-slate-500">16</td>
                  <td className="p-4 font-medium text-rose-600">20.0%</td>
                  <td className="p-4"><span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max"><AlertTriangle className="w-3 h-3 mr-1"/> Underperform</span></td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );

  const renderMasterProducts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Master Data Produk & Harga</h2>
           <p className="text-sm text-slate-500 mt-1">Kelola katalog paket catering dan harga jual ke pelanggan.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6">ID Produk</th>
                <th className="p-4 font-medium">Nama Paket / Produk</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Harga Jual</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {mockProducts.map((prod, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{prod.id}</td>
                  <td className="p-4 font-medium text-slate-800">{prod.name}</td>
                  <td className="p-4 text-slate-600">{prod.category}</td>
                  <td className="p-4 font-medium text-slate-800">{formatRp(prod.price)}</td>
                  <td className="p-4">
                     <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">{prod.status}</span>
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMasterRecipes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Master Resep & HPP Standar</h2>
           <p className="text-sm text-slate-500 mt-1">Bill of Materials (BOM) untuk estimasi budget Cost Control.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah Resep / HPP
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6">Terkait Produk</th>
                <th className="p-4 font-medium">Komponen Utama (Bahan)</th>
                <th className="p-4 font-medium">Est. HPP Standar</th>
                <th className="p-4 font-medium">Est. Margin</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {mockRecipes.map((recipe, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-800">{recipe.product}</td>
                  <td className="p-4 text-slate-500">{recipe.ingredients}</td>
                  <td className="p-4 font-semibold text-rose-600">{formatRp(recipe.stdCost)}</td>
                  <td className="p-4 font-medium text-emerald-600">{recipe.margin}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button className="bg-slate-100 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded text-xs transition-colors border border-slate-200">Detail BOM</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMasterUsers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-slate-800">Manajemen User / Karyawan</h2>
           <p className="text-sm text-slate-500 mt-1">Atur hak akses, target KPI/SLA, dan kredensial login.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-medium pl-6">ID User</th>
                <th className="p-4 font-medium">Nama Karyawan</th>
                <th className="p-4 font-medium">Role / Hak Akses</th>
                <th className="p-4 font-medium">Email Terdaftar</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {mockUsers.map((user, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{user.id}</td>
                  <td className="p-4 font-medium text-slate-800">
                     <div className="flex items-center">
                        <UserCircle className="w-5 h-5 text-slate-400 mr-2" />
                        {user.name}
                     </div>
                  </td>
                  <td className="p-4">
                     <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                        user.role === 'Owner' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'Finance' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                     }`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4">
                     <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">{user.status}</span>
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors" title="Edit Profil"><Edit className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors" title="Nonaktifkan"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Pengaturan Sistem Dasar</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Profil Perusahaan</h3>
          <input type="text" defaultValue="CRM Catering & ERP" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 mb-3" />
          <textarea rows="3" defaultValue="Jl. Pangaritan Utara, Bandung" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 resize-none"></textarea>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Target SLA Minimum (Closing Rate)</h3>
          <div className="flex items-center space-x-2">
            <input type="number" defaultValue="30" className="w-24 p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" />
            <span className="text-sm text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">CS akan ditandai underperform jika berada di bawah angka persentase ini.</p>
        </div>
        <div className="pt-4 border-t border-slate-100">
           <button className="bg-blue-600 text-white px-5 py-2.5 rounded shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors">Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  );

  // --- MAIN LAYOUT STRUCTURE ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Catering ERP System</h1>
          <p className="text-sm text-slate-500 mb-8">Smart CRM & Finance Control Panel</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all text-sm shadow-sm"
          >
            {/* Inline SVG for stable Google Logo */}
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>Login SSO Google (Super Admin)</span>
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Utama' },
    { id: 'heading1', isHeading: true, label: 'CRM & Sales' },
    { id: 'leads', icon: Users, label: 'Daftar Leads' },
    { id: 'customers', icon: UserCircle, label: 'Daftar Customers' },
    { id: 'orders_crm', icon: ShoppingBag, label: 'Daftar Orders (CRM)' },
    { id: 'heading2', isHeading: true, label: 'Operations & Finance' },
    { id: 'orders_finance', icon: DollarSign, label: 'Cost Control (HPP)' },
    { id: 'pnl', icon: FileText, label: 'Laporan Laba Rugi' },
    { id: 'heading3', isHeading: true, label: 'Management' },
    { id: 'hr', icon: TrendingUp, label: 'Performa CS (SLA)' },
    { id: 'heading4', isHeading: true, label: 'Master Data' },
    { id: 'master_products', icon: Package, label: 'Produk & Harga' },
    { id: 'master_recipes', icon: BookOpen, label: 'Resep & HPP Standar' },
    { id: 'master_users', icon: UserCog, label: 'Manajemen User' },
    { id: 'settings', icon: Settings, label: 'Pengaturan Sistem' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-['Source_Sans_Pro']">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col fixed h-full z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          {sidebarOpen ? (
            <span className="text-white font-semibold text-lg flex items-center"><LayoutDashboard className="w-5 h-5 mr-2 text-blue-400"/> ERP Catering</span>
          ) : (
            <LayoutDashboard className="w-5 h-5 text-blue-400"/>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((menu, idx) => {
              if (menu.isHeading) {
                return sidebarOpen ? (
                  <li key={idx} className="px-6 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {menu.label}
                  </li>
                ) : <li key={idx} className="mt-6"></li>;
              }

              const Icon = menu.icon;
              const isActive = activeTab === menu.id || 
                               (activeTab === 'order_detail' && menu.id === 'orders_crm') || 
                               (activeTab === 'form_order_crm' && menu.id === 'orders_crm') || 
                               (activeTab === 'form_lead' && menu.id === 'leads');

              return (
                <li key={idx}>
                  <button 
                    onClick={() => setActiveTab(menu.id)}
                    className={`w-full flex items-center ${sidebarOpen ? 'px-6' : 'justify-center px-0'} py-3 text-sm transition-colors
                      ${isActive ? 'bg-slate-800 text-blue-400 border-r-4 border-blue-500 font-medium' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                    title={!sidebarOpen ? menu.label : ''}
                  >
                    <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && <span>{menu.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 h-screen relative`}>
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800 transition-colors mr-4">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari data..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded text-sm focus:bg-white focus:border-blue-400 outline-none w-64 transition-all" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative text-slate-500 hover:text-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-medium text-sm">SA</div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-slate-800 leading-tight">Super Admin</p>
                <p className="text-xs text-slate-500">Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'leads' && renderLeadsList()}
          {activeTab === 'form_lead' && renderFormLead()}
          {activeTab === 'customers' && renderCustomersList()}
          {activeTab === 'orders_crm' && renderOrdersCRM()}
          {activeTab === 'form_order_crm' && renderFormOrderCRM()}
          {activeTab === 'order_detail' && renderOrderDetail()}
          {activeTab === 'orders_finance' && renderOrdersFinance()}
          {activeTab === 'pnl' && renderPnL()}
          {activeTab === 'hr' && renderHR()}
          {activeTab === 'master_products' && renderMasterProducts()}
          {activeTab === 'master_recipes' && renderMasterRecipes()}
          {activeTab === 'master_users' && renderMasterUsers()}
          {activeTab === 'settings' && renderSettings()}
        </div>
        
        {/* Print Modal Overlay */}
        {renderPrintModal()}
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #475569; }
        @media print {
           body * { visibility: hidden; }
           #print-canvas, #print-canvas * { visibility: visible; }
           #print-canvas { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important;}
        }
      `}} />
    </div>
  );
}