import { DrawerShell } from "@/components/shared/DrawerShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentDirectorySearch } from "@/modules/students/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Upload,
  UserPlus,
} from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const STUDENT_ID_PATTERN = /^UGR\/\d{4}\/\d{2}$/;

/** Matches the backend's maximum page size for GET /students. */
const SEARCH_FETCH_LIMIT = 100;
/** Rows visible at the top of a result list before it starts scrolling. */
const VISIBLE_ROWS = 5;
/** Fixed row heights (px) — must match the h-11 / h-14 classes on the rows. */
const SUGGESTION_ROW_HEIGHT = 44;
const DIRECTORY_ROW_HEIGHT = 56;
/** Slim scrollbar for result lists. */
const THIN_SCROLLBAR = "[scrollbar-width:thin]";

/** Max height that shows exactly VISIBLE_ROWS rows, including `divide-y` borders. */
const listMaxHeight = (rowHeight: number) =>
  VISIBLE_ROWS * rowHeight + (VISIBLE_ROWS - 1);

const addOneSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required.")
    .regex(STUDENT_ID_PATTERN, "Student ID must be in the format UGR/1234/12."),
  name: z.string().min(1, "Name is required."),
});
type AddOneValues = z.infer<typeof addOneSchema>;

interface ImportResult {
  created: number;
  alreadyExisted: number;
  enrolled?: number;
  added?: number;
  errors: { row: number; reason: string }[];
}

interface AddToRosterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  enrolledStudentIds: string[];
  mode?: "full" | "single";
  onAddOne: (data: AddOneValues, opts: { onSuccess: () => void }) => void;
  onAddSelected?: (
    studentIds: string[],
    opts: { onSuccess: () => void },
  ) => void;
  onImport?: (file: File) => void;
  isAddingOne: boolean;
  isAddingSelected?: boolean;
  isImporting?: boolean;
  importResult?: ImportResult;
}

