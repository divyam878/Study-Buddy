import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardShell footer={<Footer />}>
        {children}
      </DashboardShell>
      <Toaster />
    </div>
  );
}
