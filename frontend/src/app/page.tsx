"use client";

import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MainContent />
        <Sidebar />
      </div>
    </div>
  );
}
