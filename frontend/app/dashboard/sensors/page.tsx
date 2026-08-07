"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Radio,
  Thermometer,
  Waves,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";
import {
  getLatestSensorReading,
  getSensorReadings,
  type SensorReading,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Real prototype sensors — the only 3 sensors that exist in the DB   */
/* ------------------------------------------------------------------ */

type SensorType = "temperature" | "vibration" | "ir";
type SensorStatus = "healthy" | "warning" | "critical" | "reporting";

interface SensorDef {
  sensorId: number;
  code: string;
  label: string;
  type: SensorType;
}

const SENSOR_DEFS: SensorDef[] = [
  { sensorId: 1, code: "TEMP-01", label: "Temperature", type: "temperature" },
  { sensorId: 2, code: "VIB-01", label: "Vibration", type: "vibration" },
  { sensorId: 3, code: "IR-01", label: "IR / Carton Detection", type: "ir" },
];

// Mirrors the backend's authoritative high-temperature alert threshold
// (backend/app/alerts/service.py: TEMPERATURE_HIGH). Not a new threshold.
const TEMPERATURE_HIGH_C = 80;

const filters: { key: "all" | SensorType; label: string }[] = [
  { key: "all", label: "All Sensors" },
  { key: "temperature", label: "Temperature" },
  { key: "vibration", label: "Vibration" },
  { key: "ir", label: "IR" },
];

const typeIcon: Record<SensorType, typeof Thermometer> = {
  temperature: Thermometer,
  vibration: Waves,
  ir: Radio,
};

function formatReading(type: SensorType, reading: SensorReading | null): string {
  if (!reading) return "--";
  if (type === "temperature") return `${reading.value.toFixed(1)} °C`;
  if (type === "vibration") return reading.value === 1 ? "Detected" : "Not Detected";
  return reading.value === 1 ? "Object Detected" : "Clear";
}

function normalizeSeries(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => Math.max(0.05, Math.min(0.95, (v - min) / (max - min))));
}

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

function statusMeta(status: SensorStatus) {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        text: "text-emerald-300",
        dot: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
        badge: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
        stroke: "#34d399",
        icon: CheckCircle2,
      };
    case "warning":
      return {
        label: "Warning",
        text: "text-amber-300",
        dot: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]",
        badge: "border-amber-400/25 bg-amber-400/[0.1] text-amber-300",
        stroke: "#fbbf24",
        icon: AlertTriangle,
      };
    case "critical":
      return {
        label: "Critical",
        text: "text-rose-300",
        dot: "bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]",
        badge: "border-rose-500/25 bg-rose-500/[0.1] text-rose-300",
        stroke: "#f43f5e",
        icon: XCircle,
      };
    case "reporting":
      return {
        label: "Reporting",
        text: "text-slate-400",
        dot: "bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.5)]",
        badge: "border-white/[0.1] bg-white/[0.04] text-slate-400",
        stroke: "#94a3b8",
        icon: Activity,
      };
  }
}

