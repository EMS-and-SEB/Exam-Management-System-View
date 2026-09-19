import { useState } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useStudents } from './hooks';
import { getStudentColumns } from './columns';
import { AddStudentDrawer } from './AddStudentDrawer';
import { BulkImportStudentsDrawer } from './BulkImportStudentsDrawer';
import { StudentDetailDrawer } from './StudentDetailDrawer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Student } from './api';

const PAGE_SIZE = 25;

export function StudentDirectoryPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { data, isLoading } = useStudents({
    page: page + 1,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const columns = getStudentColumns({ onEdit: setEditingStudent });

  return (
    <div>
      <PageHeader
        title="Students"
        badge={data ? `${data.total} Total` : undefined}
        subtitle="The shared student directory used across course and cohort rosters."
        actions={
          <>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or student ID..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.students ?? []}
        isLoading={isLoading}
        emptyMessage="No students found."
        onRowClick={setEditingStudent}
        manualPagination={{
          pageIndex: page,
          pageCount: data?.totalPages ?? 0,
          onPageChange: setPage,
        }}
      />

      <AddStudentDrawer open={addOpen} onOpenChange={setAddOpen} />
      <BulkImportStudentsDrawer open={bulkOpen} onOpenChange={setBulkOpen} />
      <StudentDetailDrawer student={editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)} />
    </div>
  );
}