import { z } from 'zod';

const optionSchema = z.object({ id: z.string(), text: z.string().min(1, 'Option text is required.') });

const baseFields = {
  prompt: z.string().min(1, 'Prompt is required.'),
  points: z.number().int().positive('Points must be a positive number.'),
};

export const questionTypeOptions = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'MULTIPLE_SELECT', label: 'Multiple Select' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank' },
  { value: 'WORKOUT', label: 'Workout' },
] as const;

export const questionInputSchema = z.union([
  z.object({ type: z.literal('TRUE_FALSE'), ...baseFields, correctAnswer: z.boolean() }),

  z.object({
    type: z.literal('MULTIPLE_CHOICE'), ...baseFields,
    options: z.array(optionSchema).min(2, 'At least 2 options are required.'),
    correctAnswer: z.string().min(1, 'Select the correct answer.'),
  }).refine((q) => q.options.some((o) => o.id === q.correctAnswer), {
    message: 'The correct answer must match one of the options.', path: ['correctAnswer'],
  }),

  z.object({
    type: z.literal('MULTIPLE_SELECT'), ...baseFields,
    options: z.array(optionSchema).min(2, 'At least 2 options are required.'),
    correctAnswer: z.array(z.string()).min(1, 'Select at least one correct answer.'),
  }).refine((q) => q.correctAnswer.every((id) => q.options.some((o) => o.id === id)), {
    message: 'All correct answers must match given options.', path: ['correctAnswer'],
  }),

  z.object({
    type: z.literal('MATCHING'), ...baseFields,
    options: z.object({
      left: z.array(optionSchema).min(1, 'At least 1 item required.'),
      right: z.array(optionSchema).min(1, 'At least 1 item required.'),
    }),
    correctAnswer: z.array(z.object({ leftId: z.string(), rightId: z.string() })).min(1, 'At least one pair is required.'),
  }),

  z.object({
    type: z.literal('FILL_BLANK'), ...baseFields,
    correctAnswer: z.array(z.string().min(1, 'Blank answer cannot be empty.')).min(1),
  }).refine((q) => (q.prompt.match(/\{\{\d+\}\}/g)?.length ?? 0) === q.correctAnswer.length, {
    message: 'The number of {{n}} blanks in the prompt must match the number of answers.', path: ['correctAnswer'],
  }),

  z.object({ type: z.literal('WORKOUT'), ...baseFields }),
]);

export type QuestionInput = z.infer<typeof questionInputSchema>;
export type QuestionType = (typeof questionTypeOptions)[number]['value'];