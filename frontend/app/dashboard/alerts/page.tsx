"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  ShieldAlert,
  Siren,
  Timer,
  TriangleAlert,
} from "lucide-react";

type Severity = "critical" | "warning" | "info";
type AlertState = "active" | "acknowledged";

type Incident = {
  id: string;
  title: string;
  machineId: string;
  line: string;
  source: string;
  reading: string;
  threshold: string;
  severity: Severity;
  timestamp: string;
  duration: string;
  state: AlertState;
};

type HistoryItem = {
  id: string;
  time: string;
  machine: string;
  event: string;
  severity: Severity;
  duration: string;
  status: "Resolved" | "Acknowledged" | "Auto-cleared";
};

const initialIncidents: Incident[] = [
  {
    id: "ALT-2401",
    title: "Bearing Temperature Critical",
    machineId: "SU-03",
    line: "Line 1 — Packaging",
    source: "Bearing Temperature",
    reading: "92.6 °C",
    threshold: "85 °C",
    severity: "critical",
    timestamp: "14:32:18",
    duration: "18m",
    state: "active",
  },
  {
    id: "ALT-2402",
    title: "Motor Current High",
    machineId: "CP-02",
    line: "Line 2 — Packaging",
    source: "Motor Current",
    reading: "14.8 A",
    threshold: "14.0 A",
    severity: "warning",
    timestamp: "14:39:42",
    duration: "11m",
    state: "active",
  },
  {
    id: "ALT-2403",
    title: "Excessive Vibration",
    machineId: "CV-07",
    line: "Line 3 — Conveyance",
    source: "Drive Vibration",
    reading: "0.091 g",
    threshold: "0.075 g",
    severity: "critical",
    timestamp: "14:44:09",
    duration: "7m",
    state: "active",
  },
  {
    id: "ALT-2404",
    title: "Conveyor Speed Deviation",
    machineId: "CV-04",
    line: "Line 1 — Conveyance",
    source: "Encoder Speed",
    reading: "87.4%",
    threshold: "≥ 92%",
    severity: "warning",
    timestamp: "14:46:27",
    duration: "5m",
    state: "active",
  },
  {
    id: "ALT-2405",
    title: "Hydraulic Pressure Warning",
    machineId: "DC-01",
    line: "Line 2 — Forming",
    source: "Hydraulic Pressure",
    reading: "5.7 bar",
    threshold: "≥ 6.0 bar",
    severity: "warning",
    timestamp: "14:48:53",
    duration: "3m",
    state: "acknowledged",
  },
  {
    id: "ALT-2406",
    title: "Carton Former Cycle Delay",
    machineId: "CF-02",
    line: "Line 2 — Forming",
    source: "Cycle Time",
    reading: "4.8 s",
    threshold: "≤ 4.2 s",
    severity: "info",
    timestamp: "14:50:11",
    duration: "2m",
    state: "active",
  },
];

const history: HistoryItem[] = [
  {
    id: "ALT-2398",
    time: "13:52",
    machine: "LS-01",
    event: "Label sensor obstruction",
    severity: "warning",
    duration: "06m 14s",
    status: "Resolved",
  },
  {
    id: "ALT-2397",
    time: "13:31",
    machine: "CF-01",
    event: "Vacuum pressure deviation",
    severity: "warning",
    duration: "03m 42s",
    status: "Auto-cleared",
  },
  {
    id: "ALT-2396",
    time: "12:48",
    machine: "SU-02",
    event: "Seal temperature high",
    severity: "critical",
    duration: "18m 06s",
    status: "Resolved",
  },
  {
    id: "ALT-2395",
    time: "12:16",
    machine: "CV-03",
    event: "Drive vibration elevated",
    severity: "warning",
    duration: "09m 28s",
    status: "Acknowledged",
  },
  {
    id: "ALT-2394",
    time: "11:44",
    machine: "CP-01",
    event: "Packer cycle synchronization",
    severity: "info",
    duration: "02m 17s",
    status: "Auto-cleared",
  },
  {
    id: "ALT-2393",
    time: "11:03",
    machine: "DC-02",
    event: "Hydraulic pressure loss",
    severity: "critical",
    duration: "21m 33s",
    status: "Resolved",
  },
];

