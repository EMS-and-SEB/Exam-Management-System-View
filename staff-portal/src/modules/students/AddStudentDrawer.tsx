import { DrawerShell } from "@/components/shared/DrawerShell";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateStudent } from "./hooks";
import {
  createStudentSchema,
  type CreateStudentValues,
} from "./validation/student.schema";

interface AddStudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentDrawer({
  open,
  onOpenChange,
}: AddStudentDrawerProps) {
  const createStudent = useCreateStudent();
  const form = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { studentId: "", name: "" },
  });

  const onSubmit = (values: CreateStudentValues) => {
    createStudent.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<UserPlus className="h-4 w-4" />}
      title="Add Student"
      subtitle="Add a single student to the directory."
      footerPlacement="inline"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createStudent.isPending}
          >
            {createStudent.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add Student"
            )}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Field data-invalid={!!form.formState.errors.studentId}>
          <FieldLabel>Student ID</FieldLabel>
          <Input
            placeholder="e.g. UGR/2025/01"
            {...form.register("studentId")}
          />
          {form.formState.errors.studentId && (
            <FieldError errors={[form.formState.errors.studentId]} />
          )}
        </Field>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input placeholder="Full name" {...form.register("name")} />
          {form.formState.errors.name && (
            <FieldError errors={[form.formState.errors.name]} />
          )}
        </Field>
      </form>
    </DrawerShell>
  );
}
