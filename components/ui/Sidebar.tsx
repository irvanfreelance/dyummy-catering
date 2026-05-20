import React from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, DollarSign, 
  Settings, LogOut, Package, BookOpen, UserCog
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (o: boolean) => void }) {
  const pathname = usePathname();
  
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, id: '/dashboard', isHeading: false },
    
    { label: 'CRM & Sales', icon: null, id: 'heading-crm', isHeading: true },
    { label: 'Leads', icon: Users, id: '/leads', isHeading: false },
    { label: 'Customers', icon: UserCog, id: '/customers', isHeading: false },
    { label: 'Orders (CRM)', icon: ShoppingBag, id: '/orders/crm', isHeading: false },
    
    { label: 'Finance & Report', icon: null, id: 'heading-finance', isHeading: true },
    { label: 'Orders (Finance)', icon: DollarSign, id: '/orders/finance', isHeading: false },
    
    { label: 'Master Data', icon: null, id: 'heading-master', isHeading: true },
    { label: 'Products (Paket)', icon: Package, id: '/products', isHeading: false },
    { label: 'Recipes (BOM)', icon: BookOpen, id: '/recipes', isHeading: false },
    
    { label: 'Pengaturan', icon: null, id: 'heading-settings', isHeading: true },
    { label: 'Settings', icon: Settings, id: '/settings', isHeading: false },
  ];

  return (
    <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col fixed h-full z-30 shadow-xl md:shadow-none
      ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
    `}>
      <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950 shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wider flex items-center">
          <span className="bg-blue-600 text-white p-1 rounded-md mr-2">DY</span>
          {sidebarOpen && <span>CATERING</span>}
        </h1>
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

            const Icon = menu.icon!;
            const isActive = pathname?.startsWith(menu.id);

            return (
              <li key={idx}>
                <Link 
                  href={menu.id}
                  className={`w-full flex items-center ${sidebarOpen ? 'px-6' : 'justify-center px-0'} py-3 text-sm transition-colors
                    ${isActive ? 'bg-slate-800 text-blue-400 border-r-4 border-blue-500 font-medium' : 'hover:bg-slate-800 hover:text-white'}
                  `}
                  title={!sidebarOpen ? menu.label : ''}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && <span className="truncate">{menu.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-md transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
