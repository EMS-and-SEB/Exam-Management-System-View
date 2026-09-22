import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { downloadResultsCsv } from './api';
import { useCombinedResults} from './hooks';

interface CombinedResultsTableProps {
  parent: { courseId?: string; cohortId?: string };
  examColumns: { id: string; label: string; maxScore: number }[];
}

export function CombinedResultsTable({ parent, examColumns }: CombinedResultsTableProps) {
  const { data: rows, isLoading } = useCombinedResults(parent);
  const [search, setSearch] = useState('');

  const filtered = (rows ?? []).filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.studentId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Student Results</p>
        <Button variant="outline" size="sm" onClick={() => downloadResultsCsv(parent)}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="relative mb-3 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search student name or ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <LoadingState label="Loading combined results..." />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2.5 font-medium">Student</th>
                {examColumns.map((c) => (
                  <th key={c.id} className="text-center p-2.5 font-medium">{c.label} <span className="text-xs text-muted-foreground">/{c.maxScore}</span></th>
                ))}
                <th className="text-center p-2.5 font-medium">Aggregate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.studentId} className="border-t">
                  <td className="p-2.5">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.studentId}</p>
                  </td>
                  {examColumns.map((c) => {
                    const score = row.scores[c.id];
                    return (
                      <td key={c.id} className="text-center p-2.5">
                        {score ? `${score.score}/${score.maxScore}` : <span className="text-muted-foreground">-</span>}
                      </td>
                    );
                  })}
                  <td className="text-center p-2.5 font-medium">{row.aggregate}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={examColumns.length + 2} className="text-center p-8 text-muted-foreground">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}