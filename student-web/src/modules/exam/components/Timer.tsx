import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  endsAt: string;
  /** Fires once, the tick the countdown reaches zero, so we issue an immediate poll. */
  onExpired?: () => void;
  /** Larger, accent-style presentation used in the header (logic is identical). */
  prominent?: boolean;
}

function msLeft(endsAt: string): number {
  return Math.max(0, new Date(endsAt).getTime() - Date.now());
}

function fmt(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * COSMETIC timer only. It displays remaining time from `endsAt` and ticks
 * locally, but it has ZERO authority: it never triggers submit. Actual
 * termination only ever happens because the backend moves the session to a
 * terminal status (detected by the polling loop). On hitting zero it fires
 * `onExpired` (once) so the caller issues an immediate poll — since there is
 * no backend job finalizing sessions, that immediate poll is what actually
 * finalizes the exam, rather than waiting for the next 7s interval tick.
 * Do NOT wire this timer to call submit directly.
 */
export function Timer({ endsAt, onExpired, prominent = false }: Props) {
  const [, setTick] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = msLeft(endsAt);
  const expired = remaining <= 0;

  useEffect(() => {
    if (expired && !firedRef.current && onExpired) {
      firedRef.current = true;
      onExpired();
    }
  }, [expired, onExpired]);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
        Time&apos;s up — waiting for server confirmation…
      </span>
    );
  }

  const urgent = remaining < 5 * 60_000;
  return (
    <span
      data-testid="timer"
      className={cn(
        "inline-flex items-center rounded-full border font-mono tabular-nums",
        prominent
          ? "gap-1.5 bg-primary/10 px-4 py-1.5 text-base font-semibold"
          : "gap-1 px-3 py-1 text-sm",
        urgent
          ? "border-destructive/40 text-destructive"
          : prominent
            ? "border-ring text-foreground"
            : "border-border text-foreground",
      )}
    >
      {prominent && <Clock className="size-4" />}
      {fmt(remaining)}
    </span>
  );
}