import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calculator,
  Users,
  FileText,
  LogOut,
  Settings,
  FolderArchive,
  Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Countdown } from "@/components/Countdown";
import logo from "@/assets/logo-igh-tour.png";

const NAV_GENERAL = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/manifest", label: "Groups", icon: Users },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/quotations", label: "Quotations", icon: FileText },
] as const;

const NAV_TOOLS = [
  { to: "/manifest", label: "Documents", icon: FolderArchive },
  { to: "/dashboard", label: "Settings", icon: Settings },
] as const;

const launchDate = new Date("2026-07-01T00:00:00+07:00");

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initial = (user?.email ?? "A").charAt(0).toUpperCase();
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <img src={logo} alt="IGH Tour" className="h-9 w-auto" />
          <div>
            <p className="text-base font-extrabold tracking-tight text-primary">
              IGH Tour<span className="text-foreground">.</span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <SectionLabel>General</SectionLabel>
          <nav className="mt-2 space-y-1">
            {NAV_GENERAL.map(({ to, label, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                activeProps={{
                  className:
                    "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                }}
                inactiveProps={{
                  className:
                    "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
          </nav>

          <SectionLabel className="mt-6">Tools</SectionLabel>
          <nav className="mt-2 space-y-1">
            {NAV_TOOLS.map(({ to, label, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                inactiveProps={{
                  className:
                    "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Countdown widget */}
          <div className="mt-6 rounded-2xl border border-sidebar-border bg-gradient-warm p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Launch Countdown
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              1 Juli 2026
            </p>
            <div className="mt-3 scale-90 origin-left">
              <Countdown target={launchDate} compact />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px]" /> Log out
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="IGH Tour" className="h-8 w-auto" />
          <span className="text-sm font-extrabold text-primary">
            IGH Tour<span className="text-foreground">.</span>
          </span>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </header>
      <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-3 py-2 backdrop-blur lg:hidden">
        {NAV_GENERAL.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </Link>
        ))}
      </nav>

      <main className="lg:ml-64">
        {/* Desktop topbar — bell + avatar (Mentalthy-style) */}
        <div className="sticky top-0 z-20 hidden items-center justify-end gap-3 border-b border-border bg-background/80 px-8 py-4 backdrop-blur lg:flex">
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          </button>
          <div
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold text-sm font-bold text-gold-foreground shadow-soft"
            title={displayName}
          >
            {initial}
          </div>
        </div>
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground ${className}`}
    >
      {children}
    </p>
  );
}
