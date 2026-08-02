"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Activity,
  TrendingDown,
  Search,
  Plus,
  X,
  ChevronDown,
  Gauge,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Target,
  ArrowRight,
  Wrench,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type RiskLevel = "Critical" | "High" | "Medium" | "Low";
type ActionStatus = "Open" | "In Progress" | "Completed";

type ProcessStep =
  | "Carton Feeding"
  | "Carton Forming"
  | "Product Loading"
  | "Sealing"
  | "Coding & Inspection"
  | "Case Packing";

interface PFMEARecord {
  id: string;
  process: ProcessStep;
  failureMode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  recommendedAction: string;
  owner: string;
  actionStatus: ActionStatus;
}

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                 */
/* ------------------------------------------------------------------ */

const PROCESS_STEPS: ProcessStep[] = [
  "Carton Feeding",
  "Carton Forming",
  "Product Loading",
  "Sealing",
  "Coding & Inspection",
  "Case Packing",
];

const STATUS_OPTIONS: ActionStatus[] = ["Open", "In Progress", "Completed"];

function calcRPN(s: number, o: number, d: number): number {
  return s * o * d;
}

function classifyRisk(rpn: number): RiskLevel {
  if (rpn >= 250) return "Critical";
  if (rpn >= 150) return "High";
  if (rpn >= 80) return "Medium";
  return "Low";
}

const RISK_STYLES: Record<
  RiskLevel,
  { text: string; bg: string; border: string; dot: string; ring: string }
> = {
  Critical: {
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    ring: "shadow-[0_0_14px_rgba(244,63,94,0.35)]",
  },
  High: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    ring: "shadow-[0_0_14px_rgba(245,158,11,0.3)]",
  },
  Medium: {
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
    ring: "shadow-[0_0_14px_rgba(34,211,238,0.28)]",
  },
  Low: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    ring: "shadow-[0_0_14px_rgba(52,211,153,0.28)]",
  },
};

const STATUS_STYLES: Record<ActionStatus, { text: string; bg: string; border: string; icon: ReactNode }> = {
  Open: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    icon: <Clock3 className="h-3 w-3" />,
  },
  "In Progress": {
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    icon: <Activity className="h-3 w-3" />,
  },
  Completed: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

/* ------------------------------------------------------------------ */
/* Mock register data                                                  */
/* ------------------------------------------------------------------ */

