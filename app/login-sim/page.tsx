"use client";

import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { ROLES, getRoleConfig, type RoleKey } from "@/lib/roleConfig";
import {
  LayoutDashboard, Inbox, Users, ShoppingBag, BarChart2,
  CalendarDays, BookOpen, ClipboardList, TrendingUp, CreditCard,
  PieChart, Settings, Target, CheckCircle, ArrowRight, Utensils,
} from "lucide-react";

// Map href → icon & label (same as sidebar)
const MENU_META: Record<string, { label: string; icon: any }> = {
  "/dashboard":           { label: "Dashboard",        icon: LayoutDashboard },
  "/leads":               { label: "Lead Harian",       icon: Inbox },
  "/customers":           { label: "Data Kontak",       icon: Users },
  "/orders":              { label: "Order",             icon: ShoppingBag },
  "/cs-performance":      { label: "Performa CS",       icon: BarChart2 },
  "/production-schedules":{ label: "Jadwal Produksi",   icon: CalendarDays },
  "/recipes":             { label: "Master Resep",      icon: BookOpen },
  "/purchasing":          { label: "PR & PO",           icon: ClipboardList },
  "/market-prices":       { label: "Harga Pasar",       icon: TrendingUp },
  "/finance":             { label: "Realisasi Cost",    icon: CreditCard },
  "/pl-dashboard":        { label: "P&L Dashboard",     icon: PieChart },
  "/targets":             { label: "Target & Realisasi", icon: Target },
  "/settings":            { label: "Manajemen User",    icon: Settings },
};

const ALL_HREFS = Object.keys(MENU_META);

export default function LoginSimPage() {
  const { activeRole, setActiveRole } = useRole();
  const router = useRouter();

  const handleSelect = (roleKey: RoleKey) => {
    setActiveRole(roleKey);
    const cfg = getRoleConfig(roleKey);
    router.push(cfg.firstPage);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d1f1a 0%, #0F6E56 50%, #1a4a3a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* Background decoration */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(29,158,117,0.12)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(55,138,221,0.10)", filter: "blur(50px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Utensils size={22} color="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>Dyummy Catering</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>ERP & CRM System</p>
            </div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Simulasi Login Peran
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: 480, marginInline: "auto" }}>
            Pilih peran untuk melihat tampilan menu yang sesuai. Sidebar akan otomatis menyesuaikan akses berdasarkan role yang dipilih.
          </p>
        </div>

        {/* Role cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {ROLES.map((role) => {
            const isActive = activeRole === role.key;
            const hrefs = role.allowedHrefs === "*" ? ALL_HREFS : role.allowedHrefs as string[];

            return (
              <button
                key={role.key}
                onClick={() => handleSelect(role.key)}
                style={{
                  background: isActive
                    ? "white"
                    : "rgba(255,255,255,0.07)",
                  border: isActive
                    ? `2px solid ${role.color}`
                    : "2px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "20px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  backdropFilter: "blur(12px)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.borderColor = `${role.color}80`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <CheckCircle size={18} color={role.color} />
                  </div>
                )}

                {/* Avatar + role name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isActive ? role.color : `${role.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800,
                    color: isActive ? "white" : role.color,
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}>
                    {role.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#111827" : "white", margin: 0, lineHeight: 1.2 }}>
                      {role.label}
                    </p>
                    <p style={{ fontSize: 11, color: isActive ? "#6b7280" : "rgba(255,255,255,0.5)", margin: "3px 0 0", lineHeight: 1.3 }}>
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Menu access list */}
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#6b7280" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                    Akses Menu ({hrefs.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {hrefs.map((href) => {
                      const meta = MENU_META[href];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <div key={href} style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "3px 8px",
                          background: isActive ? `${role.color}15` : "rgba(255,255,255,0.08)",
                          borderRadius: 20,
                          fontSize: 11,
                          color: isActive ? role.color : "rgba(255,255,255,0.75)",
                          fontWeight: 500,
                        }}>
                          <Icon size={10} />
                          {meta.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: 12, borderTop: isActive ? `1px solid ${role.color}25` : "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? role.color : "rgba(255,255,255,0.6)" }}>
                      {isActive ? "✓ Role aktif sekarang" : "Masuk sebagai role ini"}
                    </span>
                    {!isActive && (
                      <span style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        Halaman awal: {MENU_META[role.firstPage]?.label ?? role.firstPage}
                      </span>
                    )}
                    {isActive && (
                      <span style={{ display: "block", fontSize: 10, color: role.color, marginTop: 2, opacity: 0.7 }}>
                        Halaman awal: {MENU_META[role.firstPage]?.label ?? role.firstPage}
                      </span>
                    )}
                  </div>
                  {!isActive && <ArrowRight size={14} color="rgba(255,255,255,0.4)" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          💡 Ini adalah mode simulasi — tidak memerlukan password. Pilihan tersimpan di browser Anda.
        </p>
      </div>
    </div>
  );
}
