"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Waves,
  Cpu,
  Gauge,
} from "lucide-react";

type MachineHealth = {
  machine_id: number;
  machine_name: string;
  health_score: number;
  health_status: string;
};

type TrendPoint = {
  timestamp: string;
  value: number;
};

type SensorCard = {
  title: string;
  value: string;
  status: string;
  icon: any;
};

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "healthy":
      return "text-emerald-300";

    case "warning":
      return "text-amber-300";

    case "critical":
      return "text-rose-300";

    default:
      return "text-slate-300";
  }
}

export default function ConditionMonitoringPage() {
  const [machines, setMachines] = useState<MachineHealth[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMachineHealth() {
    const response = await fetch(
      `${API_BASE_URL}/health/`
    );

    const data = await response.json();

    setMachines(data);
  }

  async function fetchTrend() {
    const response = await fetch(
      `${API_BASE_URL}/sensor-trends/1`
    );

    const data = await response.json();

    setTrend(data);
  }

  useEffect(() => {
    async function load() {
      try {
        await Promise.all([
          fetchMachineHealth(),
          fetchTrend(),
        ]);
      } finally {
        setLoading(false);
      }
    }

    load();

    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  const averageHealth = useMemo(() => {
    if (!machines.length) return 0;

    return Math.round(
      machines.reduce(
        (sum, machine) => sum + machine.health_score,
        0
      ) / machines.length
    );
  }, [machines]);

  const healthyMachines = useMemo(
    () =>
      machines.filter(
        (m) => m.health_status === "Healthy"
      ).length,
    [machines]
  );

  const criticalMachines = useMemo(
    () =>
      machines.filter(
        (m) => m.health_status === "Critical"
      ).length,
    [machines]
  );

  const sensorCards: SensorCard[] = [
    {
      title: "Temperature",
      value:
        trend.length > 0
          ? `${trend[trend.length - 1].value.toFixed(1)}°C`
          : "--",
      status: "Live",
      icon: Thermometer,
    },
    {
      title: "Vibration",
      value: "Normal",
      status: "Healthy",
      icon: Waves,
    },
    {
      title: "Equipment",
      value: `${machines.length}`,
      status: "Connected",
      icon: Cpu,
    },
    {
      title: "Health",
      value: `${averageHealth}%`,
      status: "Calculated",
      icon: HeartPulse,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040810]">
        <div className="text-center">
          <Activity className="mx-auto h-10 w-10 animate-pulse text-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading Condition Monitoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#040810]">

      <div className="pointer-events-none absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-sky-500/[0.055] blur-[130px]" />

      <div className="pointer-events-none absolute right-[5%] top-[24%] h-[360px] w-[360px] rounded-full bg-cyan-500/[0.04] blur-[130px]" />

      <div className="pointer-events-none absolute bottom-[10%] left-[35%] h-[420px] w-[420px] rounded-full bg-emerald-400/[0.03] blur-[150px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.035) 1px, transparent 1px),linear-gradient(90deg, rgba(56,189,248,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />

      <div className="relative px-6 pb-10 pt-12">

        {/* HERO */}

        <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Condition Monitoring
              </p>

            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-100">
              Machine Health Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Monitor equipment condition in real time using sensor
              telemetry, machine health scoring and engineering
              diagnostics.
            </p>

          </div>

          <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2">

            <div className="flex items-center gap-2">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                Live Health Monitoring
              </span>

            </div>

          </div>

        </section>

        {/* KPI CARDS */}

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {[
            {
              title: "Average Health",
              value: `${averageHealth}%`,
              icon: HeartPulse,
              color: "text-cyan-300",
            },
            {
              title: "Machines",
              value: machines.length,
              icon: Cpu,
              color: "text-sky-300",
            },
            {
              title: "Healthy",
              value: healthyMachines,
              icon: ShieldCheck,
              color: "text-emerald-300",
            },
            {
              title: "Critical",
              value: criticalMachines,
              icon: AlertTriangle,
              color: "text-rose-300",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">

                  <div>

                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      {card.title}
                    </p>

                    <h2 className={`mt-4 text-4xl font-semibold ${card.color}`}>
                      {card.value}
                    </h2>

                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">

                    <Icon className={`h-6 w-6 ${card.color}`} />

                  </div>

                </div>

              </div>
            );
          })}
        </section>
                {/* MAIN GRID */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_0.9fr]">

          {/* SENSOR TREND */}

          <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Live Sensor Trend
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-100">
                  Bearing Temperature
                </h2>

              </div>

              <Gauge className="h-6 w-6 text-cyan-300" />

            </div>

            <div className="mt-8 h-[320px]">

              <div className="flex h-full items-end justify-between gap-2">

                {trend.length === 0 ? (

                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    No sensor readings available
                  </div>

                ) : (

                  trend.map((point, index) => (

                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center justify-end"
                    >

                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-sky-300 transition-all duration-500"
                        style={{
                          height: `${Math.max(
                            (point.value / 100) * 250,
                            8
                          )}px`,
                        }}
                      />

                      <span className="mt-2 font-mono text-[8px] text-slate-600">
                        {new Date(
                          point.timestamp
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                    </div>

                  ))

                )}

              </div>

            </div>

          </div>

          {/* HEALTH GAUGE */}

          <div className="space-y-5">

            <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Overall Health
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-100">
                    Equipment Score
                  </h2>

                </div>

                <HeartPulse className="h-6 w-6 text-emerald-300" />

              </div>

              <div className="mt-8 flex justify-center">

                <div className="relative flex h-56 w-56 items-center justify-center">

                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #22c55e 0deg ${averageHealth * 3.6}deg,
                        rgba(255,255,255,.05) ${averageHealth * 3.6}deg 360deg
                      )`,
                    }}
                  />

                  <div className="absolute inset-[14px] rounded-full bg-[#060b12]" />

                  <div className="relative text-center">

                    <h2 className="text-5xl font-semibold text-emerald-300">
                      {averageHealth}
                    </h2>

                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Health %
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Live Summary
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-100">
                    System Overview
                  </h2>

                </div>

                <Activity className="h-6 w-6 text-cyan-300" />

              </div>

              <div className="mt-6 space-y-4">

                {machines.map((machine) => (

                  <div
                    key={machine.machine_id}
                    className="rounded-2xl border border-white/[0.05] bg-black/10 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-medium text-slate-200">
                          {machine.machine_name}
                        </h3>

                        <p
                          className={`mt-1 text-sm ${statusColor(
                            machine.health_status
                          )}`}
                        >
                          {machine.health_status}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-mono text-xs text-slate-500">
                          Score
                        </p>

                        <h3 className="mt-1 text-2xl font-semibold text-cyan-300">
                          {machine.health_score}
                        </h3>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>
                {/* SENSOR OVERVIEW */}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {sensorCards.map((sensor) => {
            const Icon = sensor.icon;

            return (
              <div
                key={sensor.title}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-cyan-400/20"
              >
                <div className="flex items-center justify-between">

                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3">
                    <Icon className="h-6 w-6 text-cyan-300" />
                  </div>

                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                    {sensor.status}
                  </span>

                </div>

                <h3 className="mt-6 text-lg font-semibold text-slate-100">
                  {sensor.title}
                </h3>

                <p className="mt-2 text-3xl font-semibold text-cyan-300">
                  {sensor.value}
                </p>

              </div>
            );
          })}

        </section>

        {/* MACHINE HEALTH TABLE */}

        <section className="mt-6 rounded-[28px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">

          <div className="border-b border-white/[0.06] px-6 py-5">

            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Machine Condition
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-100">
              Connected Equipment
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-white/[0.05]">

                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                    Machine
                  </th>

                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                    Health
                  </th>

                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {machines.map((machine) => (

                  <tr
                    key={machine.machine_id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                  >

                    <td className="px-6 py-5">

                      <h3 className="font-medium text-slate-200">
                        {machine.machine_name}
                      </h3>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/[0.05]">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{
                              width: `${machine.health_score}%`,
                            }}
                          />

                        </div>

                        <span className="font-semibold text-cyan-300">
                          {machine.health_score}%
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`font-semibold ${statusColor(
                          machine.health_status
                        )}`}
                      >
                        {machine.health_status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* FOOTER */}

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 backdrop-blur-xl">

          <div className="flex items-center gap-3">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
              Condition Monitoring Service Online
            </span>

          </div>

          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Refreshing every 5 seconds
          </span>

        </div>

      </div>

    </div>
  );
}