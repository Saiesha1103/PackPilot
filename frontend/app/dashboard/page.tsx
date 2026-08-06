"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import {
  getLatestSensorReading,
  getSensorReadings,
  getOEEHistory,
  API_BASE_URL,
  type SensorReading,
  type OEEHistoryRecord,
} from "@/lib/api";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

/* ---------------------------------- data ---------------------------------- */

// Mirrors the backend's authoritative high-temperature alert threshold
// (backend/app/alerts/service.py: TEMPERATURE_HIGH). Not a new threshold.
const TEMPERATURE_HIGH_C = 80;

type AlertApiRecord = {
  id: number;
  machine_id: number;
  alert_type: string;
  message: string;
  severity: string;
  timestamp: string;
  status: string;
};

// Mirrors the severity classification already used in
// frontend/app/dashboard/alerts/page.tsx — not a new scheme.
function mapAlertSeverity(severity: string): "critical" | "warning" | "info" {
  const normalized = severity.toLowerCase();
  if (normalized === "critical") return "critical";
  if (normalized === "high" || normalized === "medium") return "warning";
  return "info";
}

/* -------------------------------- helpers -------------------------------- */

function statusDot(status: string) {
  if (status === "running") {
    return "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]";
  }

  if (status === "warning") {
    return "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]";
  }

  return "bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]";
}

function alertColor(level: string) {
  if (level === "critical") {
    return {
      dot: "bg-rose-500",
      ring: "ring-rose-500/30",
      text: "text-rose-300",
    };
  }

  if (level === "warning") {
    return {
      dot: "bg-amber-400",
      ring: "ring-amber-400/30",
      text: "text-amber-300",
    };
  }

  return {
    dot: "bg-sky-400",
    ring: "ring-sky-400/30",
    text: "text-sky-300",
  };
}

function sensorColor(status: string) {
  if (status === "critical") return "text-rose-300";
  if (status === "elevated") return "text-amber-300";
  if (status === "reporting") return "text-slate-400";
  return "text-emerald-300";
}

/* ---------------------------------- page ---------------------------------- */

export default function DashboardPage() {
  const [tick, setTick] = useState(0);

  const [temperature, setTemperature] = useState<SensorReading | null>(null);

  const [vibration, setVibration] = useState<SensorReading | null>(null);

  const [irSensor, setIrSensor] = useState<SensorReading | null>(null);

  const [temperatureHistory, setTemperatureHistory] = useState<SensorReading[]>(
    [],
  );
  const [oeeHistory, setOeeHistory] =
  useState<OEEHistoryRecord[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertApiRecord[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(false);

  // Existing dashboard animation
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 2200);

    return () => clearInterval(id);
  }, []);

  // Live sensor values — refresh every 2 seconds
  useEffect(() => {
    async function fetchLiveSensors() {
      try {
        const [temp, vib, ir] = await Promise.all([
          getLatestSensorReading(1),
          getLatestSensorReading(2),
          getLatestSensorReading(3),
        ]);

        setTemperature(temp);
        setVibration(vib);
        setIrSensor(ir);
      } catch (error) {
        console.error("Failed to fetch live sensor data:", error);
      }
    }

    fetchLiveSensors();

    const interval = setInterval(fetchLiveSensors, 2000);

    return () => clearInterval(interval);
  }, []);

  // Temperature history — refresh every 10 seconds
  useEffect(() => {
    async function fetchTemperatureHistory() {
      try {
        const readings = await getSensorReadings(1);
        setTemperatureHistory(readings.slice(0, 20).reverse());
      } catch (error) {
        console.error("Failed to fetch temperature history:", error);
      }
    }

    fetchTemperatureHistory();

    const interval = setInterval(fetchTemperatureHistory, 10000);

    return () => clearInterval(interval);
  }, []);
  // Historical OEE — fetch latest 20 stored records
