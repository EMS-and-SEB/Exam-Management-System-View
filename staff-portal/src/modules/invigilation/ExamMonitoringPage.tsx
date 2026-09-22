import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { useExamMonitoring } from './hooks';
import { rosterColumns } from './columns';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'NOT_STARTED', label: 'Not Started' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'incidents', label: 'Incidents Only' },
] as const;

export function ExamMonitoringPage() {
  const { id } = useParams<{ id: string }>();
  const examId = id!;
  const { exam, otp, roster } = useExamMonitoring(examId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['key']>('all');

  if (exam.isLoading || roster.isLoading || !exam.data) return <LoadingState label="Loading exam monitoring..." />;

  const filtered = (roster.data ?? []).filter((entry) => {
    const matchesSearch =
      entry.student.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.student.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'incidents' ? entry.incidents.length > 0 : entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    inProgress: roster.data?.filter((r) => r.status === 'IN_PROGRESS').length ?? 0,
    notStarted: roster.data?.filter((r) => r.status === 'NOT_STARTED').length ?? 0,
    submitted: roster.data?.filter((r) => r.status === 'SUBMITTED' || r.status === 'FORCE_SUBMITTED').length ?? 0,
    incidents: roster.data?.filter((r) => r.incidents.length > 0).length ?? 0,
  };

  const copyCode = () => {
    if (otp.data) {
      navigator.clipboard.writeText(otp.data.otp);
      toast.success('Access code copied.');
    }
  };

  return (
    <div>
      <PageHeader
        title={exam.data.title}
        backTo="/invigilation"
        subtitle={exam.data.course?.name ?? exam.data.cohort?.name}
      />

      <div className="grid grid-cols-[1fr_260px] gap-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total" value={roster.data?.length ?? 0} />
          <StatCard label="In Exam" value={counts.inProgress} tone="success" />
          <StatCard label="Submitted" value={counts.submitted} />
          <StatCard label="Not Started" value={counts.notStarted} />
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Exam Access Code</p>
            {otp.data ? (
              <>
                <div className="flex justify-center gap-1.5 mb-2">
                  {otp.data.otp.split('').map((digit, i) => (
                    <div key={i} className="h-9 w-7 rounded-md border flex items-center justify-center font-mono text-lg font-bold">
                      {digit}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={copyCode}>
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                {otp.error ? 'Not available yet.' : 'Loading...'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students by name or ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                statusFilter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted/50'
              }`}
            >
              {f.label}
              {f.key === 'incidents' && counts.incidents > 0 && ` (${counts.incidents})`}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={rosterColumns} data={filtered} isLoading={roster.isFetching && !roster.data} emptyMessage="No students match." />
    </div>
  );
}