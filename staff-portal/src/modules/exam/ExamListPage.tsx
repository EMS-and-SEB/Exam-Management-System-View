import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useExams } from './hooks';
import { groupExams } from './ExamStatusGroup';
import { ExamCard } from './ExamCard';

export function ExamListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: exams, isLoading } = useExams();
  const [search, setSearch] = useState('');

  const parentId = new URLSearchParams(location.search).get('courseId') ?? new URLSearchParams(location.search).get('cohortId');

  const filtered = useMemo(() => {
    let list = exams ?? [];
    if (parentId) list = list.filter((e) => e.courseId === parentId || e.cohortId === parentId);
    if (search) list = list.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [exams, search, parentId]);

  const groups = groupExams(filtered);

  return (
    <div>
      <PageHeader
        title="Exams & Assessments"
        badge={`${filtered.length} Total`}
        subtitle="Create, schedule, release, and manage course assessments."
        actions={
          <Button onClick={() => navigate('/exams/new')}>
            <Plus className="h-4 w-4" />
            Create Exam
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search exams by title..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? ( 
        <LoadingState label="Loading exams..." />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({groups.draft.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({groups.upcoming.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({groups.completed.length})</TabsTrigger>
          </TabsList>

          {(['all', 'draft', 'upcoming', 'active', 'completed'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3 pt-4">
              {(tab === 'all' ? filtered : groups[tab]).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No exams in this category.</p>
              ) : (
                (tab === 'all' ? filtered : groups[tab]).map((exam) => <ExamCard key={exam.id} exam={exam} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}