import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar, Users, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/manifest")({
  component: ManifestPage,
  head: () => ({ meta: [{ title: "Manifest — IGH Tour" }] }),
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

function ManifestPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [paxTarget, setPaxTarget] = useState(28);
  const [makkah, setMakkah] = useState("Pullman Zamzam");
  const [madinah, setMadinah] = useState("Frontel Al Harithia");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("groups")
      .select("*, jamaah(count)")
      .order("departure_month", { ascending: true });
    if (error) {
      toast.error(error.message);
    } else {
      setGroups(
        (data ?? []).map((g) => ({
          ...g,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jamaah_count: (g as any).jamaah?.[0]?.count ?? 0,
        })),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month) return toast.error("Pilih bulan keberangkatan.");
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("groups").insert({
      name,
      departure_month: `${month}-01`,
      pax_target: paxTarget,
      hotel_makkah: makkah,
      hotel_madinah: madinah,
      created_by: userData.user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Grup baru berhasil dibuat!");
    setOpen(false);
    setName("");
    setMonth("");
    load();
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Manifest System
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              <span className="text-gradient-gold">Monthly Groups</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola jamaah per bulan keberangkatan + LifeGame progress tracker.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Grup Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-card">
              <DialogHeader>
                <DialogTitle>Buat Grup Bulanan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Nama Grup</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Umrah Premium Juli 2026"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Bulan Keberangkatan</Label>
                    <Input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Target PAX</Label>
                    <Input
                      type="number"
                      min={12}
                      max={47}
                      value={paxTarget}
                      onChange={(e) => setPaxTarget(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Hotel Makkah</Label>
                    <Input value={makkah} onChange={(e) => setMakkah(e.target.value)} />
                  </div>
                  <div>
                    <Label>Hotel Madinah</Label>
                    <Input value={madinah} onChange={(e) => setMadinah(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-gradient-gold font-bold text-gold-foreground"
                  >
                    Buat Grup
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-border bg-gradient-card p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">Belum ada grup</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mulai dengan bikin grup keberangkatan pertama.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => {
              const filled = g.jamaah_count ?? 0;
              const pct = g.pax_target > 0 ? Math.min(100, (filled / g.pax_target) * 100) : 0;
              return (
                <Link
                  key={g.id}
                  to="/manifest/$groupId"
                  params={{ groupId: g.id }}
                >
                  <Card className="group h-full cursor-pointer border-border bg-gradient-card p-5 shadow-soft transition-all hover:border-primary/40 hover:shadow-gold">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-primary">
                          {format(new Date(g.departure_month), "MMMM yyyy", {
                            locale: idLocale,
                          })}
                        </p>
                        <h3 className="mt-1 text-lg font-bold">{g.name}</h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
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
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-gold transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
