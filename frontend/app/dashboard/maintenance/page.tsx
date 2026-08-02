"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Hourglass,
  Radio,
  Search,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

type Priority = "High" | "Medium" | "Low";

type ScheduleTaskType = "Preventive" | "Calibration" | "Inspection" | "Service";

type ScheduleTask = {
  id: string;
  machine: string;
  task: string;
  time: string;
  type: ScheduleTaskType;
  priority: Priority;
};

type ScheduleDay = {
  day: string;
  date: string;
  isToday?: boolean;
  tasks: ScheduleTask[];
};

type ActiveOrderStatus =
  | "In Progress"
  | "Assigned"
  | "Scheduled"
  | "Waiting Parts";

type ActiveWorkOrder = {
  id: string;
  machine: string;
  task: string;
  priority: Priority;
  technician: string;
  status: ActiveOrderStatus;
  eta: string;
};

type PriorityRank = {
  rank: number;
  machine: string;
  health: number;
  label: "Critical" | "Attention" | "Monitor" | "Scheduled";
};

type OrderType = "Preventive" | "Corrective" | "Calibration" | "Predictive";

type OrderStatus = "Open" | "In Progress" | "Scheduled" | "Completed";

type WorkOrderRow = {
  id: string;
  machine: string;
  line: string;
  task: string;
  type: OrderType;
  priority: Priority;
  technician: string;
  scheduled: string;
  duration: string;
  status: OrderStatus;
  overdue?: boolean;
};

/* ============================================================
   SCHEDULE DATA
   ============================================================ */

const SCHEDULE: ScheduleDay[] = [
  {
    day: "Mon",
    date: "27",
    tasks: [
      {
        id: "t1",
        machine: "CV-04",
        task: "Belt tension check",
        time: "09:00",
        type: "Preventive",
        priority: "Low",
      },
    ],
  },
  {
    day: "Tue",
    date: "28",
    tasks: [
      {
        id: "t2",
        machine: "CP-01",
        task: "Drive motor lubrication",
        time: "10:30",
        type: "Preventive",
        priority: "Medium",
      },
      {
        id: "t3",
        machine: "SS-02",
        task: "Heater calibration",
        time: "14:00",
        type: "Calibration",
        priority: "Medium",
      },
    ],
  },
  {
    day: "Wed",
    date: "29",
    tasks: [
      {
        id: "t4",
        machine: "CF-01",
        task: "Photoelectric sensor cleaning",
        time: "08:30",
        type: "Inspection",
        priority: "Low",
      },
    ],
  },
  {
    day: "Thu",
    date: "30",
    tasks: [
      {
        id: "t5",
        machine: "CP-02",
        task: "Pressure regulator service",
        time: "13:00",
        type: "Service",
        priority: "Medium",
      },
    ],
  },
  {
    day: "Fri",
    date: "31",
    tasks: [
      {
        id: "t6",
        machine: "CV-04",
        task: "Conveyor belt inspection",
        time: "09:15",
        type: "Inspection",
        priority: "Low",
      },
    ],
  },
  {
    day: "Sat",
    date: "01",
    isToday: true,
    tasks: [
      {
        id: "t7",
        machine: "CF-03",
        task: "Bearing inspection & lubrication",
        time: "09:00",
        type: "Inspection",
        priority: "High",
      },
      {
        id: "t8",
        machine: "CP-02",
        task: "Pressure regulator follow-up",
        time: "13:00",
        type: "Service",
        priority: "Medium",
      },
    ],
  },
  {
    day: "Sun",
    date: "02",
    tasks: [
      {
        id: "t9",
        machine: "SS-02",
        task: "Heater calibration",
        time: "11:00",
        type: "Calibration",
        priority: "Low",
      },
    ],
  },
];

/* ============================================================
   ACTIVE WORK ORDERS
   ============================================================ */

const ACTIVE_ORDERS: ActiveWorkOrder[] = [
  {
    id: "WO-24018",
    machine: "CF-03",
    task: "Bearing inspection",
    priority: "High",
    technician: "A. Sharma",
    status: "In Progress",
    eta: "ETA 11:30 today",
  },
  {
    id: "WO-24017",
    machine: "CP-02",
    task: "Pressure regulator service",
    priority: "Medium",
    technician: "R. Mehta",
    status: "Assigned",
    eta: "Starts 13:00 today",
  },
  {
    id: "WO-24016",
    machine: "CV-04",
    task: "Belt inspection",
    priority: "Low",
    technician: "P. Singh",
    status: "Scheduled",
    eta: "Tomorrow · 08:00",
  },
  {
    id: "WO-24015",
    machine: "SS-02",
    task: "Heater calibration",
    priority: "Medium",
    technician: "N. Rao",
    status: "Waiting Parts",
    eta: "Blocked · thermistor kit",
  },
];

