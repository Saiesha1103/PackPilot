"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const titleMap: Record<string, { title: string; eyebrow: string }> = {
  "/dashboard": { title: "Dashboard", eyebrow: "Overview" },
  "/dashboard/machines": { title: "Machines", eyebrow: "Equipment" },
  "/dashboard/sensors": { title: "Sensors", eyebrow: "Telemetry" },
  "/dashboard/alerts": { title: "Alerts", eyebrow: "Monitoring" },
  "/dashboard/downtime": { title: "Downtime", eyebrow: "Operations" },
  "/dashboard/maintenance": {
    title: "Maintenance",
    eyebrow: "Operations",
  },
  "/dashboard/reports": { title: "Reports", eyebrow: "Analytics" },
  "/dashboard/pfmea": { title: "PFMEA", eyebrow: "Quality" },
  "/dashboard/settings": { title: "Settings", eyebrow: "Platform" },
};

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({
  onMenuClick,
}: DashboardNavbarProps) {
  const pathname = usePathname();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateClock();

    const id = setInterval(updateClock, 1000);

    return () => clearInterval(id);
  }, []);

  const page =
    titleMap[pathname ?? ""] ?? {
      title: "Dashboard",
      eyebrow: "Overview",
    };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#040810]/70 shadow-[0_20px_50px_-30px_rgba(2,6,23,0.9)] backdrop-blur-[28px]">
      {/* top glass highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />

      {/* ambient cyan bloom */}
      <div className="pointer-events-none absolute -top-16 left-1/3 h-40 w-[420px] -translate-x-1/2 rounded-full bg-sky-500/[0.08] blur-[80px]" />

      <div className="relative flex h-16 items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-sky-400/[0.06] hover:text-sky-200 lg:hidden"
          >
            <span className="text-lg leading-none">☰</span>
          </button>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {page.eyebrow}
            </p>

            <h1 className="truncate text-base font-semibold tracking-tight text-slate-100 sm:text-lg">
              {page.title}
            </h1>
          </div>
        </div>

        {/* CENTER SEARCH */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 focus-within:border-sky-300/25 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_24px_-6px_rgba(56,189,248,0.3)]">
            <span className="text-xs text-slate-500">⌕</span>

            <input
              type="text"
              placeholder="Search machines, sensors, alerts..."
              className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
            />

            <kbd className="hidden shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-500 lg:block">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Plant status */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
            </span>

            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-300">
              Plant Operational
            </span>
          </div>

          {/* Clock */}
          <span className="hidden font-mono text-xs text-slate-400 md:inline">
            {clock || "--:--:--"}
          </span>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:border-sky-400/20 hover:bg-sky-400/[0.06] hover:text-sky-200"
          >
            <span className="text-sm">●</span>

            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white shadow-[0_0_10px_2px_rgba(244,63,94,0.6)]">
              3
            </span>
          </button>

          {/* User */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-400/20 bg-gradient-to-br from-sky-500/20 to-slate-800 text-[11px] font-semibold text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-300 hover:-translate-y-0.5">
            OM
          </div>
        </div>
      </div>
    </header>
  );
}