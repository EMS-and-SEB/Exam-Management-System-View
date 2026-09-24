import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStaffSearch } from '@/modules/staff/hooks';
import { createCourseSchema, type CreateCourseValues } from './validation/course.schema';
import { useCreateCourse, useUpdateCourse } from './hooks';
import type { Course } from './api';

interface CourseFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

export function CourseFormDrawer({ open, onOpenChange, course }: CourseFormDrawerProps) {
  return (
    <CourseFormDrawerInner
      key={course?.id ?? 'create'}
      open={open}
      onOpenChange={onOpenChange}
      course={course}
    />
  );
}

function CourseFormDrawerInner({ open, onOpenChange, course }: CourseFormDrawerProps) {
  const isEdit = !!course;
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const [instructorQuery, setInstructorQuery] = useState(course?.instructor?.name ?? '');
  const debouncedQuery = useDebouncedValue(instructorQuery);
  const { data: instructorResults, isFetching } = useStaffSearch(debouncedQuery, 'INSTRUCTOR');

  const form = useForm<CreateCourseValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: course?.name ?? '',
      instructorId: course?.instructorId ?? '',
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        name: course?.name ?? '',
        instructorId: course?.instructorId ?? '',
      });
      setInstructorQuery(course?.instructor?.name ?? '');
    }
    onOpenChange(next);
  };

  const onSubmit = (values: CreateCourseValues) => {
    if (isEdit && course) {
      updateCourse.mutate({ id: course.id, data: values }, { onSuccess: () => handleOpenChange(false) });
    } else {
      createCourse.mutate(values, { onSuccess: () => handleOpenChange(false) });
    }
  };

  const isPending = createCourse.isPending || updateCourse.isPending;

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<BookOpen className="h-4 w-4" />}
      title={isEdit ? 'Edit Course' : 'Create Course'}
      subtitle={isEdit ? course?.name : 'Create a course and assign its instructor.'}
      footerPlacement="inline"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Course'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Course Name</FieldLabel>
          <Input placeholder="e.g. Data Structures — Section A" {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.instructorId}>
          <FieldLabel>Instructor</FieldLabel>
          <Controller
            control={form.control}
            name="instructorId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search instructors..."
                    className="pl-9"
                    value={instructorQuery}
                    onChange={(e) => setInstructorQuery(e.target.value)}
                  />
                </div>
                {isFetching && <p className="text-xs text-muted-foreground">Searching...</p>}
                {instructorResults && instructorResults.length > 0 && (
                  <div className="rounded-lg border divide-y max-h-40 overflow-y-auto">
                    {instructorResults.map((staff) => (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => { field.onChange(staff.id); setInstructorQuery(staff.name); }}
                        className="w-full text-left p-2 text-sm hover:bg-muted/50 data-[selected=true]:bg-primary/10"
                        data-selected={field.value === staff.id}
                      >
                        {staff.name} <span className="text-muted-foreground">— {staff.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
          {form.formState.errors.instructorId && <FieldError errors={[form.formState.errors.instructorId]} />}
        </Field>
      </form>
    </DrawerShell>
  );
}
