"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Factory,
  Thermometer,
  Gauge,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
  SlidersHorizontal,
  CalendarClock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types — shaped to drop in FastAPI responses without a UI rewrite   */
/* ------------------------------------------------------------------ */

type MachineStatus = "running" | "warning" | "offline";

interface Machine {
  id: string;
  name: string;
  type: string;
  zone: string;
  status: MachineStatus;
  oee: number; // %
  runtime: string;
  throughput: string;
  temperature: string;
  tempFlag?: boolean;
  vibration: string;
  vibrationFlag?: boolean;
  pulse: number[]; // relative telemetry samples for the mini sparkline
}

interface FleetIssue {
  id: string;
  machineId: string;
  severity: "warning" | "critical";
  message: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data — replace with FastAPI GET /machines + /machines/issues  */
/* ------------------------------------------------------------------ */

const mockMachines: Machine[] = [
  {
    id: "CF-01",
    name: "Carton Former",
    type: "Forming Unit",
    zone: "Line 1 — Fabrication",
    status: "running",
    oee: 91.2,
    runtime: "14h 22m",
    throughput: "1,240 ctn/hr",
    temperature: "42°C",
    vibration: "0.021 g",
    pulse: [4, 6, 5, 7, 6, 8, 7, 9, 8, 9],
  },
  {
    id: "CF-02",
    name: "Carton Former",
    type: "Forming Unit",
    zone: "Line 2 — Fabrication",
    status: "running",
    oee: 88.4,
    runtime: "12h 05m",
    throughput: "1,190 ctn/hr",
    temperature: "44°C",
    vibration: "0.026 g",
    pulse: [5, 5, 6, 6, 5, 7, 6, 7, 8, 7],
  },
  {
    id: "CV-04",
    name: "Conveyor",
    type: "Transfer Line",
    zone: "Line 3 — Logistics",
    status: "running",
    oee: 95.0,
    runtime: "21h 40m",
    throughput: "3,400 u/hr",
    temperature: "31°C",
    vibration: "0.014 g",
    pulse: [7, 8, 8, 9, 9, 8, 9, 9, 8, 9],
  },
  {
    id: "CP-02",
    name: "Case Packer",
    type: "Packing Unit",
    zone: "Line 2 — Packaging",
    status: "warning",
    oee: 82.7,
    runtime: "9h 58m",
    throughput: "860 cs/hr",
    temperature: "38°C",
    vibration: "0.084 g",
    vibrationFlag: true,
    pulse: [4, 6, 5, 8, 6, 9, 7, 9, 8, 9],
  },
  {
    id: "SU-03",
    name: "Sealing Unit",
    type: "Thermal Sealer",
    zone: "Line 1 — Packaging",
    status: "warning",
    oee: 68.3,
    runtime: "6h 12m",
    throughput: "640 u/hr",
    temperature: "96°C",
    tempFlag: true,
    vibration: "0.032 g",
    pulse: [6, 5, 7, 6, 8, 6, 9, 7, 8, 6],
  },
  {
    id: "LS-01",
    name: "Labeling Station",
    type: "Label Applicator",
    zone: "Line 3 — Packaging",
    status: "running",
    oee: 93.1,
    runtime: "18h 33m",
    throughput: "2,050 u/hr",
    temperature: "29°C",
    vibration: "0.011 g",
    pulse: [8, 8, 9, 9, 8, 9, 9, 9, 8, 9],
  },
  {
    id: "CV-07",
    name: "Conveyor",
    type: "Transfer Line",
    zone: "Line 4 — Logistics",
    status: "running",
    oee: 90.5,
    runtime: "16h 02m",
    throughput: "3,120 u/hr",
    temperature: "33°C",
    vibration: "0.017 g",
    pulse: [6, 7, 8, 7, 8, 9, 8, 9, 8, 9],
  },
  {
    id: "CP-01",
    name: "Case Packer",
    type: "Packing Unit",
    zone: "Line 1 — Packaging",
    status: "offline",
    oee: 0,
    runtime: "0h 00m",
    throughput: "—",
    temperature: "—",
    vibration: "—",
    pulse: [2, 2, 1, 2, 1, 1, 2, 1, 1, 1],
  },
];

const fleetIssues: FleetIssue[] = [
  {
    id: "iss-01",
    machineId: "CP-02",
    severity: "warning",
    message: "Vibration reading above baseline threshold",
    timestamp: "12m ago",
  },
  {
    id: "iss-02",
    machineId: "SU-03",
    severity: "critical",
    message: "Seal temperature deviation exceeding tolerance",
    timestamp: "24m ago",
  },
  {
    id: "iss-03",
    machineId: "CV-04",
    severity: "warning",
    message: "Scheduled inspection window approaching",
    timestamp: "1h ago",
  },
];

const fleetSummary = { total: 48, running: 42, attention: 4, offline: 2 };
const healthDistribution = [
  { label: "Healthy", count: 42, color: "#34d399" },
  { label: "Warning", count: 4, color: "#fbbf24" },
  { label: "Offline", count: 2, color: "#f43f5e" },
];

const filters: { key: "all" | MachineStatus; label: string }[] = [
  { key: "all", label: "All Machines" },
  { key: "running", label: "Running" },
  { key: "warning", label: "Warning" },
  { key: "offline", label: "Offline" },
];

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

function statusMeta(status: MachineStatus) {
  switch (status) {
    case "running":
      return {
        label: "Running",
        dot: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
        text: "text-emerald-300",
        badge: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
        ring: "hover:shadow-[0_35px_80px_-24px_rgba(2,6,23,0.85),0_0_46px_-14px_rgba(52,211,153,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]",
        icon: CheckCircle2,
      };
    case "warning":
      return {
        label: "Warning",
        dot: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]",
        text: "text-amber-300",
        badge: "border-amber-400/25 bg-amber-400/[0.1] text-amber-300",
        ring: "hover:shadow-[0_35px_80px_-24px_rgba(2,6,23,0.85),0_0_54px_-12px_rgba(251,191,36,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]",
        icon: AlertTriangle,
      };
    case "offline":
      return {
        label: "Offline",
        dot: "bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]",
        text: "text-rose-300",
        badge: "border-rose-500/25 bg-rose-500/[0.1] text-rose-300",
        ring: "hover:shadow-[0_35px_80px_-24px_rgba(2,6,23,0.85),0_0_46px_-14px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]",
        icon: XCircle,
      };
  }
}

