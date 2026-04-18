import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateQuotationPdf } from "@/lib/pdf-quotation";
import { formatCurrency, type AdditionalServices, type Currency } from "@/lib/pricing";
import { Download, FileText, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/quotations")({
  component: QuotationsPage,
  head: () => ({ meta: [{ title: "Quotations — IGH Tour" }] }),
});

interface Quotation {
  id: string;
  client_name: string;
  pax: number;
  hotel_makkah: string | null;
  hotel_madinah: string | null;
  quad_price: number;
  triple_price: number;
  double_price: number;
  currency: string;
  fx_rate: number;
  additional_services: Record<string, number> | null;
  created_at: string;
}

function QuotationsPage() {
  const [items, setItems] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as unknown as Quotation[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleDownload = (q: Quotation) => {
    const add = (q.additional_services ?? {}) as Partial<AdditionalServices>;
    const doc = generateQuotationPdf({
      clientName: q.client_name,
      pax: q.pax,
      hotelMakkah: q.hotel_makkah ?? "",
      hotelMadinah: q.hotel_madinah ?? "",
      quad: Number(q.quad_price),
      triple: Number(q.triple_price),
      double: Number(q.double_price),
      additional: {
        visa: add.visa ?? 0,
        muthowif: add.muthowif ?? 0,
        siskopatuh: add.siskopatuh ?? 0,
        handling: add.handling ?? 0,
      },
      currency: q.currency as Currency,
      fxRate: Number(q.fx_rate),
    });
    doc.save(`IGH-Quotation-${q.client_name.replace(/\s+/g, "-")}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus quotation ini?")) return;
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Quotation dihapus");
    load();
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Saved Quotations
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              <span className="text-gradient-gold">Quotation Library</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua quotation tersimpan, siap di-download ulang.
            </p>
          </div>
          <Link to="/calculator">
            <Button className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90">
              <Calculator className="mr-2 h-4 w-4" /> Buat Quotation Baru
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <Card className="border-dashed border-border bg-gradient-card p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">Belum ada quotation tersimpan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mulai dari LA Calculator dan klik "Save Quotation".
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((q) => (
              <Card
                key={q.id}
                className="border-border bg-gradient-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{q.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.pax} PAX · {q.hotel_makkah ?? "—"} / {q.hotel_madinah ?? "—"} ·{" "}
                      {format(new Date(q.created_at), "dd MMM yyyy")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md bg-muted px-2 py-1">
                        Quad: {formatCurrency(Number(q.quad_price), q.currency as Currency, Number(q.fx_rate))}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-1">
                        Triple: {formatCurrency(Number(q.triple_price), q.currency as Currency, Number(q.fx_rate))}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-1">
                        Double: {formatCurrency(Number(q.double_price), q.currency as Currency, Number(q.fx_rate))}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(q)}
                      className="bg-gradient-gold font-bold text-gold-foreground"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(q.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
