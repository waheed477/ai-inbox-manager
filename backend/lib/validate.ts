import { z } from 'zod';

// Email validation
export const emailBodySchema = z.object({
  emailBody: z.string().min(1).max(50000),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
});

export const starEmailSchema = z.object({
  emailId: z.string().min(10),
  isStarred: z.boolean(),
});

export const ruleSchema = z.object({
  name: z.string().optional(),
  condition: z.enum(['from', 'subject', 'body']),
  operator: z.enum(['contains', 'equals', 'startsWith']),
  value: z.string().min(1).max(200),
  action: z.enum(['label:important', 'label:work', 'archive', 'markRead']),
});

export const scheduleSchema = z.object({
  to: z.string().email().or(z.array(z.string().email())),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(50000),
  scheduledAt: z.string().datetime(),
  threadId: z.string().optional(),
});

export const settingsSchema = z.object({
  defaultTone: z.enum(['professional', 'friendly', 'concise', 'casual']).optional(),
  notifications: z.boolean().optional(),
  autoSummarize: z.boolean().optional(),
  smartLabeling: z.boolean().optional(),
  syncFrequency: z.string().optional(),
  autoArchive: z.object({
    promotions: z.boolean().optional(),
    newsletters: z.boolean().optional(),
    social: z.boolean().optional(),
  }).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, data: any): T {
  return schema.parse(data);
}