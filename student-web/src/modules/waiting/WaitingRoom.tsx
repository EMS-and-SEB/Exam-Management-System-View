import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "@/modules/exam/store";
import { useServerCountdown, formatCountdown } from "@/modules/waiting/useServerCountdown";
import { getSession, startSession } from "@/modules/waiting/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StudentLoginResponse } from "@/modules/auth/types";
import type { ExamQuestion } from "@/modules/exam/types";

export function WaitingRoom() {
  const navigate = useNavigate();

  // Hydration state from session store
  const sessionFromStore = useSessionStore((s) => s.session);
  const studentId = useSessionStore((s) => s.studentId);
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const setEndsAt = useExamSessionStore((s) => s.setEndsAt);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  // State - initialized from sessionStore if available to prevent flicker
  const [startsAt, setStartsAt] = useState<string | null>(
    () => sessionFromStore?.startsAt ?? null
  );
  const [offsetMs, setOffsetMs] = useState<number | null>(() =>
    sessionFromStore?.serverNow
      ? Date.parse(sessionFromStore.serverNow) - Date.now()
      : null
  );

  // Sync if hydrated after initial render
  useEffect(() => {
    if (!startsAt && sessionFromStore?.startsAt) {
      setStartsAt(sessionFromStore.startsAt);
    }
    if (offsetMs === null && sessionFromStore?.serverNow) {
      setOffsetMs(Date.parse(sessionFromStore.serverNow) - Date.now());
    }
  }, [sessionFromStore, startsAt, offsetMs]);

  // Stable session id - used in effect dependencies to avoid restarting poll
  const sessionId = sessionFromStore?.sessionToken;

  // Effect 1: Hydration gate
  useEffect(() => {
    if (!hasHydrated) return;
    if (!sessionFromStore) {
      clearSession();
      navigate("/login");
    }
  }, [hasHydrated, sessionFromStore, clearSession, navigate]);

  // Effect 2: Check if session already has endsAt and examQuestions
  useEffect(() => {
    const session = sessionFromStore;
    if (!session) return;
    if (session.endsAt && session.examQuestions?.length) {
      navigate("/exam", { replace: true });
    }
  }, [sessionFromStore, navigate]);

  // Effect 3: Polling
  useEffect(() => {
    if (!sessionId) return;
    async function poll() {
      try {
        const response = await getSession(sessionId!);

        if (response.status !== "NOT_STARTED" && response.status !== "IN_PROGRESS") {
          clearSession();
          navigate("/login");
          return;
        }

        setStartsAt(response.startsAt ?? null);

        if (response.serverNow != null) {
          setOffsetMs(Date.parse(response.serverNow) - Date.now());
        }

        // If session is already IN_PROGRESS (e.g. resumed from another tab)
        if (
          response.status === "IN_PROGRESS" &&
          response.endsAt &&
          Array.isArray(response.questions) &&
          response.questions.length > 0
        ) {
          const newSession: StudentLoginResponse = {
            ...sessionFromStore!,
            endsAt: response.endsAt,
            examQuestions: response.questions as ExamQuestion[],
          };
          setSession(newSession);
          setEndsAt(response.endsAt);
          navigate("/exam", { replace: true });
          return;
        }

        if (sessionFromStore?.endsAt && sessionFromStore?.examQuestions?.length) {
          navigate("/exam", { replace: true });
        }
      } catch {
        // silently ignore poll errors
      }
    }

    poll();
    const interval = setInterval(poll, 5000);

    return () => clearInterval(interval);
  }, [sessionId, sessionFromStore, setSession, setEndsAt, clearSession, navigate]);

  const { isReady, remainingSeconds } = useServerCountdown(startsAt, offsetMs);
  const countdownLabel = isReady
    ? "00:00 — Ready"
    : remainingSeconds === null
      ? "--:--"
      : formatCountdown(remainingSeconds);

  // Handle start exam
  const handleStartExam = async () => {
    try {
      const response = await startSession(sessionId!);
      if (response.status === "IN_PROGRESS" && response.endsAt) {
        const newSession: StudentLoginResponse = {
          ...sessionFromStore!,
          endsAt: response.endsAt,
          examQuestions: response.examQuestions as ExamQuestion[],
        };
        setSession(newSession);
        setEndsAt(response.endsAt);
        navigate("/exam", { replace: true });
      }
    } catch {
      // ignore errors
    }
  };

  const pillLabel = isReady ? "STATUS" : "STARTS IN";

  // Render session title from store (guaranteed non-null after hydration)
  const sessionTitle = sessionFromStore?.exam.title ?? "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4">
      {/* Header */}
      <header className="border-b bg-white border-b border-border/50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-text muted-foreground">
              EXAM PORTAL
            </h1>
            <span className="relative inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="text-sm font-semibold capitalize text-text capitalize">
                {sessionTitle}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {studentId ? studentId.charAt(0) : "S"}
            </span>
            <span className="font-mono text-[0.875rem] text-text">
              {studentId ?? ""}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6">
        <div className="mx-auto max-w-2xl">
          {/* State pill + heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text mb-2">
              {isReady ? "Your exam is ready to begin" : "Your exam will start soon"}
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-xs uppercase tracking-wider text-[--:#6B7280]">
                {pillLabel}
              </span>
              <span className="text-2xl font-mono text-text">
                {countdownLabel}
              </span>
            </div>
          </div>

          {/* Instructions card */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader className="px-4 py-3 border-b border-border/50">
              <p className="text-xs uppercase tracking-wider text-[--:#6B7280]">
                IMPORTANT INSTRUCTIONS
              </p>
            </CardHeader>
            <CardContent className="px-4 py-4 space-y-2">
              <p className="text-sm text-[#374151]">
                Do not close or minimize the exam window once started.
              </p>
              <p className="text-sm text-[#374151]">
                Cheating or unauthorized assistance is not permitted.
              </p>
              <p className="text-sm text-[#374151]">
                Make sure your internet connection is stable before starting.
              </p>
            </CardContent>
          </Card>

          {/* Start Exam button */}
          <div className="mt-6 text-center">
            <Button
              type="button"
              disabled={!isReady}
              className={isReady ? "bg-[#1E3A5F] text-white hover:bg-[#2D4A74]" : "bg-[#C8D0DC] text-[#F5F5F5]"}
              onClick={handleStartExam}
            >
              Start Exam
            </Button>
            <p className="mt-2 text-[0.75rem] text-[#6B7280] center">
              Click Start Exam to enter your session immediately.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