const timeline = [
  {
    time: "14:50",
    text: "CF-02 cycle delay detected",
    severity: "info" as Severity,
  },
  {
    time: "14:48",
    text: "DC-01 pressure alert acknowledged",
    severity: "warning" as Severity,
  },
  {
    time: "14:46",
    text: "CV-04 speed deviation detected",
    severity: "warning" as Severity,
  },
  {
    time: "14:44",
    text: "CV-07 vibration entered critical range",
    severity: "critical" as Severity,
  },
  {
    time: "14:32",
    text: "SU-03 temperature threshold exceeded",
    severity: "critical" as Severity,
  },
];

function severityText(severity: Severity) {
  if (severity === "critical") return "text-rose-300";
  if (severity === "warning") return "text-amber-300";
  return "text-sky-300";
}

function severityDot(severity: Severity) {
  if (severity === "critical") {
    return "bg-rose-500 shadow-[0_0_9px_rgba(244,63,94,0.75)]";
  }

  if (severity === "warning") {
    return "bg-amber-400 shadow-[0_0_9px_rgba(251,191,36,0.65)]";
  }

  return "bg-sky-400 shadow-[0_0_9px_rgba(56,189,248,0.65)]";
}

function severityBadge(severity: Severity) {
  if (severity === "critical") {
    return "border-rose-400/20 bg-rose-400/[0.08] text-rose-300";
  }

  if (severity === "warning") {
    return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";
  }

  return "border-sky-400/20 bg-sky-400/[0.08] text-sky-300";
}

