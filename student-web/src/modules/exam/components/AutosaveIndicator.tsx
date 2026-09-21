import { CloudUpload, Loader2, Check, TriangleAlert, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "../types";

interface Props {
  status: SaveStatus;
  offline?: boolean;
}

const LABELS: Record<SaveStatus, { text: string; icon: React.ComponentType<{ className?: string }> }> = {
  idle: { text: "Not saved yet", icon: CloudUpload },
  saving: { text: "Saving…", icon: Loader2 },
  saved: { text: "Saved", icon: Check },
  error: { text: "Save failed", icon: TriangleAlert },
  offline: { text: "Offline — retrying…", icon: WifiOff },
};

export function AutosaveIndicator({ status, offline }: Props) {
  const effective: SaveStatus = offline ? "offline" : status;
  const { text, icon: Icon } = LABELS[effective];
  return (
    <span
      data-testid="autosave-status"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        effective === "error" && "text-destructive",
        effective === "offline" && "text-amber-600",
        effective === "saved" && "text-emerald-600",
        effective === "saving" && "text-muted-foreground",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", effective === "saving" && "animate-spin")}
      />
      {text}
    </span>
  );
}