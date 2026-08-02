"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileBarChart2,
  Gauge,
  Loader2,
  Package,
  Radio,
  Search,
  Sparkles,
  TrendingDown,
  Trophy,
  X,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

type TrendPoint = {
  label: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};

type LineComparison = {
  line: string;
  oee: number;
  output: number;
  downtimeHours: number;
};

type LossSlice = {
  label: string;
  pct: number;
  color: string;
};

type ReportCategory = "Production" | "Reliability" | "Quality" | "Maintenance";

type ReportStatus = "Ready" | "Processing" | "Scheduled";

type ReportRow = {
  id: string;
  name: string;
  category: ReportCategory;
  line: string;
  period: string;
  generated: string;
  owner: string;
  status: ReportStatus;
};

/* ============================================================
   PRODUCTION TREND DATA
   ============================================================ */

const TREND: TrendPoint[] = [
  {
    label: "D1",
    oee: 84.1,
    availability: 92.0,
    performance: 90.5,
    quality: 98.8,
  },
  {
    label: "D5",
    oee: 85.0,
    availability: 93.1,
    performance: 91.0,
    quality: 98.9,
  },
  {
    label: "D10",
    oee: 86.2,
    availability: 93.8,
    performance: 91.8,
    quality: 99.0,
  },
  {
    label: "D15",
    oee: 85.8,
    availability: 94.0,
    performance: 91.5,
    quality: 99.1,
  },
  {
    label: "D20",
    oee: 87.0,
    availability: 94.5,
    performance: 92.2,
    quality: 99.2,
  },
  {
    label: "D25",
    oee: 86.5,
    availability: 94.2,
    performance: 92.0,
    quality: 99.1,
  },
  {
    label: "D30",
    oee: 87.4,
    availability: 94.8,
    performance: 92.7,
    quality: 99.3,
  },
];

/* ============================================================
   LINE PERFORMANCE
   ============================================================ */

const LINE_COMPARISON: LineComparison[] = [
  {
    line: "Line 1",
    oee: 88.2,
    output: 248000,
    downtimeHours: 3.1,
  },
  {
    line: "Line 2",
    oee: 82.4,
    output: 210000,
    downtimeHours: 5.8,
  },
  {
    line: "Line 3",
    oee: 89.6,
    output: 265000,
    downtimeHours: 2.4,
  },
  {
    line: "Line 4",
    oee: 85.1,
    output: 232000,
    downtimeHours: 4.2,
  },
  {
    line: "Line 5",
    oee: 91.8,
    output: 278000,
    downtimeHours: 1.9,
  },
];

/* ============================================================
   LOSS DISTRIBUTION
   ============================================================ */

const LOSS_DISTRIBUTION: LossSlice[] = [
  {
    label: "Downtime",
    pct: 42,
    color: "#fb7185",
  },
  {
    label: "Speed Loss",
    pct: 27,
    color: "#fbbf24",
  },
  {
    label: "Quality Loss",
    pct: 18,
    color: "#22d3ee",
  },
  {
    label: "Changeover",
    pct: 13,
    color: "#a78bfa",
  },
];

/* ============================================================
   REPORT DATA
   ============================================================ */

const INITIAL_REPORTS: ReportRow[] = [
  {
    id: "RPT-1042",
    name: "Daily Production Summary",
    category: "Production",
    line: "All Lines",
    period: "Today",
    generated: "Aug 1, 06:00",
    owner: "System",
    status: "Ready",
  },
  {
    id: "RPT-1041",
    name: "Weekly OEE Analysis",
    category: "Production",
    line: "All Lines",
    period: "Jul 25 – 31",
    generated: "Aug 1, 05:30",
    owner: "S. Iyer",
    status: "Ready",
  },
  {
    id: "RPT-1038",
    name: "Downtime Pareto Report",
    category: "Reliability",
    line: "Line 3",
    period: "Jul 2026",
    generated: "Jul 31, 22:10",
    owner: "A. Sharma",
    status: "Ready",
  },
  {
    id: "RPT-1037",
    name: "Line 2 Reliability Review",
    category: "Reliability",
    line: "Line 2",
    period: "Jul 2026",
    generated: "Jul 31, 18:45",
    owner: "R. Mehta",
    status: "Processing",
  },
  {
    id: "RPT-1035",
    name: "Preventive Maintenance Compliance",
    category: "Maintenance",
    line: "All Lines",
    period: "Jul 2026",
    generated: "Jul 30, 09:00",
    owner: "N. Rao",
    status: "Ready",
  },
  {
    id: "RPT-1033",
    name: "Quality Loss Analysis",
    category: "Quality",
    line: "Line 4",
    period: "Jul 2026",
    generated: "Jul 29, 14:20",
    owner: "P. Singh",
    status: "Ready",
  },
  {
    id: "RPT-1030",
    name: "Monthly Operations Summary",
    category: "Production",
    line: "All Lines",
    period: "Jul 2026",
    generated: "Jul 28, 07:00",
    owner: "System",
    status: "Scheduled",
  },
  {
    id: "RPT-1028",
    name: "Changeover Performance Report",
    category: "Production",
    line: "Line 5",
    period: "Jul 2026",
    generated: "Jul 27, 16:15",
    owner: "S. Iyer",
    status: "Processing",
  },
];