useEffect(() => {
  async function fetchOEEHistory() {
    try {
      const history = await getOEEHistory(20);

      // Backend returns newest first.
      // Reverse so chart displays oldest → newest.
      setOeeHistory(
        history.slice().reverse()
      );
    } catch (error) {
      console.error(
        "Failed to fetch OEE history:",
        error
      );
    }
  }

  fetchOEEHistory();
}, []);
  // Active Alerts — real backend data, same endpoint used by
  // frontend/app/dashboard/alerts/page.tsx
  useEffect(() => {
    async function fetchDashboardAlerts() {
      try {
        const response = await fetch(`${API_BASE_URL}/alerts/`);

        if (!response.ok) {
          throw new Error(`Failed to fetch alerts: ${response.status}`);
        }

        const data: AlertApiRecord[] = await response.json();

        setActiveAlerts(data.filter((alert) => alert.status === "Active"));
        setAlertsError(false);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setAlertsError(true);
      } finally {
        setAlertsLoading(false);
      }
    }

    fetchDashboardAlerts();

    const interval = setInterval(fetchDashboardAlerts, 10000);

    return () => clearInterval(interval);
  }, []);

  // Latest genuine OEE record already in the DB — no new fetch, no POST.
  const latestOee = oeeHistory.length > 0 ? oeeHistory[oeeHistory.length - 1] : null;

  const criticalAlertCount = activeAlerts.filter(
    (alert) => mapAlertSeverity(alert.severity) === "critical",
  ).length;
  const warningAlertCount = activeAlerts.filter(
    (alert) => mapAlertSeverity(alert.severity) === "warning",
  ).length;
  const infoAlertCount = activeAlerts.filter(
    (alert) => mapAlertSeverity(alert.severity) === "info",
  ).length;

  const parseBackendTimestamp = (timestamp: string) => {
    const normalizedTimestamp =
      timestamp.endsWith("Z") || timestamp.includes("+")
        ? timestamp
        : `${timestamp}Z`;

    return new Date(normalizedTimestamp).getTime();
  };

  const latestTelemetryTimestamp = Math.max(
    temperature ? parseBackendTimestamp(temperature.timestamp) : 0,
    vibration ? parseBackendTimestamp(vibration.timestamp) : 0,
    irSensor ? parseBackendTimestamp(irSensor.timestamp) : 0,
  );

  const telemetryAge = latestTelemetryTimestamp
    ? Date.now() - latestTelemetryTimestamp
    : Infinity;

  const isMachineOnline = telemetryAge < 15000;
  // tick keeps this calculation refreshed
  void tick;

  const machines = [
    {
      name: "Machine 1",
      zone: "PackPilot IoT Line",
      status: isMachineOnline ? "running" : "offline",
    },
  ];

  const sensorLog = [
    {
      id: "TEMP-01",
      zone: "Machine 1",
      reading: temperature ? `${temperature.value.toFixed(1)} °C` : "-- °C",
      status: temperature
        ? temperature.value > TEMPERATURE_HIGH_C
          ? "critical"
          : "nominal"
        : "reporting",
      ts: temperature
        ? new Date(temperature.timestamp).toLocaleTimeString()
        : "--:--:--",
    },
    {
      id: "VIB-01",
      zone: "Machine 1",
      reading: vibration
        ? vibration.value === 1
          ? "Detected"
          : "Normal"
        : "--",
      status: vibration?.value === 1 ? "elevated" : "nominal",
      ts: vibration
        ? new Date(vibration.timestamp).toLocaleTimeString()
        : "--:--:--",
    },
    {
      id: "IR-01",
      zone: "Machine 1",
      reading: irSensor
        ? irSensor.value === 1
          ? "Object Detected"
          : "Clear"
        : "--",
      status: "reporting",
      ts: irSensor
        ? new Date(irSensor.timestamp).toLocaleTimeString()
        : "--:--:--",
    },
  ];
  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} relative min-h-screen w-full overflow-hidden bg-[#040810] font-[family-name:var(--font-body)] text-slate-200`}
    >
      {/* Ambient dashboard background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[620px] w-[620px] rounded-full bg-blue-600/25 blur-[150px]" />

        <div className="absolute top-1/3 -right-20 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[440px] w-[440px] rounded-full bg-indigo-600/15 blur-[130px]" />

        <div className="absolute left-1/2 top-1/4 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-[160px]" />

        <div className="absolute left-1/3 top-16 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-sky-300/[0.08] blur-[170px]" />

        <div className="absolute inset-0 animate-[shimmerSweep_14s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-sky-400/[0.03] to-transparent" />

        <div
          className="absolute inset-0 opacity-[0.05] animate-[drift_60s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #7dd3fc 1px, transparent 1px), linear-gradient(to bottom, #7dd3fc 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,8,16,0.5)_70%,rgba(4,8,16,0.95)_100%)]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040810]/40 to-[#040810]" />

        <div className="absolute inset-0 shadow-[inset_0_0_200px_60px_rgba(0,0,0,0.7)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-8 sm:px-10 lg:px-10">
        {/* HERO — Manufacturing Control Center */}
        <section className="group relative mb-8 overflow-hidden rounded-[28px] border border-sky-300/[0.12] bg-white/[0.035] px-7 py-9 shadow-[0_30px_90px_-35px_rgba(14,165,233,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[30px] sm:px-10 sm:py-10">
          {/* glass top sheen */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/40 to-transparent" />

          {/* cyan ambient glow */}
          <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-sky-400/[0.12] blur-[120px] transition-all duration-700 group-hover:bg-sky-400/[0.16]" />

          <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[360px] w-[520px] rounded-full bg-blue-600/[0.08] blur-[130px]" />

          {/* subtle technical grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #7dd3fc 1px, transparent 1px), linear-gradient(to bottom, #7dd3fc 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_330px]">
            {/* LEFT HERO CONTENT */}
            <div className="max-w-3xl">
              {/* plant status */}
              <div className="mb-5 flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                      isMachineOnline ? "bg-emerald-400" : "bg-rose-500"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isMachineOnline
                        ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]"
                        : "bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]"
                    }`}
                  />
                </span>

                <span
                  className={`font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.22em] ${
                    isMachineOnline ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {isMachineOnline ? "Telemetry Online" : "Telemetry Offline"} — Sector 4B
                </span>
              </div>

              {/* title */}
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-slate-100 sm:text-4xl lg:text-[46px]">
                Meridian Assembly Plant
                <span className="mt-1 block bg-gradient-to-r from-slate-200 via-sky-200 to-cyan-300 bg-clip-text text-transparent">
                  is running at {latestOee ? latestOee.oee.toFixed(1) : "--"}%
                  efficiency
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-[15px]">
                Live operational telemetry across production lines, machine
                health, throughput, energy consumption, and plant-floor
                exceptions.
              </p>

              {/* mini operational chips */}
              <div className="mt-7 flex flex-wrap gap-2.5">
                <div className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[11px] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
                  <span className="mr-2 text-slate-500">Shift</span>
                  <span className="font-medium text-slate-200">
                    A · 06:00–14:00
                  </span>
                </div>

                <div className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[11px] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
                  <span className="mr-2 text-slate-500">Telemetry</span>
                  <span
                    className={`font-medium ${isMachineOnline ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {isMachineOnline ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — OEE GAUGE */}
            <div className="relative mx-auto flex h-[270px] w-[270px] items-center justify-center lg:mx-0 lg:justify-self-end">
              {/* outer ambient rings */}
              <div className="absolute inset-0 rounded-full border border-sky-300/[0.06]" />
              <div className="absolute inset-5 rounded-full border border-sky-300/[0.08]" />

              <div className="absolute inset-8 rounded-full bg-sky-400/[0.04] blur-xl" />

              {/* SVG circular gauge */}
              <svg
                viewBox="0 0 240 240"
                className="absolute h-[240px] w-[240px] -rotate-90 drop-shadow-[0_0_18px_rgba(56,189,248,0.18)]"
              >
                <defs>
                  <linearGradient
                    id="oeeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="55%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#67e8f9" />
                  </linearGradient>

                  <filter id="oeeGlow">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* track */}
                <circle
                  cx="120"
                  cy="120"
                  r="94"
                  fill="none"
                  stroke="rgba(148,163,184,0.10)"
                  strokeWidth="9"
                />

                {/* progress */}
                <circle
                  cx="120"
                  cy="120"
                  r="94"
                  fill="none"
                  stroke="url(#oeeGradient)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="590.62"
                  strokeDashoffset={
                    latestOee ? 590.62 * (1 - latestOee.oee / 100) : 590.62
                  }
                  filter="url(#oeeGlow)"
                  className="transition-all duration-1000"
                />
              </svg>

              {/* gauge center */}
              <div className="relative flex h-[170px] w-[170px] flex-col items-center justify-center rounded-full border border-white/[0.07] bg-[#07101c]/55 shadow-[0_0_50px_rgba(14,165,233,0.12),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Overall OEE
                </span>

                <div className="mt-1 flex items-end">
                  <span className="font-[family-name:var(--font-display)] text-[48px] font-semibold leading-none tracking-[-0.05em] text-slate-100">
                    {latestOee ? latestOee.oee.toFixed(1) : "--"}
                  </span>
                  <span className="mb-1.5 ml-1 text-sm font-medium text-sky-300">
                    %
                  </span>
                </div>
              </div>

              {/* orbiting markers */}
              <div className="absolute left-[19px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_12px_3px_rgba(125,211,252,0.55)]" />

              <div className="absolute right-[34px] top-[38px] h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_10px_rgba(103,232,249,0.6)]" />
            </div>
          </div>

          {/* bottom divider */}
          <div className="relative mt-8 border-t border-white/[0.06] pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-600">
                  Shift Schedule
                </p>
                <p className="mt-1 text-xs font-medium text-slate-300">
                  Shift A · 06:00–14:00
                </p>
              </div>

              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-600">
                  Last Sync
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isMachineOnline
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                        : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
                    }`}
                  />
                  <p className="text-xs font-medium text-slate-300">
                    {Number.isFinite(telemetryAge)
                      ? new Date(latestTelemetryTimestamp).toLocaleTimeString()
                      : "No signal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* OEE FACTORS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Availability",
              value: latestOee?.availability,
              description: "Run time / planned production time",
            },
            {
              label: "Performance",
              value: latestOee?.performance,
              description: "Actual output vs ideal production rate",
            },
            {
              label: "Quality",
              value: latestOee?.quality,
              description: "Good units / total units",
            },
          ].map((factor) => (
            <div
              key={factor.label}
              className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_18px_45px_-24px_rgba(14,165,233,0.25),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[24px]"
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {factor.label}
              </p>

              <div className="mt-3 flex items-end gap-1">
                <span className="font-[family-name:var(--font-display)] text-[30px] font-semibold leading-none tracking-[-0.04em] text-slate-100">
                  {factor.value !== undefined ? factor.value.toFixed(1) : "--"}
                </span>

                <span className="mb-0.5 text-[11px] font-medium text-sky-300">
                  %
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-1000"
                  style={{
                    width: `${Math.min(factor.value ?? 0, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-[10px] leading-4 text-slate-600">
                {factor.description}
              </p>
            </div>
          ))}
        </section>
                {/* HISTORICAL OEE TREND */}
        <section className="mb-8 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-[24px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Production Analytics
              </p>

              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
                Historical OEE Trend
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Latest {oeeHistory.length} stored OEE calculations
              </p>
            </div>

            <div className="rounded-full border border-sky-400/10 bg-sky-400/[0.04] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[9px] text-sky-300">
              Live DB History
            </div>
          </div>

          {oeeHistory.length === 0 ? (
            <div className="flex h-52 items-center justify-center rounded-xl border border-white/[0.05] bg-black/10">
              <p className="text-xs text-slate-500">
                No OEE history available
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* chart guide lines */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-48 flex-col justify-between">
                {[100, 75, 50, 25, 0].map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3"
                  >
                    <span className="w-7 text-right font-[family-name:var(--font-mono)] text-[8px] text-slate-700">
                      {value}
                    </span>

                    <div className="h-px flex-1 bg-white/[0.045]" />
                  </div>
                ))}
              </div>

              {/* bars */}
              <div className="relative ml-10 flex h-48 items-end gap-2">
                {oeeHistory.map((record) => (
                  <div
                    key={record.id}
                    className="group relative flex h-full min-w-0 flex-1 items-end"
                  >
                    <div
                      className="relative w-full rounded-t-md bg-gradient-to-t from-sky-600/70 via-sky-400/80 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.12)] transition-all duration-500 group-hover:from-sky-500 group-hover:to-cyan-200"
                      style={{
                        height: `${Math.max(
                          Math.min(record.oee, 100),
                          2
                        )}%`,
                      }}
                    >
                      {/* hover tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#07101c] px-3 py-2 shadow-xl group-hover:block">
                        <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-sky-300">
                          {record.oee.toFixed(1)}%
                        </p>

                        <p className="mt-1 font-[family-name:var(--font-mono)] text-[8px] text-slate-500">
                          {new Date(
                            record.timestamp
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* timestamps */}
              <div className="ml-10 mt-3 flex justify-between">
                <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                  {oeeHistory[0]
                    ? new Date(
                        oeeHistory[0].timestamp
                      ).toLocaleTimeString()
                    : ""}
                </span>

                <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                  {oeeHistory[oeeHistory.length - 1]
                    ? new Date(
                        oeeHistory[
                          oeeHistory.length - 1
                        ].timestamp
                      ).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            </div>
          )}
        </section>
        {/* PRODUCTION OUTPUT */}
        <section className="mb-8 overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[26px]">
          {/* chart header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]" />

                <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Live Sensor Telemetry
                </p>
              </div>

              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                Temperature History
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Temperature °C · latest 20 readings
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  Current
                </p>

                <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-200">
                  {temperature ? temperature.value.toFixed(1) : "--"}
                  <span className="ml-1 text-[10px] font-normal text-slate-500">
                    °C
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* chart */}
          <div className="relative h-[290px] px-6 pb-6 pt-7 sm:px-7">
            {/* horizontal grid */}
            <div className="pointer-events-none absolute inset-x-7 bottom-12 top-7 flex flex-col justify-between">
              {[40, 35, 30, 25, 20].map((value) => (
                <div
                  key={value}
                  className="relative border-t border-white/[0.045]"
                >
                  <span className="absolute -top-2.5 left-0 font-[family-name:var(--font-mono)] text-[8px] text-slate-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* bars */}
            <div className="relative z-10 flex h-[220px] items-end gap-1.5 pt-4 sm:gap-2">
              {temperatureHistory.map((reading, index, array) => {
                const point = {
                  time: new Date(reading.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  value: reading.value,
                };

                const minTemp = 20;
                const maxTemp = 40;

                const height = Math.max(
                  5,
                  Math.min(
                    100,
                    ((point.value - minTemp) / (maxTemp - minTemp)) * 100,
                  ),
                );

                const isCurrent = index === array.length - 1;

                return (
                  <div
                    key={`${reading.id}-${index}`}
                    className="group/bar flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="relative flex flex-1 items-end justify-center">
                      {/* tooltip */}
                      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 -translate-x-1/2 translate-y-2 rounded-lg border border-white/[0.08] bg-[#07101c]/90 px-2 py-1 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover/bar:translate-y-0 group-hover/bar:opacity-100">
                        <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] text-slate-300">
                          {point.value.toFixed(1)} °C
                        </span>
                      </div>

                      <div
                        className={`relative w-full max-w-[36px] rounded-t-md border transition-all duration-700 ${
                          isCurrent
                            ? "border-sky-300/30 bg-gradient-to-t from-blue-600/35 via-sky-500/55 to-cyan-300/90 shadow-[0_0_24px_-4px_rgba(56,189,248,0.55)]"
                            : "border-sky-400/[0.12] bg-gradient-to-t from-blue-600/15 via-sky-500/25 to-sky-300/50 group-hover/bar:border-sky-300/25 group-hover/bar:to-sky-300/70"
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-white/25" />

                        {isCurrent && (
                          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_12px_3px_rgba(103,232,249,0.75)]" />
                        )}
                      </div>
                    </div>

                    <p
                      className={`mt-3 text-center font-[family-name:var(--font-mono)] text-[8px] ${
                        isCurrent ? "text-sky-300" : "text-slate-600"
                      }`}
                    >
                      {point.time}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* bottom glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full bg-sky-500/[0.05] blur-[40px]" />
          </div>
        </section>
        {/* MACHINE STATUS + ACTIVE ALERTS */}
        <section className="mb-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          {/* MACHINE STATUS */}
          <div className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(14,165,233,0.3),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[26px]">
            {/* panel header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />

                  <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Equipment Health
                  </p>
                </div>

                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Machine Status
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Real-time telemetry status across monitored assets
                </p>
              </div>

              <div className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[9px] text-slate-500 backdrop-blur-xl">
                1 asset
              </div>
            </div>

            {/* machine rows */}
            <div className="divide-y divide-white/[0.045]">
              {machines.map((machine) => (
                <div
                  key={machine.name}
                  className="group relative grid grid-cols-[1fr_auto] items-center gap-5 px-6 py-4 transition-all duration-300 hover:bg-white/[0.025]"
                >
                  {/* hover glow */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-sky-400/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex min-w-0 items-center gap-3">
                    {/* status indicator */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <span
                        className={`h-2 w-2 rounded-full ${statusDot(
                          machine.status,
                        )}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {machine.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] text-slate-600">
                          {machine.zone}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-slate-700" />

                        <span
                          className={`font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] ${
                            machine.status === "running"
                              ? "text-emerald-400"
                              : machine.status === "warning"
                                ? "text-amber-400"
                                : "text-rose-400"
                          }`}
                        >
                          {machine.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* load */}
                  <div className="relative w-[150px]">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                        Load
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* machine footer */}
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-6 py-3">
              <Link
                href="/dashboard/machines"
                className="text-[10px] font-medium text-sky-400 transition-colors hover:text-sky-300"
              >
                View all machines →
              </Link>
            </div>
          </div>

          {/* ACTIVE ALERTS */}
          <div className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[26px]">
            {/* alert header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_2px_rgba(251,113,133,0.55)]" />
                  </span>

                  <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    Exception Feed
                  </p>
                </div>

                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                  Active Alerts
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Events requiring operator awareness
                </p>
              </div>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/[0.08] px-2 text-[10px] font-semibold text-rose-300 shadow-[0_0_16px_-5px_rgba(244,63,94,0.5)]">
                {activeAlerts.length}
              </div>
            </div>

            {/* alert list */}
            {alertsLoading ? (
              <div className="px-6 py-10 text-center text-xs text-slate-500">
                Loading alerts…
              </div>
            ) : alertsError ? (
              <div className="px-6 py-10 text-center text-xs text-rose-300/80">
                Unable to load alerts
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs text-slate-500">
                No active alerts
              </div>
            ) : (
              <div className="divide-y divide-white/[0.045]">
                {activeAlerts.slice(0, 5).map((alert) => {
                  const severity = mapAlertSeverity(alert.severity);
                  const colors = alertColor(severity);

                  return (
                    <div
                      key={alert.id}
                      className="group relative px-6 py-4 transition-all duration-300 hover:bg-white/[0.025]"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.025] ring-1 ${colors.ring}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${colors.dot}`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <span
                              className={`font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.14em] ${colors.text}`}
                            >
                              {severity}
                            </span>

                            <span className="shrink-0 font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="mt-1.5 text-xs leading-5 text-slate-300">
                            {`Machine ${alert.machine_id} — ${alert.message}`}
                          </p>
                        </div>
                      </div>

                      {/* hover accent */}
                      <div className="absolute inset-y-3 left-0 w-[2px] scale-y-0 rounded-full bg-sky-400/60 transition-transform duration-300 group-hover:scale-y-100" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* alert summary */}
            <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-rose-400/10 bg-rose-400/[0.035] px-3 py-2">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Critical
                  </p>

                  <p className="mt-1 text-sm font-semibold text-rose-300">{criticalAlertCount}</p>
                </div>

                <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-3 py-2">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Warning
                  </p>

                  <p className="mt-1 text-sm font-semibold text-amber-300">{warningAlertCount}</p>
                </div>

                <div className="rounded-xl border border-sky-400/10 bg-sky-400/[0.035] px-3 py-2">
                  <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                    Info
                  </p>

                  <p className="mt-1 text-sm font-semibold text-sky-300">{infoAlertCount}</p>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] py-2 text-[10px] font-medium text-slate-400 transition-all duration-300 hover:border-sky-400/15 hover:bg-sky-400/[0.04] hover:text-sky-300"
              >
                Open alert console
              </button>
            </div>
          </div>
        </section>
        {/* LIVE SENSOR FEED */}
        <section className="mb-8 overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(14,165,233,0.3),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[26px]">
          {/* section header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]" />
                </span>

                <p className="font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Telemetry Stream
                </p>
              </div>

              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-100">
                Live Sensor Feed
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Latest readings from plant-floor instrumentation
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em] text-emerald-300">
                Streaming
              </span>
            </div>
          </div>

          {/* SENSOR TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                  <th className="px-6 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.16em] text-slate-600 sm:px-7">
                    Sensor ID
                  </th>

                  <th className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.16em] text-slate-600">
                    Zone
                  </th>

                  <th className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.16em] text-slate-600">
                    Reading
                  </th>

                  <th className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.16em] text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.16em] text-slate-600 sm:px-7">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {sensorLog.map((sensor) => (
                  <tr
                    key={sensor.id}
                    className="group border-b border-white/[0.04] transition-all duration-300 last:border-b-0 hover:bg-sky-400/[0.025]"
                  >
                    {/* SENSOR ID */}
                    <td className="px-6 py-4 sm:px-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/[0.1] bg-sky-400/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_7px_rgba(56,189,248,0.65)]" />
                        </div>

                        <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-slate-300 transition-colors group-hover:text-sky-200">
                          {sensor.id}
                        </span>
                      </div>
                    </td>

                    {/* ZONE */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-400">
                        {sensor.zone}
                      </span>
                    </td>

                    {/* READING */}
                    <td className="px-4 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-slate-200">
                        {sensor.reading}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            sensor.status === "critical"
                              ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
                              : sensor.status === "elevated"
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.65)]"
                                : sensor.status === "reporting"
                                  ? "bg-slate-500 shadow-[0_0_6px_rgba(100,116,139,0.5)]"
                                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                          }`}
                        />

                        <span
                          className={`font-[family-name:var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.12em] ${sensorColor(
                            sensor.status,
                          )}`}
                        >
                          {sensor.status}
                        </span>
                      </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="px-6 py-4 text-right sm:px-7">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate-600">
                        {sensor.ts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.015] px-6 py-3 sm:px-7">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />

              <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.14em] text-slate-600">
                {[temperature, vibration, irSensor].filter(Boolean).length}{" "}
                sensors online
              </span>
            </div>

            <button
              type="button"
              className="text-[10px] font-medium text-sky-400 transition-colors hover:text-sky-300"
            >
              View sensor telemetry →
            </button>
          </div>
        </section>

        {/* DASHBOARD FOOTER */}
        <footer className="flex flex-col gap-4 border-t border-white/[0.05] pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-700">
              PackPilot Manufacturing Intelligence
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Real-time operational visibility · Meridian Assembly Plant
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span
              className={`flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] ${
                isMachineOnline ? "text-slate-600" : "text-rose-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isMachineOnline ? "bg-emerald-400" : "bg-rose-500"}`}
              />
              {isMachineOnline ? "Telemetry Live" : "Telemetry Offline"}
            </span>

            <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-700">
              v1.0
            </span>
          </div>
        </footer>
      </div>

      {/* GLOBAL DASHBOARD ANIMATIONS */}
      <style jsx global>{`
        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(18px, -14px, 0);
          }
        }

        @keyframes shimmerSweep {
          0%,
          100% {
            transform: translateX(-35%);
            opacity: 0.35;
          }

          50% {
            transform: translateX(35%);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
