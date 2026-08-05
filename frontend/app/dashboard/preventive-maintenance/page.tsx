"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Activity,
  Search,
  History as HistoryIcon,
} from "lucide-react";

type MaintenanceJob = {
  id: number;
  machine_id: number;
  maintenance_type: string;
  description: string | null;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
};

type TimelineEntry = {
  id: string;
  machine_id: number;
  maintenance_type: string;
  event_date: string;
  status: "Completed" | "Upcoming";
};

function statusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300";

    case "scheduled":
      return "border-sky-400/20 bg-sky-400/[0.08] text-sky-300";

    default:
      return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";
  }
}

export default function PreventiveMaintenancePage() {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [upcoming, setUpcoming] = useState<MaintenanceJob[]>([]);
  const [completed, setCompleted] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "overdue"
  >("all");

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const loadData = useCallback(async () => {
    const [jobsRes, upcomingRes, completedRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/maintenance/"),
      fetch("http://127.0.0.1:8000/maintenance/upcoming"),
      fetch("http://127.0.0.1:8000/maintenance/completed"),
    ]);

    const [jobsData, upcomingData, completedData] = await Promise.all([
      jobsRes.json(),
      upcomingRes.json(),
      completedRes.json(),
    ]);

    setJobs(jobsData);
    setUpcoming(upcomingData);
    setCompleted(completedData);
  }, []);

  async function markComplete(jobId: number) {
    await fetch(`http://127.0.0.1:8000/maintenance/${jobId}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Completed",
        completed_date: null,
      }),
    });

    await loadData();
  }

  useEffect(() => {
    async function load() {
      await loadData();

      setLoading(false);
    }

    load();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  const scheduledCount = useMemo(
    () => jobs.filter((job) => job.status === "Scheduled").length,
    [jobs],
  );

  const completedCount = completed.length;

  const overdueCount = useMemo(() => {
    return jobs.filter((job) => {
      return (
        job.status === "Scheduled" && new Date(job.scheduled_date) < new Date()
      );
    }).length;
  }, [jobs]);

  const completionRate = useMemo(() => {
    const total = jobs.length;

    if (!total) return 0;

    return Math.round((completedCount / total) * 100);
  }, [jobs, completedCount]);

  const filteredJobs = useMemo(() => {
    const result = jobs.filter((job) => {
      const overdue =
        job.status === "Scheduled" && new Date(job.scheduled_date) < new Date();

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "scheduled"
            ? job.status === "Scheduled"
            : filter === "completed"
              ? job.status === "Completed"
              : overdue;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        String(job.machine_id).includes(query) ||
        job.maintenance_type.toLowerCase().includes(query) ||
        (job.description ?? "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    return [...result].sort((a, b) => {
      const aTime = new Date(a.scheduled_date).getTime();
      const bTime = new Date(b.scheduled_date).getTime();

      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [jobs, search, filter, sortOrder]);

  const timeline = useMemo<TimelineEntry[]>(() => {
    const completedEntries: TimelineEntry[] = completed.map((job) => ({
      id: `completed-${job.id}`,
      machine_id: job.machine_id,
      maintenance_type: job.maintenance_type,
      event_date: job.completed_date ?? job.scheduled_date,
      status: "Completed",
    }));

    const upcomingEntries: TimelineEntry[] = upcoming.map((job) => ({
      id: `upcoming-${job.id}`,
      machine_id: job.machine_id,
      maintenance_type: job.maintenance_type,
      event_date: job.scheduled_date,
      status: "Upcoming",
    }));

    return [...completedEntries, ...upcomingEntries].sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );
  }, [completed, upcoming]);

  const nextDueJob = upcoming.length ? upcoming[0] : null;

  const nextDue = nextDueJob
    ? new Date(nextDueJob.scheduled_date).toLocaleDateString()
    : "--";

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
                Preventive Maintenance
              </p>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-100">
              Maintenance Planning
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Schedule, monitor and complete preventive maintenance activities
              across production equipment.
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                Maintenance Scheduler Online
              </span>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Scheduled",
              value: scheduledCount,
              icon: CalendarDays,
              color: "text-cyan-300",
            },
            {
              title: "Completed",
              value: completedCount,
              icon: ClipboardCheck,
              color: "text-emerald-300",
            },
            {
              title: "Overdue",
              value: overdueCount,
              icon: AlertTriangle,
              color: "text-rose-300",
            },
            {
              title: "Next Due",
              value: nextDue,
              icon: Clock3,
              color: "text-amber-300",
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
        {/* FILTER BAR */}

        <section className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[22px]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All" },
                { id: "scheduled", label: "Scheduled" },
                { id: "completed", label: "Completed" },
                { id: "overdue", label: "Overdue" },
              ].map((tab) => {
                const active = filter === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setFilter(
                        tab.id as "all" | "scheduled" | "completed" | "overdue",
                      )
                    }
                    className={`rounded-xl border px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition-all ${
                      active
                        ? "border-sky-400/20 bg-sky-400/[0.09] text-sky-200"
                        : "border-transparent text-slate-500 hover:border-white/[0.07] hover:bg-white/[0.035]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest")
                }
                className="rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-300 outline-none"
              >
                <option value="newest" className="bg-[#040810]">
                  Newest First
                </option>

                <option value="oldest" className="bg-[#040810]">
                  Oldest First
                </option>
              </select>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/10 px-3 py-2 w-full sm:w-[300px]">
                <Search className="h-4 w-4 text-slate-500" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search maintenance..."
                  className="flex-1 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_0.85fr]">
          {/* MAINTENANCE SCHEDULE */}

          <div className="overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Maintenance Schedule
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-100">
                  Planned Jobs
                </h2>
              </div>

              <CalendarDays className="h-6 w-6 text-cyan-300" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Machine
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Scheduled
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className={`border-b border-white/[0.05] transition ${
                        job.status === "Scheduled" &&
                        new Date(job.scheduled_date) < new Date()
                          ? "bg-rose-500/[0.06] hover:bg-rose-500/[0.10]"
                          : "hover:bg-white/[0.025]"
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-medium text-slate-200">
                            Machine {job.machine_id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {job.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-medium text-cyan-300">
                          {job.maintenance_type}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-slate-300">
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </p>

                        {job.status === "Scheduled" &&
                          new Date(job.scheduled_date) < new Date() && (
                            <p className="mt-1 text-xs text-rose-400">
                              Overdue
                            </p>
                          )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${statusBadge(
                            job.status,
                          )}`}
                        >
                          {job.status === "Scheduled" &&
                          new Date(job.scheduled_date) < new Date()
                            ? "Overdue"
                            : job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL */}

          <div className="space-y-5">
            {/* MAINTENANCE TIMELINE */}

            <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Timeline
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-100">
                    Maintenance Timeline
                  </h2>
                </div>

                <HistoryIcon className="h-6 w-6 text-amber-300" />
              </div>

              <div className="mt-6 space-y-4">
                {timeline.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No maintenance history yet.
                  </p>
                )}

                {timeline.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/[0.05] bg-black/10 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-200">
                          Machine {entry.machine_id}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {entry.maintenance_type}
                        </p>
                      </div>

                      {entry.status === "Completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      ) : (
                        <Clock3 className="h-5 w-5 text-cyan-300" />
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-mono text-xs text-amber-300">
                        {new Date(entry.event_date).toLocaleDateString()}
                      </p>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em] ${
                          entry.status === "Completed"
                            ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                            : "border-sky-400/20 bg-sky-400/[0.08] text-sky-300"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK SUMMARY */}

            <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Maintenance Summary
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-100">
                    Overview
                  </h2>
                </div>

                <ShieldCheck className="h-6 w-6 text-emerald-300" />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-slate-500">
                      Scheduled Jobs
                    </span>

                    <span className="font-semibold text-cyan-300">
                      {scheduledCount}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${jobs.length ? (scheduledCount / jobs.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-slate-500">Completed</span>

                    <span className="font-semibold text-emerald-300">
                      {completedCount}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${jobs.length ? (completedCount / jobs.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-slate-500">Overdue</span>

                    <span className="font-semibold text-rose-300">
                      {overdueCount}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-rose-400"
                      style={{
                        width: `${jobs.length ? (overdueCount / jobs.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-slate-500">
                      Completion Rate
                    </span>

                    <span className="font-semibold text-slate-200">
                      {completionRate}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{
                        width: `${completionRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.05] pt-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Next Due
                </p>

                {nextDueJob ? (
                  <div className="rounded-2xl border border-white/[0.05] bg-black/10 p-4">
                    <h3 className="font-medium text-slate-200">
                      Machine {nextDueJob.machine_id}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {nextDueJob.maintenance_type}
                    </p>

                    <p className="mt-3 font-mono text-xs text-amber-300">
                      {new Date(nextDueJob.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                    <p className="text-sm font-medium text-emerald-300">
                      ✓ No upcoming maintenance
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Everything is on schedule.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* COMPLETED JOBS */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Completed Maintenance
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-100">
                Job History
              </h2>
            </div>

            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>

          {completed.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                No completed maintenance jobs yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Machine
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Completed
                    </th>

                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {completed.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-white/[0.05] hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-5 text-slate-200">
                        Machine {job.machine_id}
                      </td>

                      <td className="px-6 py-5 text-cyan-300">
                        {job.maintenance_type}
                      </td>

                      <td className="px-6 py-5 text-slate-400">
                        {job.completed_date
                          ? new Date(job.completed_date).toLocaleString()
                          : "--"}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-emerald-300">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-6 rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Maintenance Actions
              </p>

              <h2 className="mt-2 text-lg font-semibold text-slate-100">
                Scheduled Jobs
              </h2>
            </div>

            <Wrench className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="space-y-4">
            {jobs.filter((job) => job.status === "Scheduled").length === 0 && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />

                <p className="mt-3 text-sm font-medium text-emerald-300">
                  All maintenance jobs are completed
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  No pending maintenance tasks.
                </p>
              </div>
            )}

            {jobs
              .filter((job) => job.status === "Scheduled")
              .map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/10 p-4"
                >
                  <div>
                    <h3 className="font-medium text-slate-200">
                      Machine {job.machine_id}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.maintenance_type}
                    </p>
                  </div>

                  <button
                    onClick={() => markComplete(job.id)}
                    className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 transition hover:bg-emerald-400/[0.14]"
                  >
                    Mark Complete
                  </button>
                </div>
              ))}
          </div>
        </section>

        {/* FOOTER */}

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.03] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-300">
              Preventive Maintenance Service Online
            </span>
          </div>

          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Auto Refresh • 5 Seconds
          </span>
        </div>
      </div>
    </div>
  );
}
