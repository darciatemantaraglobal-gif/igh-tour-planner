import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Calculator,
  Users,
  FileText,
  ArrowRight,
  Building2,
  Plus,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard — IGH Tour" }],
  }),
});

interface Group {
  id: string;
  name: string;
  departure_month: string;
  pax_target: number;
  hotel_makkah: string | null;
  hotel_madinah: string | null;
  jamaah_count?: number;
}

interface Stats {
  groups: number;
  jamaah: number;
  quotations: number;
}

function DashboardPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<Stats>({ groups: 0, jamaah: 0, quotations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [groupsRes, j, q] = await Promise.all([
        supabase
          .from("groups")
          .select("*, jamaah(count)")
          .order("departure_month", { ascending: true })
          .limit(6),
        supabase.from("jamaah").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }),
      ]);

      const list = (groupsRes.data ?? []).map((g) => ({
        ...g,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jamaah_count: (g as any).jamaah?.[0]?.count ?? 0,
      }));

      setGroups(list);
      setStats({
        groups: groupsRes.count ?? list.length,
        jamaah: j.count ?? 0,
        quotations: q.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "Admin";

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Welcome heading */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome, <span className="capitalize">{displayName}</span>!
          </h1>
        </div>

        {/* Intro panel — Mentalthy "Find the best psychologist..." equivalent */}
        <Card className="border-border bg-secondary/40 p-6 shadow-none">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Kelola paket Umrah <span className="font-semibold text-foreground">Bintang 5</span> lo
            dari satu tempat. Hitung land arrangement otomatis, kelola manifest jamaah,
            dan generate quotation PDF — semua tinggal sekali klik.
          </p>

          {/* Quick stats inline (replaces filter row) */}
          <div className="mt-5 grid gap-3 rounded-2xl bg-card p-3 shadow-soft sm:grid-cols-4">
            <QuickStat
              label="Active Groups"
              value={loading ? "…" : stats.groups}
              to="/manifest"
            />
            <Divider />
            <QuickStat
              label="Total Jamaah"
              value={loading ? "…" : stats.jamaah}
              to="/manifest"
            />
            <QuickStat
              label="Quotations"
              value={loading ? "…" : stats.quotations}
              to="/quotations"
              cta
            />
          </div>
        </Card>

        {/* Active Groups — "Best for you" equivalent */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight">
                Active Groups
              </h2>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {loading ? "…" : stats.groups}
              </span>
            </div>
            <Link to="/manifest">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-secondary text-foreground hover:bg-accent"
              >
                See all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : groups.length === 0 ? (
            <Card className="border-dashed bg-card p-12 text-center shadow-none">
              <Sparkles className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold">Belum ada grup keberangkatan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mulai dengan bikin grup bulanan pertama lo.
              </p>
              <Link to="/manifest" className="mt-4 inline-block">
                <Button className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> Buat Grup Pertama
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <ActionCard
              icon={Calculator}
              title="Hitung LA Package"
              desc="Tiered pricing 12-47 PAX, multi-currency realtime."
              to="/calculator"
            />
            <ActionCard
              icon={Users}
              title="Kelola Manifest"
              desc="Tambah grup, jamaah, upload passport."
              to="/manifest"
            />
            <ActionCard
              icon={FileText}
              title="Lihat Quotations"
              desc="Riwayat quotation PDF yang sudah dibuat."
              to="/quotations"
            />
          </div>
        </section>
      </div>
    </ProtectedLayout>
  );
}

function QuickStat({
  label,
  value,
  to,
  cta = false,
}: {
  label: string;
  value: string | number;
  to: string;
  cta?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
        cta ? "bg-primary text-primary-foreground hover:opacity-90" : "hover:bg-secondary"
      }`}
    >
      <div>
        <p
          className={`text-[10px] uppercase tracking-wider ${
            cta ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xl font-extrabold tabular-nums">{value}</p>
      </div>
      <ArrowRight className="h-4 w-4 opacity-60" />
    </Link>
  );
}

function Divider() {
  return <div className="hidden w-px self-stretch bg-border sm:block" />;
}

function GroupCard({ group: g }: { group: Group }) {
  const filled = g.jamaah_count ?? 0;
  const pct = g.pax_target > 0 ? Math.min(100, (filled / g.pax_target) * 100) : 0;
  return (
    <Link to="/manifest/$groupId" params={{ groupId: g.id }}>
      <Card className="group h-full cursor-pointer border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {format(new Date(g.departure_month), "MMMM yyyy", {
                locale: idLocale,
              })}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-tight">{g.name}</h3>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {(g.hotel_makkah || g.hotel_madinah) && (
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {g.hotel_makkah && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> Makkah: {g.hotel_makkah}
              </div>
            )}
            {g.hotel_madinah && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> Madinah: {g.hotel_madinah}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" /> {filled} / {g.pax_target} PAX
            </span>
            <span className="font-bold text-primary">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-gold transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
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
      <Card className="group cursor-pointer border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
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