export default function AlertsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const [filter, setFilter] = useState<
    "all" | "critical" | "warning" | "acknowledged"
  >("all");

  const [search, setSearch] = useState("");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "acknowledged"
            ? incident.state === "acknowledged"
            : incident.severity === filter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        incident.title.toLowerCase().includes(query) ||
        incident.machineId.toLowerCase().includes(query) ||
        incident.source.toLowerCase().includes(query) ||
        incident.line.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [incidents, filter, search]);

  const acknowledgedCount = incidents.filter(
    (incident) => incident.state === "acknowledged",
  ).length;

  const unacknowledgedCount = incidents.length - acknowledgedCount;
  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical",
  ).length;

  const warningCount = incidents.filter(
    (incident) => incident.severity === "warning",
  ).length;

  const infoCount = incidents.filter(
    (incident) => incident.severity === "info",
  ).length;

  const totalIncidents = incidents.length;

  const criticalDegrees =
    totalIncidents > 0 ? (criticalCount / totalIncidents) * 360 : 0;

  const warningDegrees =
    totalIncidents > 0 ? (warningCount / totalIncidents) * 360 : 0;

  const acknowledgeIncident = (id: string) => {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, state: "acknowledged" } : incident,
      ),
    );
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#040810]">
      {/* ambient dashboard lighting */}
      <div className="pointer-events-none absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-sky-500/[0.055] blur-[130px]" />
      <div className="pointer-events-none absolute right-[5%] top-[24%] h-[360px] w-[360px] rounded-full bg-rose-500/[0.035] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[38%] h-[380px] w-[380px] rounded-full bg-cyan-400/[0.025] blur-[150px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,.7), transparent 72%)",
        }}
      />

      <div className="relative px-5 pb-10 pt-12 sm:px-8 lg:px-10 xl:px-12">
        {/* PAGE HEADER */}
        <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_9px_rgba(251,113,133,0.7)]" />
              <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Incident Monitoring
              </p>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
              Alerts & Incidents
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Monitor, acknowledge and resolve operational anomalies across
              production lines.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.055] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </span>

            <span className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-300">
              Live Monitoring · Updated 2s ago
            </span>
          </div>
        </section>
        {/* KPI SUMMARY */}
        <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active Alerts",
              value: incidents.length,
              sub: "Across production lines",
              icon: BellRing,
              tone: "sky",
            },
            {
              label: "Critical",
              value: incidents.filter(
                (incident) => incident.severity === "critical",
              ).length,
              sub: "Immediate response",
              icon: Siren,
              tone: "rose",
            },
            {
              label: "Warning",
              value: incidents.filter(
                (incident) => incident.severity === "warning",
              ).length,
              sub: "Requires attention",
              icon: TriangleAlert,
              tone: "amber",
            },
            {
              label: "Acknowledged",
              value: acknowledgedCount,
              sub: "Operator reviewed",
              icon: CheckCircle2,
              tone: "emerald",
            },
          ].map((item) => {
            const Icon = item.icon;

            const toneStyles =
              item.tone === "rose"
                ? {
                    icon: "text-rose-300",
                    iconBox:
                      "border-rose-400/15 bg-rose-400/[0.06] shadow-[0_0_22px_-8px_rgba(244,63,94,0.45)]",
                    value: "text-rose-200",
                    glow: "bg-rose-500/[0.08]",
                  }
                : item.tone === "amber"
                  ? {
                      icon: "text-amber-300",
                      iconBox:
                        "border-amber-400/15 bg-amber-400/[0.06] shadow-[0_0_22px_-8px_rgba(251,191,36,0.4)]",
                      value: "text-amber-200",
                      glow: "bg-amber-500/[0.07]",
                    }
                  : item.tone === "emerald"
                    ? {
                        icon: "text-emerald-300",
                        iconBox: "border-emerald-400/15 bg-emerald-400/[0.06]",
                        value: "text-emerald-200",
                        glow: "bg-emerald-500/[0.06]",
                      }
                    : {
                        icon: "text-sky-300",
                        iconBox: "border-sky-400/15 bg-sky-400/[0.06]",
                        value: "text-sky-200",
                        glow: "bg-sky-500/[0.06]",
                      };

            return (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_18px_50px_-30px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[24px] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.11] hover:bg-white/[0.045]"
              >
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${toneStyles.glow} blur-[45px] transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
                      {item.label}
                    </p>

                    <p
                      className={`mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight ${toneStyles.value}`}
                    >
                      {item.value}
                    </p>

                    <p className="mt-1.5 text-[11px] text-slate-600">
                      {item.sub}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneStyles.iconBox}`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${toneStyles.icon}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* FILTER / CONTROL BAR */}
        <section className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[22px]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "critical", label: "Critical" },
                { id: "warning", label: "Warning" },
                { id: "acknowledged", label: "Acknowledged" },
              ].map((tab) => {
                const active = filter === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setFilter(
                        tab.id as
                          | "all"
                          | "critical"
                          | "warning"
                          | "acknowledged",
                      )
                    }
                    className={`rounded-xl border px-3.5 py-2 font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.12em] transition-all ${
                      active
                        ? "border-sky-400/20 bg-sky-400/[0.09] text-sky-200 shadow-[0_0_18px_-8px_rgba(56,189,248,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "border-transparent text-slate-500 hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2 sm:w-[270px]">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search incidents..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>

              {/* LINE CONTROL */}
              <button
                type="button"
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2 text-xs text-slate-500 transition hover:border-white/[0.11] hover:text-slate-300"
              >
                <span>All Lines</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {/* SORT CONTROL */}
              <button
                type="button"
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2 text-xs text-slate-500 transition hover:border-white/[0.11] hover:text-slate-300"
              >
                <span>Newest First</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* MAIN INCIDENT AREA */}
        <section className="mb-7 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.85fr)]">
          {/* ACTIVE INCIDENT QUEUE */}
          <div className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.028] shadow-[0_24px_70px_-35px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[26px]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-300" />

                  <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Active Incident Queue
                  </p>
                </div>

                <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Operational Anomalies
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Showing {filteredIncidents.length} of {incidents.length}{" "}
                  active incidents
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-rose-400/15 bg-rose-400/[0.05] px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
                </span>

                <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-rose-300">
                  {unacknowledgedCount} Awaiting Response
                </span>
              </div>
            </div>

            <div className="space-y-2.5 p-3 sm:p-4">
              {filteredIncidents.map((incident) => {
                const acknowledged = incident.state === "acknowledged";

                return (
                  <article
                    key={incident.id}
                    className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                      acknowledged
                        ? "border-white/[0.055] bg-white/[0.018] opacity-65"
                        : incident.severity === "critical"
                          ? "border-rose-400/[0.14] bg-rose-400/[0.025] hover:border-rose-400/[0.24] hover:bg-rose-400/[0.04]"
                          : incident.severity === "warning"
                            ? "border-amber-400/[0.12] bg-amber-400/[0.018] hover:border-amber-400/[0.22] hover:bg-amber-400/[0.03]"
                            : "border-sky-400/[0.1] bg-sky-400/[0.015] hover:border-sky-400/[0.18] hover:bg-sky-400/[0.025]"
                    }`}
                  >
                    {/* severity rail */}
                    <div
                      className={`absolute bottom-3 left-0 top-3 w-[2px] rounded-r-full ${
                        incident.severity === "critical"
                          ? "bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.65)]"
                          : incident.severity === "warning"
                            ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                            : "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                      }`}
                    />

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.12em] ${severityBadge(
                                incident.severity,
                              )}`}
                            >
                              {incident.severity}
                            </span>

                            <span className="font-[family-name:var(--font-mono)] text-[9px] text-slate-600">
                              {incident.id}
                            </span>

                            {acknowledged && (
                              <span className="flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.1em] text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Acknowledged
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-slate-200 sm:text-[15px]">
                            {incident.title}
                          </h3>

                          <p className="mt-1.5 text-[11px] text-slate-600">
                            <span className="font-[family-name:var(--font-mono)] text-sky-400">
                              {incident.machineId}
                            </span>
                            <span className="mx-2 text-slate-700">·</span>
                            {incident.line}
                            <span className="mx-2 text-slate-700">·</span>
                            {incident.source}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 font-[family-name:var(--font-mono)] text-[9px] text-slate-600">
                          <Clock3 className="h-3.5 w-3.5" />
                          <span>{incident.timestamp}</span>
                          <span className="text-slate-700">·</span>
                          <span>{incident.duration} active</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <div className="rounded-xl border border-white/[0.055] bg-black/10 px-3 py-2.5">
                          <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                            Current Reading
                          </p>

                          <p
                            className={`mt-1 font-[family-name:var(--font-mono)] text-sm font-semibold ${severityText(
                              incident.severity,
                            )}`}
                          >
                            {incident.reading}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.055] bg-black/10 px-3 py-2.5">
                          <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                            Threshold
                          </p>

                          <p className="mt-1 font-[family-name:var(--font-mono)] text-sm font-medium text-slate-400">
                            {incident.threshold}
                          </p>
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                          {!acknowledged && (
                            <button
                              type="button"
                              onClick={() => acknowledgeIncident(incident.id)}
                              className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] px-3 py-2 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.09]"
                            >
                              Acknowledge
                            </button>
                          )}

                          <Link
                            href={`/dashboard/machines/${incident.machineId.toLowerCase()}`}
                            className="rounded-xl border border-sky-400/15 bg-sky-400/[0.055] px-3 py-2 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.1em] text-sky-300 transition hover:border-sky-400/30 hover:bg-sky-400/[0.09]"
                          >
                            View Machine
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredIncidents.length === 0 && (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] p-8 text-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />

                  <p className="mt-3 text-sm font-medium text-slate-300">
                    No matching incidents
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Adjust the current filters or search query.
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* RIGHT CONTROL COLUMN */}
          <div className="space-y-4">
            {/* INCIDENT SEVERITY */}
            <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.028] p-5 shadow-[0_24px_70px_-35px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[26px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Incident Severity
                  </p>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-200">
                    Active Distribution
                  </h3>
                </div>

                <AlertTriangle className="h-4 w-4 text-rose-300" />
              </div>

              {/* DONUT */}
              <div className="mt-6 flex items-center gap-5">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
  #fb7185 0deg ${criticalDegrees}deg,
  #fbbf24 ${criticalDegrees}deg ${criticalDegrees + warningDegrees}deg,
  #38bdf8 ${criticalDegrees + warningDegrees}deg 360deg
)`,
                      boxShadow:
                        "0 0 32px rgba(56,189,248,0.06), inset 0 0 18px rgba(255,255,255,0.025)",
                    }}
                  />

                  <div className="absolute inset-[13px] rounded-full border border-white/[0.06] bg-[#070c14] shadow-[inset_0_0_22px_rgba(2,6,23,0.95)]" />

                  <div className="relative text-center">
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-100">
                      {totalIncidents}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.15em] text-slate-600">
                      Alerts
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  {[
                    {
                      label: "Critical",
                      value: criticalCount,
                      dot: "bg-rose-400",
                      text: "text-rose-300",
                    },
                    {
                      label: "Warning",
                      value: warningCount,
                      dot: "bg-amber-400",
                      text: "text-amber-300",
                    },
                    {
                      label: "Info",
                      value: infoCount,
                      dot: "bg-sky-400",
                      text: "text-sky-300",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
                        />
                        <span className="text-[11px] text-slate-500">
                          {item.label}
                        </span>
                      </div>

                      <span
                        className={`font-[family-name:var(--font-mono)] text-xs font-semibold ${item.text}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-600">
                  Critical concentration
                </span>

                <span className="font-[family-name:var(--font-mono)] text-[9px] text-rose-300">
                  {totalIncidents > 0
                    ? `${((criticalCount / totalIncidents) * 100).toFixed(1)}%`
                    : "0.0%"}
                </span>
              </div>
            </div>

            {/* ALERT TIMELINE */}
            <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.028] p-5 shadow-[0_24px_70px_-35px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[26px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Alert Timeline
                  </p>

                  <h3 className="mt-1.5 text-sm font-semibold text-slate-200">
                    Latest Events
                  </h3>
                </div>

                <Clock3 className="h-4 w-4 text-sky-300" />
              </div>

              <div className="relative mt-5">
                <div className="absolute bottom-2 left-[5px] top-2 w-px bg-gradient-to-b from-sky-400/25 via-white/[0.08] to-transparent" />

                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div
                      key={`${event.time}-${event.text}`}
                      className="relative flex gap-3"
                    >
                      <div className="relative z-10 mt-1">
                        <span
                          className={`block h-[11px] w-[11px] rounded-full border-2 border-[#080d16] ${severityDot(
                            event.severity,
                          )}`}
                        />
                      </div>

                      <div
                        className={`min-w-0 flex-1 ${
                          index !== timeline.length - 1 ? "pb-1" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] leading-relaxed text-slate-400">
                            {event.text}
                          </p>

                          <span className="shrink-0 font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                            {event.time}
                          </span>
                        </div>

                        <p
                          className={`mt-1 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.1em] ${severityText(
                            event.severity,
                          )}`}
                        >
                          {event.severity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESPONSE STATUS */}
            <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.028] p-5 shadow-[0_24px_70px_-35px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[26px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Response Status
                  </p>

                  <h3 className="mt-1.5 text-sm font-semibold text-slate-200">
                    Operator Response
                  </h3>
                </div>

                <Timer className="h-4 w-4 text-emerald-300" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-rose-400/[0.1] bg-rose-400/[0.025] p-3">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Unacknowledged
                  </p>

                  <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-rose-300">
                    {unacknowledgedCount}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/[0.1] bg-emerald-400/[0.025] p-3">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Acknowledged
                  </p>

                  <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-emerald-300">
                    {acknowledgedCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Avg Response
                  </p>

                  <p className="mt-2 font-[family-name:var(--font-mono)] text-base font-semibold text-sky-300">
                    4m 18s
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    MTTR
                  </p>

                  <p className="mt-2 font-[family-name:var(--font-mono)] text-base font-semibold text-slate-300">
                    22m
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-600">
                    Response completion
                  </span>

                  <span className="font-[family-name:var(--font-mono)] text-[8px] text-emerald-300">
                    {Math.round((acknowledgedCount / incidents.length) * 100)}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.35)] transition-all duration-500"
                    style={{
                      width: `${(acknowledgedCount / incidents.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* RECENT ALERT HISTORY */}
        <section className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.028] shadow-[0_24px_70px_-35px_rgba(2,6,23,0.95),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[26px]">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Recent Alert History
              </p>

              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                Resolved & Historical Events
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Recent incident activity across connected production equipment.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
              <Clock3 className="h-3.5 w-3.5 text-slate-500" />

              <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-500">
                Last 24 Hours
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.055] bg-white/[0.015]">
                  {[
                    "Alert ID",
                    "Time",
                    "Machine",
                    "Event",
                    "Severity",
                    "Duration",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.15em] text-slate-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="group border-b border-white/[0.045] transition-colors last:border-b-0 hover:bg-sky-400/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate-500 transition-colors group-hover:text-slate-400">
                        {item.id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate-500">
                        {item.time}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] font-medium text-sky-400">
                        {item.machine}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-[11px] text-slate-400">
                        {item.event}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.1em] ${severityBadge(
                          item.severity,
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${severityDot(
                            item.severity,
                          )}`}
                        />

                        {item.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate-500">
                        {item.duration}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.1em] ${
                          item.status === "Resolved"
                            ? "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-300"
                            : item.status === "Acknowledged"
                              ? "border-sky-400/15 bg-sky-400/[0.055] text-sky-300"
                              : "border-slate-400/10 bg-slate-400/[0.045] text-slate-400"
                        }`}
                      >
                        {item.status === "Resolved" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}

                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="flex flex-col gap-2 border-t border-white/[0.05] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.11em] text-slate-700">
              Showing {history.length} recent events
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />

              <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.11em] text-slate-600">
                Incident service online
              </span>
            </div>
          </div>
        </section>

        {/* BOTTOM SYSTEM STRIP */}
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
              Alert Engine Operational
            </span>
          </div>

          <div className="flex items-center gap-4 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.1em] text-slate-700">
            <span>Polling 2s</span>
            <span>Rules Engine v1.0</span>
            <span>PackPilot Incident Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
