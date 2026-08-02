"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  PauseCircle,
  Search,
  ChevronDown,
  Wrench,
  Zap,
  Radio,
  Timer,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

type DayTrend = {
  day: string;
  planned: number;
  unplanned: number;
  isToday?: boolean;
};

type CauseItem = {
  cause: string;
  minutes: number;
  events: number;
};

type LineAvailability = {
  line: string;
  segment: string;
  availability: number;
  downtimeMinutes: number;
  status: "Stable" | "Attention";
};

type DowntimeType = "Planned" | "Unplanned";
type DowntimeStatus = "Active" | "Resolved";
type DowntimeImpact = "High" | "Medium" | "Low";

type DowntimeEvent = {
  id: string;
  machine: string;
  line: string;
  reason: string;
  type: DowntimeType;
  started: string;
  duration: string;
  impact: DowntimeImpact;
  status: DowntimeStatus;
};

/* ============================================================
   MOCK DATA
   Later this can be replaced by FastAPI responses
   ============================================================ */

const TREND: DayTrend[] = [
  { day: "Mon", planned: 20, unplanned: 45 },
  { day: "Tue", planned: 15, unplanned: 30 },
  { day: "Wed", planned: 40, unplanned: 20 },
  { day: "Thu", planned: 10, unplanned: 55 },
  { day: "Fri", planned: 25, unplanned: 40 },
  { day: "Sat", planned: 60, unplanned: 15 },
  {
    day: "Sun",
    planned: 73,
    unplanned: 128,
    isToday: true,
  },
];

const CAUSES: CauseItem[] = [
  {
    cause: "Mechanical",
    minutes: 92,
    events: 8,
  },
  {
    cause: "Electrical",
    minutes: 64,
    events: 6,
  },
  {
    cause: "Sensor",
    minutes: 48,
    events: 5,
  },
  {
    cause: "Pneumatic",
    minutes: 37,
    events: 4,
  },
  {
    cause: "Process",
    minutes: 29,
    events: 3,
  },
];

const LINES: LineAvailability[] = [
  {
    line: "Line 1",
    segment: "Filling",
    availability: 96.8,
    downtimeMinutes: 31,
    status: "Stable",
  },
  {
    line: "Line 2",
    segment: "Packaging",
    availability: 91.4,
    downtimeMinutes: 68,
    status: "Attention",
  },
  {
    line: "Line 3",
    segment: "Filling",
    availability: 95.2,
    downtimeMinutes: 40,
    status: "Stable",
  },
  {
    line: "Line 4",
    segment: "Conveying",
    availability: 93.1,
    downtimeMinutes: 55,
    status: "Attention",
  },
  {
    line: "Line 5",
    segment: "Secondary Packaging",
    availability: 97.3,
    downtimeMinutes: 24,
    status: "Stable",
  },
];

const EVENTS: DowntimeEvent[] = [
  {
    id: "EVT-3401",
    machine: "CF-03",
    line: "Line 3 — Filling",
    reason: "Bearing temperature exceeded threshold",
    type: "Unplanned",
    started: "14:32:18",
    duration: "18m · active",
    impact: "High",
    status: "Active",
  },
  {
    id: "EVT-3402",
    machine: "CP-02",
    line: "Line 2 — Packaging",
    reason: "Pneumatic pressure instability detected",
    type: "Unplanned",
    started: "13:58:02",
    duration: "42m · active",
    impact: "Medium",
    status: "Active",
  },
  {
    id: "EVT-3396",
    machine: "CV-04",
    line: "Line 4 — Conveying",
    reason: "Scheduled belt inspection",
    type: "Planned",
    started: "12:00:00",
    duration: "35m",
    impact: "Low",
    status: "Resolved",
  },
  {
    id: "EVT-3390",
    machine: "CF-01",
    line: "Line 1 — Filling",
    reason: "Photoelectric sensor obstruction",
    type: "Unplanned",
    started: "10:22:47",
    duration: "14m",
    impact: "Medium",
    status: "Resolved",
  },
  {
    id: "EVT-3385",
    machine: "SS-02",
    line: "Line 5 — Secondary Packaging",
    reason: "Heater calibration",
    type: "Planned",
    started: "09:15:10",
    duration: "38m",
    impact: "Low",
    status: "Resolved",
  },
  {
    id: "EVT-3379",
    machine: "CP-01",
    line: "Line 2 — Packaging",
    reason: "Drive motor overload trip",
    type: "Unplanned",
    started: "07:48:33",
    duration: "26m",
    impact: "High",
    status: "Resolved",
  },
];

