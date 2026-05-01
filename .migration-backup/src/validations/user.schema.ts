import { z } from 'zod';
import { UserRole } from '@/types';

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.nativeEnum(UserRole),
  trackId: z.string().uuid('Please select a valid track').optional().nullable(),
  companyId: z.string().uuid('Please select a valid company').optional().nullable(),
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
}).refine((data) => {
  if (data.role === UserRole.STUDENT && !data.trackId) {
    return false;
  }
  return true;
}, {
  message: 'Track is required for students',
  path: ['trackId'],
}).refine((data) => {
  if (data.role === UserRole.COMPANY_REP && !data.companyId) {
    return false;
  }
  return true;
}, {
  message: 'Company is required for company representatives',
  path: ['companyId'],
});

export type UserFormData = z.infer<typeof userSchema>;
