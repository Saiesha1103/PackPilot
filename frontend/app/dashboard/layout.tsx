"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040810]">
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <DashboardNavbar
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main className="relative flex-1">{children}</main>
      </div>
    </div>
  );
}