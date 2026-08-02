"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroKpiStack } from "@/components/hero-kpi-stack";

const HEADLINE = "PackPilot";

const TECH_BADGES = [
  "Industry 4.0",
  "Industrial IoT",
  "OEE",
  "PFMEA",
  "Condition Monitoring",
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.35 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

// CTAs and tech badges get their own short stagger so each item lands in
// sequence rather than the whole row appearing as one block.
const sequenceContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0 } },
};

const sequenceItem = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE },
  },
};

// Particles drifting along the digital data lines near the hologram —
// small, short, staggered loops so they read as flowing data, not fireflies.
const PARTICLES = [
  { top: "16%", left: "34%", dx: 22, dy: -6, duration: 3.4, delay: 0 },
  { top: "22%", left: "40%", dx: 26, dy: 8, duration: 4.1, delay: 0.6 },
  { top: "30%", left: "48%", dx: -20, dy: 10, duration: 3.8, delay: 1.2 },
  { top: "19%", left: "55%", dx: 18, dy: -10, duration: 4.6, delay: 0.3 },
  { top: "35%", left: "38%", dx: 24, dy: -8, duration: 3.6, delay: 1.6 },
  { top: "26%", left: "60%", dx: -16, dy: 12, duration: 4.2, delay: 0.9 },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax — the image drifts slower than the page, never disorienting
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  // Mouse parallax — a few px of drift on the photo only, following the
  // cursor. Springed so it trails smoothly rather than tracking instantly.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18, mass: 0.6 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX * 16);
    mouseY.set(relY * 10);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen flex-col bg-base-950 pt-16 lg:block"
    >
      {/* Engineering blueprint grid — signature background texture behind the left content */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 z-0" />

      {/* RIGHT — hero visual. Bleeds to the viewport edge, no card, no border —
          the line itself is the focal point, the way an Apple product page
          lets the product fill the frame rather than boxing it.
          overflow-hidden here scopes clipping to the hero visual only, never
          to the KPI overlay's safe padding (the overlay is inset-0 within
          this same box, so nothing it contains can exceed these bounds). */}
      <div className="relative order-2 h-[48vh] w-full overflow-hidden sm:h-[56vh] lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:h-full lg:w-[66%]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, ease: EASE }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div
            style={{ y: imageY, scale: imageScale }}
            className="absolute inset-0"
          >
            {/* Fixed-px buffer so the left-shift and mouse parallax below
                never reveal an edge, regardless of container width. Static. */}
            <div className="absolute -inset-x-[150px] inset-y-0 lg:-inset-x-[190px]">
              {/* The requested left shift — brings the machinery in from the
                  right edge so the KPI cards have clean breathing room.
                  Pure CSS, responsive, independent of the motion layers below. */}
              <div className="absolute inset-0 -translate-x-5 sm:-translate-x-10 md:-translate-x-16 lg:-translate-x-[110px]">
                {/* Mouse parallax — the photo only, a few px of drift */}
                <motion.div
                  style={{ x: springX, y: springY }}
                  className="absolute inset-0"
                >
                  {/* Near-imperceptible drift — just enough to read as a
                      running line, never a dramatic pan. The conveyor and
                      machinery themselves stay put; only this whole-photo
                      drift + the mouse parallax above move it. */}
                  <motion.div
                    className="absolute inset-0 scale-[1.025]"
                    animate={{ x: [-3, 3, -3] }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/hero-line.png"
                      alt="PackPilot digital twin overlay on an FMCG packaging conveyor line, showing live OEE and condition-monitoring telemetry"
                      fill
                      priority
                      className="object-cover object-[30%_50%] [filter:contrast(1.22)_brightness(0.86)_saturate(0.94)] lg:object-[34%_48%]"
                      sizes="(min-width: 1024px) 66vw, 100vw"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Cinematic grade — cool shadow tint via soft-light so blacks read
              deeper without crushing detail, plus a corner vignette. Kept
              subtle so nothing here reads as a filter. */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                "linear-gradient(155deg, rgba(70,130,190,0.23) 0%, rgba(10,16,28,0.14) 45%, rgba(0,0,0,0.3) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 75% at 55% 45%, transparent 55%, rgba(4,6,10,0.52) 100%)",
            }}
          />

          {/* Pulsing bloom over the holographic digital-twin overlay only —
              positioned away from the conveyor, screen-blended so it adds
              light rather than washing the scene. */}
          <motion.div
            className="pointer-events-none absolute left-[28%] top-[13%] h-[46%] w-[42%] rounded-full mix-blend-screen"
            style={{
              background:
                "radial-gradient(closest-side, rgba(63,198,224,0.30), rgba(63,198,224,0.08) 60%, transparent 80%)",
              filter: "blur(18px)",
            }}
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute left-[44%] top-[9%] h-[34%] w-[26%] rounded-full mix-blend-screen"
            style={{
              background:
                "radial-gradient(closest-side, rgba(140,225,240,0.24), transparent 75%)",
              filter: "blur(12px)",
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          />

          {/* Radiating rings from the digital twin — a soft sonar-like pulse,
              not a flash. Three rings, staggered, expanding and fading. */}
          <div className="pointer-events-none absolute left-[46%] top-[26%] h-0 w-0 mix-blend-screen">
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-accent/50"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 2.6], opacity: [0, 0.35, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: ring * 2.3,
                }}
              />
            ))}
          </div>

          {/* Glowing particles drifting along the digital data lines */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-cyan-accent mix-blend-screen"
              style={{
                top: p.top,
                left: p.left,
                boxShadow: "0 0 6px 1px rgba(63,198,224,0.9)",
              }}
              animate={{
                x: [0, p.dx, 0],
                y: [0, p.dy, 0],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}

          {/* Scanning wave — a soft diagonal band that sweeps from the
              machinery down across the conveyor, as if the line is being
              scanned in real time. One pass every ~9s, extremely subtle. */}
          <motion.div
            className="pointer-events-none absolute -left-1/4 -top-1/4 h-[160%] w-[45%] mix-blend-screen"
            style={{
              background:
                "linear-gradient(100deg, transparent 40%, rgba(120,220,240,0.16) 50%, transparent 60%)",
              filter: "blur(6px)",
              transform: "rotate(12deg)",
            }}
            animate={{ x: ["-10%", "170%"], opacity: [0, 0.8, 0.8, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 6.4,
              ease: "easeInOut",
              times: [0, 0.15, 0.75, 1],
            }}
          />

          {/* Soft masks — multi-stop, never a hard black edge — the image
              dissolves into the page instead of sitting in a box. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[58%] lg:w-[46%]"
            style={{
              background:
                "linear-gradient(to right, #05070B 0%, rgba(5,7,11,0.86) 28%, rgba(5,7,11,0.52) 52%, rgba(5,7,11,0.18) 75%, transparent 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base-950/90 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-base-950/90 to-transparent lg:h-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-base-950/35 to-transparent" />
        </motion.div>

        {/* KPI overlay — a single absolute layer sized exactly to this hero
            visual (inset-0, nothing more), never to the browser viewport.
            Its own padding (see hero-kpi-stack.tsx) is what guarantees every
            card's 40px minimum margin, and this parent's overflow-hidden
            keeps that guarantee airtight. */}
        <HeroKpiStack />
      </div>

      <div className="container relative z-10 order-1 py-12 lg:order-none lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:py-20">
        {/* LEFT — content */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="relative z-10 max-w-xl"
        >
          <motion.div variants={wordVariants} className="mb-6 inline-flex">
            <span className="hmi-panel flex items-center gap-2 px-4 py-2 pl-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-good/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-good" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-steel-300">
                Industry 4.0 Manufacturing Operations Platform
              </span>
            </span>
          </motion.div>

          <motion.h1
            variants={containerVariants}
            className="font-display text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[3rem] lg:text-[3.35rem]"
          >
            {HEADLINE.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="mr-[0.28em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={wordVariants}
            className="mt-6 max-w-lg text-[15px] leading-relaxed text-steel-400"
          >
            PackPilot unifies Industrial IoT telemetry, real-time OEE analytics,
            PFMEA-driven failure prevention, and continuous condition monitoring
            into a single engineering decision-support system — built for the
            pace and precision of FMCG packaging lines.
          </motion.p>

          <motion.div
            variants={sequenceContainer}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <motion.span
              variants={sequenceItem}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="group">
                  Explore Platform
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Button>
              </Link>
            </motion.span>
            <motion.span
              variants={sequenceItem}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Button variant="secondary" size="lg">
                <GitBranch size={16} strokeWidth={1.75} />
                View Architecture
              </Button>
            </motion.span>
          </motion.div>

          <motion.div
            variants={sequenceContainer}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-hairline pt-6"
          >
            {TECH_BADGES.map((badge) => (
              <motion.span
                key={badge}
                variants={sequenceItem}
                whileHover={{
                  y: -2,
                  borderColor: "rgba(63,198,224,0.4)",
                  color: "#fff",
                }}
                transition={{ duration: 0.2, ease: EASE }}
                className="cursor-default rounded-md border border-hairline bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-steel-400"
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
