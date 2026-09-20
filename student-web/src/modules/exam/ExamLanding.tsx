import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Eraser, Flag, LogOut, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "./store";
import { isEmptyAnswer, useExamSession } from "./useExamSession";
import { useExamPolling, useInvalidatePoll, POLL_INTERVAL_MS } from "./useExamPolling";
import { QuestionRenderer } from "./components/QuestionRenderer";
import { Timer } from "./components/Timer";
import { AutosaveIndicator } from "./components/AutosaveIndicator";
import type { SessionSummary } from "./types";

const TYPE_LABEL = {
  TRUE_FALSE: "True / False",
  MULTIPLE_CHOICE: "Multiple Choice",
  MULTIPLE_SELECT: "Multiple Select",
  MATCHING: "Matching",
  FILL_BLANK: "Fill in the Blank",
  WORKOUT: "Work Out",
} as const;

function PostSubmit({ summary }: { summary: SessionSummary }) {
  const navigate = useNavigate();
  const hasScore = typeof summary.score === "number";

  const title =
    summary.status === "EXPIRED"
      ? "Time expired"
      : summary.status === "FORCE_SUBMITTED"
        ? "Exam terminated"
        : "Exam submitted";
  const body =
    summary.status === "FORCE_SUBMITTED"
      ? "Your session was ended by an invigilator."
      : summary.status === "EXPIRED"
        ? "The time limit was reached and your answers were submitted automatically."
        : "Your submission was received.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-4" />
          <h1 className="text-lg font-semibold">{title}</h1>
          {hasScore ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Your score:{" "}
              <span className="font-medium text-foreground">
                {summary.score} / {summary.maxScore ?? "—"}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">
              {body} Check back once an instructor has reviewed the work-out questions.
            </p>
          )}
          <Button variant="outline" className="mt-6 w-full" onClick={() => {
            useSessionStore.getState().clearSession();
            navigate("/login");
          }}>
            <LogOut className="h-4 w-4" /> Return to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LockedBanner() {
  return (
    <div
      data-testid="locked-banner"
      className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <span>
        Your session is temporarily locked due to an incident. Answers are
        frozen until it&apos;s resolved — keep this page open.
      </span>
    </div>
  );
}