function severityMeta(severity: "warning" | "critical") {
  return severity === "critical"
    ? { dot: "bg-rose-500", text: "text-rose-300", badge: "border-rose-500/25 bg-rose-500/[0.1] text-rose-300" }
    : { dot: "bg-amber-400", text: "text-amber-300", badge: "border-amber-400/25 bg-amber-400/[0.1] text-amber-300" };
}

function Sparkline({ values, colorClass }: { values: number[]; colorClass: string }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - (v / max) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full">
      <polyline points={points} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function MachinesPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | MachineStatus>("all");
  const [query, setQuery] = useState("");

  const filteredMachines = useMemo(() => {
    return mockMachines.filter((m) => {
      const matchesFilter = activeFilter === "all" ? true : m.status === activeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.zone.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const totalHealth = healthDistribution.reduce((s, d) => s + d.count, 0);
  let offset = 0;

  return (
    <div className="relative px-6 py-8 sm:px-10 lg:px-14">
      {/* local ambient bloom, contained to this page's content area */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative">
        {/* header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sky-300">
              <Factory className="h-3 w-3" />
              Machine Fleet
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/[0.1] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300">
              Demo Fleet Data
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Packaging Line Equipment
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Real-time health, performance and operating state across connected machinery.
          </p>
        </div>

        {/* filters + search */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] p-1.5 shadow-[0_16px_36px_-18px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-tight transition-all duration-300 ${
                  activeFilter === f.key
                    ? "bg-sky-400/15 text-sky-200 shadow-[0_0_20px_-4px_rgba(56,189,248,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:-translate-y-0.5 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition focus-within:border-sky-300/25 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_20px_-6px_rgba(56,189,248,0.3)] lg:w-72">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search equipment…"
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-600" />
          </div>
        </div>

        {/* summary row */}
        <section className="mb-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[
            { label: "Total Machines", value: fleetSummary.total, accent: "from-sky-400 to-cyan-300", icon: Factory },
            { label: "Running", value: fleetSummary.running, accent: "from-emerald-400 to-teal-300", icon: CheckCircle2 },
            { label: "Attention Required", value: fleetSummary.attention, accent: "from-amber-400 to-orange-300", icon: AlertTriangle },
            { label: "Offline", value: fleetSummary.offline, accent: "from-rose-400 to-rose-300", icon: XCircle },
          ].map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-[0_24px_60px_-24px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
              />
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                <s.icon className="h-4 w-4 text-slate-300" />
              </div>
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-slate-50">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
            </div>
          ))}
        </section>

        {/* machine grid */}
        <section className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
            Connected Equipment
          </h2>
          <p className="font-[family-name:var(--font-mono)] text-xs text-slate-500">
            Showing {filteredMachines.length} of {fleetSummary.total}
          </p>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMachines.map((m) => {
            const meta = statusMeta(m.status);
            const isOffline = m.status === "offline";
            return (
              <div
                key={m.id}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-[0_24px_60px_-24px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${meta.ring} ${
                  isOffline ? "opacity-80" : ""
                }`}
              >
                {/* top sheen + corner brackets, industrial instrument feel */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-white/[0.12]" />
                <div className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-white/[0.12]" />
                {m.status === "warning" && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/15 blur-[70px]" />
                )}

                {/* header */}
                <div className="relative mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {m.name} <span className="text-slate-500">— {m.id}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {m.type} · {m.zone}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${meta.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${isOffline ? "" : "animate-pulse"}`} />
                    {meta.label}
                  </span>
                </div>

                {/* OEE + sparkline */}
                <div className="relative mb-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">OEE</p>
                    <p className="font-[family-name:var(--font-mono)] text-xl font-semibold text-slate-50">
                      {isOffline ? "—" : `${m.oee.toFixed(1)}%`}
                    </p>
                  </div>
                  <div className="h-7 w-24">
                    <Sparkline
                      values={m.pulse}
                      colorClass={
                        isOffline
                          ? "stroke-slate-600"
                          : m.status === "warning"
                          ? "stroke-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                          : "stroke-cyan-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]"
                      }
                    />
                  </div>
                </div>

                {/* telemetry grid */}
                <div className="relative mb-4 grid grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                    <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Runtime</p>
                      <p className="truncate font-[family-name:var(--font-mono)] text-slate-200">{m.runtime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                    <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Throughput</p>
                      <p className="truncate font-[family-name:var(--font-mono)] text-slate-200">{m.throughput}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                    <Thermometer className={`h-3.5 w-3.5 shrink-0 ${m.tempFlag ? "text-amber-400" : "text-slate-500"}`} />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Temp</p>
                      <p className={`truncate font-[family-name:var(--font-mono)] ${m.tempFlag ? "text-amber-300" : "text-slate-200"}`}>
                        {m.temperature}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                    <Gauge className={`h-3.5 w-3.5 shrink-0 ${m.vibrationFlag ? "text-amber-400" : "text-slate-500"}`} />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Vibration</p>
                      <p className={`truncate font-[family-name:var(--font-mono)] ${m.vibrationFlag ? "text-amber-300" : "text-slate-200"}`}>
                        {m.vibration}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMachines.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-slate-500 backdrop-blur-xl">
              No equipment matches the current filter.
            </div>
          )}
        </section>

        {/* bottom panels */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* health overview */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-7 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
            <div className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-emerald-400/10 blur-[100px]" />
            <h2 className="mb-1 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
              Machine Health Overview
            </h2>
            <p className="mb-6 text-xs text-slate-500">Fleet-wide distribution across {fleetSummary.total} connected units</p>

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              {/* ring */}
              <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                  {healthDistribution.map((d) => {
                    const circumference = 2 * Math.PI * 66;
                    const dash = (d.count / totalHealth) * circumference;
                    const dashOffset = circumference - offset;
                    offset += dash;
                    return (
                      <circle
                        key={d.label}
                        cx="80"
                        cy="80"
                        r="66"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={dashOffset}
                        style={{ filter: `drop-shadow(0 0 6px ${d.color}80)` }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-slate-50">
                    {Math.round((healthDistribution[0].count / totalHealth) * 100)}%
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Healthy</p>
                </div>
              </div>

              {/* legend + bars */}
              <div className="w-full flex-1 space-y-3.5">
                {healthDistribution.map((d) => (
                  <div key={d.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: d.color, boxShadow: `0 0 8px 1px ${d.color}90` }}
                        />
                        {d.label}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-slate-400">{d.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(d.count / totalHealth) * 100}%`,
                          backgroundColor: d.color,
                          boxShadow: `0 0 10px 0 ${d.color}80`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* attention required */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-7 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-amber-400/10 blur-[100px]" />
            <h2 className="mb-1 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
              Attention Required
            </h2>
            <p className="mb-6 text-xs text-slate-500">Open issues awaiting review or acknowledgement</p>

            <div className="space-y-3">
              {fleetIssues.map((issue) => {
                const sev = severityMeta(issue.severity);
                return (
                  <div
                    key={issue.id}
                    className="group/issue relative flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
                  >
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${sev.dot} animate-pulse`} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-slate-200">
                          {issue.machineId}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] ${sev.badge}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm leading-snug text-slate-300">{issue.message}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <CalendarClock className="h-3 w-3" />
                        {issue.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}