const INITIAL_RECORDS: PFMEARecord[] = [
  {
    id: "PFM-001",
    process: "Carton Forming",
    failureMode: "Incomplete carton erection",
    effect: "Carton collapse during downstream product loading",
    cause: "Vacuum pickup degradation / forming timing deviation",
    severity: 8,
    occurrence: 8,
    detection: 5,
    recommendedAction:
  "Introduce vacuum threshold interlock and scheduled suction-cup inspection.",
    owner: "R. Mehta",
    actionStatus: "In Progress",
  },
  {
    id: "PFM-002",
    process: "Sealing",
    failureMode: "Seal integrity failure",
    effect: "Product contamination / shelf-life loss",
    cause: "Hot-melt glue temperature deviation",
    severity: 9,
    occurrence: 6,
    detection: 6,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "S. Kapoor",
    actionStatus: "Open",
  },
  {
    id: "PFM-003",
    process: "Coding & Inspection",
    failureMode: "Incorrect batch/date coding",
    effect: "Regulatory non-compliance / recall risk",
    cause: "Printer firmware fault / operator override",
    severity: 9,
    occurrence: 4,
    detection: 7,
    recommendedAction: "Review and update printer firmware, implement operator training.",
    owner: "A. Verma",
    actionStatus: "Open",
  },
  {
    id: "PFM-004",
    process: "Sealing",
    failureMode: "Seal contamination",
    effect: "Product spoilage detected at retailer",
    cause: "Foreign particle lodged in seal head",
    severity: 8,
    occurrence: 6,
    detection: 6,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "S. Kapoor",
    actionStatus: "In Progress",
  },
  {
    id: "PFM-005",
    process: "Carton Feeding",
    failureMode: "Carton misfeed",
    effect: "Line stoppage / production delay",
    cause: "Feeder timing misalignment",
    severity: 6,
    occurrence: 6,
    detection: 4,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "N. Iyer",
    actionStatus: "In Progress",
  },
  {
    id: "PFM-006",
    process: "Product Loading",
    failureMode: "Product loading error (short fill)",
    effect: "Underweight carton reaches market",
    cause: "Load-cell drift / miscalibration",
    severity: 7,
    occurrence: 5,
    detection: 6,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "P. Singh",
    actionStatus: "Open",
  },
  {
    id: "PFM-007",
    process: "Sealing",
    failureMode: "Adhesive application failure",
    effect: "Flap not fully sealed, opens in transit",
    cause: "Glue nozzle clogging",
    severity: 7,
    occurrence: 5,
    detection: 5,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "K. Rao",
    actionStatus: "In Progress",
  },
  {
    id: "PFM-008",
    process: "Coding & Inspection",
    failureMode: "Barcode verification failure",
    effect: "Carton rejected at retailer distribution center",
    cause: "Print head misalignment",
    severity: 6,
    occurrence: 4,
    detection: 5,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "A. Verma",
    actionStatus: "Completed",
  },
  {
    id: "PFM-009",
    process: "Coding & Inspection",
    failureMode: "Photoelectric sensor misalignment",
    effect: "Missed defect detection downstream",
    cause: "Sensor drift from line vibration",
    severity: 7,
    occurrence: 3,
    detection: 6,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "D. Sharma",
    actionStatus: "Open",
  },
  {
    id: "PFM-010",
    process: "Case Packing",
    failureMode: "Case packing jam",
    effect: "Line stoppage, upstream back-pressure",
    cause: "Conveyor synchronization error",
    severity: 5,
    occurrence: 5,
    detection: 4,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "K. Rao",
    actionStatus: "In Progress",
  },
  {
    id: "PFM-011",
    process: "Case Packing",
    failureMode: "Conveyor synchronization error",
    effect: "Carton crushing at case infeed",
    cause: "PLC timing drift",
    severity: 6,
    occurrence: 4,
    detection: 4,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "N. Iyer",
    actionStatus: "Open",
  },
  {
    id: "PFM-012",
    process: "Product Loading",
    failureMode: "Product misalignment during loading",
    effect: "Carton damage / jam downstream",
    cause: "Robotic gripper positioning error",
    severity: 6,
    occurrence: 3,
    detection: 5,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "P. Singh",
    actionStatus: "Completed",
  },
  {
    id: "PFM-013",
    process: "Carton Forming",
    failureMode: "Forming glue under-application",
    effect: "Weak carton base, failure in transit",
    cause: "Glue gun pressure inconsistency",
    severity: 6,
    occurrence: 3,
    detection: 3,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "R. Mehta",
    actionStatus: "Completed",
  },
  {
    id: "PFM-014",
    process: "Carton Feeding",
    failureMode: "Carton skew at pickup",
    effect: "Minor misfeed, jam auto-cleared",
    cause: "Vacuum belt wear",
    severity: 3,
    occurrence: 4,
    detection: 3,
    recommendedAction: "Implement corrective action and verify effectiveness.",
    owner: "D. Sharma",
    actionStatus: "Completed",
  },
];

/* ------------------------------------------------------------------ */
/* Static visualization data                                           */
/* ------------------------------------------------------------------ */