function Oscilloscope({
  values,
  color,
  thresholdRatio,
}: {
  values: number[];
  color: string;
  thresholdRatio?: number;
}) {
  const w = 100;
  const h = 100;

  if (values.length < 2) {
    return (
      <div className="flex h-20 w-full items-center justify-center text-[10px] text-slate-600">
        No history yet
      </div>
    );
  }

  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - v * h}`)
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const thresholdY = thresholdRatio !== undefined ? h - thresholdRatio * h : null;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-20 w-full">
      {/* scope grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((g) => (
        <line key={g} x1={w * g} x2={w * g} y1="0" y2={h} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {/* threshold line — only rendered when a genuine threshold applies */}
      {thresholdY !== null && (
        <line
          x1="0"
          x2={w}
          y1={thresholdY}
          y2={thresholdY}
          stroke="rgba(244,63,94,0.45)"
          strokeWidth="0.7"
          strokeDasharray="3 3"
        />
      )}
      {/* area fill */}
      <polygon points={areaPoints} fill={color} opacity="0.12" />
      {/* trace */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}90)` }}
      />
      {/* live head dot */}
      <circle
        cx={w}
        cy={h - values[values.length - 1] * h}
        r="1.8"
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function SensorsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | SensorType>("all");
  const [query, setQuery] = useState("");

  const [latest, setLatest] = useState<Record<number, SensorReading | null>>({});
  const [history, setHistory] = useState<Record<number, SensorReading[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [syncSeconds, setSyncSeconds] = useState(0);

  /* latest readings — poll every 2s, matches dashboard/page.tsx cadence */
  useEffect(() => {
    async function fetchLatest() {
      const results = await Promise.allSettled(
        SENSOR_DEFS.map((s) => getLatestSensorReading(s.sensorId))
      );

      setLatest((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          next[SENSOR_DEFS[i].sensorId] = r.status === "fulfilled" ? r.value : null;
        });
        return next;
      });

      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        console.error("Failed to fetch sensor readings");
      }
      setError(allFailed);
      setLoading(false);
      setSyncSeconds(0);
    }

    fetchLatest();
    const interval = setInterval(fetchLatest, 2000);
    return () => clearInterval(interval);
  }, []);

  /* reading history — poll every 10s, matches dashboard/page.tsx cadence */
  useEffect(() => {
    async function fetchHistory() {
      const results = await Promise.allSettled(
        SENSOR_DEFS.map((s) => getSensorReadings(s.sensorId))
      );

      setHistory((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            next[SENSOR_DEFS[i].sensorId] = r.value.slice(-30);
          }
        });
        return next;
      });
    }

    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  /* "last sync Xs ago" ticker */
  useEffect(() => {
    const id = setInterval(() => setSyncSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const channels = useMemo(() => {
    return SENSOR_DEFS.map((def) => {
      const reading = latest[def.sensorId] ?? null;
      const hist = history[def.sensorId] ?? [];
      const values = hist.map((r) => r.value);

      let status: SensorStatus = "reporting";
      if (def.type === "temperature" && reading) {
        status = reading.value > TEMPERATURE_HIGH_C ? "critical" : "healthy";
      }
      // Vibration and IR are both binary detection states, not measured
      // magnitudes — no health/warning/critical classification applies,
      // so status stays "reporting" rather than a guessed one.

      return { def, reading, values, status: status as SensorStatus };
    });
  }, [latest, history]);

  const filteredChannels = useMemo(
    () => channels.filter((c) => (activeFilter === "all" ? true : c.def.type === activeFilter)),
    [channels, activeFilter]
  );

  const filteredRegistry = useMemo(() => {
    return channels.filter((c) => {
      const matchesFilter = activeFilter === "all" ? true : c.def.type === activeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        c.def.code.toLowerCase().includes(q) ||
        c.def.label.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [channels, activeFilter, query]);

  const connectedCount = SENSOR_DEFS.length;
  const healthyCount = channels.filter((c) => c.status === "healthy").length;
  const warningCount = channels.filter((c) => c.status === "warning").length;
  const criticalCount = channels.filter((c) => c.status === "critical").length;
  const reportingCount = channels.filter((c) => c.status === "reporting").length;

  const healthDistribution = [
    { label: "Healthy", count: healthyCount, color: "#34d399" },
    { label: "Warning", count: warningCount, color: "#fbbf24" },
    { label: "Critical", count: criticalCount, color: "#f43f5e" },
    { label: "Reporting", count: reportingCount, color: "#94a3b8" },
  ];

  const totalHealth = healthDistribution.reduce((s, d) => s + d.count, 0) || 1;
  let ringOffset = 0;

  return (
    <div className="relative px-6 pb-8 pt-12 sm:px-10 lg:px-14">
      {/* local ambient bloom */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative">
        {/* header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sky-300">
              <Radio className="h-3 w-3" />
              Live Telemetry
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              Sensor Network
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Real-time condition monitoring across connected packaging equipment.
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${
              error ? "border-rose-500/25 bg-rose-500/[0.08]" : "border-emerald-400/20 bg-emerald-400/[0.08]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                  error ? "bg-rose-500" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  error
                    ? "bg-rose-500 shadow-[0_0_8px_2px_rgba(244,63,94,0.7)]"
                    : "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]"
                }`}
              />
            </span>
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                error ? "text-rose-300" : "text-emerald-300"
              }`}
            >
              {error ? "Offline" : "Live Data"}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-slate-400">
              · Last sync {syncSeconds}s ago
            </span>
          </div>
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
              placeholder="Search sensor ID…"
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* KPI row */}
        <section className="mb-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[
            { label: "Connected Sensors", value: connectedCount, sub: "on PackPilot IoT Line", accent: "from-sky-400 to-cyan-300", icon: Radio },
            { label: "Healthy", value: healthyCount, sub: "operating within range", accent: "from-emerald-400 to-teal-300", icon: CheckCircle2 },
            { label: "Warning", value: warningCount, sub: "approaching threshold", accent: "from-amber-400 to-orange-300", icon: AlertTriangle },
            { label: "Critical", value: criticalCount, sub: "requires immediate action", accent: "from-rose-400 to-rose-300", icon: XCircle },
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
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-slate-50">
                {loading ? "--" : s.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
              <p className="mt-1.5 text-[11px] text-slate-600">{s.sub}</p>
            </div>
          ))}
        </section>

        {/* control room: telemetry + right column */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* live telemetry */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-7 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px] lg:col-span-2">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
            <div className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-sky-500/10 blur-[100px]" />
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
                  Live Telemetry
                </h2>
                <p className="text-xs text-slate-500">Streaming waveform per instrumented channel</p>
              </div>
              <Activity className="h-4 w-4 text-sky-400/60" />
            </div>

            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-slate-500">
                  Loading sensor telemetry…
                </div>
              )}

              {!loading &&
                filteredChannels.map((c) => {
                  const meta = statusMeta(c.status);
                  const normalized = normalizeSeries(c.values);
                  const isTemperature = c.def.type === "temperature";
                  const thresholdRatio =
                    isTemperature && c.values.length > 0
                      ? (() => {
                          const min = Math.min(...c.values);
                          const max = Math.max(...c.values);
                          return max === min ? undefined : (TEMPERATURE_HIGH_C - min) / (max - min);
                        })()
                      : undefined;
                  const histMin = c.values.length ? Math.min(...c.values) : null;
                  const histMax = c.values.length ? Math.max(...c.values) : null;

                  return (
                    <div
                      key={c.def.sensorId}
                      className="group/channel relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.035]"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{c.def.label}</p>
                          <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-slate-500">
                            {c.def.code}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${meta.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} animate-pulse`} />
                          {meta.label}
                        </span>
                      </div>

                      <div className="mb-3 flex items-end justify-between gap-4">
                        <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-slate-50">
                          {formatReading(c.def.type, c.reading)}
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-[11px] text-slate-600">
                          {histMin !== null && histMax !== null
                            ? `observed min ${histMin.toFixed(2)} · max ${histMax.toFixed(2)}`
                            : "no history yet"}
                        </p>
                      </div>

                      <Oscilloscope values={normalized} color={meta.stroke} thresholdRatio={thresholdRatio} />

                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${normalized.length ? Math.min(100, Math.max(2, normalized[normalized.length - 1] * 100)) : 2}%`,
                            backgroundColor: meta.stroke,
                            boxShadow: `0 0 8px 0 ${meta.stroke}80`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

              {!loading && filteredChannels.length === 0 && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-sm text-slate-500">
                  No live channels for this sensor type.
                </div>
              )}
            </div>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-6">
            {/* sensor health */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-400/10 blur-[90px]" />
              <h2 className="mb-1 font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">Sensor Health</h2>
              <p className="mb-5 text-xs text-slate-500">Across {connectedCount} monitored points</p>

              <div className="flex items-center gap-5">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" />
                    {healthDistribution.map((d) => {
                      const circumference = 2 * Math.PI * 50;
                      const dash = (d.count / totalHealth) * circumference;
                      const dashOffset = circumference - ringOffset;
                      ringOffset += dash;
                      return (
                        <circle
                          key={d.label}
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={d.color}
                          strokeWidth="11"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={dashOffset}
                          style={{ filter: `drop-shadow(0 0 5px ${d.color}80)` }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-[family-name:var(--font-mono)] text-lg font-semibold text-slate-50">
                      {Math.round((healthyCount / totalHealth) * 100)}%
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500">Healthy</p>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5">
                  {healthDistribution.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: d.color, boxShadow: `0 0 8px 1px ${d.color}90` }}
                        />
                        {d.label}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-slate-400">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* anomaly feed */}
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
              <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-amber-400/10 blur-[90px]" />
              <h2 className="mb-1 font-[family-name:var(--font-display)] text-base font-semibold text-slate-100">Anomaly Feed</h2>
              <p className="mb-4 text-xs text-slate-500">Latest out-of-range events</p>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center text-xs text-slate-500">
                No anomaly data available.
              </div>
            </div>
          </div>
        </section>

        {/* sensor registry */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-7 shadow-[0_30px_70px_-20px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-[100px]" />
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">Sensor Registry</h2>
              <p className="text-xs text-slate-500">Full instrumentation directory · {filteredRegistry.length} shown</p>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="pb-3 font-medium">Sensor ID</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Machine</th>
                  <th className="pb-3 font-medium">Reading</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  filteredRegistry.map((c) => {
                    const meta = statusMeta(c.status);
                    const TypeIcon = typeIcon[c.def.type];
                    return (
                      <tr
                        key={c.def.sensorId}
                        className="group/row border-b border-white/[0.04] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                      >
                        <td className="py-3 font-[family-name:var(--font-mono)] text-sm text-slate-300 transition-colors group-hover/row:text-slate-100">
                          {c.def.code}
                        </td>
                        <td className="py-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5 text-slate-500" />
                            <span className="capitalize">{c.def.type}</span>
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-300">Machine 1</td>
                        <td className="py-3 font-[family-name:var(--font-mono)] text-sm text-slate-200">
                          {formatReading(c.def.type, c.reading)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${meta.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-right font-[family-name:var(--font-mono)] text-xs text-slate-500">
                          {c.reading ? new Date(c.reading.timestamp).toLocaleTimeString() : "--:--:--"}
                        </td>
                      </tr>
                    );
                  })}

                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      Loading sensor registry…
                    </td>
                  </tr>
                )}

                {!loading && filteredRegistry.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No sensors match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
