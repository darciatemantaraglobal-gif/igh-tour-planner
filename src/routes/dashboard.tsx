import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Countdown } from "@/components/Countdown";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Users, FileText, Calendar, ArrowRight, Plane } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard — IGH Tour" }],
  }),
});

interface Stats {
  groups: number;
  jamaah: number;
  quotations: number;
}

function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ groups: 0, jamaah: 0, quotations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [g, j, q] = await Promise.all([
        supabase.from("groups").select("id", { count: "exact", head: true }),
        supabase.from("jamaah").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        groups: g.count ?? 0,
        jamaah: j.count ?? 0,
        quotations: q.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  // First operational target: 1 July 2026
  const launchDate = new Date("2026-07-01T00:00:00+07:00");

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Welcome back
          </p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
            <span className="text-gradient-gold">IGH Tour</span> Command Center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola paket Umrah Bintang 5 lo dari satu tempat — dari kalkulasi
            harga sampai manifest jamaah.
          </p>
        </div>

        {/* Countdown */}
        <Card className="overflow-hidden border-primary/30 bg-gradient-card p-6 shadow-elegant">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-gold p-3 shadow-gold">
                <Plane className="h-6 w-6 text-gold-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">
                  Operational Launch
                </p>
                <h2 className="mt-1 text-xl font-extrabold md:text-2xl">
                  Target Keberangkatan Perdana
                </h2>
                <p className="text-sm text-muted-foreground">1 Juli 2026</p>
              </div>
            </div>
            <Countdown target={launchDate} />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Calendar}
            label="Active Groups"
            value={loading ? "…" : stats.groups}
            href="/manifest"
          />
          <StatCard
            icon={Users}
            label="Total Jamaah"
            value={loading ? "…" : stats.jamaah}
            href="/manifest"
          />
          <StatCard
            icon={FileText}
            label="Quotations"
            value={loading ? "…" : stats.quotations}
            href="/quotations"
          />
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard
              icon={Calculator}
              title="Hitung LA Package"
              desc="Tiered pricing 12-47 PAX dengan multi-currency realtime."
              to="/calculator"
            />
            <ActionCard
              icon={Users}
              title="Kelola Manifest"
              desc="Tambah grup baru, kelola jamaah, upload dokumen passport."
              to="/manifest"
            />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link to={href}>
      <Card className="group cursor-pointer border-border bg-gradient-card p-6 shadow-soft transition-all hover:border-primary/40 hover:shadow-gold">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <p className="mt-4 text-3xl font-extrabold tabular-nums">{value}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </Card>
    </Link>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer border-border bg-gradient-card p-6 shadow-soft transition-all hover:border-primary/40 hover:shadow-gold">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-gradient-gold p-3 shadow-gold">
            <Icon className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold">{title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </Card>
    </Link>
  );
}