const PROCESS_RISK_EXPOSURE: { process: ProcessStep; avgRpn: number }[] = [
  { process: "Carton Forming", avgRpn: 320 },
  { process: "Sealing", avgRpn: 288 },
  { process: "Coding & Inspection", avgRpn: 252 },
  { process: "Product Loading", avgRpn: 178 },
  { process: "Case Packing", avgRpn: 132 },
  { process: "Carton Feeding", avgRpn: 108 },
];

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const s = RISK_STYLES[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.border} ${s.bg} px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-wider ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {risk}
    </span>
  );
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.border} ${s.bg} px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-wider ${s.text}`}
    >
      {s.icon}
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function PFMEAPage() {
  const [records, setRecords] = useState<PFMEARecord[]>(INITIAL_RECORDS);

  const [activeTab, setActiveTab] = useState<"All" | RiskLevel>("All");
  const [search, setSearch] = useState("");
  const [processFilter, setProcessFilter] = useState<"All Processes" | ProcessStep>("All Processes");
  const [statusFilter, setStatusFilter] = useState<"All Status" | ActionStatus>("All Status");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    process: PROCESS_STEPS[0],
    failureMode: "",
    effect: "",
    cause: "",
    severity: 5,
    occurrence: 5,
    detection: 5,
    owner: "",
    recommendedAction: "",
  });

  const formRpn = calcRPN(form.severity, form.occurrence, form.detection);
  const formRisk = classifyRisk(formRpn);

  const enriched = useMemo(
    () =>
      records.map((r) => {
        const rpn = calcRPN(r.severity, r.occurrence, r.detection);
        return { ...r, rpn, risk: classifyRisk(rpn) };
      }),
    [records]
  );

  const filtered = useMemo(() => {
    return enriched.filter((r) => {
      if (activeTab !== "All" && r.risk !== activeTab) return false;
      if (processFilter !== "All Processes" && r.process !== processFilter) return false;
      if (statusFilter !== "All Status" && r.actionStatus !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${r.id} ${r.process} ${r.failureMode} ${r.effect} ${r.cause} ${r.owner}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, activeTab, processFilter, statusFilter, search]);

  const tabCounts = useMemo(() => {
    const counts: Record<"All" | RiskLevel, number> = { All: enriched.length, Critical: 0, High: 0, Medium: 0, Low: 0 };
    enriched.forEach((r) => {
      counts[r.risk] += 1;
    });
    return counts;
  }, [enriched]);
  const riskDistribution = useMemo(() => {
  const counts: Record<RiskLevel, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  enriched.forEach((record) => {
    counts[record.risk] += 1;
  });

  return (["Critical", "High", "Medium", "Low"] as RiskLevel[]).map(
    (level) => ({
      level,
      count: counts[level],
    })
  );
}, [enriched]);

  function handleAddFailureMode() {
    if (!form.failureMode.trim() || !form.owner.trim()) return;
    const nextIndex =
  Math.max(
    0,
    ...records.map((r) => Number(r.id.replace("PFM-", "")))
  ) + 1;
    const newRecord: PFMEARecord = {
      id: `PFM-${String(nextIndex).padStart(3, "0")}`,
      process: form.process,
      failureMode: form.failureMode.trim(),
      effect: form.effect.trim() || "—",
      cause: form.cause.trim() || "—",
      severity: form.severity,
      occurrence: form.occurrence,
      detection: form.detection,
       recommendedAction:
    form.recommendedAction.trim() || "—",
      owner: form.owner.trim(),
      actionStatus: "Open",
    };
    setRecords((prev) => [newRecord, ...prev]);
    setIsModalOpen(false);
    setForm({
      process: PROCESS_STEPS[0],
      failureMode: "",
      effect: "",
      cause: "",
      severity: 5,
      occurrence: 5,
      detection: 5,
      owner: "",
      recommendedAction: "",
    });
  }

  /* ---------------- donut chart geometry ---------------- */
  const total = riskDistribution.reduce((a, b) => a + b.count, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const donutSegments = riskDistribution.map((seg) => {
    const fraction = seg.count / total;
    const length = fraction * circumference;
    const offset = -cumulative;
    cumulative += length;
    return { ...seg, length, offset, fraction };
  });
  const openActionsCount = useMemo(() => {
  return records.filter(
    (record) => record.actionStatus !== "Completed"
  ).length;
}, [records]);
const averageRpn = useMemo(() => {
  if (enriched.length === 0) return 0;

  const totalRpn = enriched.reduce(
    (sum, record) => sum + record.rpn,
    0
  );

  return Math.round(totalRpn / enriched.length);
}, [enriched]);

  const maxExposure = Math.max(...PROCESS_RISK_EXPOSURE.map((p) => p.avgRpn));

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-[#050912]">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-7 lg:px-8 xl:px-10">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              Process Risk Engineering
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold leading-tight text-white sm:text-[36px]">
              PFMEA Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              Identify process failure modes, quantify manufacturing risk and track mitigation actions across
              packaging operations.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Risk Analysis · Active
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KPI CARDS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<ClipboardList className="h-4 w-4" />}
            accent="cyan"
            label="Failure Modes"
            value={String(records.length)}
            sub="Across active packaging processes"
          />
          <KpiCard
            icon={<ShieldAlert className="h-4 w-4" />}
            accent="rose"
            label="Critical Risks"
            value={String(tabCounts.Critical)}
            sub="Requires immediate mitigation"
          />
          <KpiCard
            icon={<Wrench className="h-4 w-4" />}
            accent="amber"
            label="Open Actions"
            value={String(openActionsCount)}
            sub="3 actions currently overdue"
          />
          <KpiCard
            icon={<Gauge className="h-4 w-4" />}
            accent="emerald"
            label="Avg RPN"
            value={String(averageRpn)}
            sub="↓ 8.4% after mitigation"
            trendDown
          />
        </div>

        {/* ============================================================ */}
        {/* MAIN ANALYTICS ROW */}
        {/* ============================================================ */}
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* LEFT: Risk Priority Overview */}
          <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
                  Risk Priority Overview
                </h2>
                <p className="mt-1 text-xs text-white/40">Distribution of failure modes by risk classification</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-around">
              <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-0">
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                  {donutSegments.map((seg) => {
                    const colorMap: Record<RiskLevel, string> = {
                      Critical: "#fb7185",
                      High: "#fbbf24",
                      Medium: "#22d3ee",
                      Low: "#34d399",
                    };
                    return (
                      <circle
                        key={seg.level}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={colorMap[seg.level]}
                        strokeWidth="18"
                        strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                        strokeDashoffset={seg.offset}
                        transform="rotate(-90 100 100)"
                        strokeLinecap="butt"
                        style={{ filter: `drop-shadow(0 0 6px ${colorMap[seg.level]}55)` }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
                    {total}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/40">
                    Total Modes
                  </span>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-3">
                {donutSegments.map((seg) => {
                  const s = RISK_STYLES[seg.level];
                  return (
                    <div
                      key={seg.level}
                      className={`flex items-center justify-between rounded-xl border ${s.border} ${s.bg} px-3.5 py-2.5`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        <span className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-wide text-white/70">
                          {seg.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-white">
                          {seg.count}
                        </span>
                        <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/40">
                          {(seg.fraction * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: PFMEA Health */}
          <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">PFMEA Health</h2>
            <p className="mt-1 text-xs text-white/40">Mitigation velocity and outstanding exposure</p>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.83)}`}
                    style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.45))" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">83%</span>
                </div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-widest text-white/40">
                  On-Time Closure
                </div>
                <div className="mt-1 text-sm text-white/60">Actions closed within target window</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <MiniStat label="Critical" value="4" accent="rose" />
              <MiniStat label="Open" value="9" accent="amber" />
              <MiniStat label="Overdue" value="3" accent="rose" />
            </div>

            <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-4">
              <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-rose-300/80">
                <AlertTriangle className="h-3.5 w-3.5" />
                Highest Risk Process
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                  Carton Forming
                </span>
                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-rose-300">320</span>
              </div>
              <div className="mt-0.5 text-[11px] text-white/40">Current RPN</div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECOND ROW */}
        {/* ============================================================ */}
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          {/* LEFT: Process Risk Comparison */}
          <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
              Process Risk Comparison
            </h2>
            <p className="mt-1 text-xs text-white/40">Average risk priority number by process step</p>

            <div className="mt-6 space-y-4">
              {PROCESS_RISK_EXPOSURE.map((p) => {
                const risk = classifyRisk(p.avgRpn);
                const s = RISK_STYLES[risk];
                const widthPct = (p.avgRpn / maxExposure) * 100;
                return (
                  <div key={p.process}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-white/70">{p.process}</span>
                      <span className={`font-[family-name:var(--font-mono)] text-xs font-semibold ${s.text}`}>
                        {p.avgRpn}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full ${s.dot} ${s.ring}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Engineering Risk Insight */}
          <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-300" />
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
                Engineering Risk Insight
              </h2>
            </div>

            <div className="mt-4 space-y-3.5">
              <InsightRow label="Process" value="Carton Forming" />
              <InsightRow label="Failure Mode" value="Incomplete carton erection" />
              <InsightRow label="Effect" value="Carton collapse during downstream product loading" />
              <InsightRow label="Likely Cause" value="Vacuum pickup degradation / forming timing deviation" />
              <InsightRow label="Current Controls" value="Vacuum pressure monitoring + operator inspection" />
              <InsightRow
                label="Recommended Action"
                value="Introduce vacuum threshold interlock and scheduled suction-cup inspection."
                emphasize
              />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="text-center">
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/40">
                  Current
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xl font-bold text-rose-300">320</div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30" />
              <div className="text-center">
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/40">
                  Projected
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xl font-bold text-emerald-300">120</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center gap-1 text-center">
                <TrendingDown className="h-4 w-4 text-emerald-300" />
                <div className="font-[family-name:var(--font-mono)] text-xs font-semibold text-emerald-300">-62.5%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PFMEA REGISTER */}
        {/* ============================================================ */}
        <div className="mt-5 rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
                PFMEA Register
              </h2>
              <p className="mt-1 text-xs text-white/40">Failure mode inventory with live risk scoring</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Failure Mode
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(["All", "Critical", "High", "Medium", "Low"] as const).map((tab) => {
              const active = activeTab === tab;
              const s = tab !== "All" ? RISK_STYLES[tab] : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-wider transition ${
                    active
                      ? s
                        ? `${s.border} ${s.bg} ${s.text}`
                        : "border-white/25 bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab}
                  <span className="opacity-60">{tabCounts[tab]}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PFMEA records…"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-cyan-400/40"
              />
            </div>

            <SelectField
              value={processFilter}
              onChange={(v) => setProcessFilter(v as typeof processFilter)}
              options={["All Processes", ...PROCESS_STEPS]}
            />
            <SelectField
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as typeof statusFilter)}
              options={["All Status", ...STATUS_OPTIONS]}
            />
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full min-w-[1280px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  {[
                    "PFMEA ID",
                    "Process Step",
                    "Failure Mode",
                    "Effect",
                    "Cause",
                    "S",
                    "O",
                    "D",
                    "RPN",
                    "Risk",
                    "Owner",
                    "Action Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-white/[0.05] transition hover:bg-white/[0.02] ${
                      idx % 2 === 1 ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-cyan-300/90">
                      {r.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-white/70">{r.process}</td>
                    <td className="min-w-[190px] px-4 py-3 text-xs text-white/80">{r.failureMode}</td>
                    <td className="min-w-[220px] px-4 py-3 text-xs text-white/50">{r.effect}</td>
                    <td className="min-w-[220px] px-4 py-3 text-xs text-white/50">{r.cause}</td>
                    <td className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-xs text-white/70">
                      {r.severity}
                    </td>
                    <td className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-xs text-white/70">
                      {r.occurrence}
                    </td>
                    <td className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-xs text-white/70">
                      {r.detection}
                    </td>
                    <td className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-sm font-bold text-white">
                      {r.rpn}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <RiskBadge risk={r.risk} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-white/60">{r.owner}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={r.actionStatus} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-xs text-white/30">
                      No PFMEA records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[11px] text-white/30">
            Showing {filtered.length} of {records.length} records
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ADD FAILURE MODE MODAL */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] border border-white/[0.1] bg-[#0a1120] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-cyan-400/70">
                  New Record
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                  Add Failure Mode
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/[0.08] p-1.5 text-white/40 transition hover:text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Process Step">
                  <select
                    value={form.process}
                    onChange={(e) => setForm((f) => ({ ...f, process: e.target.value as ProcessStep }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 outline-none focus:border-cyan-400/40"
                  >
                    {PROCESS_STEPS.map((p) => (
                      <option key={p} value={p} className="bg-[#0a1120]">
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Owner">
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="e.g. R. Mehta"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-400/40"
                  />
                </Field>
              </div>

              <Field label="Failure Mode">
                <input
                  type="text"
                  value={form.failureMode}
                  onChange={(e) => setForm((f) => ({ ...f, failureMode: e.target.value }))}
                  placeholder="e.g. Carton misfeed at pickup station"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-400/40"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Effect">
                  <input
                    type="text"
                    value={form.effect}
                    onChange={(e) => setForm((f) => ({ ...f, effect: e.target.value }))}
                    placeholder="Downstream impact"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-400/40"
                  />
                </Field>
                <Field label="Cause">
                  <input
                    type="text"
                    value={form.cause}
                    onChange={(e) => setForm((f) => ({ ...f, cause: e.target.value }))}
                    placeholder="Root cause"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-400/40"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <RatingField
                  label="Severity (1–10)"
                  value={form.severity}
                  onChange={(v) => setForm((f) => ({ ...f, severity: v }))}
                />
                <RatingField
                  label="Occurrence (1–10)"
                  value={form.occurrence}
                  onChange={(v) => setForm((f) => ({ ...f, occurrence: v }))}
                />
                <RatingField
                  label="Detection (1–10)"
                  value={form.detection}
                  onChange={(v) => setForm((f) => ({ ...f, detection: v }))}
                />
              </div>

              <Field label="Recommended Action">
                <textarea
                  value={form.recommendedAction}
                  onChange={(e) => setForm((f) => ({ ...f, recommendedAction: e.target.value }))}
                  rows={2}
                  placeholder="Proposed mitigation / control"
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-400/40"
                />
              </Field>

              {/* Live RPN preview */}
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div>
                  <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/40">
                    Live Calculation
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-mono)] text-xs text-white/50">
                    RPN = S ({form.severity}) × O ({form.occurrence}) × D ({form.detection})
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-[family-name:var(--font-mono)] text-2xl font-bold text-white">{formRpn}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/30">RPN</div>
                  </div>
                  <RiskBadge risk={formRisk} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFailureMode}
                disabled={!form.failureMode.trim() || !form.owner.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Failure Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon,
  accent,
  label,
  value,
  sub,
  trendDown,
}: {
  icon: ReactNode;
  accent: "cyan" | "rose" | "amber" | "emerald";
  label: string;
  value: string;
  sub: string;
  trendDown?: boolean;
}) {
  const accentMap = {
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
    rose: "text-rose-300 bg-rose-500/10 border-rose-500/25",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  };
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${accentMap[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">{value}</div>
      <div className={`mt-1.5 flex items-center gap-1 text-xs ${trendDown ? "text-emerald-300" : "text-white/40"}`}>
        {trendDown && <TrendingDown className="h-3.5 w-3.5" />}
        <span>{sub}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: "rose" | "amber" | "cyan" }) {
  const accentMap = {
    rose: "text-rose-300 border-rose-500/25 bg-rose-500/[0.06]",
    amber: "text-amber-300 border-amber-500/25 bg-amber-500/[0.06]",
    cyan: "text-cyan-300 border-cyan-500/25 bg-cyan-500/[0.06]",
  };
  return (
    <div className={`rounded-xl border px-2.5 py-2.5 text-center ${accentMap[accent]}`}>
      <div className="font-[family-name:var(--font-mono)] text-lg font-bold">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">{label}</div>
    </div>
  );
}

function InsightRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/35">
        {label}
      </div>
      <div className={`mt-1 text-sm leading-snug ${emphasize ? "text-cyan-200" : "text-white/75"}`}>{value}</div>
    </div>
  );
}

function SelectField({
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
        className="appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-4 pr-9 text-xs font-medium text-white/70 outline-none focus:border-cyan-400/40"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0a1120]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}

function RatingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
        />
        <span className="w-6 shrink-0 text-center font-[family-name:var(--font-mono)] text-sm font-semibold text-white">
          {value}
        </span>
      </div>
    </div>
  );
}