/* ============================================================
   FILTER OPTIONS
   ============================================================ */

const LINE_FILTERS = [
  "All Lines",
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
];

const DATE_FILTERS = [
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Quarter",
];

const REPORT_TYPES = [
  "Daily Production Summary",
  "Weekly OEE Analysis",
  "Downtime Pareto Report",
  "Line Reliability Review",
  "Preventive Maintenance Compliance",
  "Quality Loss Analysis",
  "Monthly Operations Summary",
  "Changeover Performance Report",
];

const TABS = [
  "All",
  "Production",
  "Reliability",
  "Quality",
  "Maintenance",
] as const;

/* ============================================================
   BASIC STYLE HELPERS
   ============================================================ */

function categoryTone(category: ReportCategory) {
  const tones: Record<ReportCategory, string> = {
    Production: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",

    Reliability: "border-rose-400/20 bg-rose-400/[0.07] text-rose-300",

    Quality: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",

    Maintenance: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
  };

  return tones[category];
}

function CategoryTag({ category }: { category: ReportCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] font-medium uppercase tracking-[0.07em] ${categoryTone(
        category,
      )}`}
    >
      {category}
    </span>
  );
}

function StatusPill({ status }: { status: ReportStatus }) {
  if (status === "Ready") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.08em] text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </span>
    );
  }

  if (status === "Processing") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.08em] text-cyan-300">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2 py-1 font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.08em] text-amber-300">
      <CalendarClock className="h-3 w-3" />
      Scheduled
    </span>
  );
}
/* ============================================================
   PANEL
   ============================================================ */

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   PANEL HEADER
   ============================================================ */

function PanelHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
          {eyebrow}
        </p>

        <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[10px] leading-4 text-slate-600">
            {description}
          </p>
        )}
      </div>

      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */

type KpiCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "cyan" | "emerald" | "amber" | "rose";
  helper: string;
  trend?: {
    direction: "up" | "down";
    text: string;
    good?: boolean;
  };
};

function KpiCard({ label, value, icon, tone, helper, trend }: KpiCardProps) {
  const styles = {
    cyan: {
      icon: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
      glow: "bg-cyan-400/[0.04]",
    },

    emerald: {
      icon: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
      glow: "bg-emerald-400/[0.04]",
    },

    amber: {
      icon: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
      glow: "bg-amber-400/[0.04]",
    },

    rose: {
      icon: "border-rose-400/20 bg-rose-400/[0.07] text-rose-300",
      glow: "bg-rose-400/[0.04]",
    },
  }[tone];

  return (
    <div className="relative min-h-[154px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0a1019]/90 p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.045)]">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[65px] ${styles.glow}`}
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
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-4">
        {trend && (
          <div
            className={`mb-1 flex items-center gap-1 font-[family-name:var(--font-mono)] text-[8px] font-semibold ${
              trend.good === false ? "text-rose-300" : "text-emerald-300"
            }`}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}

            {trend.text}
          </div>
        )}

        <p className="text-[10px] text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

/* ============================================================
   LEGEND
   ============================================================ */

