"use client";

import { motion } from "framer-motion";

// All effects are scoped to the region where the holographic digital-twin
// overlay actually sits in the source photo — never the full frame, and
// never the conveyor/cartons — via screen-blend so they only add light.
const HOLOGRAM_REGION = { left: "30%", top: "12%", width: "44%", height: "48%" };

const RINGS = [
  { delay: 0, duration: 4.2 },
  { delay: 1.4, duration: 4.2 },
  { delay: 2.8, duration: 4.2 },
];

const PARTICLES = [
  { top: "22%", left: "34%", dx: 90, dy: 14, duration: 4.5, delay: 0 },
  { top: "34%", left: "40%", dx: 120, dy: -10, duration: 5.2, delay: 0.8 },
  { top: "28%", left: "46%", dx: 100, dy: 22, duration: 4.8, delay: 1.6 },
  { top: "40%", left: "38%", dx: 80, dy: 30, duration: 5.6, delay: 2.4 },
  { top: "18%", left: "50%", dx: 70, dy: 18, duration: 4.9, delay: 3.2 },
];

export function HologramEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] mix-blend-screen">
      {/* Expanding rings — the digital twin "breathing" */}
      <div
        className="absolute flex items-center justify-center"
        style={HOLOGRAM_REGION}
      >
        {RINGS.map((ring, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-cyan-accent/40"
            style={{ width: "30%", height: "30%" }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 2.2], opacity: [0, 0.35, 0] }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: ring.delay,
            }}
          />
        ))}
      </div>

      {/* Glowing particles drifting along the digital data lines */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-cyan-accent"
          style={{
            top: p.top,
            left: p.left,
            boxShadow: "0 0 6px 1.5px rgba(63,198,224,0.85)",
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.9, 0],
            x: [0, p.dx],
            y: [0, p.dy],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export function ScanWave() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-y-0 left-[16%] z-[2] w-[18%] mix-blend-screen"
      style={{
        background:
          "linear-gradient(100deg, transparent 0%, rgba(120,215,235,0.16) 45%, rgba(190,240,250,0.22) 50%, rgba(120,215,235,0.16) 55%, transparent 100%)",
        filter: "blur(6px)",
        transform: "skewX(-12deg)",
      }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: ["0%", "340%"], opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 2.6,
        times: [0, 0.15, 0.85, 1],
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 7,
      }}
    />
  );
}
