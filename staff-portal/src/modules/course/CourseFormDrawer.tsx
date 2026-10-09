import { DrawerShell } from "@/components/shared/DrawerShell";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useStaff } from "@/modules/staff/hooks";
import { useScopedOrgUnits } from "@/modules/org-units/hooks";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { Course } from "./api";
import { useCreateCourse, useUpdateCourse } from "./hooks";
import {
  createCourseSchema,
  type CreateCourseValues,
} from "./validation/course.schema";

interface CourseFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

export function CourseFormDrawer({
  open,
  onOpenChange,
  course,
}: CourseFormDrawerProps) {
  return (
    <CourseFormDrawerInner
      key={course?.id ?? "create"}
      open={open}
      onOpenChange={onOpenChange}
      course={course}
    />
  );
}

function CourseFormDrawerInner({
  open,
  onOpenChange,
  course,
}: CourseFormDrawerProps) {
  const isEdit = !!course;
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const needsOrgUnitPicker = isSuperAdmin;

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const form = useForm<CreateCourseValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: course?.name ?? "",
      instructorId: course?.instructorId ?? "",
      orgUnitId: course?.orgUnitId,
    },
  });
  const orgUnitId = useWatch({ control: form.control, name: "orgUnitId" });

  const { data: staffData, isLoading: staffLoading } = useStaff({
    page: 1,
    limit: 100,
    role: "INSTRUCTOR",
    orgUnitId: isSuperAdmin ? orgUnitId : undefined,
    enabled: !isSuperAdmin || Boolean(orgUnitId),
  });

  const { data: orgUnits } = useScopedOrgUnits(isSuperAdmin);
  const instructors = staffData?.staff ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        name: course?.name ?? "",
        instructorId: course?.instructorId ?? "",
        orgUnitId: course?.orgUnitId,
      });
    }
    onOpenChange(next);
  };

  const onSubmit = (values: CreateCourseValues) => {
    if (isEdit && course) {
      updateCourse.mutate(
        {
          id: course.id,
          data: { name: values.name, instructorId: values.instructorId },
        },
        { onSuccess: () => handleOpenChange(false) },
      );
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
      title={isEdit ? "Edit Course" : "Create Course"}
      subtitle={
        isEdit ? course?.name : "Create a course and assign its instructor."
      }
      footerPlacement="inline"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Course"
            )}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Course Name</FieldLabel>
          <Input
            placeholder="e.g. Data Structures (CS201) — 2026 — Section A"
            {...form.register("name")}
          />
          <p className="text-xs text-muted-foreground">
            Include the course name, course code, year, and section for clear
            communication.
          </p>
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>

        {needsOrgUnitPicker && (
          <Field data-invalid={!!form.formState.errors.orgUnitId}>
            <FieldLabel>Unit</FieldLabel>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              disabled={isEdit}
              {...form.register("orgUnitId", {
                onChange: () => form.setValue("instructorId", ""),
              })}
            >
              <option value="">Select a unit…</option>
              {orgUnits?.filter((unit) => unit.parentId !== null).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            {form.formState.errors.orgUnitId && (
              <FieldError errors={[form.formState.errors.orgUnitId]} />
            )}
          </Field>
        )}

        <Field data-invalid={!!form.formState.errors.instructorId}>
          <FieldLabel>Instructor</FieldLabel>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
            disabled={staffLoading || (isSuperAdmin && !orgUnitId)}
            {...form.register("instructorId")}
          >
            <option value="">
              {isSuperAdmin && !orgUnitId
                ? "Select a unit first…"
                : staffLoading
                  ? "Loading instructors…"
                  : "Select an instructor…"}
            </option>
            {instructors.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.email})
              </option>
            ))}
          </select>
          {form.formState.errors.instructorId && (
            <FieldError errors={[form.formState.errors.instructorId]} />
          )}
        </Field>
      </form>
    </DrawerShell>
  );
}