"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} toggle={() => setIsCollapsed(!isCollapsed)} />
      <main 
        className={cn(
            "flex-1 flex flex-col h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed ? "pl-20" : "pl-64"
        )}
      >
        <div className="flex-1 overflow-y-auto">
             {children}
        </div>
        {footer}
      </main>
    </div>
  );
}
