"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  Gauge,
  CalendarDays,
  Clock3,
  Factory,
  ShieldAlert,
  ClipboardCheck,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

type OeeSummary = {
  availability?: number;
  performance?: number;
  quality?: number;
  oee?: number;
};

type MaintenanceSummary = {
  scheduled?: number;
  completed?: number;
  overdue?: number;
};

type DowntimeSummary = {
  events?: number;
  minutes?: number;
};

type PfmeaSummary = {
  high_risk?: number;
  medium_risk?: number;
  low_risk?: number;
};

type ProductionSummary = {
  machines?: number;
  active?: number;
  stopped?: number;
};

type ReportsSummary = {
  oee?: OeeSummary;
  maintenance?: MaintenanceSummary;
  downtime?: DowntimeSummary;
  pfmea?: PfmeaSummary;
  production?: ProductionSummary;
};

const OEE_TARGET = 85;

function fmtNumber(value: number | undefined | null, suffix = "") {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }

  return `${Number(value).toLocaleString()}${suffix}`;
}

function fmtPercent(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }

  return `${Number(value).toFixed(1)}%`;
}

export default function EngineeringReportsPage() {
  const [data, setData] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("--");

  const loadData = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/reports/summary");

      if (!response.ok) {
        setError(true);

        return;
      }

      const json = await response.json();

      setData(json);
      setError(false);
      setLastRefreshed(new Date().toLocaleString());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    async function load() {
      await loadData();

      setLoading(false);
    }

    load();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  const oee = data?.oee ?? {};
  const maintenance = data?.maintenance ?? {};
  const downtime = data?.downtime ?? {};
  const pfmea = data?.pfmea ?? {};
  const production = data?.production ?? {};

  const insights = useMemo(() => {
    if (!data) return [];

    const list: { text: string; ok: boolean }[] = [];

    if (oee.oee !== undefined) {
      if (oee.oee >= OEE_TARGET) {
        list.push({ text: "OEE exceeds target.", ok: true });
      } else {
        list.push({
          text: `OEE is below target (${fmtPercent(oee.oee)} vs ${OEE_TARGET}% target).`,
          ok: false,
        });
      }
    }

    const overdue = maintenance.overdue ?? 0;

    if (overdue > 0) {
      list.push({
        text: `${overdue} maintenance job${overdue === 1 ? "" : "s"} overdue.`,
        ok: false,
      });
    } else if (maintenance.scheduled !== undefined) {
      list.push({ text: "No overdue maintenance.", ok: true });
    }

    const highRisk = pfmea.high_risk ?? 0;

    if (highRisk > 0) {
      list.push({
        text: `High PFMEA risks require review (${highRisk}).`,
        ok: false,
      });
    } else if (
      pfmea.high_risk !== undefined ||
      pfmea.medium_risk !== undefined ||
      pfmea.low_risk !== undefined
    ) {
      list.push({ text: "No high-risk PFMEA items.", ok: true });
    }

    const machines = production.machines ?? 0;
    const active = production.active ?? 0;
    const stopped = production.stopped ?? 0;

    if (machines > 0) {
      list.push({
        text: `${active}/${machines} machines currently operational.`,
        ok: stopped === 0,
      });
    }

    return list;
  }, [data, oee, maintenance, pfmea, production]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040810]">
        <Activity className="h-10 w-10 animate-pulse text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#040810]">
      {/* ambient glow */}

      <div className="pointer-events-none absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.05] blur-[130px]" />

      <div className="pointer-events-none absolute right-[5%] top-[25%] h-[360px] w-[360px] rounded-full bg-emerald-500/[0.04] blur-[130px]" />

      <div className="pointer-events-none absolute bottom-[8%] left-[35%] h-[420px] w-[420px] rounded-full bg-sky-400/[0.03] blur-[140px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.035) 1px, transparent 1px),linear-gradient(90deg, rgba(56,189,248,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />

      <div className="relative px-6 pb-10 pt-12">
        {/* HEADER */}

        <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Engineering Reports
              </p>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-100">
              Engineering Reports
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Consolidated OEE, maintenance, downtime, production and PFMEA
              performance across the plant.
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                Reporting Engine Online
              </span>
            </div>
          </div>
        </section>

        {error && (
          <section className="mb-8 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="h-4 w-4" />

              <p className="text-sm">
                Unable to reach the reports service. Retrying automatically...
              </p>
            </div>
          </section>
        )}

        {!error && !data && (
          <section className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-8 text-center">
            <p className="text-sm text-slate-500">
              No report data is available yet.
            </p>
          </section>
        )}

        {data && (
          <>
            {/* KPI CARDS */}

            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Overall OEE",
                  value: fmtPercent(oee.oee),
                  icon: Gauge,
                  color: "text-cyan-300",
                },
                {
                  title: "Scheduled Maintenance",
                  value: fmtNumber(maintenance.scheduled),
                  icon: CalendarDays,
                  color: "text-sky-300",
                },
                {
                  title: "Downtime Minutes",
                  value: fmtNumber(downtime.minutes),
                  icon: Clock3,
                  color: "text-amber-300",
                },
                {
                  title: "High Risk PFMEA",
                  value: fmtNumber(pfmea.high_risk),
                  icon: ShieldAlert,
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

                        <h2
                          className={`mt-4 text-4xl font-semibold ${card.color}`}
                        >
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

            {/* SUMMARY GRID */}

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {/* OEE SUMMARY */}

              <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      OEE
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-100">
                      OEE Summary
                    </h2>
                  </div>

                  <Gauge className="h-6 w-6 text-cyan-300" />
                </div>

                {oee.oee === undefined ? (
                  <p className="mt-6 text-sm text-slate-500">
                    No OEE data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {[
                      { label: "Overall OEE", value: oee.oee },
                      { label: "Availability", value: oee.availability },
                      { label: "Performance", value: oee.performance },
                      { label: "Quality", value: oee.quality },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm text-slate-500">
                            {row.label}
                          </span>

                          <span className="font-semibold text-cyan-300">
                            {fmtPercent(row.value)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${Math.min(row.value ?? 0, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAINTENANCE SUMMARY */}

              <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Maintenance
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-100">
                      Maintenance Summary
                    </h2>
                  </div>

                  <ClipboardCheck className="h-6 w-6 text-emerald-300" />
                </div>

                {maintenance.scheduled === undefined &&
                maintenance.completed === undefined &&
                maintenance.overdue === undefined ? (
                  <p className="mt-6 text-sm text-slate-500">
                    No maintenance data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Scheduled
                      </span>

                      <span className="font-semibold text-sky-300">
                        {fmtNumber(maintenance.scheduled)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Completed
                      </span>

                      <span className="font-semibold text-emerald-300">
                        {fmtNumber(maintenance.completed)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">Overdue</span>

                      <span className="font-semibold text-rose-300">
                        {fmtNumber(maintenance.overdue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* DOWNTIME SUMMARY */}

              <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Downtime
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-100">
                      Downtime Summary
                    </h2>
                  </div>

                  <Clock3 className="h-6 w-6 text-amber-300" />
                </div>

                {downtime.minutes === undefined &&
                downtime.events === undefined ? (
                  <p className="mt-6 text-sm text-slate-500">
                    No downtime data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Total Minutes
                      </span>

                      <span className="font-semibold text-amber-300">
                        {fmtNumber(downtime.minutes)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">Events</span>

                      <span className="font-semibold text-slate-200">
                        {fmtNumber(downtime.events)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUCTION SUMMARY */}

              <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Production
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-100">
                      Production Summary
                    </h2>
                  </div>

                  <Factory className="h-6 w-6 text-cyan-300" />
                </div>

                {production.machines === undefined &&
                production.active === undefined &&
                production.stopped === undefined ? (
                  <p className="mt-6 text-sm text-slate-500">
                    No production data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Machines
                      </span>

                      <span className="font-semibold text-slate-200">
                        {fmtNumber(production.machines)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">Running</span>

                      <span className="font-semibold text-emerald-300">
                        {fmtNumber(production.active)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">Stopped</span>

                      <span className="font-semibold text-rose-300">
                        {fmtNumber(production.stopped)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PFMEA SUMMARY */}

              <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      PFMEA
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-slate-100">
                      PFMEA Summary
                    </h2>
                  </div>

                  <ShieldAlert className="h-6 w-6 text-rose-300" />
                </div>

                {pfmea.high_risk === undefined &&
                pfmea.medium_risk === undefined &&
                pfmea.low_risk === undefined ? (
                  <p className="mt-6 text-sm text-slate-500">
                    No PFMEA data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        High Risk
                      </span>

                      <span className="font-semibold text-rose-300">
                        {fmtNumber(pfmea.high_risk)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Medium Risk
                      </span>

                      <span className="font-semibold text-amber-300">
                        {fmtNumber(pfmea.medium_risk)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 px-4 py-3">
                      <span className="text-sm text-slate-500">Low Risk</span>

                      <span className="font-semibold text-emerald-300">
                        {fmtNumber(pfmea.low_risk)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ENGINEERING INSIGHTS */}

            <section className="mt-6 rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Insights
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-100">
                    Engineering Insights
                  </h2>
                </div>

                <Lightbulb className="h-6 w-6 text-amber-300" />
              </div>

              {insights.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No insights available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div
                      key={`${insight.text}-${index}`}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        insight.ok
                          ? "border-emerald-400/15 bg-emerald-400/[0.05]"
                          : "border-amber-400/15 bg-amber-400/[0.05]"
                      }`}
                    >
                      {insight.ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
                      )}

                      <p
                        className={`text-sm ${
                          insight.ok ? "text-emerald-200" : "text-amber-200"
                        }`}
                      >
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* LAST REFRESHED */}

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.03] px-5 py-4">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-slate-500" />

                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  Last Refreshed • {lastRefreshed}
                </span>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Auto Refresh • 5 Seconds
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}