// src/modules/portal/StudentResultsPage.tsx
import { useEffect, useState } from 'react';
import { portalApi } from './api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await portalApi.getResults();
        setResults(response);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Exam Results" description="View your submitted exams and grading status." />
      
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result: any) => (
          <Card key={result.examId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{result.examTitle}</CardTitle>
                  <CardDescription>{result.courseOrCohortName}</CardDescription>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Submitted: {new Date(result.submittedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                {result.status === 'GRADED' ? (
                  <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Graded
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500 text-white flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Under Review
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result.status === 'GRADED' ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{result.score}</span>
                  <span className="text-muted-foreground">/ {result.maxScore}</span>
                  <Badge variant="outline" className="ml-2 text-base">
                    {result.percentage}%
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <p className="font-medium">Manual Grading in Progress</p>
                  <p className="text-xs opacity-90">
                    {result.notice || "Workout/essay questions are currently being graded by your instructor. Your final score will be published once grading is completed."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && (
          <p className="col-span-2 text-center text-muted-foreground py-8">
            No exam results found yet.
          </p>
        )}
      </div>
    </div>
  );
}