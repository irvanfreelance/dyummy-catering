"use client";
import React, { useState } from 'react';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 flex flex-col transition-all duration-300 h-screen relative w-full ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 w-full max-w-full">
          {children}
        </div>
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
