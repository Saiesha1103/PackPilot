"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Radio,
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Waves,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types — shaped to drop in FastAPI responses without a UI rewrite   */
/* ------------------------------------------------------------------ */

type SensorType = "temperature" | "vibration" | "pressure" | "current" | "humidity";
type SensorStatus = "healthy" | "warning" | "critical";

interface TelemetryChannel {
  id: string;
  sensorId: string;
  label: string;
  machineId: string;
  type: SensorType;
  value: number;
  unit: string;
  status: SensorStatus;
  min: number;
  max: number;
  threshold: number;
  wave: "sine" | "sawtooth" | "noisy" | "spike";
}

interface AnomalyEvent {
  id: string;
  machineId: string;
  label: string;
  value: string;
  note: string;
  severity: SensorStatus;
  timestamp: string;
}

interface RegistryRow {
  sensorId: string;
  type: SensorType;
  machineId: string;
  location: string;
  reading: string;
  status: SensorStatus;
  lastUpdate: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data — replace with FastAPI GET /sensors, /sensors/anomalies  */
/* ------------------------------------------------------------------ */

const initialChannels: TelemetryChannel[] = [
  {
    id: "ch-1",
    sensorId: "VIB-CF01-02",
    label: "Motor Vibration",
    machineId: "CF-01",
    type: "vibration",
    value: 0.032,
    unit: "g RMS",
    status: "healthy",
    min: 0.0,
    max: 0.08,
    threshold: 0.065,
    wave: "sine",
  },
  {
    id: "ch-2",
    sensorId: "TMP-CV04-01",
    label: "Bearing Temperature",
    machineId: "CV-04",
    type: "temperature",
    value: 68.2,
    unit: "°C",
    status: "healthy",
    min: 20,
    max: 95,
    threshold: 85,
    wave: "sawtooth",
  },
  {
    id: "ch-3",
    sensorId: "CUR-CP02-01",
    label: "Motor Current",
    machineId: "CP-02",
    type: "current",
    value: 14.8,
    unit: "A",
    status: "warning",
    min: 4,
    max: 18,
    threshold: 15,
    wave: "spike",
  },
  {
    id: "ch-4",
    sensorId: "PRS-DC01-01",
    label: "Hydraulic Pressure",
    machineId: "DC-01",
    type: "pressure",
    value: 6.4,
    unit: "bar",
    status: "healthy",
    min: 2,
    max: 9,
    threshold: 8,
    wave: "noisy",
  },
];

const anomalyFeed: AnomalyEvent[] = [
  { id: "an-1", machineId: "CP-02", label: "Motor Current", value: "14.8 A", note: "High", severity: "warning", timestamp: "2m ago" },
  { id: "an-2", machineId: "SU-03", label: "Bearing Temp", value: "92.6 °C", note: "Threshold exceeded", severity: "critical", timestamp: "18m ago" },
  { id: "an-3", machineId: "CV-07", label: "Vibration", value: "0.091 g", note: "Elevated", severity: "warning", timestamp: "41m ago" },
];

const registryRows: RegistryRow[] = [
  { sensorId: "TMP-CF01-01", type: "temperature", machineId: "CF-01", location: "Line 1 — Forming", reading: "41.8 °C", status: "healthy", lastUpdate: "3s ago" },
  { sensorId: "VIB-CF01-02", type: "vibration", machineId: "CF-01", location: "Line 1 — Forming", reading: "0.032 g", status: "healthy", lastUpdate: "3s ago" },
  { sensorId: "CUR-CP02-01", type: "current", machineId: "CP-02", location: "Line 2 — Packaging", reading: "14.8 A", status: "warning", lastUpdate: "5s ago" },
  { sensorId: "PRS-DC01-01", type: "pressure", machineId: "DC-01", location: "Line 2 — Die Cutting", reading: "6.4 bar", status: "healthy", lastUpdate: "4s ago" },
  { sensorId: "HUM-LS01-01", type: "humidity", machineId: "LS-01", location: "Line 3 — Packaging", reading: "47.2 %RH", status: "healthy", lastUpdate: "8s ago" },
  { sensorId: "TMP-SU03-02", type: "temperature", machineId: "SU-03", location: "Line 1 — Packaging", reading: "92.6 °C", status: "critical", lastUpdate: "1s ago" },
];

const healthDistribution = [
  { label: "Healthy", count: 118, color: "#34d399" },
  { label: "Warning", count: 6, color: "#fbbf24" },
  { label: "Critical", count: 2, color: "#f43f5e" },
];

const filters: { key: "all" | SensorType; label: string }[] = [
  { key: "all", label: "All Sensors" },
  { key: "temperature", label: "Temperature" },
  { key: "vibration", label: "Vibration" },
  { key: "pressure", label: "Pressure" },
  { key: "current", label: "Current" },
  { key: "humidity", label: "Humidity" },
];

const typeIcon: Record<SensorType, typeof Thermometer> = {
  temperature: Thermometer,
  vibration: Waves,
  pressure: Gauge,
  current: Zap,
  humidity: Droplets,
};

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
  }
}

