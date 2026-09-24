import { LoadingState } from "@/components/shared/LoadingState";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { groupExams } from "@/modules/exam/ExamStatusGroup";
import { useExams } from "@/modules/exam/hooks";
import { format } from "date-fns";
import { ClipboardCheck, Clock, FileText, Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function StaffDashboard() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useExams();

  const groups = useMemo(() => groupExams(exams ?? []), [exams]);
  const backendProvidesPending = (exams ?? []).some(
    (e) => typeof e.pendingGradingCount === "number",
  );
  const gradable = (exams ?? []).filter((e) =>
    backendProvidesPending
      ? (e.pendingGradingCount ?? 0) > 0
      : e.status === "RELEASED" || e.status === "CLOSED",
  );

  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-3">Quick Actions</p>
        <Button onClick={() => navigate("/exams/new")}>
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Draft Exams"
          value={groups.draft.length}
          icon={FileText}
        />
        <StatCard
          label="Upcoming"
          value={groups.upcoming.length}
          icon={Clock}
        />
        <StatCard
          label="Ready to Grade"
          value={gradable.length}
          icon={ClipboardCheck}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium mb-3">Upcoming Exams</p>
          {groups.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">
              Nothing scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {groups.upcoming.slice(0, 5).map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:border-primary/50"
                  onClick={() => navigate(`/exams/${exam.id}`)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.scheduledStart &&
                        format(new Date(exam.scheduledStart), "MMM d, h:mm a")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Needs Attention</p>
          {groups.draft.length === 0 && gradable.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">
              All caught up.
            </p>
          ) : (
            <div className="space-y-2">
              {groups.draft.slice(0, 3).map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:border-primary/50"
                  onClick={() => navigate(`/exams/${exam.id}`)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <p className="text-sm font-medium">{exam.title}</p>
                    <StatusBadge status="DRAFT" label="Continue Editing" />
                  </CardContent>
                </Card>
              ))}
              {gradable.slice(0, 3).map((exam) => (
                <Card
                  key={exam.id}
                  className="cursor-pointer hover:border-primary/50"
                  onClick={() => navigate(`/grading/${exam.id}`)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <p className="text-sm font-medium">{exam.title}</p>
                    <StatusBadge
                      status="NEEDS_GRADING"
                      label="Continue Grading"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
