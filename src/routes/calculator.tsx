import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useFxRates } from "@/hooks/useFxRates";
import { supabase } from "@/integrations/supabase/client";
import {
  CURRENCY_SYMBOL,
  DEFAULT_ADDITIONAL,
  PRICE_TIERS,
  findTier,
  formatCurrency,
  type AdditionalServices,
  type Currency,
} from "@/lib/pricing";
import { generateQuotationPdf } from "@/lib/pdf-quotation";
import { Download, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
  head: () => ({ meta: [{ title: "LA Calculator — IGH Tour" }] }),
});

function CalculatorPage() {
  const navigate = useNavigate();
  const fx = useFxRates();
  const [pax, setPax] = useState(28);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [hotelMakkah, setHotelMakkah] = useState("Pullman Zamzam");
  const [hotelMadinah, setHotelMadinah] = useState("Frontel Al Harithia");
  const [clientName, setClientName] = useState("");
  const [additional, setAdditional] = useState<AdditionalServices>(DEFAULT_ADDITIONAL);
  const [saving, setSaving] = useState(false);

  const tier = useMemo(() => findTier(pax), [pax]);
  const fxRate = fx.rates[currency];

  const addPerPax =
    additional.visa + additional.muthowif + additional.siskopatuh + additional.handling;

  const handleDownload = () => {
    if (!tier) {
      toast.error("Minimal 12 PAX untuk dapat tier harga.");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Isi nama client dulu.");
      return;
    }
    const doc = generateQuotationPdf({
      clientName,
      pax,
      hotelMakkah,
      hotelMadinah,
      quad: tier.quad,
      triple: tier.triple,
      double: tier.double,
      additional,
      currency,
      fxRate,
    });
    doc.save(`IGH-Quotation-${clientName.replace(/\s+/g, "-")}-${pax}pax.pdf`);
    toast.success("PDF quotation berhasil di-download!");
  };

  const handleSave = async () => {
    if (!tier) return toast.error("Minimal 12 PAX.");
    if (!clientName.trim()) return toast.error("Isi nama client.");
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("quotations").insert({
      client_name: clientName,
      pax,
      hotel_makkah: hotelMakkah,
      hotel_madinah: hotelMadinah,
      quad_price: tier.quad,
      triple_price: tier.triple,
      double_price: tier.double,
      currency,
      fx_rate: fxRate,
      additional_services: additional as unknown as Record<string, number>,
      created_by: userData.user?.id,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Quotation tersimpan!");
    navigate({ to: "/quotations" });
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Land Arrangement
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              <span className="text-gradient-gold">Tiered Calculator</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium Bintang 5 — Source: Package #3345
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {fx.loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>
              FX:{" "}
              <span className="font-mono text-primary">
                1 USD = {fx.rates.IDR.toFixed(0)} IDR · {fx.rates.SAR.toFixed(2)} SAR
              </span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* INPUTS */}
          <Card className="space-y-6 border-border bg-gradient-card p-6 shadow-soft">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-bold">Jumlah PAX</Label>
                <span className="rounded-md bg-gradient-gold px-3 py-1 text-sm font-extrabold text-gold-foreground shadow-gold">
                  {pax} PAX
                </span>
              </div>
              <Slider
                value={[pax]}
                min={12}
                max={47}
                step={1}
                onValueChange={(v) => setPax(v[0])}
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>12</span>
                <span>20</span>
                <span>28</span>
                <span>36</span>
                <span>47</span>
              </div>
              {tier && (
                <p className="mt-2 text-xs text-primary">
                  Tier aktif: <strong>{tier.minPax}–{tier.maxPax} PAX</strong>
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-sm font-bold">Currency</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["USD", "IDR", "SAR"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`rounded-lg border py-2 text-sm font-bold transition-all ${
                      currency === c
                        ? "border-primary bg-gradient-gold text-gold-foreground shadow-gold"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {CURRENCY_SYMBOL[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="client">Nama Client / Travel Agent</Label>
                <Input
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="PT. Travel Mitra"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="m1">Hotel Makkah</Label>
                  <Input
                    id="m1"
                    value={hotelMakkah}
                    onChange={(e) => setHotelMakkah(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="m2">Hotel Madinah</Label>
                  <Input
                    id="m2"
                    value={hotelMadinah}
                    onChange={(e) => setHotelMadinah(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-bold">
                Additional Services <span className="text-muted-foreground">(USD per pax)</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["visa", "Visa Umroh"],
                    ["muthowif", "Muthowif"],
                    ["siskopatuh", "Siskopatuh"],
                    ["handling", "Handling"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={additional[key]}
                      onChange={(e) =>
                        setAdditional((s) => ({
                          ...s,
                          [key]: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* OUTPUT */}
          <Card className="border-primary/30 bg-gradient-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                Live Quotation
              </h3>
            </div>

            {!tier ? (
              <div className="py-12 text-center text-muted-foreground">
                Minimal 12 PAX untuk dapat tier harga premium.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {(
                    [
                      ["Quad Sharing", tier.quad],
                      ["Triple Sharing", tier.triple],
                      ["Double Sharing", tier.double],
                    ] as const
                  ).map(([label, price]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4"
                    >
                      <div>
                        <p className="font-bold">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(price, currency, fxRate)} LA + {formatCurrency(addPerPax, currency, fxRate)} services
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase text-muted-foreground">Total / pax</p>
                        <p className="text-lg font-extrabold text-gradient-gold">
                          {formatCurrency(price + addPerPax, currency, fxRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-gradient-gold p-5 text-gold-foreground shadow-gold">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                    Estimasi Total Group ({pax} PAX, Quad Base)
                  </p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums">
                    {formatCurrency((tier.quad + addPerPax) * pax, currency, fxRate)}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    disabled={saving}
                    className="flex-1 border-primary/40 hover:bg-primary/10"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Menyimpan…" : "Save Quotation"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Tier reference */}
        <Card className="border-border bg-gradient-card p-6 shadow-soft">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
            Reference: All Pricing Tiers (USD per pax)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2">PAX Range</th>
                  <th className="py-2 text-right">Quad</th>
                  <th className="py-2 text-right">Triple</th>
                  <th className="py-2 text-right">Double</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_TIERS.map((t) => {
                  const active = tier && t.minPax === tier.minPax;
                  return (
                    <tr
                      key={t.minPax}
                      className={`border-b border-border/40 transition-colors ${
                        active ? "bg-primary/15 font-bold text-primary" : ""
                      }`}
                    >
                      <td className="py-2.5">
                        {t.minPax}–{t.maxPax} PAX
                      </td>
                      <td className="py-2.5 text-right tabular-nums">${t.quad}</td>
                      <td className="py-2.5 text-right tabular-nums">${t.triple}</td>
                      <td className="py-2.5 text-right tabular-nums">${t.double}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
