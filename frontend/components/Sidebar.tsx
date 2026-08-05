"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Factory,
  Radio,
  AlertTriangle,
  TimerReset,
  Wrench,
  FileBarChart2,
  ShieldCheck,
  Settings,
  Repeat,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Machines", href: "/dashboard/machines", icon: Factory },
  { label: "Sensors", href: "/dashboard/sensors", icon: Radio },
  { label: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { label: "Downtime", href: "/dashboard/downtime", icon: TimerReset },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { label: "Reports", href: "/dashboard/reports", icon: FileBarChart2 },
  { label: "PFMEA", href: "/dashboard/pfmea", icon: ShieldCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },

  {
    label: "Changeover",
    href: "/dashboard/changeover",
    icon: Repeat,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  const content = (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* ambient bloom */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-sky-500/15 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 -left-10 h-56 w-56 rounded-full bg-cyan-400/[0.06] blur-[110px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />

      {/* brand */}
      <div className="relative flex items-center justify-between px-5 pb-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/25 bg-gradient-to-br from-sky-500/25 via-sky-400/10 to-cyan-400/15 shadow-[0_0_28px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-6px_10px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-sky-300"
              fill="none"
            >
              <path
                d="M4 17V9l8-4 8 4v8l-8 4-8-4Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M4 9l8 4 8-4M12 13v8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-slate-100">
              PackPilot
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Operations Platform
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-1.5 text-slate-400 backdrop-blur-md transition hover:text-slate-200 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* system status */}
      <div className="relative mx-4 mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-300">
          System Operational
        </span>
      </div>

      {/* nav */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-300 ${
                active
                  ? "border-sky-400/20 bg-sky-400/[0.08] text-sky-200 shadow-[0_0_20px_-4px_rgba(56,189,248,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "border-transparent text-slate-400 hover:translate-x-0.5 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-sky-300 to-cyan-300 shadow-[0_0_10px_2px_rgba(56,189,248,0.6)]" />
              )}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active
                    ? "text-sky-300"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="font-medium tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* profile */}
      <div className="relative m-3 mt-2 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 shadow-[0_14px_30px_-16px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-slate-700 to-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">
            Operations Manager
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Operations Manager
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-white/[0.06] bg-white/[0.025] shadow-[8px_0_40px_-20px_rgba(2,6,23,0.9)] backdrop-blur-[32px] lg:block">
        {content}
      </aside>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-[#020408]/70 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[260px] border-r border-white/[0.08] bg-[#060b16]/95 shadow-[8px_0_60px_-16px_rgba(2,6,23,0.95)] backdrop-blur-[32px] transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
