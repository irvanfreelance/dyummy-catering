"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const financialDataMock = [
  { month: 'Jan', omset: 120, biaya: 80, margin: 40 },
  { month: 'Feb', omset: 150, biaya: 95, margin: 55 },
  { month: 'Mar', omset: 180, biaya: 110, margin: 70 },
  { month: 'Apr', omset: 140, biaya: 100, margin: 40 },
  { month: 'Mei', omset: 210, biaya: 130, margin: 80 },
  { month: 'Jun', omset: 250, biaya: 145, margin: 105 },
];

const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/get-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (!stats) return <div className="p-10 text-center text-rose-500">Failed to load data</div>;

  const { financial, crm } = stats;

  const targetAchievementData = [
    { name: 'Target', value: 100, fill: '#f1f5f9' }, 
    { name: 'Omset', value: (financial.totalOmset / 1200000000) * 100, fill: '#3b82f6' }    
  ];

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Financial & CRM Target Overview</h2>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center border border-emerald-200">
          <CheckCircle className="w-4 h-4 mr-2" />
          Status Bisnis: Sehat (Margin {financial.netMargin}%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Total Omset (YTD)</span>
          <span className="text-2xl font-semibold text-slate-800">{formatRp(financial.totalOmset)}</span>
          <span className="text-emerald-600 text-xs font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Live Data</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Total Biaya (Actual Cost)</span>
          <span className="text-2xl font-semibold text-rose-600">{formatRp(financial.totalBiaya)}</span>
          <span className="text-rose-500 text-xs font-medium mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Monitor Cost</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Net Margin</span>
          <span className="text-2xl font-semibold text-emerald-600">{financial.netMargin}%</span>
          <span className="text-slate-500 text-xs font-medium mt-2 block">Target minimal: 30%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Avg Closing Rate</span>
          <span className="text-2xl font-semibold text-blue-600">{crm.avgClosingRate}%</span>
          <span className="text-blue-600 text-xs font-medium mt-2 flex items-center">SLA Target ({'>'}30%)</span>
        </div>
      </div>

      {/* 4 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Tren Omset vs Biaya vs Margin (Simulasi)</h3>
          <div className="h-72 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialDataMock}>
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Performa CS (Closing Rate %)</h3>
          <div className="h-72 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crm.csPerformanceData} layout="vertical" margin={{ left: 20, right: 20 }}>
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Sumber Leads (Volume)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={crm.leadSources} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label>
                  {crm.leadSources.map((entry: any, index: number) => (
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Pencapaian Target Omset Tahunan</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={24} data={targetAchievementData} startAngle={180} endAngle={0}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center mt-12">
              <span className="text-4xl font-semibold text-blue-600">{Math.round((financial.totalOmset / 1200000000) * 100)}%</span>
              <span className="text-sm text-slate-500 mt-1">{formatRp(financial.totalOmset)} / Rp 1.2M</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
