import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, Users, FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-igh-tour.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calculator", label: "LA Calculator", icon: Calculator },
  { to: "/manifest", label: "Manifest", icon: Users },
  { to: "/quotations", label: "Quotations", icon: FileText },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <img src={logo} alt="IGH Tour" className="h-12 w-auto" />
          <div>
            <p className="text-sm font-bold tracking-wider text-primary">IGH TOUR</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Bintang 5
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{
                className:
                  "bg-gradient-gold text-gold-foreground shadow-gold",
              }}
              inactiveProps={{
                className:
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary",
              }}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="IGH Tour" className="h-9 w-auto" />
          <span className="text-sm font-bold text-primary">IGH TOUR</span>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </header>
      <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-3 py-2 backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeProps={{ className: "bg-gradient-gold text-gold-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </Link>
        ))}
      </nav>

      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
