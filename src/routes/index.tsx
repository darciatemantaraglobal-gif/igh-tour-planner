import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, Users, FileText, Sparkles } from "lucide-react";
import logo from "@/assets/logo-igh-tour.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "IGH Tour — Premium Umrah Bintang 5 Calculator & Manifest" },
      {
        name: "description",
        content:
          "Platform resmi IGH Tour untuk kelola paket Umrah premium Bintang 5: tiered pricing calculator, manifest jamaah, dan PDF quotation otomatis.",
      },
      { property: "og:title", content: "IGH Tour Admin Platform" },
      {
        property: "og:description",
        content:
          "Pilihanmu untuk menjelajah Timur Tengah. Calculator LA, manifest jamaah, dan quotation PDF dalam satu dashboard premium.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-60"
        style={{ background: "var(--gradient-glow)" }}
      />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IGH Tour" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold tracking-wider text-primary">
              IGH TOUR
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Premium Bintang 5
            </p>
          </div>
        </div>
        <Link to="/login">
          <Button className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90">
            Login Admin <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-20 text-center md:pt-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Official Platform · Operational Juli 2026
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-gradient-gold">Pilihanmu</span> untuk menjelajah{" "}
          <span className="text-gradient-gold">Timur Tengah</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Sistem manajemen paket Umrah premium yang menghitung land arrangement
          otomatis, kelola jamaah, dan generate quotation PDF — semua dalam satu
          dashboard elegan.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login">
            <Button
              size="lg"
              className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90"
            >
              Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-primary/40 hover:bg-primary/10"
            >
              Daftar sebagai Admin
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Calculator,
              title: "Tiered LA Calculator",
              desc: "9 tier harga otomatis dari 12 sampai 47 PAX. Multi-currency USD/IDR/SAR realtime.",
            },
            {
              icon: Users,
              title: "Manifest & Document Vault",
              desc: "Kelola jamaah per bulan keberangkatan, upload passport & foto, tracking progress visual.",
            },
            {
              icon: FileText,
              title: "PDF Quotation Otomatis",
              desc: "Generate quotation branded IGH Tour dengan inclusion/exclusion lengkap dalam 1 klik.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-soft transition-all hover:border-primary/40 hover:shadow-gold"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
                <Icon className="h-6 w-6 text-gold-foreground" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IGH Tour · Premium Umrah Bintang 5
      </footer>
    </div>
  );
}