/* ============================================================
   MAINTENANCE PRIORITIES
   ============================================================ */

const PRIORITIES: PriorityRank[] = [
  {
    rank: 1,
    machine: "CF-03",
    health: 68,
    label: "Critical",
  },
  {
    rank: 2,
    machine: "CP-02",
    health: 76,
    label: "Attention",
  },
  {
    rank: 3,
    machine: "SS-02",
    health: 82,
    label: "Monitor",
  },
  {
    rank: 4,
    machine: "CV-04",
    health: 89,
    label: "Scheduled",
  },
];

/* ============================================================
   WORK ORDER TABLE DATA
   ============================================================ */

const WORK_ORDERS: WorkOrderRow[] = [
  {
    id: "WO-24018",
    machine: "CF-03",
    line: "Line 3 — Filling",
    task: "Bearing inspection & lubrication",
    type: "Preventive",
    priority: "High",
    technician: "A. Sharma",
    scheduled: "Today · 09:00",
    duration: "2h 30m",
    status: "In Progress",
  },
  {
    id: "WO-24017",
    machine: "CP-02",
    line: "Line 2 — Packaging",
    task: "Pressure regulator service",
    type: "Corrective",
    priority: "Medium",
    technician: "R. Mehta",
    scheduled: "Today · 13:00",
    duration: "1h 45m",
    status: "Open",
  },
  {
    id: "WO-24016",
    machine: "CV-04",
    line: "Line 4 — Conveying",
    task: "Belt inspection",
    type: "Preventive",
    priority: "Low",
    technician: "P. Singh",
    scheduled: "Tomorrow · 08:00",
    duration: "1h 00m",
    status: "Scheduled",
  },
  {
    id: "WO-24015",
    machine: "SS-02",
    line: "Line 5 — Secondary Packaging",
    task: "Heater calibration",
    type: "Calibration",
    priority: "Medium",
    technician: "N. Rao",
    scheduled: "Today · 11:30",
    duration: "50m",
    status: "Open",
    overdue: true,
  },
  {
    id: "WO-24012",
    machine: "CF-01",
    line: "Line 1 — Filling",
    task: "Photoelectric sensor cleaning",
    type: "Preventive",
    priority: "Low",
    technician: "A. Sharma",
    scheduled: "Yesterday · 08:30",
    duration: "30m",
    status: "Completed",
  },
  {
    id: "WO-24010",
    machine: "CP-01",
    line: "Line 2 — Packaging",
    task: "Drive motor lubrication",
    type: "Preventive",
    priority: "Medium",
    technician: "R. Mehta",
    scheduled: "2 days ago",
    duration: "1h 15m",
    status: "Completed",
  },
  {
    id: "WO-24008",
    machine: "CF-03",
    line: "Line 3 — Filling",
    task: "Vibration sensor check",
    type: "Predictive",
    priority: "High",
    technician: "P. Singh",
    scheduled: "2 days overdue",
    duration: "1h 00m",
    status: "Open",
    overdue: true,
  },
  {
    id: "WO-24005",
    machine: "CV-04",
    line: "Line 4 — Conveying",
    task: "Scheduled lubrication",
    type: "Preventive",
    priority: "Low",
    technician: "N. Rao",
    scheduled: "Next week",
    duration: "45m",
    status: "Scheduled",
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

const PRIORITY_FILTERS = ["All Priority", "High", "Medium", "Low"];

const TABS = ["All", "Open", "In Progress", "Scheduled", "Completed"] as const;
/* ============================================================
   STYLE HELPERS
   ============================================================ */

function priorityClasses(priority: Priority) {
  if (priority === "High") {
    return "border-rose-400/20 bg-rose-400/[0.07] text-rose-300";
  }

  if (priority === "Medium") {
    return "border-amber-400/20 bg-amber-400/[0.07] text-amber-300";
  }

  return "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300";
}

function statusClasses(status: OrderStatus | ActiveOrderStatus) {
  if (status === "Completed") {
    return "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300";
  }

  if (status === "In Progress") {
    return "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300";
  }

  if (status === "Waiting Parts") {
    return "border-amber-400/20 bg-amber-400/[0.07] text-amber-300";
  }

  if (status === "Scheduled") {
    return "border-violet-400/20 bg-violet-400/[0.07] text-violet-300";
  }

  if (status === "Assigned") {
    return "border-sky-400/20 bg-sky-400/[0.07] text-sky-300";
  }

  return "border-white/[0.08] bg-white/[0.035] text-slate-400";
}

function taskTypeClasses(type: ScheduleTaskType) {
  if (type === "Preventive") {
    return "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300";
  }

  if (type === "Calibration") {
    return "border-amber-400/20 bg-amber-400/[0.07] text-amber-300";
  }

  if (type === "Service") {
    return "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300";
  }

  return "border-slate-400/15 bg-slate-400/[0.05] text-slate-400";
}

function healthClasses(label: PriorityRank["label"]) {
  if (label === "Critical") {
    return {
      text: "text-rose-300",
      dot: "bg-rose-400",
      bar: "bg-gradient-to-r from-rose-600 to-rose-400",
      badge: "border-rose-400/20 bg-rose-400/[0.07] text-rose-300",
    };
  }

  if (label === "Attention") {
    return {
      text: "text-amber-300",
      dot: "bg-amber-400",
      bar: "bg-gradient-to-r from-amber-600 to-amber-400",
      badge: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
    };
  }

  if (label === "Monitor") {
    return {
      text: "text-cyan-300",
      dot: "bg-cyan-400",
      bar: "bg-gradient-to-r from-cyan-600 to-cyan-400",
      badge: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
    };
  }

  return {
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    bar: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    badge: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
  };
}

/* ============================================================
   SMALL REUSABLE COMPONENTS
   ============================================================ */

function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.1em] ${priorityClasses(
        priority,
      )}`}
    >
      {priority}
    </span>
  );
}

function StatusPill({ status }: { status: OrderStatus | ActiveOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.08em] ${statusClasses(
        status,
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Completed"
            ? "bg-emerald-400"
            : status === "In Progress"
              ? "bg-cyan-400"
              : status === "Waiting Parts"
                ? "bg-amber-400"
                : status === "Scheduled"
                  ? "bg-violet-400"
                  : status === "Assigned"
                    ? "bg-sky-400"
                    : "bg-slate-500"
        }`}
      />

      {status}
    </span>
  );
}