export function ExamLanding() {
  const session = useSessionStore((s) => s.session);
  const studentId = useSessionStore((s) => s.studentId);
  const clearSession = useSessionStore((s) => s.clearSession);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const examHydrated = useExamSessionStore((s) => s.hasHydrated);

  const exam = useExamSession();
  const navigate = useNavigate();

  const sessionId = session?.sessionToken ?? "";
  const poll = useExamPolling({ enabled: Boolean(sessionId) && !exam.summary });
  const invalidatePoll = useInvalidatePoll();

  const [confirming, setConfirming] = useState(false);

  // Hydration gate: don't render the exam until persisted sessionStorage has
  // been rehydrated (a refresh restores store state, and we must not flash an
  // empty exam over it). If nothing was stored, clear and route to login.
  useEffect(() => {
    if (!hasHydrated || !examHydrated) return;
    if (!session) {
      clearSession();
      navigate("/login");
    }
  }, [hasHydrated, examHydrated, session, clearSession, navigate]);

  if (!hasHydrated || !examHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!session) return null;
  if (exam.summary) return <PostSubmit summary={exam.summary} />;

  const q = exam.current;
  const value = q ? (exam.answers[q.id] ?? null) : null;
  const locked = exam.locked;
  const marked = q ? Boolean(exam.markedForReview[q.id]) : false;
  const answeredCount = exam.questions.filter(
    (item) => !isEmptyAnswer(exam.answers[item.id] ?? null),
  ).length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 h-16">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{session.exam.title}</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {session.exam.examType} · {exam.total} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Timer endsAt={exam.currentEndsAt} onExpired={invalidatePoll} prominent />
            {studentId && (
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-xs font-medium text-foreground">{studentId}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-6 lg:px-6 lg:pt-0 lg:pb-0">
        <div className="grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="flex min-w-0 flex-col gap-4 lg:h-[calc(100vh-8.5rem)]">
            {locked && <LockedBanner />}
            <div className="flex flex-1 flex-col rounded-xl bg-muted/20 p-4 lg:p-6">
              <Card className="flex flex-1 flex-col">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CardTitle className="text-base">
                      Question {exam.currentIndex + 1} of {exam.total}
                    </CardTitle>
                    <AutosaveIndicator
                      status={exam.currentStatus}
                      offline={exam.offline}
                    />
                  </div>
                  <CardDescription className="capitalize">
                    {q ? TYPE_LABEL[q.type] : ""} · {q?.points ?? 0} pt
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {q?.type === "FILL_BLANK" ? (
                  <QuestionRenderer
                    question={q}
                    value={value}
                    onChange={(value, qid) => exam.updateAnswer(qid, value)}
                    disabled={locked}
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium leading-6 text-foreground/90">{q?.prompt}</p>
                    <QuestionRenderer
                      question={q!}
                      value={value}
                      onChange={(value, qid) => exam.updateAnswer(qid, value)}
                      disabled={locked}
                    />
                  </>
                )}
              </CardContent>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant={marked ? "secondary" : "outline"}
                    onClick={() => q && exam.toggleMarkForReview(q.id)}
                    title={marked ? "Remove review flag" : "Flag this question for review"}
                  >
                    <Flag className="h-4 w-4" />
                    {marked ? "Marked for review" : "Mark for review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => q && exam.updateAnswer(q.id, null)}
                    disabled={!q || isEmptyAnswer(value)}
                    title="Clear this selection"
                  >
                    <Eraser className="h-4 w-4" /> Clear selection
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2 border-t pt-4">
                  <Button type="button" variant="ghost" onClick={exam.goPrev} disabled={!exam.hasPrev}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button type="button" onClick={exam.goNext} disabled={!exam.hasNext}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
              </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Status refreshes automatically every {Math.round(POLL_INTERVAL_MS / 1000)}s.
              {poll.isFetching ? " Refreshing…" : ""}
            </p>
          </main>

          <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-[6.5rem] lg:h-[calc(100vh-8.5rem)] lg:w-80">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-muted/60">
              <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Questions</h2>
                <span className="text-xs text-muted-foreground">
                  {answeredCount}/{exam.total} answered
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-4">
                {exam.questions.map((item, i) => {
                  const answered = !isEmptyAnswer(exam.answers[item.id] ?? null);
                  const isMarked = Boolean(exam.markedForReview[item.id]);
                  const isCurrent = i === exam.currentIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => exam.goTo(i)}
                      aria-label={`Go to question ${i + 1}`}
                      aria-current={isCurrent ? "step" : undefined}
                      className={cn(
                        "relative h-9 rounded-md border text-xs font-medium transition-colors",
                        isCurrent && "border-ring ring-2 ring-ring/40",
                        answered
                          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                          : isMarked
                            ? "border-amber-500/70 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {i + 1}
                      {isMarked && (
                        <span
                          aria-hidden
                          className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-2 ring-card"
                        />
                      )}
                    </button>
                  );
})}
                  </div>
                </div>
              </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => setConfirming(true)}
              disabled={locked}
            >
              <Flag className="h-4 w-4" /> Submit exam
            </Button>
          </aside>
        </div>
      </div>

      {confirming && !locked && (
        <SubmitDialog
          unanswered={exam.unansweredCount}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            setConfirming(false);
            await exam.doSubmit();
          }}
        />
      )}
    </div>
  );
}

function SubmitDialog({
  unanswered,
  onCancel,
  onConfirm,
}: {
  unanswered: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Submit exam?</CardTitle>
          <CardDescription>
            {unanswered > 0
              ? `${unanswered} question${unanswered === 1 ? "" : "s"} are unanswered.`
              : "All questions are answered."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Keep working
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirm submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}