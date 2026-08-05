"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Factory,
  Gauge,
  Plus,
  PlayCircle,
  Search,
  Settings2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Changeover,
  ChangeoverAnalytics,
  getChangeovers,
  getChangeoverAnalytics,
  createChangeover,
  closeChangeover,
} from "@/lib/api";
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ChangeoverStatus = "Running" | "Completed" | "Delayed";
type TabKey = "All" | "Running" | "Completed" | "Delayed";

interface ChangeoverRecord {
  id: string;
  machine: string;
  fromSku: string;
  toSku: string;
  operator: string;
  start: string; // HH:MM 24h
  end: string; // HH:MM 24h or "--:--"
  durationMin: number;
  status: ChangeoverStatus;
  efficiency: number | null; // percentage
  remarks: string;
}

interface NewChangeoverForm {
  machine: string;
  fromProduct: string;
  toProduct: string;
  operator: string;
  plannedStart: string; // datetime-local value
  expectedDuration: string; // minutes as string
  reason: string;
}

/* ------------------------------------------------------------------ */
/*  Static reference data                                              */
/* ------------------------------------------------------------------ */

const MACHINES = [
  "Line 1 – Filler",
  "Line 2 – Cartoner",
  "Line 3 – Wrapper",
  "Line 4 – Palletizer",
  "Blow Molder A",
  "Labeler B",
];
const MACHINE_MAP: Record<number, string> = {
  1: "Line 1 – Filler",
  2: "Line 2 – Cartoner",
  3: "Line 3 – Wrapper",
  4: "Line 4 – Palletizer",
  5: "Blow Molder A",
  6: "Labeler B",
};

const REASONS = [
  "Product changeover",
  "Format changeover",
  "Tooling change",
  "Flavor changeover",
  "Size changeover",
  "Planned maintenance",
];

const TARGET_DURATION_MIN = 42;

