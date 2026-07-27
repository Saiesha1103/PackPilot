"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  Package,
  Thermometer,
  Droplets,
  HeartPulse,
  CirclePlay,
  TrendingUp,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { cn } from "@/lib/utils";

type Metric =
  | {
      id: string;
      icon: React.ElementType;
      label: string;
      kind: "number";
      value: number;
      decimals?: number;
      suffix?: string;
      note: string;
      noteTone: "good" | "neutral";
      delta?: string;
    }
  | {
      id: string;
      icon: React.ElementType;
      label: string;
      kind: "status";
      value: string;
      note: string;
      noteTone: "good" | "neutral";
    };

const METRICS: Metric[] = [
  {
    id: "oee",
    icon: Gauge,
    label: "OEE",
    kind: "number",
    value: 84.2,
    decimals: 1,
    suffix: "%",
    note: "vs. last shift",
    noteTone: "good",
    delta: "+6.3%",
  },
  {
    id: "production",
    icon: Package,
    label: "Production",
    kind: "number",
    value: 8542,
    decimals: 0,
    suffix: " ctn",
    note: "current shift",
    noteTone: "neutral",
  },
  {
    id: "temperature",
    icon: Thermometer,
    label: "Temperature",
    kind: "number",
    value: 28.5,
    decimals: 1,
    suffix: "°C",
    note: "Optimal",
    noteTone: "good",
  },
  {
    id: "humidity",
    icon: Droplets,
    label: "Humidity",
    kind: "number",
    value: 56,
    decimals: 0,
    suffix: "%",
    note: "Normal",
    noteTone: "neutral",
  },
  {
    id: "machine-health",
    icon: HeartPulse,
    label: "Machine Health",
    kind: "status",
    value: "Healthy",
    note: "All systems normal",
    noteTone: "good",
  },
  {
    id: "line-status",
    icon: CirclePlay,
    label: "Line Status",
    kind: "status",
    value: "Running",
    note: "No active faults",
    noteTone: "good",
  },
];

// AR-style scatter around the machinery instead of a stacked right edge.
// Plain percentages here — the overlay container below applies real CSS
// padding, and per the CSS spec an absolutely positioned element's top /
// right / bottom / left percentages resolve against its containing block's
// *padding box*. So every card is automatically kept at least that padding
// away from the container's true edge; no per-card clamping needed.
const PLACEMENT: Record<string, string> = {
  oee: "top-[10%] left-[54%]",

  production: "top-[18%] left-[76%]",

  temperature: "top-[45%] left-[60%]",

  humidity: "top-[72%] left-[52%] hidden sm:block",

  "machine-health": "top-[60%] left-[78%]",

  "line-status": "top-[84%] left-[72%] hidden sm:block",
};
const FLOAT_DURATION = [6, 7, 8, 6.5, 7.5, 8.5];

export function HeroKpiStack() {
  return (
    // Fills the hero image container exactly (inset-0) — nothing more,
    // never the browser viewport. The clamp() padding is real CSS padding,
    // not an inset offset, which is what makes it double as the containing
    // block for the cards' percentage positions (see note above): every
    // card keeps at least 40px from every edge of this overlay, at any of
    // 1440 / 1536 / 1600 / 1920+ screen widths.
    <div className="pointer-events-none absolute inset-0 z-10 p-[clamp(40px,4%,64px)]">
      {METRICS.map((metric, i) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.6 + i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn("pointer-events-auto absolute", PLACEMENT[metric.id])}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
            transition={{
              y: {
                duration: FLOAT_DURATION[i],
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              },
              scale: { type: "spring", stiffness: 320, damping: 20 },
              filter: { duration: 0.2 },
            }}
            className="hmi-panel-sm w-[104px] cursor-default px-2.5 py-2 opacity-95 transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(63,198,224,0.16),0_0_28px_0_rgba(63,198,224,0.22)] sm:w-[116px]"
          >
            <div className="flex items-center gap-1 pl-1">
              <metric.icon
                size={9}
                strokeWidth={1.75}
                className="shrink-0 text-cyan-accent/80"
              />
              <span className="truncate font-mono text-[7.5px] uppercase tracking-[0.06em] text-steel-400">
                {metric.label}
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-1 pl-1">
              {metric.kind === "number" ? (
                <CountUp
                  value={metric.value}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                  className="font-display text-[13px] font-semibold text-white"
                  delay={0.65 + i * 0.1}
                />
              ) : (
                <span className="font-display text-[13px] font-semibold text-white">
                  {metric.value}
                </span>
              )}
              {"delta" in metric && metric.delta && (
                <span className="flex items-center gap-0.5 font-mono text-[7.5px] text-status-good">
                  <TrendingUp size={8} strokeWidth={2} />
                  {metric.delta}
                </span>
              )}
            </div>

            <div
              className={cn(
                "mt-0.5 truncate pl-1 font-mono text-[7.5px]",
                metric.noteTone === "good" ? "text-status-good" : "text-steel-400"
              )}
            >
              {metric.note}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
