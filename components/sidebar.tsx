"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart3, Brain, Globe, FileQuestion } from "lucide-react";

const navigation = [
  { name: "My Decks", href: "/decks", icon: BookOpen },
  { name: "Browse", href: "/browse", icon: Globe },
  { name: "Study", href: "/study", icon: Brain },
  { name: "Mock Tests", href: "/tests", icon: FileQuestion },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  toggle: () => void;
}

export function Sidebar({ isCollapsed, toggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
        className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300 z-30",
            isCollapsed ? "w-20" : "w-64"
        )}
    >
      <div className="absolute -right-3 top-6 z-40">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full shadow-md border-0 bg-background hover:bg-accent ring-1 ring-border"
          onClick={toggle}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "h-6 w-6" : "")} />
              {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-14 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md border z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
