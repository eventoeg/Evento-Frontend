import { z } from 'zod';

export const trackSchema = z.object({
  name: z.string().min(1, 'Track name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export type TrackFormData = z.infer<typeof trackSchema>;
