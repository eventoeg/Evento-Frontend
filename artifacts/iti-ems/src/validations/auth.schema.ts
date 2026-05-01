import { z } from 'zod';
import { UserRole } from '@/types';

// ========================================
// Login Schema
// ========================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ========================================
// Registration Schema
// ========================================

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    role: z.nativeEnum(UserRole),
    trackId: z
      .string()
      .uuid('Please select a valid track')
      .optional()
      .or(z.literal('')),
    companyId: z
      .string()
      .uuid('Please select a valid company')
      .optional()
      .or(z.literal('')),
    graduationYear: z
      .number()
      .int('Graduation year must be a whole number')
      .min(1900, 'Graduation year must be after 1900')
      .max(new Date().getFullYear() + 10, 'Graduation year is too far in the future')
      .optional()
      .or(z.literal(0)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      // If role is student, trackId is required
      if (data.role === UserRole.STUDENT) {
        return !!data.trackId && data.trackId !== '';
      }
      return true;
    },
    {
      message: 'Track is required for students',
      path: ['trackId'],
    }
  )
  .refine(
    (data) => {
      // If role is company_rep, companyId is required
      if (data.role === UserRole.COMPANY_REP) {
        return !!data.companyId && data.companyId !== '';
      }
      return true;
    },
    {
      message: 'Company is required for company representatives',
      path: ['companyId'],
    }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

// ========================================
// Profile Update Schema
// ========================================

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ========================================
// Password Change Schema
// ========================================

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password must be less than 100 characters'),
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
