"use client";

import { useState, type ReactNode } from "react";
import {
  Settings as SettingsIcon,
  Factory,
  AlertTriangle,
  Bell,
  Database,
  User,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Radio,
  Download,
  Activity,
  Cpu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SectionId =
  | "general"
  | "plant"
  | "thresholds"
  | "notifications"
  | "telemetry"
  | "preferences";

interface GeneralSettings {
  plantName: string;
  plantCode: string;
  timezone: string;
  operatingMode: string;
  defaultShift: string;
  units: string;
  language: string;
  autoRefresh: boolean;
  refreshInterval: string;
}

interface PlantConfigSettings {
  productionLines: number;
  activeZones: number;
  targetOee: number;
  targetAvailability: number;
  plannedHours: number;
  maintenanceWindow: string;
  energyMonitoring: boolean;
}

interface ThresholdPair {
  id: string;
  label: string;
  description: string;
  unit: string;
  warning: number;
  critical: number;
  direction: "above" | "below" | "deviation";
}

interface NotificationSettings {
  criticalAlerts: boolean;
  warningAlerts: boolean;
  downtime: boolean;
  predictiveMaintenance: boolean;
  pfmeaCritical: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  channelInApp: boolean;
  channelEmail: boolean;
  channelOpsDashboard: boolean;
}

interface TelemetrySettings {
  samplingInterval: string;
  dataRetention: string;
  autoSync: boolean;
}

interface UserPreferenceSettings {
  operatorName: string;
  role: string;
  landingPage: string;
  compactMode: boolean;
  showClock: boolean;
  animations: boolean;
}

/* ------------------------------------------------------------------ */
/* Initial mock values                                                 */
/* ------------------------------------------------------------------ */

const INITIAL_GENERAL: GeneralSettings = {
  plantName: "Meridian Assembly Plant",
  plantCode: "MAP-04",
  timezone: "Asia/Kolkata (IST)",
  operatingMode: "Continuous Production",
  defaultShift: "Morning Shift",
  units: "Metric",
  language: "English",
  autoRefresh: true,
  refreshInterval: "15 sec",
};

const INITIAL_PLANT: PlantConfigSettings = {
  productionLines: 16,
  activeZones: 5,
  targetOee: 85,
  targetAvailability: 95,
  plannedHours: 22,
  maintenanceWindow: "02:00 – 04:00 IST",
  energyMonitoring: true,
};

const INITIAL_THRESHOLDS: ThresholdPair[] = [
  {
    id: "bearing-temp",
    label: "Bearing Temperature",
    description: "Triggers when bearing housing exceeds threshold",
    unit: "°C",
    warning: 70,
    critical: 85,
    direction: "above",
  },
  {
    id: "motor-vibration",
    label: "Motor Vibration",
    description: "RMS vibration velocity on drive motors",
    unit: "g RMS",
    warning: 0.06,
    critical: 0.08,
    direction: "above",
  },
  {
    id: "line-oee",
    label: "Line OEE",
    description: "Overall equipment effectiveness floor",
    unit: "%",
    warning: 80,
    critical: 70,
    direction: "below",
  },
  {
    id: "availability",
    label: "Availability",
    description: "Line uptime against scheduled hours",
    unit: "%",
    warning: 92,
    critical: 85,
    direction: "below",
  },
  {
    id: "pressure-deviation",
    label: "Pressure Deviation",
    description: "Allowable deviation from setpoint pressure",
    unit: "%",
    warning: 8,
    critical: 15,
    direction: "deviation",
  },
];

const INITIAL_NOTIFICATIONS: NotificationSettings = {
  criticalAlerts: true,
  warningAlerts: true,
  downtime: true,
  predictiveMaintenance: true,
  pfmeaCritical: true,
  dailySummary: false,
  weeklyReport: true,
  channelInApp: true,
  channelEmail: true,
  channelOpsDashboard: false,
};

const INITIAL_TELEMETRY: TelemetrySettings = {
  samplingInterval: "5 sec",
  dataRetention: "90 days",
  autoSync: true,
};

const INITIAL_PREFERENCES: UserPreferenceSettings = {
  operatorName: "Operations Manager",
  role: "Plant Operations",
  landingPage: "Overview",
  compactMode: false,
  showClock: true,
  animations: true,
};

const NAV_ITEMS: { id: SectionId; label: string; icon: ReactNode }[] = [
  { id: "general", label: "General", icon: <SettingsIcon className="h-4 w-4" /> },
  { id: "plant", label: "Plant Configuration", icon: <Factory className="h-4 w-4" /> },
  { id: "thresholds", label: "Alert Thresholds", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "telemetry", label: "Data & Telemetry", icon: <Database className="h-4 w-4" /> },
  { id: "preferences", label: "User Preferences", icon: <User className="h-4 w-4" /> },
];

/* ------------------------------------------------------------------ */
/* Small field primitives                                              */
/* ------------------------------------------------------------------ */

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
      {children}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/80 outline-none focus:border-cyan-400/40"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/80 outline-none focus:border-cyan-400/40"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-xs text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-9 text-sm text-white/80 outline-none focus:border-cyan-400/40"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0a1120]">
              {o}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-white/30" />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
      <div>
        <div className="text-sm font-medium text-white/80">{label}</div>
        {description && <div className="mt-0.5 text-xs text-white/40">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          checked ? "border-cyan-400/40 bg-cyan-500/40" : "border-white/10 bg-white/[0.06]"
        }`}
      >
        <span
  className={`absolute left-0.5 top-0.5 rounded-full bg-white shadow-md transition-transform ${
    checked ? "translate-x-5" : "translate-x-0"
  }`}
  style={{ height: "18px", width: "18px" }}
/>
      </button>
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
  onReset,
  onSave,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 text-xs text-white/40">{description}</p>

      <div className="mt-6">{children}</div>

      <div className="mt-7 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-white/80"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Changes
        </button>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/25"
        >
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("general");

  const [general, setGeneral] = useState<GeneralSettings>(INITIAL_GENERAL);
  const [plant, setPlant] = useState<PlantConfigSettings>(INITIAL_PLANT);
  const [thresholds, setThresholds] = useState<ThresholdPair[]>(INITIAL_THRESHOLDS);
  const [notifications, setNotifications] = useState<NotificationSettings>(INITIAL_NOTIFICATIONS);
  const [telemetry, setTelemetry] = useState<TelemetrySettings>(INITIAL_TELEMETRY);
  const [preferences, setPreferences] = useState<UserPreferenceSettings>(INITIAL_PREFERENCES);

  const [toastVisible, setToastVisible] = useState(false);

  function showSavedToast() {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  }

  function updateThreshold(id: string, key: "warning" | "critical", value: number) {
    setThresholds((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
  }

  function resetCurrentSection() {
    switch (activeSection) {
      case "general":
        setGeneral(INITIAL_GENERAL);
        break;
      case "plant":
        setPlant(INITIAL_PLANT);
        break;
      case "thresholds":
        setThresholds(INITIAL_THRESHOLDS);
        break;
      case "notifications":
        setNotifications(INITIAL_NOTIFICATIONS);
        break;
      case "telemetry":
        setTelemetry(INITIAL_TELEMETRY);
        break;
      case "preferences":
        setPreferences(INITIAL_PREFERENCES);
        break;
    }
  }

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-[#050912]">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-7 lg:px-8 xl:px-10">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              System Configuration
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold leading-tight text-white sm:text-[36px]">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              Configure plant preferences, operational thresholds and PackPilot system behavior.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-1.5 sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              System Config · Synchronized
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BODY: NAV + PANEL */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* LEFT NAV */}
          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-2.5">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? "border border-cyan-400/25 bg-cyan-500/10 text-cyan-300"
                          : "border border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                      }`}
                    >
                      <span className={active ? "text-cyan-300" : "text-white/30"}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SYSTEM INFORMATION CARD */}
            <div className="rounded-[20px] border border-white/[0.08] bg-[#090f18]/90 p-5">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-white/40" />
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  System Information
                </span>
              </div>
              <div className="mt-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white">
                PackPilot v1.0
              </div>
              <div className="mt-0.5 text-xs text-white/40">Industry 4.0 Operations Platform</div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">System Status</span>
                  <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">Configuration</span>
                  <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium text-white/60">
                    Local Demo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div>
            {activeSection === "general" && (
              <SectionShell
                title="General"
                description="Core plant identity, locale and telemetry refresh behavior"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Plant Name"
                    value={general.plantName}
                    onChange={(v) => setGeneral((s) => ({ ...s, plantName: v }))}
                  />
                  <TextInput
                    label="Plant Code"
                    value={general.plantCode}
                    onChange={(v) => setGeneral((s) => ({ ...s, plantCode: v }))}
                  />
                  <SelectInput
                    label="Timezone"
                    value={general.timezone}
                    onChange={(v) => setGeneral((s) => ({ ...s, timezone: v }))}
                    options={["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "Europe/London (GMT)", "America/New_York (EST)"]}
                  />
                  <SelectInput
                    label="Operating Mode"
                    value={general.operatingMode}
                    onChange={(v) => setGeneral((s) => ({ ...s, operatingMode: v }))}
                    options={["Continuous Production", "Batch Production", "Scheduled Shifts"]}
                  />
                  <SelectInput
                    label="Default Shift"
                    value={general.defaultShift}
                    onChange={(v) => setGeneral((s) => ({ ...s, defaultShift: v }))}
                    options={["Morning Shift", "Afternoon Shift", "Night Shift"]}
                  />
                  <SelectInput
                    label="Units"
                    value={general.units}
                    onChange={(v) => setGeneral((s) => ({ ...s, units: v }))}
                    options={["Metric", "Imperial"]}
                  />
                  <SelectInput
                    label="Language"
                    value={general.language}
                    onChange={(v) => setGeneral((s) => ({ ...s, language: v }))}
                    options={["English", "Hindi", "German", "Japanese"]}
                  />
                  <SelectInput
                    label="Refresh Interval"
                    value={general.refreshInterval}
                    onChange={(v) => setGeneral((s) => ({ ...s, refreshInterval: v }))}
                    options={["5 sec", "15 sec", "30 sec", "60 sec"]}
                  />
                </div>

                <div className="mt-4">
                  <Toggle
                    checked={general.autoRefresh}
                    onChange={(v) => setGeneral((s) => ({ ...s, autoRefresh: v }))}
                    label="Auto-Refresh Telemetry"
                    description="Continuously poll live sensor and machine data at the configured interval"
                  />
                </div>
              </SectionShell>
            )}

            {activeSection === "plant" && (
              <SectionShell
                title="Plant Configuration"
                description="Production line topology and operational targets"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NumberInput
                    label="Number of Production Lines"
                    value={plant.productionLines}
                    onChange={(v) => setPlant((s) => ({ ...s, productionLines: v }))}
                  />
                  <NumberInput
                    label="Active Zones"
                    value={plant.activeZones}
                    onChange={(v) => setPlant((s) => ({ ...s, activeZones: v }))}
                  />
                  <NumberInput
                    label="Target OEE"
                    value={plant.targetOee}
                    onChange={(v) => setPlant((s) => ({ ...s, targetOee: v }))}
                    suffix="%"
                  />
                  <NumberInput
                    label="Target Availability"
                    value={plant.targetAvailability}
                    onChange={(v) => setPlant((s) => ({ ...s, targetAvailability: v }))}
                    suffix="%"
                  />
                  <NumberInput
                    label="Planned Production Hours / Day"
                    value={plant.plannedHours}
                    onChange={(v) => setPlant((s) => ({ ...s, plannedHours: v }))}
                    suffix="hrs"
                  />
                  <TextInput
                    label="Maintenance Window"
                    value={plant.maintenanceWindow}
                    onChange={(v) => setPlant((s) => ({ ...s, maintenanceWindow: v }))}
                  />
                </div>

                <div className="mt-4">
                  <Toggle
                    checked={plant.energyMonitoring}
                    onChange={(v) => setPlant((s) => ({ ...s, energyMonitoring: v }))}
                    label="Energy Monitoring"
                    description="Track power draw across production lines and packaging cells"
                  />
                </div>
              </SectionShell>
            )}

            {activeSection === "thresholds" && (
              <SectionShell
                title="Alert Thresholds"
                description="Warning and critical setpoints that drive plant-wide alerting"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="space-y-3.5">
                  {thresholds.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="text-sm font-medium text-white/80">{t.label}</div>
                          <div className="mt-0.5 text-xs text-white/40">{t.description}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:w-72">
                          <div>
                            <span className="mb-1.5 flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                              Warning
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={t.warning}
                                onChange={(e) => updateThreshold(t.id, "warning", Number(e.target.value))}
                                className="w-full rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-sm font-medium text-amber-200 outline-none focus:border-amber-400/50"
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px] text-amber-300/50">
                                {t.direction === "deviation" ? `±${t.unit}` : t.unit}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="mb-1.5 flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-rose-300/80">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                              Critical
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={t.critical}
                                onChange={(e) => updateThreshold(t.id, "critical", Number(e.target.value))}
                                className="w-full rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-3 py-2 text-sm font-medium text-rose-200 outline-none focus:border-rose-400/50"
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px] text-rose-300/50">
                                {t.direction === "deviation" ? `±${t.unit}` : t.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-white/25">
                        {t.direction === "below"
                          ? "Alerts trigger when the metric falls below threshold"
                          : t.direction === "above"
                          ? "Alerts trigger when the metric exceeds threshold"
                          : "Alerts trigger when deviation from setpoint exceeds threshold"}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionShell>
            )}

            {activeSection === "notifications" && (
              <SectionShell
                title="Notifications"
                description="Alert routing preferences and delivery channels"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="space-y-2.5">
                  <Toggle
                    checked={notifications.criticalAlerts}
                    onChange={(v) => setNotifications((s) => ({ ...s, criticalAlerts: v }))}
                    label="Critical Alerts"
                    description="Immediate notification for critical machine or process events"
                  />
                  <Toggle
                    checked={notifications.warningAlerts}
                    onChange={(v) => setNotifications((s) => ({ ...s, warningAlerts: v }))}
                    label="Warning Alerts"
                    description="Notify when a metric crosses a warning threshold"
                  />
                  <Toggle
                    checked={notifications.downtime}
                    onChange={(v) => setNotifications((s) => ({ ...s, downtime: v }))}
                    label="Machine Downtime"
                    description="Notify on unplanned stoppages across production lines"
                  />
                  <Toggle
                    checked={notifications.predictiveMaintenance}
                    onChange={(v) => setNotifications((s) => ({ ...s, predictiveMaintenance: v }))}
                    label="Predictive Maintenance"
                    description="Early-warning notifications from condition-based monitoring"
                  />
                  <Toggle
                    checked={notifications.pfmeaCritical}
                    onChange={(v) => setNotifications((s) => ({ ...s, pfmeaCritical: v }))}
                    label="PFMEA Critical Risks"
                    description="Notify when a failure mode is reclassified as critical risk"
                  />
                  <Toggle
                    checked={notifications.dailySummary}
                    onChange={(v) => setNotifications((s) => ({ ...s, dailySummary: v }))}
                    label="Daily Production Summary"
                    description="End-of-day rollup of output, OEE and downtime"
                  />
                  <Toggle
                    checked={notifications.weeklyReport}
                    onChange={(v) => setNotifications((s) => ({ ...s, weeklyReport: v }))}
                    label="Weekly Performance Report"
                    description="Consolidated plant performance report every Monday"
                  />
                </div>

                <div className="mt-6">
                  <div className="mb-2.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Notification Channels
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <Toggle
                      checked={notifications.channelInApp}
                      onChange={(v) => setNotifications((s) => ({ ...s, channelInApp: v }))}
                      label="In-App"
                    />
                    <Toggle
                      checked={notifications.channelEmail}
                      onChange={(v) => setNotifications((s) => ({ ...s, channelEmail: v }))}
                      label="Email"
                    />
                    <Toggle
                      checked={notifications.channelOpsDashboard}
                      onChange={(v) => setNotifications((s) => ({ ...s, channelOpsDashboard: v }))}
                      label="Operations Dashboard"
                    />
                  </div>
                </div>
              </SectionShell>
            )}

            {activeSection === "telemetry" && (
              <SectionShell
                title="Data & Telemetry"
                description="Sensor network status, sampling behavior and retention policy"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                  <TelemetryStat icon={<Radio className="h-4 w-4" />} label="Telemetry Status" value="Connected" accent="emerald" />
                  <TelemetryStat icon={<Activity className="h-4 w-4" />} label="Sensor Network" value="126 endpoints" accent="cyan" />
                  <TelemetryStat icon={<Database className="h-4 w-4" />} label="Sampling Interval" value="5 sec" accent="cyan" />
                  <TelemetryStat icon={<Database className="h-4 w-4" />} label="Data Retention" value="90 days" accent="cyan" />
                  <TelemetryStat icon={<Activity className="h-4 w-4" />} label="Last Synchronization" value="28 sec ago" accent="emerald" />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectInput
                    label="Sampling Interval"
                    value={telemetry.samplingInterval}
                    onChange={(v) => setTelemetry((s) => ({ ...s, samplingInterval: v }))}
                    options={["1 sec", "5 sec", "10 sec", "30 sec"]}
                  />
                  <SelectInput
                    label="Data Retention"
                    value={telemetry.dataRetention}
                    onChange={(v) => setTelemetry((s) => ({ ...s, dataRetention: v }))}
                    options={["30 days", "90 days", "180 days", "365 days"]}
                  />
                </div>

                <div className="mt-4">
                  <Toggle
                    checked={telemetry.autoSync}
                    onChange={(v) => setTelemetry((s) => ({ ...s, autoSync: v }))}
                    label="Automatic Synchronization"
                    description="Continuously sync sensor telemetry with the historian database"
                  />
                </div>

                <button
                  onClick={showSavedToast}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-white/60 transition hover:bg-white/[0.06] hover:text-white/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Telemetry Configuration
                </button>
              </SectionShell>
            )}

            {activeSection === "preferences" && (
              <SectionShell
                title="User Preferences"
                description="Personal interface and workspace behavior"
                onReset={resetCurrentSection}
                onSave={showSavedToast}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Operator Name"
                    value={preferences.operatorName}
                    onChange={(v) => setPreferences((s) => ({ ...s, operatorName: v }))}
                  />
                  <TextInput
                    label="Role"
                    value={preferences.role}
                    onChange={(v) => setPreferences((s) => ({ ...s, role: v }))}
                  />
                  <SelectInput
                    label="Default Landing Page"
                    value={preferences.landingPage}
                    onChange={(v) => setPreferences((s) => ({ ...s, landingPage: v }))}
                    options={["Overview", "Production Lines", "Machines", "OEE", "Alerts", "Reports"]}
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  <Toggle
                    checked={preferences.compactMode}
                    onChange={(v) => setPreferences((s) => ({ ...s, compactMode: v }))}
                    label="Compact Dashboard Mode"
                    description="Reduce panel padding and density for smaller displays"
                  />
                  <Toggle
                    checked={preferences.showClock}
                    onChange={(v) => setPreferences((s) => ({ ...s, showClock: v }))}
                    label="Show Live Clock"
                    description="Display real-time plant clock in the navigation bar"
                  />
                  <Toggle
                    checked={preferences.animations}
                    onChange={(v) => setPreferences((s) => ({ ...s, animations: v }))}
                    label="Enable Interface Animations"
                    description="Smooth transitions, glows and live status indicators"
                  />
                </div>
              </SectionShell>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUCCESS TOAST */}
      {/* ============================================================ */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#0a1120] px-4 py-3 shadow-[0_0_24px_rgba(52,211,153,0.15)]">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span className="text-sm font-medium text-white/85">Configuration saved successfully</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Telemetry stat card                                                 */
/* ------------------------------------------------------------------ */

function TelemetryStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: "cyan" | "emerald";
}) {
  const accentMap = {
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  };
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${accentMap[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-2.5 font-[family-name:var(--font-display)] text-lg font-semibold text-white">{value}</div>
    </div>
  );
}