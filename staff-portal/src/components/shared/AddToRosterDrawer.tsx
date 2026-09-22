import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Upload, Search, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStudentDirectorySearch } from '@/modules/students/hooks';

const addOneSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required.'),
  name: z.string().min(1, 'Name is required.'),
});
type AddOneValues = z.infer<typeof addOneSchema>;

interface BulkResult {
  created: number;
  alreadyExisted: number;
  enrolled?: number;
  added?: number;
  errors: { row: number; reason: string }[];
}

interface AddToRosterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string; // "Course" | "Cohort"
  onAddOne: (data: AddOneValues, opts: { onSuccess: () => void }) => void;
  onAddSelected: (studentIds: string[], opts: { onSuccess: () => void }) => void;
  onAddBulk: (file: File) => void;
  isAddingOne: boolean;
  isAddingSelected: boolean;
  isAddingBulk: boolean;
  bulkResult?: BulkResult;
}

export function AddToRosterDrawer({
  open, onOpenChange, entityLabel,
  onAddOne, onAddSelected, onAddBulk,
  isAddingOne, isAddingSelected, isAddingBulk, bulkResult,
}: AddToRosterDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebouncedValue(directoryQuery);
  const { data: directoryResults, isFetching } = useStudentDirectorySearch(debouncedQuery);

  const form = useForm<AddOneValues>({
    resolver: zodResolver(addOneSchema),
    defaultValues: { studentId: '', name: '' },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setFile(null);
      setSelectedIds(new Set());
      setDirectoryQuery('');
    }
    onOpenChange(nextOpen);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
        next.delete(id);
        } else {
        next.add(id);
        }

        return next;
    });
    };

  return (
    <DrawerShell open={open} onOpenChange={handleClose} icon={<UserPlus className="h-4 w-4" />} title={`Add to ${entityLabel} Roster`} width="lg">
      <Tabs defaultValue="single">
        <TabsList className="w-full">
          <TabsTrigger value="single" className="flex-1">Add One</TabsTrigger>
          <TabsTrigger value="directory" className="flex-1">From Directory</TabsTrigger>
          <TabsTrigger value="bulk" className="flex-1">Bulk CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="pt-4 space-y-4">
          <Field data-invalid={!!form.formState.errors.studentId}>
            <FieldLabel>Student ID</FieldLabel>
            <Input placeholder="e.g. UGR/2025/001" {...form.register('studentId')} />
            {form.formState.errors.studentId && <FieldError errors={[form.formState.errors.studentId]} />}
          </Field>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel>Full Name</FieldLabel>
            <Input placeholder="Full name" {...form.register('name')} />
            {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
          </Field>
          <p className="text-xs text-muted-foreground">
            If this student ID isn't in the directory yet, it will be created automatically.
          </p>
          <Button className="w-full" disabled={isAddingOne}
            onClick={form.handleSubmit((values) => onAddOne(values, { onSuccess: () => form.reset() }))}>
            {isAddingOne ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Student'}
          </Button>
        </TabsContent>

        <TabsContent value="directory" className="pt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search the student directory..."
              className="pl-9"
              value={directoryQuery}
              onChange={(e) => setDirectoryQuery(e.target.value)}
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border divide-y">
            {isFetching && <p className="p-4 text-sm text-muted-foreground text-center">Searching...</p>}
            {!isFetching && directoryQuery && directoryResults?.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No matches found.</p>
            )}
            {directoryResults?.map((student) => (
              <label key={student.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
                <Checkbox checked={selectedIds.has(student.id)} onCheckedChange={() => toggleSelected(student.id)} />
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.studentId}</p>
                </div>
              </label>
            ))}
          </div>

          <Button className="w-full" disabled={selectedIds.size === 0 || isAddingSelected}
            onClick={() => onAddSelected([...selectedIds], { onSuccess: () => setSelectedIds(new Set()) })}>
            {isAddingSelected ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add Selected (${selectedIds.size})`}
          </Button>
        </TabsContent>

        <TabsContent value="bulk" className="pt-4 space-y-4">
          <label className="block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center">
            <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="sr-only" />
            <span className="text-sm text-muted-foreground">Choose a CSV file</span>
            {file && <p className="mt-2 text-xs text-muted-foreground">{file.name}</p>}
          </label>

          {bulkResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {bulkResult.created} created, {bulkResult.alreadyExisted} already existed, {bulkResult.enrolled ?? bulkResult.added} added.
              </div>
              {bulkResult.errors.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1 dark:bg-amber-950 dark:border-amber-900">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {bulkResult.errors.length} row(s) skipped
                  </div>
                </div>
              )}
            </div>
          )}

          <Button className="w-full" disabled={!file || isAddingBulk} onClick={() => file && onAddBulk(file)}>
            {isAddingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" />Import CSV</>}
          </Button>
        </TabsContent>
      </Tabs>
    </DrawerShell>
  );
}