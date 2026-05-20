"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Fetch all orders and find the one. Since we don't have a single GET endpoint yet,
    // we use get-list-crm and filter. In production, a GET /api/orders/get-by-id is better.
    fetch('/api/orders/get-list-crm')
      .then(res => res.json())
      .then((data: any[]) => {
        const found = data.find(o => o.id.toString() === id.toString());
        setOrder(found);
        setLoading(false);
        
        // Auto trigger print dialog after a slight delay to ensure rendering
        setTimeout(() => {
          window.print();
        }, 500);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat dokumen...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-rose-500">Order tidak ditemukan!</div>;
  }

  return (
    <div id="print-canvas" className="bg-white text-slate-800 p-8 max-w-4xl mx-auto border border-slate-200 min-h-screen md:min-h-[297mm]">
      {/* Header Kop Surat */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
        <div>
           <div className="flex items-center mb-2">
             <span className="bg-slate-800 text-white p-1.5 rounded-md font-bold text-lg mr-3">DY</span>
             <h1 className="text-2xl font-bold tracking-wider uppercase text-slate-900">Catering Smart</h1>
           </div>
           <p className="text-sm text-slate-600">Jl. Contoh Alamat No. 123, Kota Bandung</p>
           <p className="text-sm text-slate-600">Telp: 0812-3456-7890 | Web: www.dyummy.com</p>
        </div>
        <div className="text-right">
           <h2 className="text-xl font-bold uppercase text-slate-400 tracking-widest mb-1">Sales Order</h2>
           <p className="text-lg font-semibold text-slate-800">ORD-{order.id}</p>
           <p className="text-sm text-slate-500 mt-1">Tgl Terbit: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Info Customer & Pengiriman */}
      <div className="grid grid-cols-2 gap-8 mb-8">
         <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Tagihan Kepada</h3>
            <p className="font-bold text-slate-800 text-lg">{order.customer}</p>
            <p className="text-sm mt-1">Telepon: {order.phone}</p>
         </div>
         <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Detail Pengiriman</h3>
            <div className="grid grid-cols-3 gap-2 text-sm mt-2">
               <span className="text-slate-500">Tgl Kirim</span>
               <span className="col-span-2 font-medium">{order.delivery_date}</span>
               
               <span className="text-slate-500">Waktu Berangkat</span>
               <span className="col-span-2 font-medium">{order.time || 'Sesuai Jadwal'}</span>
               
               <span className="text-slate-500">Venue / Alamat</span>
               <span className="col-span-2">{order.venue}</span>
            </div>
         </div>
      </div>

      {/* Tabel Item */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-300">
            <th className="py-3 px-4 font-semibold text-sm">Deskripsi Paket</th>
            <th className="py-3 px-4 font-semibold text-sm">Qty</th>
            <th className="py-3 px-4 font-semibold text-sm">Harga Satuan</th>
            <th className="py-3 px-4 font-semibold text-sm text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm border-b border-slate-300">
          {order.items_json?.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-slate-100 border-dashed">
              <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
              <td className="py-3 px-4">{item.quantity} pax</td>
              <td className="py-3 px-4">{formatRp(Number(item.unit_price))}</td>
              <td className="py-3 px-4 font-medium text-right">{formatRp(Number(item.total_price))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Kalkulasi Total & Catatan */}
      <div className="flex justify-between items-start">
         <div className="w-1/2 pr-8">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Catatan Tambahan</h3>
            <p className="text-sm italic text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
              {order.notes || 'Tidak ada catatan tambahan untuk pesanan ini.'}
            </p>
         </div>
         <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-slate-200">
               <span className="text-slate-600 font-medium">Subtotal</span>
               <span className="font-medium text-slate-800">{formatRp(Number(order.total))}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-slate-800">
               <span className="text-slate-800 font-bold text-lg">Grand Total</span>
               <span className="font-bold text-lg text-slate-800">{formatRp(Number(order.total))}</span>
            </div>
         </div>
      </div>

      {/* Tanda Tangan */}
      <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm">
         <div>
            <p className="mb-16">Hormat Kami,</p>
            <p className="font-bold underline">DY Catering Smart</p>
            <p className="text-slate-500">Sales / CS</p>
         </div>
         <div>
            <p className="mb-16">Penerima,</p>
            <p className="font-bold underline">{order.customer}</p>
            <p className="text-slate-500">Tanda Tangan & Nama Terang</p>
         </div>
      </div>
    </div>
  );
}
