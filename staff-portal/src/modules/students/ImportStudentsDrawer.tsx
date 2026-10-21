import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useImportStudents } from './hooks';

interface ImportStudentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStudentsDrawer({ open, onOpenChange }: ImportStudentsDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const importStudents = useImportStudents();

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFile(null);
      importStudents.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleImport = () => {
    if (!file) return;
    importStudents.mutate(file);
  };

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleClose}
      icon={<Upload className="h-4 w-4" />}
      title="Import Students"
      subtitle="Upload a CSV with studentId and name columns."
      footer={
        <>
          <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
          <Button onClick={handleImport} disabled={!file || importStudents.isPending}>
            {importStudents.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <span className="text-sm text-muted-foreground">Choose a CSV file</span>
          {file && <p className="mt-2 text-xs text-muted-foreground">{file.name}</p>}
        </label>

        {importStudents.isSuccess && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {importStudents.data.created} created, {importStudents.data.alreadyExisted} already existed.
            </div>
            {importStudents.data.nameMismatches.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 space-y-1 dark:bg-destructive/20 dark:border-destructive/30">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive dark:text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Name mismatches
                </div>
                <ul className="text-xs text-destructive dark:text-destructive space-y-0.5">
                  {importStudents.data.nameMismatches.map((mismatch) => (
                    <li key={`${mismatch.row}-${mismatch.studentId}`}>
                      Row {mismatch.row} — {mismatch.existingName} → {mismatch.importedName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importStudents.data.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 space-y-1 dark:bg-destructive/20 dark:border-destructive/30">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive dark:text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {importStudents.data.errors.length} row(s) skipped
                </div>
                <ul className="text-xs text-destructive dark:text-destructive space-y-0.5">
                  {importStudents.data.errors.map((err, i) => (
                    <li key={i}>Row {err.row}: {err.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </DrawerShell>
  );
}