const INITIAL_RECORDS: ChangeoverRecord[] = [
  {
    id: "CO-2201",
    machine: "Line 1 – Filler",
    fromSku: "500ml PET – Still Water",
    toSku: "500ml PET – Sparkling Water",
    operator: "R. Verma",
    start: "05:40",
    end: "06:22",
    durationMin: 42,
    status: "Completed",
    efficiency: 96,
    remarks: "Within SMED target",
  },
  {
    id: "CO-2202",
    machine: "Line 3 – Wrapper",
    fromSku: "40g Bar – Milk Chocolate",
    toSku: "40g Bar – Hazelnut",
    operator: "S. Iyer",
    start: "06:10",
    end: "07:18",
    durationMin: 68,
    status: "Delayed",
    efficiency: 61,
    remarks: "Wrap film jam, tooling recalibration",
  },
  {
    id: "CO-2203",
    machine: "Line 2 – Cartoner",
    fromSku: "12x330ml Can Multipack",
    toSku: "24x330ml Can Multipack",
    operator: "A. Khan",
    start: "07:00",
    end: "--:--",
    durationMin: 35,
    status: "Running",
    efficiency: null,
    remarks: "Carton blank swap in progress",
  },
  {
    id: "CO-2204",
    machine: "Blow Molder A",
    fromSku: "1L PET Preform – Clear",
    toSku: "1.5L PET Preform – Clear",
    operator: "M. Fernandes",
    start: "07:15",
    end: "08:05",
    durationMin: 50,
    status: "Completed",
    efficiency: 89,
    remarks: "Mold change, 8min above target",
  },
  {
    id: "CO-2205",
    machine: "Line 4 – Palletizer",
    fromSku: "SKU-Pallet Pattern A",
    toSku: "SKU-Pallet Pattern C",
    operator: "D. Rao",
    start: "08:00",
    end: "08:31",
    durationMin: 31,
    status: "Completed",
    efficiency: 98,
    remarks: "Program preload, fast changeover",
  },
  {
    id: "CO-2206",
    machine: "Labeler B",
    fromSku: "750ml Glass – Tomato Sauce",
    toSku: "750ml Glass – Chili Sauce",
    operator: "P. Sharma",
    start: "08:20",
    end: "--:--",
    durationMin: 45,
    status: "Running",
    efficiency: null,
    remarks: "Label reel + sensor recalibration",
  },
  {
    id: "CO-2207",
    machine: "Line 1 – Filler",
    fromSku: "500ml PET – Sparkling Water",
    toSku: "1L PET – Sparkling Water",
    operator: "R. Verma",
    start: "09:05",
    end: "10:02",
    durationMin: 57,
    status: "Delayed",
    efficiency: 68,
    remarks: "Nozzle head misalignment",
  },
  {
    id: "CO-2208",
    machine: "Line 2 – Cartoner",
    fromSku: "24x330ml Can Multipack",
    toSku: "6x1L Tetra Multipack",
    operator: "A. Khan",
    start: "10:10",
    end: "10:48",
    durationMin: 38,
    status: "Completed",
    efficiency: 93,
    remarks: "Standard SMED procedure",
  },
  {
    id: "CO-2209",
    machine: "Line 3 – Wrapper",
    fromSku: "40g Bar – Hazelnut",
    toSku: "20g Bar – Hazelnut Mini",
    operator: "S. Iyer",
    start: "11:00",
    end: "11:40",
    durationMin: 40,
    status: "Completed",
    efficiency: 94,
    remarks: "Format tooling swap, on target",
  },
  {
    id: "CO-2210",
    machine: "Blow Molder A",
    fromSku: "1.5L PET Preform – Clear",
    toSku: "1.5L PET Preform – Tinted",
    operator: "M. Fernandes",
    start: "11:45",
    end: "--:--",
    durationMin: 39,
    status: "Running",
    efficiency: null,
    remarks: "Colorant dosing verification",
  },
  {
    id: "CO-2211",
    machine: "Line 4 – Palletizer",
    fromSku: "SKU-Pallet Pattern C",
    toSku: "SKU-Pallet Pattern B",
    operator: "D. Rao",
    start: "12:00",
    end: "13:05",
    durationMin: 65,
    status: "Delayed",
    efficiency: 58,
    remarks: "Robot arm gripper fault",
  },
  {
    id: "CO-2212",
    machine: "Labeler B",
    fromSku: "750ml Glass – Chili Sauce",
    toSku: "500ml PET – BBQ Sauce",
    operator: "P. Sharma",
    start: "12:30",
    end: "13:11",
    durationMin: 41,
    status: "Completed",
    efficiency: 95,
    remarks: "On-target, no deviation",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function timeToMinutes(t: string): number {
  if (!t || t === "--:--" || t === "--") return -1;

  const value = t.trim();

  // Handles 12-hour format: "03:49 PM", "12:39 PM"
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minute;
  }

  // Handles 24-hour format: "15:49", "17:50"
  const [hour, minute] = value.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return -1;
  }

  return hour * 60 + minute;
}