function Legend({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {dashed ? (
        <span
          className="h-0 w-3 border-t border-dashed"
          style={{ borderColor: color }}
        />
      ) : (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
    </span>
  );
}

/* ============================================================
   PERFORMANCE METRIC BAR
   ============================================================ */

function MetricBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "amber" | "violet";
}) {
  const barStyles = {
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.25)]",

    emerald:
      "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.25)]",

    amber:
      "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.22)]",

    violet:
      "bg-gradient-to-r from-violet-600 to-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.22)]",
  }[tone];

  const textStyles = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    violet: "text-violet-300",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">{label}</span>

        <span
          className={`font-[family-name:var(--font-mono)] text-[9px] font-semibold ${textStyles}`}
        >
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
        <div
          className={`h-full rounded-full ${barStyles}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   LINE COMPARISON BAR
   ============================================================ */

function BarRow({
  label,
  valueLabel,
  pct,
  tone,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  tone: "cyan" | "emerald" | "amber" | "rose";
}) {
  const toneMap = {
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-400",
    emerald: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    amber: "bg-gradient-to-r from-amber-600 to-amber-400",
    rose: "bg-gradient-to-r from-rose-600 to-rose-400",
  };

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[58px] shrink-0 font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.08em] text-slate-600">
        {label}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.045]">
        <div
          className={`h-full rounded-full ${toneMap[tone]}`}
          style={{
            width: `${Math.min(pct, 100)}%`,
          }}
        />
      </div>

      <span className="w-[76px] shrink-0 text-right font-[family-name:var(--font-mono)] text-[8px] text-slate-500">
        {valueLabel}
      </span>
    </div>
  );
}

/* ============================================================
   DROPDOWN
   ============================================================ */

function Dropdown({
  value,
  options,
  open,
  setOpen,
  onChange,
}: {
  value: string;
  options: string[];
  open: boolean;
  setOpen: (value: boolean) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 min-w-[130px] items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#0b111b] px-3.5 font-[family-name:var(--font-mono)] text-[8px] text-slate-400 transition hover:border-white/[0.12]"
      >
        <span>{value}</span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a1018] py-1 shadow-2xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full whitespace-nowrap px-3.5 py-2 text-left font-[family-name:var(--font-mono)] text-[8px] transition ${
                option === value
                  ? "bg-cyan-400/[0.08] text-cyan-300"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MODAL FORM SELECT
   ============================================================ */

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0b111b] px-3.5 pr-10 text-[10px] text-slate-300 outline-none transition focus:border-cyan-400/25"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#0b111b]">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
      </div>
    </label>
  );
}

/* ============================================================
   PRODUCTION TREND SVG CHART
   ============================================================ */

function TrendChart({ data }: { data: TrendPoint[] }) {
  const width = 640;
  const height = 260;

  const padLeft = 34;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 28;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const min = 80;
  const max = 100;
  const target = 85;

  const scaleX = (index: number) =>
    padLeft + (index / (data.length - 1)) * chartWidth;

  const scaleY = (value: number) =>
    padTop + chartHeight - ((value - min) / (max - min)) * chartHeight;

  const series: {
    key: keyof TrendPoint;
    color: string;
  }[] = [
    {
      key: "oee",
      color: "#22d3ee",
    },
    {
      key: "availability",
      color: "#34d399",
    },
    {
      key: "performance",
      color: "#fbbf24",
    },
    {
      key: "quality",
      color: "#a78bfa",
    },
  ];

  const linePath = (key: keyof TrendPoint) =>
    data
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${scaleX(index).toFixed(
            1,
          )} ${scaleY(point[key] as number).toFixed(1)}`,
      )
      .join(" ");

  const areaPath = `${linePath("oee")}
    L ${scaleX(data.length - 1).toFixed(1)} ${(padTop + chartHeight).toFixed(1)}
    L ${scaleX(0).toFixed(1)} ${(padTop + chartHeight).toFixed(1)}
    Z`;

  const gridLines = [80, 85, 90, 95, 100];
  const targetY = scaleY(target);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Production performance over the last 30 days"
    >
      {/* GRID */}
      {gridLines.map((grid) => {
        const y = scaleY(grid);

        return (
          <g key={grid}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
            />

            <text
              x={padLeft - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="rgba(148,163,184,0.55)"
            >
              {grid}
            </text>
          </g>
        );
      })}

      {/* TARGET */}
      <line
        x1={padLeft}
        x2={width - padRight}
        y1={targetY}
        y2={targetY}
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="1"
        strokeDasharray="5 4"
      />

      <text
        x={width - padRight}
        y={targetY - 5}
        textAnchor="end"
        fontSize="8"
        fill="rgba(148,163,184,0.55)"
      >
        target {target}%
      </text>

      {/* OEE AREA */}
      <path d={areaPath} fill="url(#reportsOeeArea)" opacity="0.6" />

      {/* SERIES */}
      {series.map((item) => (
        <path
          key={item.key}
          d={linePath(item.key)}
          fill="none"
          stroke={item.color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* POINTS */}
      {series.map((item) =>
        data.map((point, index) => (
          <circle
            key={`${item.key}-${index}`}
            cx={scaleX(index)}
            cy={scaleY(point[item.key] as number)}
            r="2.2"
            fill={item.color}
          />
        )),
      )}

      {/* X AXIS */}
      {data.map((point, index) => (
        <text
          key={point.label}
          x={scaleX(index)}
          y={height - 8}
          textAnchor="middle"
          fontSize="8"
          fill="rgba(148,163,184,0.55)"
        >
          {point.label}
        </text>
      ))}

      <defs>
        <linearGradient id="reportsOeeArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />

          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ============================================================
   LOSS DISTRIBUTION DONUT
   ============================================================ */

function DonutChart({
  data,
  centerLabel,
  centerSub,
}: {
  data: LossSlice[];
  centerLabel: string;
  centerSub: string;
}) {
  const size = 168;
  const radius = 58;
  const strokeWidth = 18;

  const circumference = 2 * Math.PI * radius;

  let offsetAccumulated = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-[168px] w-[168px]"
      role="img"
      aria-label="Production loss distribution"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.045)"
        strokeWidth={strokeWidth}
      />

      {data.map((slice) => {
        const dash = (slice.pct / 100) * circumference;

        const gap = circumference - dash;

        const rotation = (offsetAccumulated / 100) * 360 - 90;

        offsetAccumulated += slice.pct;

        return (
          <circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            opacity="0.9"
          />
        );
      })}

      <text
        x={size / 2}
        y={size / 2 - 3}
        textAnchor="middle"
        fontSize="20"
        fontWeight="600"
        fill="#f1f5f9"
      >
        {centerLabel}
      </text>

      <text
        x={size / 2}
        y={size / 2 + 14}
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fill="rgba(148,163,184,0.55)"
      >
        {centerSub}
      </text>
    </svg>
  );
}
/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");

  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("All Lines");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateType, setGenerateType] = useState(REPORT_TYPES[0]);
  const [generateLine, setGenerateLine] = useState("All Lines");
  const [generateRange, setGenerateRange] = useState("Last 30 Days");
  const [generated, setGenerated] = useState(false);

  const filteredReports = useMemo(() => {
    let rows = [...INITIAL_REPORTS];

    if (activeTab !== "All") {
      rows = rows.filter((report) => report.category === activeTab);
    }

    if (lineFilter !== "All Lines") {
      rows = rows.filter(
        (report) => report.line === lineFilter || report.line === "All Lines",
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      rows = rows.filter((report) =>
        [
          report.id,
          report.name,
          report.category,
          report.line,
          report.period,
          report.owner,
          report.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    return rows;
  }, [activeTab, search, lineFilter]);

  function handleGenerateReport() {
    setGenerated(true);

    window.setTimeout(() => {
      setGenerateOpen(false);
      setGenerated(false);
    }, 900);
  }

  return (
    /*
      DashboardLayout already handles the sidebar + navbar.
      Keep this page in normal document flow.
      No fixed positioning, negative margins or manual sidebar offsets.
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
                <FileBarChart2 className="h-3.5 w-3.5 text-cyan-400" />

                <span className="font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Operations Intelligence
                </span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold leading-[1.05] tracking-[-0.025em] text-slate-100 sm:text-[36px]">
                Reports & Analytics
              </h1>

              <p className="mt-3 max-w-[760px] text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                Analyze production performance, reliability trends and
                operational efficiency across packaging lines.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-400/[0.055] px-3.5 py-2 xl:self-auto">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Reporting Engine · Live
              </span>
            </div>
          </div>
        </section>

        {/* ====================================================
            KPI ROW
            ==================================================== */}

        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Reports Generated"
            value="148"
            helper="Reports available in current workspace"
            tone="cyan"
            icon={<FileBarChart2 className="h-[18px] w-[18px]" />}
            trend={{
              direction: "up",
              text: "24 this month",
            }}
          />

          <KpiCard
            label="Avg OEE"
            value="87.4%"
            helper="Across all active packaging lines"
            tone="emerald"
            icon={<Gauge className="h-[18px] w-[18px]" />}
            trend={{
              direction: "up",
              text: "2.8% vs last month",
            }}
          />

          <KpiCard
            label="Production Output"
            value="1.28M"
            helper="Cartons produced this month"
            tone="cyan"
            icon={<Package className="h-[18px] w-[18px]" />}
            trend={{
              direction: "up",
              text: "4.6% vs last month",
            }}
          />

          <KpiCard
            label="Downtime Loss"
            value="18.6h"
            helper="Total recorded production loss"
            tone="rose"
            icon={<TrendingDown className="h-[18px] w-[18px]" />}
            trend={{
              direction: "down",
              text: "7.2% vs last month",
              good: true,
            }}
          />
        </section>

        {/* ====================================================
            PRODUCTION PERFORMANCE + SUMMARY
            ==================================================== */}

        <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* ==================================================
              PRODUCTION PERFORMANCE
              ================================================== */}

          <Panel>
            <PanelHeader
              eyebrow="30 Day Trend"
              title="Production Performance"
              description="OEE and core manufacturing performance factors across all packaging lines"
              right={
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.055] bg-black/10 px-3 py-2">
                  <Legend color="#22d3ee" label="OEE" />

                  <Legend color="#34d399" label="Availability" />

                  <Legend color="#fbbf24" label="Performance" />

                  <Legend color="#a78bfa" label="Quality" />

                  <Legend color="rgba(148,163,184,0.5)" label="Target" dashed />
                </div>
              }
            />

            {/* CURRENT VALUES */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-cyan-400/[0.1] bg-cyan-400/[0.025] px-3 py-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Current OEE
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-cyan-300">
                  87.4%
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/[0.1] bg-emerald-400/[0.025] px-3 py-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Availability
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-emerald-300">
                  94.8%
                </p>
              </div>

              <div className="rounded-xl border border-amber-400/[0.1] bg-amber-400/[0.025] px-3 py-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Performance
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-amber-300">
                  92.7%
                </p>
              </div>

              <div className="rounded-xl border border-violet-400/[0.1] bg-violet-400/[0.025] px-3 py-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                  Quality
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-[20px] font-semibold leading-none text-violet-300">
                  99.3%
                </p>
              </div>
            </div>

            {/* CHART */}
            <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.055] bg-black/[0.12] p-3 sm:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.018)_1px,transparent_1px)] bg-[size:32px_32px]" />

              <div className="relative">
                <TrendChart data={TREND} />
              </div>
            </div>

            {/* CHART FOOTER */}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.045] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-3 w-3 text-emerald-400" />

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Production telemetry synchronized
                </span>
              </div>

              <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-700">
                Last refresh · 17:42 IST
              </span>
            </div>
          </Panel>

          {/* ==================================================
              PERFORMANCE SUMMARY
              ================================================== */}

          <Panel>
            <PanelHeader
              eyebrow="Plant Overview"
              title="Performance Summary"
              description="Current operating efficiency across connected lines"
              right={<Activity className="h-4 w-4 text-cyan-400/70" />}
            />

            {/* METRIC BARS */}
            <div className="mt-6 space-y-5">
              <MetricBar
                label="Overall Equipment Effectiveness"
                value={87.4}
                tone="cyan"
              />

              <MetricBar label="Availability" value={94.8} tone="emerald" />

              <MetricBar label="Performance" value={92.7} tone="amber" />

              <MetricBar label="Quality" value={99.3} tone="violet" />
            </div>

            {/* TARGET STATUS */}
            <div className="mt-5 rounded-xl border border-emerald-400/[0.1] bg-emerald-400/[0.025] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                    OEE Target
                  </p>

                  <p className="mt-1.5 text-[10px] font-medium text-slate-300">
                    Plant operating above target
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-emerald-300">
                    +2.4%
                  </p>

                  <p className="font-[family-name:var(--font-mono)] text-[7px] text-slate-600">
                    vs 85%
                  </p>
                </div>
              </div>
            </div>

            {/* BEST LINE */}
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
                  <Trophy className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                    Best Performing Line
                  </p>

                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-300">
                      Line 5
                    </span>

                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-emerald-300">
                      91.8% OEE
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                      style={{
                        width: "91.8%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* NEEDS ATTENTION */}
            <div className="mt-2.5 rounded-xl border border-amber-400/[0.1] bg-amber-400/[0.025] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/[0.06] text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.11em] text-slate-600">
                    Needs Attention
                  </p>

                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-300">
                      Line 2
                    </span>

                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-amber-300">
                      82.4% OEE
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                      style={{
                        width: "82.4%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY FOOTER */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-400/[0.08] bg-cyan-400/[0.02] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-cyan-300" />

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Analytics Engine
                </span>
              </div>

              <span className="font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.1em] text-cyan-300">
                Live
              </span>
            </div>
          </Panel>
        </section>
        {/* ====================================================
            LINE PERFORMANCE + LOSS DISTRIBUTION
            ==================================================== */}

        <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* ==================================================
              LINE PERFORMANCE COMPARISON
              ================================================== */}

          <Panel>
            <PanelHeader
              eyebrow="Cross-Line Benchmark"
              title="Line Performance Comparison"
              description="OEE, production output and downtime performance across active packaging lines"
              right={
                <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
                  <Activity className="h-3 w-3 text-cyan-400/70" />

                  <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                    5 Active Lines
                  </span>
                </div>
              }
            />

            {/* COLUMN LABELS */}
            <div className="mt-5 hidden grid-cols-[74px_1fr] gap-3 border-b border-white/[0.05] pb-2 sm:grid">
              <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-700">
                Line
              </span>

              <div className="grid grid-cols-3 gap-4">
                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-700">
                  OEE
                </span>

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-700">
                  Output
                </span>

                <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-700">
                  Downtime
                </span>
              </div>
            </div>

            {/* LINE ROWS */}
            <div className="mt-2 space-y-2.5">
              {LINE_COMPARISON.map((line) => {
                const isBest = line.line === "Line 5";
                const needsAttention = line.line === "Line 2";

                const maxOutput = 300000;
                const maxDowntime = 6;

                return (
                  <div
                    key={line.line}
                    className={`rounded-xl border p-4 transition ${
                      isBest
                        ? "border-emerald-400/[0.12] bg-emerald-400/[0.025]"
                        : needsAttention
                          ? "border-amber-400/[0.12] bg-amber-400/[0.02]"
                          : "border-white/[0.055] bg-white/[0.015] hover:border-white/[0.09]"
                    }`}
                  >
                    <div className="grid gap-4 sm:grid-cols-[74px_1fr] sm:items-center">
                      {/* LINE ID */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isBest
                                ? "bg-emerald-400"
                                : needsAttention
                                  ? "bg-amber-400"
                                  : "bg-cyan-400"
                            }`}
                          />

                          <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold text-slate-300">
                            {line.line}
                          </span>
                        </div>

                        {isBest && (
                          <span className="mt-1.5 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[6px] font-semibold uppercase tracking-[0.08em] text-emerald-300">
                            Best
                          </span>
                        )}

                        {needsAttention && (
                          <span className="mt-1.5 inline-flex rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[6px] font-semibold uppercase tracking-[0.08em] text-amber-300">
                            Attention
                          </span>
                        )}
                      </div>

                      {/* METRICS */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        {/* OEE */}
                        <BarRow
                          label="OEE"
                          valueLabel={`${line.oee}%`}
                          pct={line.oee}
                          tone={
                            line.oee >= 90
                              ? "emerald"
                              : line.oee < 85
                                ? "amber"
                                : "cyan"
                          }
                        />

                        {/* OUTPUT */}
                        <BarRow
                          label="Output"
                          valueLabel={`${Math.round(line.output / 1000)}k`}
                          pct={(line.output / maxOutput) * 100}
                          tone={line.output >= 270000 ? "emerald" : "cyan"}
                        />

                        {/* DOWNTIME */}
                        <BarRow
                          label="Loss"
                          valueLabel={`${line.downtimeHours}h`}
                          pct={(line.downtimeHours / maxDowntime) * 100}
                          tone={
                            line.downtimeHours >= 5
                              ? "rose"
                              : line.downtimeHours >= 4
                                ? "amber"
                                : "cyan"
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.055] bg-black/10 p-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Total Output
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-200">
                  1.23M
                </p>

                <p className="mt-1 text-[8px] text-slate-600">
                  cartons represented
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.018] p-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Highest OEE
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-emerald-300">
                  91.8%
                </p>

                <p className="mt-1 text-[8px] text-slate-600">Line 5</p>
              </div>

              <div className="rounded-xl border border-rose-400/[0.08] bg-rose-400/[0.018] p-3">
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Highest Downtime
                </p>

                <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-rose-300">
                  5.8h
                </p>

                <p className="mt-1 text-[8px] text-slate-600">Line 2</p>
              </div>
            </div>
          </Panel>

          {/* ==================================================
              LOSS DISTRIBUTION
              ================================================== */}

          <Panel>
            <PanelHeader
              eyebrow="Production Loss"
              title="Loss Distribution"
              description="Contribution of major loss categories to production inefficiency"
              right={<TrendingDown className="h-4 w-4 text-rose-300/80" />}
            />

            {/* DONUT */}
            <div className="mt-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-5 rounded-full bg-rose-400/[0.035] blur-[35px]" />

                <div className="relative">
                  <DonutChart
                    data={LOSS_DISTRIBUTION}
                    centerLabel="18.6h"
                    centerSub="TOTAL LOSS"
                  />
                </div>
              </div>
            </div>

            {/* LEGEND / BREAKDOWN */}
            <div className="mt-2 space-y-2">
              {LOSS_DISTRIBUTION.map((loss) => (
                <div
                  key={loss.label}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{
                        backgroundColor: loss.color,
                      }}
                    />

                    <span className="text-[9px] text-slate-500">
                      {loss.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-600">
                      {((18.6 * loss.pct) / 100).toFixed(1)}h
                    </span>

                    <span
                      className="w-8 text-right font-[family-name:var(--font-mono)] text-[9px] font-semibold"
                      style={{
                        color: loss.color,
                      }}
                    >
                      {loss.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* PRIMARY LOSS */}
            <div className="mt-4 rounded-xl border border-rose-400/[0.1] bg-rose-400/[0.025] p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />

                <div>
                  <p className="text-[10px] font-medium text-slate-300">
                    Primary loss driver
                  </p>

                  <p className="mt-1 text-[9px] leading-[1.6] text-slate-600">
                    Unplanned downtime accounts for{" "}
                    <span className="font-[family-name:var(--font-mono)] font-semibold text-rose-300">
                      42%
                    </span>{" "}
                    of total production loss and remains the largest improvement
                    opportunity.
                  </p>
                </div>
              </div>
            </div>

            {/* ENGINEERING INSIGHT */}
            <div className="mt-2.5 rounded-xl border border-cyan-400/[0.08] bg-cyan-400/[0.02] p-4">
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />

                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.1em] text-cyan-300">
                    Engineering Insight
                  </p>

                  <p className="mt-1.5 text-[9px] leading-[1.6] text-slate-600">
                    Reducing Line 2 downtime to the plant median would recover
                    approximately{" "}
                    <span className="font-medium text-slate-400">
                      2.4 production hours
                    </span>{" "}
                    per month.
                  </p>
                </div>
              </div>
            </div>

            {/* LOSS TREND */}
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.018] px-3.5 py-3">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Month-over-Month
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  Total loss improving
                </p>
              </div>

              <div className="flex items-center gap-1 text-emerald-300">
                <ArrowDownRight className="h-3.5 w-3.5" />

                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold">
                  7.2%
                </span>
              </div>
            </div>
          </Panel>
        </section>
        {/* ====================================================
            GENERATED REPORTS
            ==================================================== */}

        <section className="mt-5 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* HEADER */}
          <div className="border-b border-white/[0.055] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[8px] uppercase tracking-[0.18em] text-slate-600">
                  Report Library
                </p>

                <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-tight text-slate-100">
                  Generated Reports
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  Production, reliability, quality and maintenance intelligence
                  generated across PackPilot operations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGenerateOpen(true)}
                className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.1em] text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.12]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Report
              </button>
            </div>

            {/* FILTER AREA */}
            <div className="mt-5 flex flex-col gap-3">
              {/* TABS */}
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

              {/* SEARCH + FILTERS */}
              <div className="grid gap-2.5 lg:grid-cols-[minmax(280px,1fr)_150px_160px]">
                {/* SEARCH */}
                <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 transition focus-within:border-cyan-400/20 focus-within:bg-white/[0.035]">
                  <Search className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search reports..."
                    className="w-full bg-transparent text-[10px] text-slate-300 outline-none placeholder:text-slate-600"
                  />
                </div>

                <Dropdown
                  value={lineFilter}
                  options={LINE_FILTERS}
                  open={lineDropdownOpen}
                  setOpen={setLineDropdownOpen}
                  onChange={setLineFilter}
                />

                <Dropdown
                  value={dateFilter}
                  options={DATE_FILTERS}
                  open={dateDropdownOpen}
                  setOpen={setDateDropdownOpen}
                  onChange={setDateFilter}
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              REPORT TABLE
              ================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.055] bg-white/[0.015]">
                  {[
                    "Report ID",
                    "Report Name",
                    "Category",
                    "Line",
                    "Period",
                    "Generated",
                    "Owner",
                    "Status",
                    "Action",
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
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="group border-b border-white/[0.045] transition-colors last:border-b-0 hover:bg-cyan-400/[0.018]"
                  >
                    {/* ID */}
                    <td className="px-4 py-4 pl-6">
                      <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[9px] font-semibold text-slate-500 group-hover:text-slate-400">
                        {report.id}
                      </span>
                    </td>

                    {/* NAME */}
                    <td className="max-w-[260px] px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/[0.1] bg-cyan-400/[0.035]">
                          <FileBarChart2 className="h-3.5 w-3.5 text-cyan-300/80" />
                        </div>

                        <span className="text-[10px] font-medium leading-[1.45] text-slate-300">
                          {report.name}
                        </span>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4">
                      <CategoryTag category={report.category} />
                    </td>

                    {/* LINE */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[8px] text-slate-500">
                        {report.line}
                      </span>
                    </td>

                    {/* PERIOD */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-[9px] text-slate-500">
                        {report.period}
                      </span>
                    </td>

                    {/* GENERATED */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3 w-3 shrink-0 text-slate-600" />

                        <span className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[8px] text-slate-500">
                          {report.generated}
                        </span>
                      </div>
                    </td>

                    {/* OWNER */}
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-[9px] text-slate-400">
                        {report.owner}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <StatusPill status={report.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4 pr-6">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={report.status !== "Ready"}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-600 transition enabled:hover:border-cyan-400/20 enabled:hover:bg-cyan-400/[0.05] enabled:hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`View ${report.name}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={report.status !== "Ready"}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-600 transition enabled:hover:border-emerald-400/20 enabled:hover:bg-emerald-400/[0.05] enabled:hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Download ${report.name}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                          <Search className="h-4 w-4 text-slate-600" />
                        </div>

                        <p className="mt-3 text-[11px] font-medium text-slate-400">
                          No reports found
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                          Try changing the category, line or search query.
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
              Showing {filteredReports.length} of {INITIAL_REPORTS.length}{" "}
              reports · {dateFilter}
            </span>

            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>

              <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.12em] text-slate-600">
                Reporting Service Online
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
              Operations Intelligence Operational
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.1em] text-slate-700">
            <span>OEE 87.4%</span>
            <span>1.28M Cartons</span>
            <span>18.6h Loss</span>
            <span>148 Reports</span>
            <span>PackPilot Analytics Engine</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          GENERATE REPORT MODAL
          ====================================================== */}

      {generateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02050a]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#090f18] shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />

                  <span className="font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                    Report Builder
                  </span>
                </div>

                <h3 className="mt-3 font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-tight text-slate-100">
                  Generate Report
                </h3>

                <p className="mt-1.5 max-w-[360px] text-[10px] leading-4 text-slate-600">
                  Configure an operational report from PackPilot production
                  intelligence.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGenerateOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                aria-label="Close generate report modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-4 px-6 py-6">
              <FormSelect
                label="Report Type"
                value={generateType}
                options={REPORT_TYPES}
                onChange={setGenerateType}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  label="Production Line"
                  value={generateLine}
                  options={LINE_FILTERS}
                  onChange={setGenerateLine}
                />

                <FormSelect
                  label="Date Range"
                  value={generateRange}
                  options={DATE_FILTERS}
                  onChange={setGenerateRange}
                />
              </div>

              {/* SUMMARY */}
              <div className="rounded-xl border border-cyan-400/[0.09] bg-cyan-400/[0.025] p-4">
                <p className="font-[family-name:var(--font-mono)] text-[7px] font-semibold uppercase tracking-[0.11em] text-cyan-300">
                  Generation Summary
                </p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] text-slate-600">Report</span>

                    <span className="max-w-[260px] truncate text-right text-[9px] font-medium text-slate-300">
                      {generateType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600">Scope</span>

                    <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-400">
                      {generateLine}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600">Period</span>

                    <span className="font-[family-name:var(--font-mono)] text-[8px] text-slate-400">
                      {generateRange}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] bg-black/[0.08] px-6 py-4">
              <button
                type="button"
                onClick={() => setGenerateOpen(false)}
                disabled={generated}
                className="h-9 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 font-[family-name:var(--font-mono)] text-[8px] font-medium uppercase tracking-[0.09em] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generated}
                className="flex h-9 min-w-[132px] items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.1] px-4 font-[family-name:var(--font-mono)] text-[8px] font-semibold uppercase tracking-[0.09em] text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.14] disabled:cursor-wait"
              >
                {generated ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileBarChart2 className="h-3.5 w-3.5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
