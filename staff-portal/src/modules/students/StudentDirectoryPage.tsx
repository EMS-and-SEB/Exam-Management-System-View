import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { useStudents } from './hooks';
import { getStudentColumns } from './columns';
import { AddStudentDrawer } from './AddStudentDrawer';
import { ImportStudentsDrawer } from './ImportStudentsDrawer';
import { StudentEditDrawer } from './StudentEditDrawer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Student } from './api';

const PAGE_SIZE = 25;

export function StudentDirectoryPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useStudents({
    page: page + 1,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const columns = getStudentColumns({ onView: (student) => navigate(`/students/${student.id}`), onEdit: setEditingStudent });

  return (
    <div>
      <PageHeader
        title="Students"
        badge={data ? `${data.total} Total` : undefined}
        subtitle="The shared student directory used across course and cohort rosters."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Import
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
        onRowClick={(student) => navigate(`/students/${student.id}`)}
        manualPagination={{
          pageIndex: page,
          pageCount: data?.totalPages ?? 0,
          onPageChange: setPage,
        }}
      />

      <AddStudentDrawer open={addOpen} onOpenChange={setAddOpen} />
      <ImportStudentsDrawer open={importOpen} onOpenChange={setImportOpen} />
      <StudentEditDrawer student={editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)} />
    </div>
  );
}