function statusStyles(status: ChangeoverStatus) {
  switch (status) {
    case "Running":
      return {
        text: "text-cyan-300",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/30",
        dot: "bg-cyan-400",
        bar: "bg-cyan-400",
      };
    case "Completed":
      return {
        text: "text-emerald-300",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/30",
        dot: "bg-emerald-400",
        bar: "bg-emerald-400",
      };
    case "Delayed":
      return {
        text: "text-rose-300",
        bg: "bg-rose-400/10",
        border: "border-rose-400/30",
        dot: "bg-rose-400",
        bar: "bg-rose-400",
      };
  }
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

let idCounter = 2213;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ChangeoverPage() {
  const [records, setRecords] = useState<ChangeoverRecord[]>([]);
  const [analytics, setAnalytics] = useState<ChangeoverAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");
  const [machineFilter, setMachineFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<NewChangeoverForm>({
    machine: MACHINES[0],
    fromProduct: "",
    toProduct: "",
    operator: "",
    plannedStart: "",
    expectedDuration: "45",
    reason: REASONS[0],
  });
  useEffect(() => {
    async function fetchData() {
      try {
        const [events, stats] = await Promise.all([
          getChangeovers(),
          getChangeoverAnalytics(),
        ]);

        const mapped: ChangeoverRecord[] = events.map((event) => ({
          id: `CO-${String(event.id).padStart(4, "0")}`,
          machine:
            MACHINE_MAP[event.machine_id] ?? `Machine ${event.machine_id}`,
          fromSku: event.from_product,
          toSku: event.to_product,
          operator: "Operator",
          start: new Date(event.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          end: event.end_time
            ? new Date(event.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--",
          durationMin: event.duration_minutes ?? 0,
          status: event.end_time ? "Completed" : "Running",
          efficiency: 100,
          remarks: "-",
        }));

        setRecords(mapped);
        setAnalytics(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);
  /* ---------------- KPI calculations ---------------- */

  const kpis = useMemo(() => {
    const total = records.length;
    const running = records.filter((r) => r.status === "Running").length;
    const delayed = records.filter((r) => r.status === "Delayed").length;
    const completed = records.filter((r) => r.status === "Completed");
    const avgDuration =
      records.reduce((sum, r) => sum + r.durationMin, 0) / (total || 1);
    const avgEfficiency =
      completed.reduce((sum, r) => sum + (r.efficiency ?? 0), 0) /
      (completed.length || 1);

    return {
      total: analytics?.total_changeovers ?? total,

      running,

      delayed,

      avgDuration:
        analytics?.average_duration_minutes ?? Math.round(avgDuration),

      avgEfficiency: Math.round(avgEfficiency),
    };
  }, [records]);

  const health = useMemo(() => {
    const completed = records.filter((r) => r.status === "Completed");
    const onTime = completed.filter(
      (r) => r.durationMin <= TARGET_DURATION_MIN + 5,
    ).length;
    const onTimeRate = completed.length
      ? Math.round((onTime / completed.length) * 100)
      : 0;
    const delayedRate = records.length
      ? Math.round(
          (records.filter((r) => r.status === "Delayed").length /
            records.length) *
            100,
        )
      : 0;
    const score = Math.max(
      0,
      Math.min(100, Math.round(onTimeRate * 0.7 + (100 - delayedRate) * 0.3)),
    );
    return { onTimeRate, delayedRate, score };
  }, [records]);

  const machineStats = useMemo(() => {
    const byMachine = new Map<string, number[]>();
    records.forEach((r) => {
      const arr = byMachine.get(r.machine) ?? [];
      arr.push(r.durationMin);
      byMachine.set(r.machine, arr);
    });
    return Array.from(byMachine.entries())
      .map(([machine, durations]) => ({
        machine,
        avg: Math.round(
          durations.reduce((s, d) => s + d, 0) / durations.length,
        ),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [records]);
  const lossAnalysis = useMemo(() => {
    const completed = records.filter(
      (r) => r.status === "Completed" && r.durationMin > 0,
    );

    const totalSetupLoss = completed.reduce((total, r) => {
      const excess = Math.max(0, r.durationMin - TARGET_DURATION_MIN);
      return total + excess;
    }, 0);

    const changeoversAboveTarget = completed.filter(
      (r) => r.durationMin > TARGET_DURATION_MIN,
    ).length;

    const worstChangeover =
      completed.length > 0
        ? completed.reduce((worst, current) =>
            current.durationMin > worst.durationMin ? current : worst,
          )
        : null;

    const averageLoss =
      completed.length > 0 ? Math.round(totalSetupLoss / completed.length) : 0;

    return {
      totalSetupLoss,
      changeoversAboveTarget,
      averageLoss,
      worstChangeover,
    };
  }, [records]);
  const trendData = useMemo(() => {
  return records
    .filter(
      (r) =>
        r.status === "Completed" &&
        r.durationMin > 0
    )
    .slice()
    .reverse()
    .slice(-10)
    .map((r) => ({
      id: r.id,
      machine: r.machine,
      duration: r.durationMin,
      loss: Math.max(
        0,
        r.durationMin - TARGET_DURATION_MIN
      ),
    }));
}, [records]);

const maxTrendDuration = useMemo(() => {
  if (trendData.length === 0) {
    return TARGET_DURATION_MIN * 1.5;
  }

  return Math.max(
    TARGET_DURATION_MIN * 1.25,
    ...trendData.map((item) => item.duration)
  );
}, [trendData]);

  const maxMachineAvg = Math.max(...machineStats.map((m) => m.avg), 1);

  /* ---------------- Timeline events ---------------- */

  const timelineRows = useMemo(() => {
    return MACHINES.map((machine) => ({
      machine,
      events: records
        .filter((r) => r.machine === machine)
        .map((r) => {
          const startMin = timeToMinutes(r.start);

          // For a running changeover, extend the bar up to the current time.
          const now = new Date();
          const currentMin = now.getHours() * 60 + now.getMinutes();

          const endMin =
            r.end === "--:--"
              ? Math.max(startMin + 1, currentMin)
              : timeToMinutes(r.end);
      

          return {
            ...r,
            startMin,
            endMin,
          };
        }),
    }));
  }, [records]);
  const timelineRange = useMemo(() => {
    const allEvents = timelineRows.flatMap((row) => row.events);

    if (allEvents.length === 0) {
      return {
        start: 0,
        end: 1440,
      };
    }

    const earliest = Math.min(...allEvents.map((event) => event.startMin));
    const latest = Math.max(...allEvents.map((event) => event.endMin));

    // Add 30-minute padding on both sides
    const start = Math.max(0, Math.floor((earliest - 30) / 60) * 60);
    const end = Math.min(1440, Math.ceil((latest + 30) / 60) * 60);

    return {
      start,
      end: end <= start ? start + 60 : end,
    };
  }, [timelineRows]);
  /* ---------------- Filtering ---------------- */

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (activeTab !== "All" && r.status !== activeTab) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (machineFilter !== "All" && r.machine !== machineFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack =
          `${r.id} ${r.machine} ${r.fromSku} ${r.toSku} ${r.operator}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, activeTab, statusFilter, machineFilter, search]);

  const tabCounts = useMemo(() => {
    return {
      All: records.length,
      Running: records.filter((r) => r.status === "Running").length,
      Completed: records.filter((r) => r.status === "Completed").length,
      Delayed: records.filter((r) => r.status === "Delayed").length,
    };
  }, [records]);

  /* ---------------- Modal calculations ---------------- */

  const estimate = useMemo(() => {
    const durationMin = parseInt(form.expectedDuration, 10) || 0;
    if (!form.plannedStart) {
      return { completion: "—", downtime: `${durationMin} min` };
    }
    const start = new Date(form.plannedStart);
    const end = new Date(start.getTime() + durationMin * 60000);
    const completion = end.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
    return { completion, downtime: `${durationMin} min` };
  }, [form.plannedStart, form.expectedDuration]);

  function resetForm() {
    setForm({
      machine: MACHINES[0],
      fromProduct: "",
      toProduct: "",
      operator: "",
      plannedStart: "",
      expectedDuration: "45",
      reason: REASONS[0],
    });
  }
  async function handleCloseChangeover(recordId: string) {
    try {
      const numericId = Number(recordId.replace("CO-", ""));

      await closeChangeover(numericId);

      const [events, stats] = await Promise.all([
        getChangeovers(),
        getChangeoverAnalytics(),
      ]);

      const mapped: ChangeoverRecord[] = events.map((event) => ({
        id: `CO-${String(event.id).padStart(4, "0")}`,
        machine: MACHINE_MAP[event.machine_id] ?? `Machine ${event.machine_id}`,
        fromSku: event.from_product,
        toSku: event.to_product,
        operator: "Operator",
        start: new Date(event.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        end: event.end_time
          ? new Date(event.end_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--",
        durationMin: event.duration_minutes ?? 0,
        status: event.end_time ? "Completed" : "Running",
        efficiency: 100,
        remarks: "-",
      }));

      setRecords(mapped);
      setAnalytics(stats);
    } catch (error) {
      console.error("Failed to close changeover:", error);
    }
  }
  async function handleSubmit() {
    if (!form.fromProduct || !form.toProduct || !form.operator) return;

    try {
      await createChangeover({
        machine_id: 1, // TODO: map selected machine to actual machine ID
        from_product: form.fromProduct,
        to_product: form.toProduct,
      });

      const [events, stats] = await Promise.all([
        getChangeovers(),
        getChangeoverAnalytics(),
      ]);

      const mapped: ChangeoverRecord[] = events.map((event) => ({
        id: `CO-${String(event.id).padStart(4, "0")}`,
        machine: MACHINE_MAP[event.machine_id] ?? `Machine ${event.machine_id}`,
        fromSku: event.from_product,
        toSku: event.to_product,
        operator: form.operator,
        start: new Date(event.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        end: event.end_time
          ? new Date(event.end_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--",
        durationMin: event.duration_minutes ?? 0,
        status: event.end_time ? "Completed" : "Running",
        efficiency: null,
        remarks: "",
      }));

      setRecords(mapped);
      setAnalytics(stats);

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create changeover:", error);
    }
  }
  const worstMachine =
    machineStats.length > 0
      ? machineStats.reduce((worst, current) =>
          current.avg > worst.avg ? current : worst,
        )
      : null;
  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-[#050912]">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-7 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-400/80">
              <Factory className="h-3.5 w-3.5" />
              Line Operations · Changeover Management
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-[28px]">
              Changeover Control Center
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Monitor product changeovers, minimize setup losses and optimize
              SMED performance across packaging operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#090f18] px-3 py-2 text-xs text-white/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live · shift B
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-[#04121a] shadow-[0_0_0_1px_rgba(34,211,238,0.4)] transition hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" />
              Start Changeover
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Changeovers Today"
            value={kpis.total.toString()}
            sub={`Total ${analytics?.total_changeovers ?? 0} changeovers`}
            trend="up"
            icon={<Activity className="h-4 w-4" />}
            accent="cyan"
          />

          <KpiCard
            label="Active Right Now"
            value={kpis.running.toString()}
            sub={`${kpis.running} currently running`}
            trend="flat"
            icon={<PlayCircle className="h-4 w-4" />}
            accent="cyan"
          />

          <KpiCard
            label="Avg. Changeover Time"
            value={formatDuration(
              Math.round(analytics?.average_duration_minutes ?? 0),
            )}
            sub={`Target ${TARGET_DURATION_MIN} min`}
            trend={
              (analytics?.average_duration_minutes ?? 0) > TARGET_DURATION_MIN
                ? "down"
                : "up"
            }
            icon={<Clock className="h-4 w-4" />}
            accent="amber"
          />

          <KpiCard
            label="Delayed Changeovers"
            value={kpis.delayed.toString()}
            sub={`${kpis.delayed} delayed this shift`}
            trend="down"
            icon={<AlertTriangle className="h-4 w-4" />}
            accent="rose"
          />
        </div>

        {/* Timeline + Health row */}
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          {/* Timeline */}
          <div className="rounded-xl border border-white/10 bg-[#090f18] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Today's Changeover Timeline
                </h2>
                <p className="text-xs text-white/40">
                  Live SMED schedule across packaging assets
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/40">
                <LegendDot color="bg-emerald-400" label="Completed" />
                <LegendDot color="bg-cyan-400" label="Running" />
                <LegendDot color="bg-rose-400" label="Delayed" />
              </div>
            </div>

            <div className="space-y-3">
              {timelineRows.map((row) => (
                <div key={row.machine} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 truncate text-[11px] text-white/50">
                    {row.machine}
                  </div>
                  <div className="relative h-6 flex-1 rounded-md bg-white/[0.03]">
                    {row.events.map((ev) => {
                      const rangeStart = timelineRange.start;
                      const rangeEnd = timelineRange.end;
                      const total = Math.max(1, rangeEnd - rangeStart);
                      const left = Math.max(
                        0,
                        ((ev.startMin - rangeStart) / total) * 100,
                      );
                      const width = Math.max(
                        1.5,
                        ((ev.endMin - ev.startMin) / total) * 100,
                      );
                      const s = statusStyles(ev.status);
                      return (
                        <div
                          key={ev.id}
                          title={`${ev.id} · ${ev.fromSku} → ${ev.toSku}`}
                          className={`absolute top-0.5 h-5 rounded ${s.bar} opacity-80 transition hover:opacity-100`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pl-32 pt-1 text-[10px] text-white/30">
  {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
    const minutes =
      timelineRange.start +
      (timelineRange.end - timelineRange.start) * fraction;

    const hour = Math.floor(minutes / 60);
    const minute = Math.round(minutes % 60);

    return (
      <span key={fraction}>
        {String(hour).padStart(2, "0")}:
        {String(minute).padStart(2, "0")}
      </span>
    );
  })}
</div>
            </div>
          </div>

          {/* Health panel */}
          <div className="rounded-xl border border-white/10 bg-[#090f18] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">
              Changeover Health
            </h2>
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={
                    health.score >= 80
                      ? "#34d399"
                      : health.score >= 60
                        ? "#fbbf24"
                        : "#fb7185"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(health.score / 100) * 314} 314`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="56"
                  textAnchor="middle"
                  className="fill-white text-[22px] font-semibold"
                >
                  {health.score}
                </text>
                <text
                  x="60"
                  y="74"
                  textAnchor="middle"
                  className="fill-white/40 text-[10px] uppercase"
                >
                  score
                </text>
              </svg>
              <div className="flex-1 space-y-3">
                <HealthRow
                  label="On-time rate"
                  value={`${health.onTimeRate}%`}
                  good={health.onTimeRate >= 75}
                />
                <HealthRow
                  label="Delayed rate"
                  value={`${health.delayedRate}%`}
                  good={health.delayedRate <= 20}
                />
                <HealthRow
                  label="Avg. efficiency"
                  value={`${kpis.avgEfficiency}%`}
                  good={kpis.avgEfficiency >= 85}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Machine comparison + Insight */}
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
          <div className="rounded-xl border border-white/10 bg-[#090f18] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">
              Avg. Changeover Duration by Machine
            </h2>
            <div className="space-y-3.5">
              {machineStats.map((m) => {
                const overTarget = m.avg > TARGET_DURATION_MIN;
                return (
                  <div key={m.machine}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-white/60">{m.machine}</span>
                      <span
                        className={
                          overTarget ? "text-rose-300" : "text-emerald-300"
                        }
                      >
                        {m.avg} min
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.05]">
                      <div
                        className={`h-2 rounded-full ${
                          overTarget ? "bg-rose-400" : "bg-emerald-400"
                        }`}
                        style={{
                          width: `${(m.avg / maxMachineAvg) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/30">
              <div className="h-px flex-1 bg-white/10" />
              target line: {TARGET_DURATION_MIN} min
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </div>
          {/* Loss Analysis */}
          <div className="rounded-xl border border-rose-400/20 bg-gradient-to-br from-rose-400/[0.05] to-transparent p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-rose-400/10 p-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-300" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Changeover Loss Analysis
                </h2>
                <p className="text-[11px] text-white/40">
                  Excess setup time against {TARGET_DURATION_MIN} min SMED
                  target
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="text-[11px] text-white/40">Total Setup Loss</p>
                <p className="mt-1 text-xl font-semibold text-rose-300">
                  {lossAnalysis.totalSetupLoss} min
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="text-[11px] text-white/40">Above Target</p>
                <p className="mt-1 text-xl font-semibold text-amber-300">
                  {lossAnalysis.changeoversAboveTarget}
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="text-[11px] text-white/40">Avg. Setup Loss</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {lossAnalysis.averageLoss} min
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="text-[11px] text-white/40">Worst Changeover</p>

                {lossAnalysis.worstChangeover ? (
                  <>
                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {lossAnalysis.worstChangeover.machine}
                    </p>
                    <p className="mt-0.5 text-[11px] text-rose-300">
                      {lossAnalysis.worstChangeover.durationMin} min · +
                      {Math.max(
                        0,
                        lossAnalysis.worstChangeover.durationMin -
                          TARGET_DURATION_MIN,
                      )}{" "}
                      min loss
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-white/30">
                    No completed changeovers
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Engineering insight */}
          <div className="rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-md bg-amber-400/10 p-1.5">
                <Settings2 className="h-4 w-4 text-amber-300" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Engineering Insight
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              <span className="font-medium text-amber-200">
                {worstMachine?.machine ?? "No machine"}
              </span>{" "}
              is currently showing the highest average changeover duration of{" "}
              <span className="font-medium text-rose-300">
                {worstMachine?.avg ?? 0} min
              </span>
              . Engineering should review tooling setup, operator sequence and
              SMED preparation to reduce setup time before the next scheduled
              changeover.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-300">
              View maintenance recommendation
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
        {/* Changeover Duration Trend */}
<div className="mb-6 rounded-xl border border-white/10 bg-[#090f18] p-5">
  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-sm font-semibold text-white">
        Changeover Duration Trend
      </h2>
      <p className="mt-1 text-xs text-white/40">
        Recent completed changeovers against {TARGET_DURATION_MIN} min SMED target
      </p>
    </div>

    <div className="flex items-center gap-4 text-[11px] text-white/40">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        Actual Duration
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-[2px] w-4 bg-amber-400" />
        SMED Target
      </div>
    </div>
  </div>

  {trendData.length > 0 ? (
    <div className="overflow-x-auto">
      <div className="min-w-[650px]">
        <div className="relative h-[240px] border-b border-l border-white/10">
          {/* horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((position) => (
            <div
              key={position}
              className="absolute left-0 right-0 border-t border-white/[0.04]"
              style={{ bottom: `${position}%` }}
            />
          ))}

          {/* SMED target line */}
          <div
            className="absolute left-0 right-0 z-10 border-t border-dashed border-amber-400/70"
            style={{
              bottom: `${Math.min(
                100,
                (TARGET_DURATION_MIN / maxTrendDuration) * 100
              )}%`,
            }}
          >
            <span className="absolute right-1 -top-5 text-[10px] font-medium text-amber-300">
              Target {TARGET_DURATION_MIN} min
            </span>
          </div>

          {/* bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-3 px-5">
            {trendData.map((item) => {
              const height = Math.max(
                3,
                (item.duration / maxTrendDuration) * 100
              );

              const overTarget =
                item.duration > TARGET_DURATION_MIN;

              return (
                <div
                  key={item.id}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <div
                    className={`relative w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                      overTarget
                        ? "bg-rose-400/75 hover:bg-rose-400"
                        : "bg-cyan-400/75 hover:bg-cyan-400"
                    }`}
                    style={{
                      height: `${Math.min(100, height)}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white/60">
                      {item.duration}m
                    </div>

                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-8 hidden w-44 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0c1420] p-2.5 text-[10px] shadow-xl group-hover:block">
                      <p className="font-medium text-white">
                        {item.id}
                      </p>

                      <p className="mt-1 truncate text-white/50">
                        {item.machine}
                      </p>

                      <div className="mt-2 flex justify-between">
                        <span className="text-white/40">
                          Duration
                        </span>
                        <span className="text-white">
                          {item.duration} min
                        </span>
                      </div>

                      <div className="mt-1 flex justify-between">
                        <span className="text-white/40">
                          Setup Loss
                        </span>
                        <span
                          className={
                            item.loss > 0
                              ? "text-rose-300"
                              : "text-emerald-300"
                          }
                        >
                          {item.loss} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-white/30">
                    {item.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/25">
          <span>Earlier</span>
          <span>Recent Changeovers</span>
          <span>Latest</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-white/10">
      <p className="text-xs text-white/30">
        Complete changeovers to generate duration trend data.
      </p>
    </div>
  )}
</div>
        {/* Register */}
        <div className="rounded-xl border border-white/10 bg-[#090f18]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
              {(["All", "Running", "Completed", "Delayed"] as TabKey[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                      activeTab === tab
                        ? "bg-cyan-500 text-[#04121a]"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {tab}{" "}
                    <span
                      className={
                        activeTab === tab
                          ? "text-[#04121a]/60"
                          : "text-white/30"
                      }
                    >
                      {tabCounts[tab]}
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, SKU, operator..."
                  className="w-56 rounded-lg border border-white/10 bg-white/[0.02] py-2 pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
                />
              </div>

              <SelectFilter
                value={machineFilter}
                onChange={setMachineFilter}
                options={["All", ...MACHINES]}
              />
              <SelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={["All", "Running", "Completed", "Delayed"]}
              />
            </div>
          </div>

          {/* Table */}
          <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#0c1420] text-[11px] uppercase tracking-wide text-white/40">
                <tr>
                  {[
                    "ID",
                    "Machine",
                    "From SKU",
                    "To SKU",
                    "Operator",
                    "Start",
                    "End",
                    "Duration",
                    "Status",
                    "Efficiency",
                    "Remarks",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredRecords.map((r) => {
                  const s = statusStyles(r.status);

                  return (
                    <tr
                      key={r.id}
                      className="text-white/70 transition hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-cyan-300/80">
                        {r.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {r.machine}
                      </td>

                      <td className="max-w-[180px] truncate px-4 py-3">
                        {r.fromSku}
                      </td>

                      <td className="max-w-[180px] truncate px-4 py-3">
                        {r.toSku}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {r.operator}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">{r.start}</td>

                      <td className="whitespace-nowrap px-4 py-3">{r.end}</td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDuration(r.durationMin)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${s.text} ${s.bg} ${s.border}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                          />
                          {r.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {r.efficiency !== null ? (
                          <span
                            className={
                              r.efficiency >= 85
                                ? "text-emerald-300"
                                : r.efficiency >= 70
                                  ? "text-amber-300"
                                  : "text-rose-300"
                            }
                          >
                            {r.efficiency}%
                          </span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>

                      <td className="max-w-[220px] truncate px-4 py-3 text-white/50">
                        {r.remarks}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {r.status === "Running" ? (
                          <button
                            onClick={() => handleCloseChangeover(r.id)}
                            className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                          >
                            Close
                          </button>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-white/30"
                    >
                      No changeover records match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#0a111c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="text-sm font-semibold text-white">
                Start Changeover
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <FormField label="Machine">
                <select
                  value={form.machine}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, machine: e.target.value }))
                  }
                  className="modal-input"
                >
                  {MACHINES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="From Product">
                  <input
                    value={form.fromProduct}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fromProduct: e.target.value }))
                    }
                    placeholder="e.g. 500ml PET – Still Water"
                    className="modal-input"
                  />
                </FormField>
                <FormField label="To Product">
                  <input
                    value={form.toProduct}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, toProduct: e.target.value }))
                    }
                    placeholder="e.g. 1L PET – Sparkling"
                    className="modal-input"
                  />
                </FormField>
              </div>

              <FormField label="Operator">
                <input
                  value={form.operator}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, operator: e.target.value }))
                  }
                  placeholder="Operator name"
                  className="modal-input"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Planned Start">
                  <input
                    type="datetime-local"
                    value={form.plannedStart}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, plannedStart: e.target.value }))
                    }
                    className="modal-input"
                  />
                </FormField>
                <FormField label="Expected Duration (min)">
                  <input
                    type="number"
                    min={5}
                    value={form.expectedDuration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        expectedDuration: e.target.value,
                      }))
                    }
                    className="modal-input"
                  />
                </FormField>
              </div>

              <FormField label="Reason">
                <select
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  className="modal-input"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/30">
                    Est. Completion
                  </div>
                  <div className="mt-1 text-sm font-medium text-cyan-300">
                    {estimate.completion}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/30">
                    Est. Downtime
                  </div>
                  <div className="mt-1 text-sm font-medium text-amber-300">
                    {estimate.downtime}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.fromProduct || !form.toProduct || !form.operator
                }
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-medium text-[#04121a] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Changeover
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .modal-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: white;
          outline: none;
        }
        .modal-input:focus {
          border-color: rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function KpiCard({
  label,
  value,
  sub,
  trend,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "flat";
  icon: React.ReactNode;
  accent: "cyan" | "amber" | "rose" | "emerald";
}) {
  const accentMap = {
    cyan: "text-cyan-300 bg-cyan-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    rose: "text-rose-300 bg-rose-400/10",
    emerald: "text-emerald-300 bg-emerald-400/10",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#090f18] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-white/40">{label}</span>
        <div className={`rounded-md p-1.5 ${accentMap[accent]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-white/40">
        {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
        {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-400" />}
        {sub}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function HealthRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-white/50">
        {good ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
        )}
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-white/10 bg-white/[0.02] py-2 pl-3 pr-8 text-xs text-white/70 focus:border-cyan-400/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0a111c]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}

function Gauge_unused() {
  return <Gauge className="hidden" />;
}