const LINE_FILTERS = [
  "All Lines",
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
];

const SORT_OPTIONS = ["Newest First", "Oldest First", "Longest Duration"];

const TABS = ["All", "Active", "Unplanned", "Planned"] as const;

/* ============================================================
   EVENT PILLS
   ============================================================ */

function ImpactPill({ impact }: { impact: DowntimeImpact }) {
  const styles: Record<DowntimeImpact, string> = {
    High: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Low: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[impact]}`}
    >
      {impact}
    </span>
  );
}

function StatusPill({ status }: { status: DowntimeStatus }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
        ACTIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300">
      <CheckCircle2 className="h-3 w-3" />
      RESOLVED
    </span>
  );
}

function TypePill({ type }: { type: DowntimeType }) {
  if (type === "Unplanned") {
    return (
      <span className="inline-flex items-center rounded-md border border-rose-500/25 bg-rose-500/[0.08] px-2 py-0.5 text-[10px] font-medium text-rose-300">
        Unplanned
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-amber-500/25 bg-amber-500/[0.08] px-2 py-0.5 text-[10px] font-medium text-amber-300">
      Planned
    </span>
  );
}
/* ============================================================
   PAGE
   ============================================================ */

export default function DowntimePage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");

  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("All Lines");
  const [sortBy, setSortBy] = useState("Newest First");

  const filteredEvents = useMemo(() => {
    let result = EVENTS.filter((event) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Active" && event.status === "Active") ||
        (activeTab === "Unplanned" && event.type === "Unplanned") ||
        (activeTab === "Planned" && event.type === "Planned");

      const query = search.trim().toLowerCase();

      const matchesSearch =
        query.length === 0 ||
        event.id.toLowerCase().includes(query) ||
        event.machine.toLowerCase().includes(query) ||
        event.line.toLowerCase().includes(query) ||
        event.reason.toLowerCase().includes(query);

      const matchesLine =
        lineFilter === "All Lines" || event.line.startsWith(lineFilter);

      return matchesTab && matchesSearch && matchesLine;
    });

    if (sortBy === "Oldest First") {
      result = [...result].reverse();
    }

    if (sortBy === "Longest Duration") {
      result = [...result].sort((a, b) => {
        const aMinutes = Number.parseInt(a.duration);
        const bMinutes = Number.parseInt(b.duration);

        return bMinutes - aMinutes;
      });
    }

    return result;
  }, [activeTab, search, lineFilter, sortBy]);

  return (
    /*
      IMPORTANT:
      DashboardLayout already owns the sidebar + top navbar.
      This page stays entirely in normal document flow.
    */
    <div className="relative min-h-full overflow-hidden bg-[#040810]">
      {/* subtle ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-sky-500/[0.035] blur-[130px]" />
        <div className="absolute right-0 top-32 h-[360px] w-[360px] rounded-full bg-cyan-400/[0.025] blur-[130px]" />
      </div>

      {/*
        IMPORTANT FIX:
        Everything lives inside ONE constrained page container.
        No absolute positioning / negative margins / fixed offsets.
      */}
      <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-12 pt-8 sm:px-8 lg:px-10">
        {/* ====================================================
            PAGE HEADER
            ==================================================== */}

        <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.055] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <PauseCircle className="h-3.5 w-3.5 text-amber-300" />

              <span className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.18em] text-amber-300">
                Production Availability
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-slate-100 sm:text-[38px]">
              Downtime Intelligence
            </h1>

            <p className="mt-2 max-w-[720px] text-sm leading-6 text-slate-500">
              Track production losses, recurring stoppage causes and line
              availability across packaging operations.
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.055] px-3.5 py-2 shadow-[0_0_22px_-10px_rgba(52,211,153,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                Availability Engine · Live
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            KPI CARDS
            ==================================================== */}

        <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* DOWNTIME TODAY */}
          <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0b111b]/80 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-rose-400/15">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-400/[0.07] blur-[42px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
                  Downtime Today
                </p>

                <p className="mt-4 font-[family-name:var(--font-display)] text-[31px] font-semibold tracking-tight text-slate-100">
                  3h 21m
                </p>

                <div className="mt-2 flex items-center gap-1">
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-300" />

                  <span className="text-[11px] font-medium text-emerald-300">
                    8.4% vs yesterday
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-600">
                  Across all production lines
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.08] text-rose-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Clock className="h-[19px] w-[19px]" />
              </div>
            </div>
          </div>

          {/* ACTIVE STOPS */}
          <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0b111b]/80 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/15">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/[0.065] blur-[42px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
                  Active Stops
                </p>

                <p className="mt-4 font-[family-name:var(--font-display)] text-[31px] font-semibold tracking-tight text-slate-100">
                  2
                </p>

                <p className="mt-2 text-[11px] text-slate-500">
                  Requiring operator action
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 shadow-[0_0_7px_rgba(252,211,77,0.7)]" />

                  <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] text-amber-300">
                    Response pending
                  </span>
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.08] text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <AlertTriangle className="h-[19px] w-[19px]" />
              </div>
            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0b111b]/80 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/15">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/[0.06] blur-[42px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
                  Availability
                </p>

                <p className="mt-4 font-[family-name:var(--font-display)] text-[31px] font-semibold tracking-tight text-slate-100">
                  94.8%
                </p>

                <div className="mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-300" />

                  <span className="text-[11px] font-medium text-emerald-300">
                    1.2% vs last shift
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-600">
                  Rolling 24h OEE input
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Gauge className="h-[19px] w-[19px]" />
              </div>
            </div>
          </div>

          {/* UNPLANNED EVENTS */}
          <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0b111b]/80 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/15">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/[0.06] blur-[42px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
                  Unplanned Events
                </p>

                <p className="mt-4 font-[family-name:var(--font-display)] text-[31px] font-semibold tracking-tight text-slate-100">
                  4
                </p>

                <p className="mt-2 text-[11px] text-slate-500">Current shift</p>

                <p className="mt-2 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] text-slate-600">
                  2 currently active
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Zap className="h-[19px] w-[19px]" />
              </div>
            </div>
          </div>
        </section>
        {/* ====================================================
            TREND + PARETO
            ==================================================== */}

        <section className="mb-7 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          {/* DOWNTIME TREND */}
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/85 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-cyan-400/[0.035] blur-[90px]" />

            <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Trend · 7 Days
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Downtime Trend — Last 7 Days
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Planned and unplanned stoppage minutes
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Planned
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Unplanned
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-px w-4 border-t border-dashed border-cyan-400/70" />
                  Target
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="relative h-[300px]">
              {/* Y axis labels */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex w-8 flex-col justify-between pb-7 pt-1 font-[family-name:var(--font-mono)] text-[9px] text-slate-600">
                <span>220</span>
                <span>165</span>
                <span>110</span>
                <span>55</span>
                <span>0</span>
              </div>

              <div className="absolute bottom-7 left-10 right-0 top-1">
                {/* horizontal grid */}
                {[0, 25, 50, 75, 100].map((position) => (
                  <div
                    key={position}
                    className="absolute left-0 right-0 border-t border-white/[0.055]"
                    style={{ bottom: `${position}%` }}
                  />
                ))}

                {/* target line */}
                <div
                  className="absolute left-0 right-0 z-10 border-t border-dashed border-cyan-400/55"
                  style={{ bottom: `${(90 / 220) * 100}%` }}
                >
                  <span className="absolute right-0 -top-5 rounded bg-cyan-400/[0.07] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[8px] text-cyan-300">
                    target 90m
                  </span>
                </div>

                {/* bars */}
                <div className="absolute inset-0 flex items-end justify-around gap-2 px-1 sm:px-4">
                  {TREND.map((item) => {
                    const total = item.planned + item.unplanned;
                    const plannedHeight = (item.planned / 220) * 100;
                    const unplannedHeight = (item.unplanned / 220) * 100;

                    return (
                      <div
                        key={item.day}
                        className="group relative flex h-full flex-1 items-end justify-center"
                      >
                        {item.isToday && (
                          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-14 -translate-x-1/2 rounded-xl bg-cyan-400/[0.025] blur-[1px]" />
                        )}

                        <div className="relative flex h-full w-full max-w-[42px] flex-col justify-end">
                          {/* total label */}
                          <span
                            className={`absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] font-semibold ${
                              item.isToday ? "text-cyan-300" : "text-slate-400"
                            }`}
                            style={{
                              bottom: `calc(${Math.min(
                                (total / 220) * 100,
                                92,
                              )}% + 7px)`,
                            }}
                          >
                            {total}m
                          </span>

                          {/* stacked bar */}
                          <div
                            className={`relative w-full overflow-hidden rounded-t-[5px] border-x border-t transition-all duration-300 group-hover:brightness-110 ${
                              item.isToday
                                ? "border-cyan-300/20 shadow-[0_0_22px_-7px_rgba(34,211,238,0.35)]"
                                : "border-white/[0.08]"
                            }`}
                            style={{
                              height: `${(total / 220) * 100}%`,
                            }}
                          >
                            {/* unplanned */}
                            <div
                              className="absolute left-0 right-0 top-0 bg-gradient-to-b from-rose-400 to-rose-600"
                              style={{
                                height: `${
                                  (unplannedHeight /
                                    (plannedHeight + unplannedHeight)) *
                                  100
                                }%`,
                              }}
                            >
                              <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                            </div>

                            {/* planned */}
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-amber-400 to-amber-600"
                              style={{
                                height: `${
                                  (plannedHeight /
                                    (plannedHeight + unplannedHeight)) *
                                  100
                                }%`,
                              }}
                            >
                              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                            </div>
                          </div>

                          {/* hover tooltip */}
                          <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-40 hidden w-32 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#0b111b]/95 p-2 shadow-xl backdrop-blur-xl group-hover:block">
                            <p className="text-[10px] font-semibold text-slate-200">
                              {item.day}
                            </p>

                            <div className="mt-1.5 space-y-1 font-[family-name:var(--font-mono)] text-[8px]">
                              <div className="flex justify-between text-amber-300">
                                <span>Planned</span>
                                <span>{item.planned}m</span>
                              </div>

                              <div className="flex justify-between text-rose-300">
                                <span>Unplanned</span>
                                <span>{item.unplanned}m</span>
                              </div>

                              <div className="border-t border-white/[0.06] pt-1 text-slate-300">
                                <div className="flex justify-between">
                                  <span>Total</span>
                                  <span>{total}m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X axis */}
              <div className="absolute bottom-0 left-10 right-0 flex justify-around px-1 sm:px-4">
                {TREND.map((item) => (
                  <span
                    key={item.day}
                    className={`flex-1 text-center font-[family-name:var(--font-mono)] text-[9px] ${
                      item.isToday
                        ? "font-semibold text-cyan-300"
                        : "text-slate-500"
                    }`}
                  >
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              DOWNTIME BY CAUSE
              ================================================== */}

          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/85 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-rose-400/[0.035] blur-[90px]" />

            <div className="relative">
              <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Root Cause · Pareto
              </p>

              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                Downtime by Cause
              </h2>

              <p className="mt-1 text-[11px] text-slate-600">
                Ranked by total stoppage minutes
              </p>
            </div>

            <div className="relative mt-6 space-y-5">
              {CAUSES.map((item, index) => {
                const maxMinutes = CAUSES[0].minutes;

                const totalMinutes = CAUSES.reduce(
                  (sum, cause) => sum + cause.minutes,
                  0,
                );

                const cumulativeMinutes = CAUSES.slice(0, index + 1).reduce(
                  (sum, cause) => sum + cause.minutes,
                  0,
                );

                const cumulativePercentage =
                  (cumulativeMinutes / totalMinutes) * 100;

                const width = (item.minutes / maxMinutes) * 100;

                const barClass =
                  index === 0
                    ? "from-rose-500 to-rose-400"
                    : index === 1
                      ? "from-amber-500 to-amber-400"
                      : "from-cyan-500 to-cyan-400";

                const iconClass =
                  index === 0
                    ? "text-rose-300"
                    : index === 1
                      ? "text-amber-300"
                      : "text-cyan-300";

                return (
                  <div key={item.cause}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {index === 0 ? (
                          <Wrench
                            className={`h-3.5 w-3.5 shrink-0 ${iconClass}`}
                          />
                        ) : index === 1 ? (
                          <Zap
                            className={`h-3.5 w-3.5 shrink-0 ${iconClass}`}
                          />
                        ) : index === 2 ? (
                          <Radio
                            className={`h-3.5 w-3.5 shrink-0 ${iconClass}`}
                          />
                        ) : (
                          <Activity
                            className={`h-3.5 w-3.5 shrink-0 ${iconClass}`}
                          />
                        )}

                        <span className="truncate text-xs font-semibold text-slate-300">
                          {item.cause}
                        </span>
                      </div>

                      <span className="shrink-0 font-[family-name:var(--font-mono)] text-[9px] text-slate-400">
                        {item.minutes} min · {item.events} events
                      </span>
                    </div>

                    <div className="relative h-2.5 overflow-hidden rounded-full border border-white/[0.055] bg-white/[0.035]">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barClass} shadow-[0_0_12px_-4px_currentColor] transition-all duration-500`}
                        style={{
                          width: `${width}%`,
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                      </div>
                    </div>

                    <div className="mt-1.5 flex justify-end">
                      <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                        cumulative {cumulativePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* insight box */}
            <div className="relative mt-6 overflow-hidden rounded-xl border border-rose-400/10 bg-rose-400/[0.035] p-3.5">
              <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-rose-400 to-transparent" />

              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />

                <div>
                  <p className="text-[11px] font-medium text-slate-300">
                    Mechanical losses are the primary contributor
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    Mechanical failures account for{" "}
                    <span className="font-medium text-rose-300">34.1%</span> of
                    tracked stoppage minutes. Prioritize recurring bearing and
                    drive-train faults.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ====================================================
            LINE AVAILABILITY + LOSS ANALYSIS
            ==================================================== */}

        <section className="mb-7 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          {/* LINE AVAILABILITY */}
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/85 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-emerald-400/[0.025] blur-[90px]" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Production Lines
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Line Availability
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Current shift availability and accumulated downtime
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />

                <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-500">
                  5 Lines Monitored
                </span>
              </div>
            </div>

            <div className="relative mt-6 space-y-3">
              {LINES.map((item) => {
                const needsAttention = item.status === "Attention";

                return (
                  <div
                    key={item.line}
                    className={`group rounded-xl border p-4 transition-all duration-300 ${
                      needsAttention
                        ? "border-amber-400/[0.12] bg-amber-400/[0.025] hover:border-amber-400/20"
                        : "border-white/[0.055] bg-white/[0.018] hover:border-white/[0.1] hover:bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              needsAttention
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.65)]"
                                : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
                            }`}
                          />

                          <p className="text-xs font-semibold text-slate-200">
                            {item.line}
                          </p>

                          <span className="text-[10px] text-slate-600">
                            {item.segment}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center gap-4">
                          <span className="font-[family-name:var(--font-mono)] text-[9px] text-slate-500">
                            Downtime{" "}
                            <span
                              className={
                                needsAttention
                                  ? "text-amber-300"
                                  : "text-slate-300"
                              }
                            >
                              {item.downtimeMinutes}m
                            </span>
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.1em] ${
                              needsAttention
                                ? "border-amber-400/15 bg-amber-400/[0.055] text-amber-300"
                                : "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-end gap-1">
                        <span
                          className={`font-[family-name:var(--font-display)] text-2xl font-semibold ${
                            needsAttention ? "text-amber-300" : "text-slate-100"
                          }`}
                        >
                          {item.availability.toFixed(1)}
                        </span>

                        <span className="mb-1 text-[10px] text-slate-600">
                          %
                        </span>
                      </div>
                    </div>

                    {/* availability bar */}
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          needsAttention
                            ? "bg-gradient-to-r from-amber-600 to-amber-300 shadow-[0_0_9px_rgba(251,191,36,0.2)]"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-300 shadow-[0_0_9px_rgba(52,211,153,0.2)]"
                        }`}
                        style={{
                          width: `${item.availability}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================================================
              LOSS ANALYSIS
              ================================================== */}

          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/85 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-violet-400/[0.025] blur-[90px]" />

            <div className="relative">
              <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Reliability Metrics
              </p>

              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                Loss Analysis
              </h2>

              <p className="mt-1 text-[11px] text-slate-600">
                Maintenance and stoppage performance indicators
              </p>
            </div>

            {/* METRIC GRID */}
            <div className="relative mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cyan-400/[0.1] bg-cyan-400/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                    MTBF
                  </span>

                  <Activity className="h-3.5 w-3.5 text-cyan-300" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-cyan-300">
                  6h 42m
                </p>

                <p className="mt-1 text-[9px] text-slate-600">
                  Mean time between failures
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/[0.1] bg-emerald-400/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                    MTTR
                  </span>

                  <Timer className="h-3.5 w-3.5 text-emerald-300" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-emerald-300">
                  22m
                </p>

                <p className="mt-1 text-[9px] text-slate-600">
                  Mean time to repair
                </p>
              </div>

              <div className="rounded-xl border border-amber-400/[0.1] bg-amber-400/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                    Planned
                  </span>

                  <Wrench className="h-3.5 w-3.5 text-amber-300" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-300">
                  1h 13m
                </p>

                <p className="mt-1 text-[9px] text-slate-600">
                  Scheduled downtime
                </p>
              </div>

              <div className="rounded-xl border border-rose-400/[0.1] bg-rose-400/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                    Unplanned
                  </span>

                  <Zap className="h-3.5 w-3.5 text-rose-300" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-rose-300">
                  2h 08m
                </p>

                <p className="mt-1 text-[9px] text-slate-600">
                  Unexpected production loss
                </p>
              </div>
            </div>

            {/* DISTRIBUTION */}
            <div className="relative mt-5 rounded-xl border border-white/[0.055] bg-black/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                    Downtime Distribution
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Planned vs unplanned loss
                  </p>
                </div>

                <span className="font-[family-name:var(--font-mono)] text-[9px] text-slate-500">
                  201 min
                </span>
              </div>

              <div className="mt-4 flex h-3 overflow-hidden rounded-full border border-white/[0.055] bg-white/[0.025]">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                  style={{
                    width: `${(73 / 201) * 100}%`,
                  }}
                />

                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.2)]"
                  style={{
                    width: `${(128 / 201) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                    <span className="text-[10px] text-slate-500">Planned</span>
                  </div>

                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-amber-300">
                      36.3%
                    </span>

                    <span className="text-[9px] text-slate-600">73 min</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />

                    <span className="text-[10px] text-slate-500">
                      Unplanned
                    </span>
                  </div>

                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-rose-300">
                      63.7%
                    </span>

                    <span className="text-[9px] text-slate-600">128 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ENGINEERING INSIGHT */}
            <div className="relative mt-4 overflow-hidden rounded-xl border border-cyan-400/[0.09] bg-cyan-400/[0.025] p-3.5">
              <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-cyan-300 to-transparent" />

              <div className="flex items-start gap-2.5">
                <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />

                <div>
                  <p className="text-[11px] font-medium text-slate-300">
                    Reliability opportunity detected
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    Unplanned losses represent{" "}
                    <span className="font-medium text-rose-300">63.7%</span> of
                    today&apos;s downtime. Reducing mechanical recurrence would
                    provide the largest availability gain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ====================================================
            DOWNTIME EVENT LOG
            ==================================================== */}

        <section className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/85 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* HEADER + CONTROLS */}
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Production Loss History
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Downtime Event Log
                </h2>

                <p className="mt-1 text-[11px] text-slate-600">
                  Planned and unplanned stoppages across connected production
                  assets.
                </p>
              </div>

              {/* FILTER TABS */}
              <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-white/[0.06] bg-black/15 p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3 py-1.5 font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.1em] transition-all ${
                      activeTab === tab
                        ? "border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300 shadow-[0_0_14px_-6px_rgba(34,211,238,0.45)]"
                        : "border border-transparent text-slate-600 hover:bg-white/[0.035] hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH + SELECTS */}
            <div className="mt-5 grid gap-2.5 lg:grid-cols-[1fr_auto_auto]">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 transition focus-within:border-cyan-400/20 focus-within:bg-white/[0.035]">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search machine, event ID, line or downtime reason..."
                  className="h-10 w-full bg-transparent text-[11px] text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>

              {/* LINE FILTER */}
              <div className="relative">
                <select
                  value={lineFilter}
                  onChange={(event) => setLineFilter(event.target.value)}
                  className="h-10 min-w-[145px] appearance-none rounded-xl border border-white/[0.07] bg-[#0b111b] pl-3.5 pr-9 font-[family-name:var(--font-mono)] text-[9px] text-slate-400 outline-none transition hover:border-white/[0.12] focus:border-cyan-400/20"
                >
                  {LINE_FILTERS.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              </div>

              {/* SORT */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 min-w-[150px] appearance-none rounded-xl border border-white/[0.07] bg-[#0b111b] pl-3.5 pr-9 font-[family-name:var(--font-mono)] text-[9px] text-slate-400 outline-none transition hover:border-white/[0.12] focus:border-cyan-400/20"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.055] bg-white/[0.015]">
                  {[
                    "Event ID",
                    "Machine",
                    "Line",
                    "Reason",
                    "Type",
                    "Started",
                    "Duration",
                    "Impact",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.14em] text-slate-600 first:pl-6 last:pr-6"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className={`group border-b border-white/[0.045] transition-colors last:border-b-0 ${
                      event.status === "Active" && event.type === "Unplanned"
                        ? "bg-rose-400/[0.018] hover:bg-rose-400/[0.035]"
                        : "hover:bg-cyan-400/[0.02]"
                    }`}
                  >
                    {/* EVENT ID */}
                    <td className="px-4 py-4 pl-6">
                      <span className="font-[family-name:var(--font-mono)] text-[9px] font-medium text-slate-500 transition group-hover:text-slate-300">
                        {event.id}
                      </span>
                    </td>

                    {/* MACHINE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            event.status === "Active"
                              ? "bg-rose-400 shadow-[0_0_7px_rgba(251,113,133,0.65)]"
                              : "bg-emerald-400/80"
                          }`}
                        />

                        <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-cyan-300">
                          {event.machine}
                        </span>
                      </div>
                    </td>

                    {/* LINE */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-[10px] text-slate-500">
                        {event.line}
                      </span>
                    </td>

                    {/* REASON */}
                    <td className="max-w-[260px] px-4 py-4">
                      <span className="text-[11px] leading-relaxed text-slate-400">
                        {event.reason}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td className="px-4 py-4">
                      <TypePill type={event.type} />
                    </td>

                    {/* STARTED */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] text-slate-500">
                        {event.started}
                      </span>
                    </td>

                    {/* DURATION */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-600" />

                        <span
                          className={`whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] ${
                            event.status === "Active"
                              ? "text-rose-300"
                              : "text-slate-400"
                          }`}
                        >
                          {event.duration}
                        </span>
                      </div>
                    </td>

                    {/* IMPACT */}
                    <td className="px-4 py-4">
                      <ImpactPill impact={event.impact} />
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4 pr-6">
                      <StatusPill status={event.status} />
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                          <Search className="h-4 w-4 text-slate-600" />
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-400">
                          No downtime events found
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          Try changing the filters or search query.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="flex flex-col gap-2 border-t border-white/[0.055] bg-black/[0.08] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
              Showing {filteredEvents.length} of {EVENTS.length} events
            </span>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />

              <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                Downtime event service online
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            BOTTOM SYSTEM STRIP
            ==================================================== */}

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
              Availability Monitoring Operational
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.1em] text-slate-700">
            <span>Polling 2s</span>
            <span>5 Lines Connected</span>
            <span>PackPilot Downtime Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
