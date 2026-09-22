import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useBulkImportStudents } from './hooks';

interface BulkImportStudentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportStudentsDrawer({ open, onOpenChange }: BulkImportStudentsDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const bulkImport = useBulkImportStudents();

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFile(null);
      bulkImport.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleImport = () => {
    if (!file) return;
    bulkImport.mutate(file);
  };

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleClose}
      icon={<Upload className="h-4 w-4" />}
      title="Bulk Import Students"
      subtitle="Upload a CSV with studentId and name columns."
      footer={
        <>
          <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
          <Button onClick={handleImport} disabled={!file || bulkImport.isPending}>
            {bulkImport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
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

        {bulkImport.isSuccess && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {bulkImport.data.created} created, {bulkImport.data.updated} updated.
            </div>
            {bulkImport.data.errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1 dark:bg-amber-950 dark:border-amber-900">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  {bulkImport.data.errors.length} row(s) skipped
                </div>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
                  {bulkImport.data.errors.map((err, i) => (
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