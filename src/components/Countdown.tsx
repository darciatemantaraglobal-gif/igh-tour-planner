import { useEffect, useState } from "react";

interface CountdownProps {
  target: Date;
  compact?: boolean;
}

export function Countdown({ target, compact = false }: CountdownProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  if (compact) {
    const Mini = ({ value, label }: { value: number; label: string }) => (
      <div className="flex flex-col items-center rounded-lg bg-card px-2 py-1.5 shadow-soft">
        <span className="text-sm font-extrabold tabular-nums text-foreground">
          {value.toString().padStart(2, "0")}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    );
    return (
      <div className="flex gap-1.5">
        <Mini value={days} label="Hari" />
        <Mini value={hours} label="Jam" />
        <Mini value={mins} label="Mnt" />
        <Mini value={secs} label="Dtk" />
      </div>
    );
  }

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-3 py-2 shadow-soft md:px-5 md:py-3">
      <span className="text-2xl font-extrabold text-gradient-gold tabular-nums md:text-4xl">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground md:text-[10px]">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-2 md:gap-3">
      <Cell value={days} label="Hari" />
      <Cell value={hours} label="Jam" />
      <Cell value={mins} label="Menit" />
      <Cell value={secs} label="Detik" />
    </div>
  );
}
