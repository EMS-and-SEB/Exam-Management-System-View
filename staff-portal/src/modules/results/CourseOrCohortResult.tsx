import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCourse } from '@/modules/course/hooks';
import { useCohort } from '@/modules/cohorts/hooks';
import { useClosedExamsForParent, useCombinedResults } from './hooks';
import { ExamResultsCard } from './ExamResultsCard';
import { CombinedResultsTable } from './CombinedResults';

export function CourseOrCohortResult() {
  const { courseId, cohortId } = useParams<{ courseId?: string; cohortId?: string }>();
  const parent = courseId ? { courseId } : { cohortId };

  const course = useCourse(courseId ?? '');
  const cohort = useCohort(cohortId ?? '');
  const parentName = courseId ? course.data?.name : cohort.data?.name;

  const { data: exams, isLoading: examsLoading } = useClosedExamsForParent(parent);
  const { data: combinedRows } = useCombinedResults(parent);

  const examColumns = (exams ?? []).map((e) => ({ id: e.id, label: e.title, maxScore: e.maxScore }));

  return (
    <div>
      <PageHeader
        title={parentName ?? 'Results'}
        backTo="/results"
        subtitle="Closed assessments and combined performance for this course/cohort."
      />

      <div>
        <p className="text-sm font-medium mb-3">Completed Exams</p>
        {examsLoading ? (
          <LoadingState label="Loading exams..." />
        ) : exams?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">No closed exams yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {exams?.map((exam) => <ExamResultsCard key={exam.id} exam={exam} />)}
          </div>
        )}
      </div>

      {combinedRows && combinedRows.length > 0 && (
        <CombinedResultsTable parent={parent} examColumns={examColumns} />
      )}
    </div>
  );
}