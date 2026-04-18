import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo-igh-tour.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Login — IGH Tour Admin" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Akun berhasil dibuat. Silakan login.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Selamat datang di IGH Tour Dashboard");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "var(--gradient-glow)" }}
      />
      <Card className="relative w-full max-w-md overflow-hidden border-border/60 bg-gradient-card p-8 shadow-elegant">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src={logo} alt="IGH Tour" className="h-24 w-auto" />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-gradient-gold">IGH TOUR</span>
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Admin Dashboard · Bintang 5
            </p>
          </div>
        </div>

        <div className="mb-5 flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              mode === "signin"
                ? "bg-gradient-gold text-gold-foreground shadow-gold"
                : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-gradient-gold text-gold-foreground shadow-gold"
                : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Admin IGH Tour"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ightour.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90"
          >
            {submitting ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          User pertama yang mendaftar otomatis menjadi <strong>admin</strong>.
        </p>
        <Link
          to="/"
          className="mt-3 block text-center text-xs text-primary hover:underline"
        >
          ← Kembali ke beranda
        </Link>
      </Card>
    </div>
  );
}
