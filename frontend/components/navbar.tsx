"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-base-950/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-base-800/80 text-cyan-accent transition-colors group-hover:border-cyan-accent/40">
            <Boxes size={16} strokeWidth={1.75} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-wide text-white">
            Pack<span className="text-cyan-accent">Pilot</span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