export function AddToRosterDrawer({
  open,
  onOpenChange,
  entityLabel,
  enrolledStudentIds,
  mode = "full",
  onAddOne,
  onAddSelected,
  onImport,
  isAddingOne,
  isAddingSelected,
  isImporting,
  importResult,
}: AddToRosterDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directorySuccessMessage, setDirectorySuccessMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [studentIdInput, setStudentIdInput] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const { data: directoryResults, isFetching } = useStudentDirectorySearch(
    directoryQuery,
    SEARCH_FETCH_LIMIT,
  );
  const enrolledStudentIdSet = new Set(enrolledStudentIds);
  const availableDirectoryResults = directoryResults?.filter(
    (student) => !enrolledStudentIdSet.has(student.id),
  );

  const form = useForm<AddOneValues>({
    resolver: zodResolver(addOneSchema),
    defaultValues: { studentId: "", name: "" },
  });

  const { data: suggestions, isFetching: isSuggesting } =
    useStudentDirectorySearch(studentIdInput, SEARCH_FETCH_LIMIT);
  const availableSuggestions = suggestions?.filter(
    (student) => !enrolledStudentIdSet.has(student.id),
  );
  const showSuggestions =
    suggestionsOpen &&
    studentIdInput.length > 0 &&
    (isSuggesting || (availableSuggestions?.length ?? 0) > 0);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setFile(null);
      setSelectedIds(new Set());
      setDirectoryQuery("");
      setDirectorySuccessMessage("");
      setStudentIdInput("");
      setSuggestionsOpen(false);
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

  const pickSuggestion = (student: { studentId: string; name: string }) => {
    form.setValue("studentId", student.studentId, { shouldValidate: true });
    form.setValue("name", student.name, { shouldValidate: true });
    setStudentIdInput(student.studentId);
    setSuggestionsOpen(false);
  };

  const handleImport = () => {
    if (!file) {
      return;
    }

    onImport?.(file);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addOneForm = (
    <>
      <Controller
        control={form.control}
        name="studentId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Student ID</FieldLabel>
            <div className="relative">
              <Input
                placeholder="e.g. UGR/2025/01"
                autoComplete="off"
                {...field}
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => {
                  field.onBlur();
                  setSuggestionsOpen(false);
                }}
                onChange={(e) => {
                  field.onChange(e);
                  setStudentIdInput(e.target.value);
                  setSuggestionsOpen(true);
                }}
              />
              {showSuggestions && (
                <div
                  className={`absolute z-20 mt-1 w-full overflow-y-auto rounded-lg border bg-popover shadow-md divide-y ${THIN_SCROLLBAR}`}
                  style={{ maxHeight: listMaxHeight(SUGGESTION_ROW_HEIGHT) }}
                >
                  {isSuggesting && (
                    <p className="p-3 text-sm text-muted-foreground text-center">
                      Searching...
                    </p>
                  )}
                  {!isSuggesting &&
                    availableSuggestions?.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="flex h-11 w-full items-center justify-between gap-3 px-3 text-left hover:bg-muted/50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(student)}
                      >
                        <span className="truncate text-sm font-medium">
                          {student.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {student.studentId}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel>Full Name</FieldLabel>
        <Input placeholder="Full name" {...form.register("name")} />
        {form.formState.errors.name && (
          <FieldError errors={[form.formState.errors.name]} />
        )}
      </Field>
      <p className="text-xs text-muted-foreground">
        If this student ID isn't in the directory yet, it will be created
        automatically.
      </p>
      <Button
        className="w-full"
        disabled={isAddingOne}
        onClick={form.handleSubmit((values) =>
          onAddOne(values, {
            onSuccess: () => {
              form.reset();
              setStudentIdInput("");
            },
          }),
        )}
      >
        {isAddingOne ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Add Student"
        )}
      </Button>
    </>
  );

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleClose}
      icon={<UserPlus className="h-4 w-4" />}
      title={`Add to ${entityLabel} Roster`}
      width="lg"
    >
      {mode === "single" ? (
        <div className="pt-4 space-y-4">{addOneForm}</div>
      ) : (
        <Tabs defaultValue="directory">
          <TabsList className="w-full">
            <TabsTrigger value="directory" className="flex-1">
              Existing
            </TabsTrigger>
            <TabsTrigger value="single" className="flex-1">
              Manual
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1">
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search from the existing list..."
                className="pl-9"
                value={directoryQuery}
                onChange={(e) => {
                  setDirectoryQuery(e.target.value);
                  setDirectorySuccessMessage("");
                }}
              />
            </div>

            <div
              className={`overflow-y-auto rounded-lg border divide-y ${THIN_SCROLLBAR}`}
              style={{ maxHeight: listMaxHeight(DIRECTORY_ROW_HEIGHT) }}
            >
              {isFetching && !isAddingSelected && (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Searching...
                </p>
              )}
              {!isFetching && isAddingSelected && (
                <p className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding students...
                </p>
              )}
              {!isFetching &&
                !isAddingSelected &&
                directorySuccessMessage &&
                directoryQuery === "" && (
                  <p className="flex items-center justify-center gap-2 p-4 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {directorySuccessMessage}
                  </p>
                )}
              {!isFetching &&
                !isAddingSelected &&
                directoryQuery &&
                availableDirectoryResults?.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No matches found.
                  </p>
                )}
              {!isAddingSelected &&
                availableDirectoryResults?.map((student) => (
                  <label
                    key={student.id}
                    className="flex h-14 items-center gap-3 px-3 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedIds.has(student.id)}
                      onCheckedChange={() => toggleSelected(student.id)}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.studentId}
                      </p>
                    </div>
                  </label>
                ))}
            </div>

            <Button
              className="w-full"
              disabled={selectedIds.size === 0 || isAddingSelected}
              onClick={() =>
                onAddSelected?.([...selectedIds], {
                  onSuccess: () => {
                    setSelectedIds(new Set());
                    setDirectoryQuery("");
                    setDirectorySuccessMessage("Students successfully added.");
                  },
                })
              }
            >
              {isAddingSelected ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Add Selected (${selectedIds.size})`
              )}
            </Button>
          </TabsContent>

          <TabsContent value="single" className="pt-4 space-y-4">
            {addOneForm}
          </TabsContent>

          <TabsContent value="import" className="pt-4 space-y-4">
            <label className="block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <span className="text-sm text-muted-foreground">
                Choose a CSV file
              </span>
              {file && (
                <p className="mt-2 text-xs text-muted-foreground">{file.name}</p>
              )}
            </label>

            {importResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {importResult.created} created, {importResult.alreadyExisted}{" "}
                  already existed, {importResult.enrolled ?? importResult.added}{" "}
                  {entityLabel.toLowerCase() === "course"
                    ? "enrolled to course."
                    : "added to cohort."}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1 dark:bg-amber-950 dark:border-amber-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      {importResult.errors.length} row(s) skipped
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              disabled={!file || isImporting}
              onClick={handleImport}
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </DrawerShell>
  );
}