"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, Users, ShoppingBag, BarChart2,
  CalendarDays, BookOpen, ClipboardList, TrendingUp, CreditCard,
  PieChart, Settings, Menu, X, Utensils, Target, LogOut, ChefHat,
  ShoppingCart, DollarSign, Truck,
} from "lucide-react";

const MENU = [
  {
    section: "Dashboard",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "CRM",
    items: [
      { href: "/leads", label: "Lead Harian", icon: Inbox },
      { href: "/customers", label: "Data Kontak", icon: Users },
      { href: "/orders", label: "Order", icon: ShoppingBag },
      { href: "/cs-performance", label: "Performa CS", icon: BarChart2 },
    ],
  },
  {
    section: "Cost Control — Chef",
    items: [
      { href: "/production-schedules", label: "Jadwal Produksi", icon: CalendarDays },
      { href: "/recipes", label: "Master Resep", icon: BookOpen },
    ],
  },
  {
    section: "Purchasing",
    items: [
      { href: "/purchasing", label: "PR & PO", icon: ClipboardList },
      { href: "/market-prices", label: "Harga Pasar", icon: TrendingUp },
    ],
  },
  {
    section: "Keuangan",
    items: [
      { href: "/finance", label: "Realisasi Cost", icon: CreditCard },
    ],
  },
  {
    section: "Owner / Admin",
    items: [
      { href: "/pl-dashboard", label: "P&L Dashboard", icon: PieChart },
      { href: "/targets", label: "Target & Realisasi", icon: Target },
      { href: "/settings", label: "Manajemen User", icon: Settings },
    ],
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on login/print pages
  const isPublicPage = pathname?.startsWith("/login") || pathname?.startsWith("/print");

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  const activeLabel = MENU.flatMap((s) => s.items).find((i) => i.href === pathname)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6", position: "relative" }}>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          style={{ display: "block", position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 98 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarOpen ? 224 : 0,
          minWidth: sidebarOpen ? 224 : 0,
          background: "#0F6E56",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          transition: "all 0.22s ease",
          flexShrink: 0,
          zIndex: 99,
          position: isMobile ? "fixed" : "relative",
          height: isMobile ? "100vh" : "auto",
          top: 0,
          left: 0,
        }}
      >
        {/* Brand */}
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Utensils size={18} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>
                Dyummy
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginTop: 2 }}>
                Catering ERP
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {MENU.map((section) => (
            <div key={section.section}>
              <p style={{
                fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "10px 16px 4px", whiteSpace: "nowrap",
              }}>
                {section.section}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 16px",
                      background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                      color: "white",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      borderLeft: isActive ? "3px solid white" : "3px solid transparent",
                      opacity: isActive ? 1 : 0.82,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.12s",
                    }}>
                      <Icon size={15} style={{ flexShrink: 0 }} />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "white",
            }}>SA</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.2 }}>Super Admin</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>admin@catering.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          height: 52,
          background: "white",
          borderBottom: "0.5px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}>
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, display: "flex", alignItems: "center" }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{activeLabel}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              fontSize: 11, color: "#6b7280",
              background: "#f9fafb",
              border: "0.5px solid #e5e7eb",
              padding: "4px 10px",
              borderRadius: 20,
            }}>Super Admin Mode</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#639922" }} />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
