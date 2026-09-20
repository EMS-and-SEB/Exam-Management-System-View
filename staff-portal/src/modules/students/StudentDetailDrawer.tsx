import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { updateStudentSchema, type UpdateStudentValues } from './validation/student.schema';
import { useUpdateStudent } from './hooks';
import type { Student } from './api';

interface StudentDetailDrawerProps {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailDrawer({ student, onOpenChange }: StudentDetailDrawerProps) {
  if (!student) return null;
  return <StudentDetailForm key={student.id} student={student} onOpenChange={onOpenChange} />;
}

function StudentDetailForm({ student, onOpenChange }: { student: Student; onOpenChange: (open: boolean) => void }) {
  const updateStudent = useUpdateStudent();
  const form = useForm<UpdateStudentValues>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: { studentId: student.studentId, name: student.name },
  });

  const onSubmit = (values: UpdateStudentValues) => {
    updateStudent.mutate({ id: student.id, data: values }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <DrawerShell
      open
      onOpenChange={onOpenChange}
      icon={<User className="h-4 w-4" />}
      title={student.name}
      subtitle={student.studentId}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateStudent.isPending}>
            {updateStudent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Field data-invalid={!!form.formState.errors.studentId}>
          <FieldLabel>Student ID</FieldLabel>
          <Input {...form.register('studentId')} />
          {form.formState.errors.studentId && <FieldError errors={[form.formState.errors.studentId]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>
      </form>
    </DrawerShell>
  );
}
