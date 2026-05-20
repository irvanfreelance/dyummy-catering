import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export default function Header({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (o: boolean) => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800 transition-colors mr-4">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari data..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:border-blue-400 outline-none w-64 transition-all" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative text-slate-500 hover:text-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-medium text-sm">SA</div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-slate-800 leading-tight">Super Admin</p>
            <p className="text-xs text-slate-500">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
