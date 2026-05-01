import { z } from 'zod';
import { CompanyStatus } from '@/types';

export const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.nativeEnum(CompanyStatus).default(CompanyStatus.PENDING),
});

export type CompanyFormData = z.infer<typeof companySchema>;