function TaskTypePill({ type }: { type: ScheduleTaskType }) {
  return (
    <span
      className={`inline-flex rounded-md border px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[7px] font-medium uppercase tracking-[0.06em] ${taskTypeClasses(
        type,
      )}`}
    >
      {type}
    </span>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */

type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
  footer?: string;
  tone: "cyan" | "amber" | "rose" | "emerald";
  icon: React.ReactNode;
};

function KpiCard({ label, value, helper, footer, tone, icon }: KpiCardProps) {
  const toneClasses = {
    cyan: {
      icon: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
      glow: "bg-cyan-400/[0.04]",
      footer: "text-cyan-300",
    },

    amber: {
      icon: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
      glow: "bg-amber-400/[0.035]",
      footer: "text-amber-300",
    },

    rose: {
      icon: "border-rose-400/20 bg-rose-400/[0.07] text-rose-300",
      glow: "bg-rose-400/[0.035]",
      footer: "text-rose-300",
    },

    emerald: {
      icon: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
      glow: "bg-emerald-400/[0.035]",
      footer: "text-emerald-300",
    },
  }[tone];

  return (
    <div className="relative min-h-[154px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0a1019]/90 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.045)]">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[65px] ${toneClasses.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.17em] text-slate-500">
            {label}
          </p>

          <p className="mt-5 font-[family-name:var(--font-display)] text-[31px] font-semibold leading-none tracking-tight text-slate-100">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-4">
        <p className="text-[10px] text-slate-500">{helper}</p>

        {footer && (
          <p
            className={`mt-1.5 font-[family-name:var(--font-mono)] text-[9px] font-medium ${toneClasses.footer}`}
          >
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAINTENANCE HEALTH RING
   ============================================================ */

function ComplianceRing() {
  const percentage = 94.6;
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-[170px] items-center justify-center">
      <div className="absolute h-32 w-32 rounded-full bg-cyan-400/[0.045] blur-[35px]" />

      <svg
        viewBox="0 0 140 140"
        className="relative h-[150px] w-[150px] -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="10"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#maintenanceCompliance)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        <defs>
          <linearGradient
            id="maintenanceCompliance"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute text-center">
        <p className="font-[family-name:var(--font-display)] text-[27px] font-semibold tracking-tight text-slate-100">
          94.6%
        </p>

        <p className="mt-1 font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.15em] text-slate-500">
          PM Compliance
        </p>
      </div>
    </div>
  );
}
/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");

  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("All Lines");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  const filteredOrders = useMemo(() => {
    let rows = [...WORK_ORDERS];

    if (activeTab !== "All") {
      rows = rows.filter((order) => order.status === activeTab);
    }

    if (lineFilter !== "All Lines") {
      rows = rows.filter((order) => order.line.startsWith(lineFilter));
    }

    if (priorityFilter !== "All Priority") {
      rows = rows.filter((order) => order.priority === priorityFilter);
    }

    const query = search.trim().toLowerCase();

    if (query) {
      rows = rows.filter((order) =>
        [
          order.id,
          order.machine,
          order.line,
          order.task,
          order.type,
          order.priority,
          order.technician,
          order.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    return rows;
  }, [activeTab, search, lineFilter, priorityFilter]);

  return (
    /*
      IMPORTANT:
      DashboardLayout already handles sidebar + navbar.
      No fixed positioning, negative margin or manual sidebar offset here.
    */
    <div className="min-h-full w-full overflow-x-hidden bg-[#050912]">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-7 lg:px-8 xl:px-10">
        {/* ====================================================
            PAGE HEADER
            ==================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />

                <span className="font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Asset Reliability
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-slate-100 sm:text-[36px]">
                Maintenance Operations
              </h1>

              <p className="mt-3 max-w-[760px] text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                Plan preventive maintenance, manage work orders and track
                equipment service health across production lines.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/[0.055] px-3.5 py-2 xl:self-auto">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Maintenance System · Online
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            KPI ROW
            ==================================================== */}

        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Open Work Orders"
            value="12"
            helper="Across active production assets"
            footer="3 high priority"
            tone="cyan"
            icon={<ClipboardList className="h-[18px] w-[18px]" />}
          />

          <KpiCard
            label="Due Today"
            value="5"
            helper="Scheduled across 4 machines"
            footer="Preventive tasks scheduled"
            tone="amber"
            icon={<CalendarClock className="h-[18px] w-[18px]" />}
          />

          <KpiCard
            label="Overdue"
            value="2"
            helper="Requires escalation"
            footer="Immediate attention required"
            tone="rose"
            icon={<AlertOctagon className="h-[18px] w-[18px]" />}
          />

          <KpiCard
            label="PM Compliance"
            value="94.6%"
            helper="Rolling 30-day schedule adherence"
            footer="↑ 2.1% this month"
            tone="emerald"
            icon={<ShieldCheck className="h-[18px] w-[18px]" />}
          />
        </section>

        {/* ====================================================
            SCHEDULE + MAINTENANCE HEALTH
            ==================================================== */}

        <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* ==================================================
              PREVENTIVE MAINTENANCE SCHEDULE
              ================================================== */}

          <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex flex-col gap-3 border-b border-white/[0.055] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                  Planning · 7 Days
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                  Preventive Maintenance Schedule
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  Upcoming service activity across connected production assets
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-cyan-400/70" />

                <span className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.12em] text-slate-600">
                  Current Week
                </span>
              </div>
            </div>

            {/* 7 DAY GRID */}
            <div className="overflow-x-auto p-4 sm:p-5">
              <div className="grid min-w-[790px] grid-cols-7 gap-2.5">
                {SCHEDULE.map((day) => (
                  <div
                    key={`${day.day}-${day.date}`}
                    className={`min-h-[290px] rounded-xl border p-2.5 transition ${
                      day.isToday
                        ? "border-cyan-400/35 bg-cyan-400/[0.045] shadow-[0_0_24px_-14px_rgba(34,211,238,0.55)]"
                        : "border-white/[0.065] bg-white/[0.018]"
                    }`}
                  >
                    {/* DAY HEADER */}
                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                      <span
                        className={`text-[10px] font-semibold ${
                          day.isToday ? "text-cyan-300" : "text-slate-400"
                        }`}
                      >
                        {day.day}
                      </span>

                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 font-[family-name:var(--font-mono)] text-[8px] ${
                          day.isToday
                            ? "bg-cyan-400 text-[#041018]"
                            : "text-slate-600"
                        }`}
                      >
                        {day.date}
                      </span>
                    </div>

                    {/* TASKS */}
                    <div className="mt-2.5 space-y-2">
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-lg border p-2 ${
                            task.priority === "High"
                              ? "border-rose-400/25 bg-rose-400/[0.06]"
                              : task.priority === "Medium"
                                ? "border-amber-400/20 bg-amber-400/[0.05]"
                                : "border-cyan-400/18 bg-cyan-400/[0.045]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-[family-name:var(--font-mono)] text-[9px] font-semibold ${
                                task.priority === "High"
                                  ? "text-rose-300"
                                  : task.priority === "Medium"
                                    ? "text-amber-300"
                                    : "text-cyan-300"
                              }`}
                            >
                              {task.machine}
                            </span>

                            <span className="font-[family-name:var(--font-mono)] text-[7px] text-slate-500">
                              {task.time}
                            </span>
                          </div>

                          <p className="mt-2 min-h-[42px] text-[9px] leading-[1.45] text-slate-400">
                            {task.task}
                          </p>

                          <div className="mt-2">
                            <TaskTypePill type={task.type} />
                          </div>
                        </div>
                      ))}

                      {day.tasks.length === 0 && (
                        <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-white/[0.055]">
                          <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-700">
                            No Tasks
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              MAINTENANCE HEALTH
              ================================================== */}

          <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                Compliance
              </p>

              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                Maintenance Health
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Preventive maintenance execution health
              </p>
            </div>

            <ComplianceRing />

            {/* HEALTH COUNTS */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-slate-100">
                  53
                </p>

                <p className="mt-1.5 text-[8px] leading-3 text-slate-600">
                  Completed
                  <br />
                  On Time
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300">
                  <CalendarClock className="h-3.5 w-3.5" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-slate-100">
                  8
                </p>

                <p className="mt-1.5 text-[8px] leading-3 text-slate-600">
                  Due This
                  <br />
                  Week
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/[0.06] text-rose-300">
                  <AlertOctagon className="h-3.5 w-3.5" />
                </div>

                <p className="mt-3 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-slate-100">
                  2
                </p>

                <p className="mt-1.5 text-[8px] leading-3 text-slate-600">
                  Overdue
                  <br />
                  Tasks
                </p>
              </div>
            </div>

            {/* ENGINEERING METRICS */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 text-cyan-400/70" />

                  <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
                    Average MTTR
                  </span>
                </div>

                <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-200">
                  22
                  <span className="ml-1 text-[9px] font-normal text-slate-600">
                    min
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-3.5 w-3.5 text-amber-400/70" />

                  <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
                    Backlog
                  </span>
                </div>

                <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-200">
                  7.4
                  <span className="ml-1 text-[9px] font-normal text-slate-600">
                    hrs
                  </span>
                </p>
              </div>
            </div>

            {/* HEALTH FOOTER */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <Radio className="h-3 w-3 text-emerald-400" />

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-500">
                  PM Engine
                </span>
              </div>

              <span className="font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                Healthy
              </span>
            </div>
          </div>
        </section>
        {/* ====================================================
            ACTIVE WORK ORDERS + MAINTENANCE PRIORITIES
            ==================================================== */}

        <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* ==================================================
              ACTIVE WORK ORDERS
              ================================================== */}

          <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex flex-col gap-3 border-b border-white/[0.055] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                  Execution Queue
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                  Active Work Orders
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  Current maintenance activity requiring technician action
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.035] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_7px_rgba(34,211,238,0.65)]" />

                <span className="font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.11em] text-cyan-300">
                  4 Active Orders
                </span>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
              {ACTIVE_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                    order.priority === "High"
                      ? "border-rose-400/[0.14] bg-rose-400/[0.025] hover:border-rose-400/25"
                      : "border-white/[0.06] bg-white/[0.018] hover:border-white/[0.11] hover:bg-white/[0.027]"
                  }`}
                >
                  {order.priority === "High" && (
                    <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-rose-400 via-rose-400/70 to-transparent" />
                  )}

                  {/* ORDER HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.11em] text-slate-600">
                        {order.id}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-[family-name:var(--font-mono)] text-[12px] font-semibold text-cyan-300">
                          {order.machine}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-slate-700" />

                        <span className="text-[9px] text-slate-600">
                          Packaging Asset
                        </span>
                      </div>
                    </div>

                    <PriorityPill priority={order.priority} />
                  </div>

                  {/* TASK */}
                  <p className="mt-4 min-h-[36px] text-[11px] font-medium leading-[1.55] text-slate-300">
                    {order.task}
                  </p>

                  {/* TECHNICIAN */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/[0.05] bg-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="h-3 w-3 text-slate-600" />

                        <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                          Technician
                        </span>
                      </div>

                      <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                        {order.technician}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-600" />

                        <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                          Timing
                        </span>
                      </div>

                      <p className="mt-1.5 truncate text-[9px] font-medium text-slate-400">
                        {order.eta}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.045] pt-3">
                    <StatusPill status={order.status} />

                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.055] bg-white/[0.02] text-slate-600 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
                      aria-label={`Open ${order.id}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================
              MAINTENANCE PRIORITIES
              ================================================== */}

          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="pointer-events-none absolute -right-16 top-10 h-44 w-44 rounded-full bg-rose-400/[0.025] blur-[80px]" />

            <div className="relative">
              <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                Asset Risk
              </p>

              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                Maintenance Priorities
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Equipment ranked by maintenance attention requirement
              </p>
            </div>

            {/* PRIORITY LIST */}
            <div className="relative mt-5 space-y-3">
              {PRIORITIES.map((item) => {
                const style = healthClasses(item.label);

                return (
                  <div
                    key={item.machine}
                    className="rounded-xl border border-white/[0.055] bg-white/[0.018] p-3.5 transition hover:border-white/[0.1] hover:bg-white/[0.026]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-black/15 font-[family-name:var(--font-mono)] text-[9px] font-semibold text-slate-500">
                          {item.rank}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />

                            <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-slate-200">
                              {item.machine}
                            </span>
                          </div>

                          <p className="mt-1 text-[9px] text-slate-600">
                            {item.machine === "CF-03"
                              ? "Bearing temperature trend"
                              : item.machine === "CP-02"
                                ? "Pneumatic pressure instability"
                                : item.machine === "SS-02"
                                  ? "Heater calibration drift"
                                  : "Belt inspection due"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.08em] ${style.badge}`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* HEALTH */}
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                          Equipment Health
                        </span>

                        <span
                          className={`font-[family-name:var(--font-mono)] text-[9px] font-semibold ${style.text}`}
                        >
                          {item.health}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
                        <div
                          className={`h-full rounded-full ${style.bar}`}
                          style={{
                            width: `${item.health}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ENGINEERING INSIGHT */}
            <div className="relative mt-4 overflow-hidden rounded-xl border border-rose-400/[0.1] bg-rose-400/[0.025] p-4">
              <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-rose-400 to-transparent" />

              <div className="flex items-start gap-2.5">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />

                <div>
                  <p className="text-[10px] font-medium text-slate-300">
                    Highest reliability risk
                  </p>

                  <p className="mt-1 text-[9px] leading-[1.65] text-slate-600">
                    <span className="font-[family-name:var(--font-mono)] font-semibold text-rose-300">
                      CF-03
                    </span>{" "}
                    contributes the highest maintenance risk due to recurring
                    bearing-temperature excursions.
                  </p>
                </div>
              </div>
            </div>

            {/* SMALL SUMMARY */}
            <div className="relative mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.055] bg-black/10 p-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Assets Below 80%
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-300">
                  2
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.055] bg-black/10 p-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Critical Assets
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-rose-300">
                  1
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ====================================================
            MAINTENANCE WORK ORDERS
            ==================================================== */}

        <section className="mt-5 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* HEADER */}
          <div className="border-b border-white/[0.055] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                  Work Management
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                  Maintenance Work Orders
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  Track maintenance execution, scheduling and technician
                  assignments across production assets
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
                <ClipboardList className="h-3 w-3 text-cyan-400/70" />

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-500">
                  {WORK_ORDERS.length} Records
                </span>
              </div>
            </div>

            {/* FILTERS */}
            <div className="mt-5 flex flex-col gap-3">
              {/* STATUS TABS */}
              <div className="overflow-x-auto">
                <div className="flex w-fit min-w-max items-center gap-1 rounded-xl border border-white/[0.06] bg-black/15 p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-3 py-1.5 font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.09em] transition-all ${
                        activeTab === tab
                          ? "border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300 shadow-[0_0_14px_-7px_rgba(34,211,238,0.5)]"
                          : "border border-transparent text-slate-600 hover:bg-white/[0.035] hover:text-slate-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEARCH + DROPDOWNS */}
              <div className="grid gap-2.5 lg:grid-cols-[minmax(280px,1fr)_150px_150px]">
                {/* SEARCH */}
                <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 transition focus-within:border-cyan-400/20 focus-within:bg-white/[0.035]">
                  <Search className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search work orders, machines, technicians..."
                    className="w-full bg-transparent text-[10px] text-slate-300 outline-none placeholder:text-slate-600"
                  />
                </div>

                {/* LINE FILTER */}
                <div className="relative">
                  <select
                    value={lineFilter}
                    onChange={(event) => setLineFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-white/[0.07] bg-[#0b111b] pl-3.5 pr-9 font-[family-name:var(--font-mono)] text-[8px] text-slate-400 outline-none transition hover:border-white/[0.12] focus:border-cyan-400/20"
                  >
                    {LINE_FILTERS.map((line) => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                </div>

                {/* PRIORITY FILTER */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-white/[0.07] bg-[#0b111b] pl-3.5 pr-9 font-[family-name:var(--font-mono)] text-[8px] text-slate-400 outline-none transition hover:border-white/[0.12] focus:border-cyan-400/20"
                  >
                    {PRIORITY_FILTERS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              WORK ORDER TABLE
              ================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.055] bg-white/[0.015]">
                  {[
                    "Work Order",
                    "Machine",
                    "Line",
                    "Maintenance Task",
                    "Type",
                    "Priority",
                    "Technician",
                    "Scheduled",
                    "Duration",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[7px] font-medium uppercase tracking-[0.14em] text-slate-600 first:pl-6 last:pr-6"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`group border-b border-white/[0.045] transition-colors last:border-b-0 ${
                      order.overdue
                        ? "bg-rose-400/[0.012] hover:bg-rose-400/[0.03]"
                        : "hover:bg-cyan-400/[0.018]"
                    }`}
                  >
                    {/* WORK ORDER */}
                    <td className="px-4 py-4 pl-6">
                      <div className="flex items-center gap-2">
                        {order.overdue && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_7px_rgba(251,113,133,0.65)]" />
                        )}

                        <span
                          className={`whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] font-semibold ${
                            order.overdue
                              ? "text-rose-300"
                              : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        >
                          {order.id}
                        </span>
                      </div>
                    </td>

                    {/* MACHINE */}
                    <td className="px-4 py-4">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-cyan-300">
                        {order.machine}
                      </span>
                    </td>

                    {/* LINE */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-[9px] text-slate-500">
                        {order.line}
                      </span>
                    </td>

                    {/* TASK */}
                    <td className="max-w-[260px] px-4 py-4">
                      <span className="text-[10px] leading-[1.5] text-slate-400">
                        {order.task}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap rounded-md border border-white/[0.065] bg-white/[0.025] px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.07em] text-slate-500">
                        {order.type}
                      </span>
                    </td>

                    {/* PRIORITY */}
                    <td className="px-4 py-4">
                      <PriorityPill priority={order.priority} />
                    </td>

                    {/* TECHNICIAN */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="h-3 w-3 text-slate-600" />

                        <span className="whitespace-nowrap text-[9px] text-slate-400">
                          {order.technician}
                        </span>
                      </div>
                    </td>

                    {/* SCHEDULE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3 w-3 text-slate-600" />

                        <span
                          className={`whitespace-nowrap font-[family-name:var(--font-mono)] text-[8px] ${
                            order.overdue ? "text-rose-300" : "text-slate-500"
                          }`}
                        >
                          {order.scheduled}
                        </span>
                      </div>
                    </td>

                    {/* DURATION */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-600" />

                        <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[8px] text-slate-500">
                          {order.duration}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4 pr-6">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                          <Search className="h-4 w-4 text-slate-600" />
                        </div>

                        <p className="mt-3 text-[11px] font-medium text-slate-400">
                          No maintenance work orders found
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                          Try changing the status, line, priority or search
                          query.
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
            <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
              Showing {filteredOrders.length} of {WORK_ORDERS.length} work
              orders
            </span>

            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
                Work Order Service Online
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            SYSTEM STATUS STRIP
            ==================================================== */}

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
              Maintenance Planning Operational
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-700">
            <span>PM Compliance 94.6%</span>
            <span>12 Open Orders</span>
            <span>5 Assets Due Today</span>
            <span>PackPilot Maintenance Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