/* waveform generators — distinct shapes per channel, oscilloscope style */
function buildWave(kind: TelemetryChannel["wave"], seed: number, points = 48): number[] {
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / points;
    let v = 0;
    if (kind === "sine") {
      v = Math.sin(t * Math.PI * 6 + seed) * 0.35 + 0.5;
    } else if (kind === "sawtooth") {
      v = (((t * 5 + seed * 0.1) % 1) * 0.7) + 0.15;
    } else if (kind === "spike") {
      v = 0.42 + Math.sin(t * Math.PI * 10 + seed) * 0.06;
      if (i % 9 === 0) v += 0.35;
      if (i % 17 === 3) v += 0.22;
    } else {
      // noisy
      v = 0.5 + Math.sin(t * Math.PI * 8 + seed) * 0.18 + (Math.sin(i * 12.9898 + seed) * 43758.5453 % 1) * 0.14;
    }
    out.push(Math.max(0.05, Math.min(0.95, v)));
  }
  return out;
}

function Oscilloscope({
  values,
  color,
  thresholdRatio,
}: {
  values: number[];
  color: string;
  thresholdRatio: number;
}) {
  const w = 100;
  const h = 100;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - v * h}`)
    .join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const thresholdY = h - thresholdRatio * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-20 w-full">
      {/* scope grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((g) => (
        <line key={g} x1={w * g} x2={w * g} y1="0" y2={h} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {/* threshold line */}
      <line
        x1="0"
        x2={w}
        y1={thresholdY}
        y2={thresholdY}
        stroke="rgba(244,63,94,0.45)"
        strokeWidth="0.7"
        strokeDasharray="3 3"
      />
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
  const [channels, setChannels] = useState(initialChannels);
  const [waves, setWaves] = useState(() =>
    initialChannels.map((c, i) => buildWave(c.wave, i * 1.3))
  );
  const [syncSeconds, setSyncSeconds] = useState(0);
  const tickRef = useRef(0);

  /* live telemetry jitter */
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setChannels((prev) =>
        prev.map((c) => {
          const jitter = (Math.random() - 0.5) * (c.max - c.min) * 0.02;
          const next = Math.min(c.max, Math.max(c.min, c.value + jitter));
          return { ...c, value: Number(next.toFixed(c.unit === "A" ? 1 : 2)) };
        })
      );
      setWaves((prev) => prev.map((w, i) => buildWave(initialChannels[i].wave, tickRef.current * 0.35 + i)));
      setSyncSeconds(0);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  /* "last sync Xs ago" ticker */
  useEffect(() => {
    const id = setInterval(() => setSyncSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredChannels = useMemo(
    () => channels.filter((c) => (activeFilter === "all" ? true : c.type === activeFilter)),
    [channels, activeFilter]
  );

  const filteredRegistry = useMemo(() => {
    return registryRows.filter((r) => {
      const matchesFilter = activeFilter === "all" ? true : r.type === activeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        r.sensorId.toLowerCase().includes(q) ||
        r.machineId.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const totalHealth = healthDistribution.reduce((s, d) => s + d.count, 0);
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

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Live Data</span>
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
              placeholder="Search sensor ID, machine…"
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* KPI row */}
        <section className="mb-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[
            { label: "Connected Sensors", value: 126, sub: "across 5 production lines", accent: "from-sky-400 to-cyan-300", icon: Radio },
            { label: "Healthy", value: 118, sub: "operating within range", accent: "from-emerald-400 to-teal-300", icon: CheckCircle2 },
            { label: "Warning", value: 6, sub: "approaching threshold", accent: "from-amber-400 to-orange-300", icon: AlertTriangle },
            { label: "Critical", value: 2, sub: "requires immediate action", accent: "from-rose-400 to-rose-300", icon: XCircle },
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
              {filteredChannels.map((c, i) => {
                const meta = statusMeta(c.status);
                const StatusIcon = meta.icon;
                const idx = channels.findIndex((ch) => ch.id === c.id);
                const ratio = (c.value - c.min) / (c.max - c.min);
                const thresholdRatio = (c.threshold - c.min) / (c.max - c.min);
                return (
                  <div
                    key={c.id}
                    className="group/channel relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.035]"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {c.label} <span className="text-slate-500">— {c.machineId}</span>
                        </p>
                        <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-slate-500">{c.sensorId}</p>
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
                        {c.value.toFixed(c.unit === "A" ? 1 : c.unit === "bar" ? 1 : c.unit.includes("g") ? 3 : 1)}
                        <span className="ml-1 text-sm font-normal text-slate-500">{c.unit}</span>
                      </p>
                      <p className="font-[family-name:var(--font-mono)] text-[11px] text-slate-600">
                        min {c.min} · max {c.max} {c.unit}
                      </p>
                    </div>

                    <Oscilloscope values={waves[idx] ?? waves[i]} color={meta.stroke} thresholdRatio={thresholdRatio} />

                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(2, ratio * 100))}%`, backgroundColor: meta.stroke, boxShadow: `0 0 8px 0 ${meta.stroke}80` }}
                      />
                    </div>
                  </div>
                );
              })}

              {filteredChannels.length === 0 && (
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
              <p className="mb-5 text-xs text-slate-500">Across {totalHealth} monitored points</p>

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
                      {Math.round((healthDistribution[0].count / totalHealth) * 100)}%
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

              <div className="space-y-2.5">
                {anomalyFeed.map((a) => {
                  const meta = statusMeta(a.severity);
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.045]"
                    >
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot} animate-pulse`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:var(--font-mono)] text-xs font-semibold text-slate-200">
                          {a.machineId} <span className="font-sans font-normal text-slate-400">— {a.label}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          <span className={meta.text}>{a.value}</span> · {a.note}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-600">{a.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
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
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="pb-3 font-medium">Sensor ID</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Machine</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Reading</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistry.map((r) => {
                  const meta = statusMeta(r.status);
                  const TypeIcon = typeIcon[r.type];
                  return (
                    <tr
                      key={r.sensorId}
                      className="group/row border-b border-white/[0.04] transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="py-3 font-[family-name:var(--font-mono)] text-sm text-slate-300 transition-colors group-hover/row:text-slate-100">
                        {r.sensorId}
                      </td>
                      <td className="py-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <TypeIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span className="capitalize">{r.type}</span>
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-300">{r.machineId}</td>
                      <td className="py-3 text-sm text-slate-400">{r.location}</td>
                      <td className="py-3 font-[family-name:var(--font-mono)] text-sm text-slate-200">{r.reading}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${meta.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 text-right font-[family-name:var(--font-mono)] text-xs text-slate-500">{r.lastUpdate}</td>
                    </tr>
                  );
                })}

                {filteredRegistry.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
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