'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, User, Building, GraduationCap, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { registerSchema, type RegisterFormData } from '@/validations/auth.schema';
import { UserRole } from '@/types';

// Mock tracks data - will be fetched from API in production
const MOCK_TRACKS = [
  { id: '1', name: 'Software Engineering' },
  { id: '2', name: 'Cyber Security' },
  { id: '3', name: 'Cloud Computing' },
  { id: '4', name: 'Data Science' },
  { id: '5', name: 'AI & Machine Learning' },
];

// Mock companies data - will be fetched from API in production
const MOCK_COMPANIES = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'InnovateSoft' },
  { id: '3', name: 'DataDriven Inc.' },
  { id: '4', name: 'CloudFirst Systems' },
  { id: '5', name: 'CyberGuard Technologies' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);

  const {
    register: registerField,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.STUDENT,
      trackId: '',
      companyId: '',
      graduationYear: undefined,
    },
  });

  const watchRole = watch('role');

  // Update selectedRole when watchRole changes
  useEffect(() => {
    setSelectedRole(watchRole);
  }, [watchRole]);

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        trackId: data.role === UserRole.STUDENT ? data.trackId : undefined,
        companyId: data.role === UserRole.COMPANY_REP ? data.companyId : undefined,
        graduationYear: data.role === UserRole.STUDENT ? data.graduationYear : undefined,
      });
      
      // Redirect to dashboard on success
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-md text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join ITI EMS</h1>
          <p className="text-xl text-blue-100 mb-8">
            Create your account to access employment opportunities, events, and interview queues.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <p className="text-blue-100">Access job fairs and interview opportunities</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <p className="text-blue-100">Manage your CV and professional portfolio</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <p className="text-blue-100">Join real-time interview queues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-2"
            >
              ← Back to Login
            </Link>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="text-slate-600 mt-1">Register as a Student or Company Representative</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Role Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                I am a...
              </label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.STUDENT)}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    watchRole === UserRole.STUDENT
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.COMPANY_REP)}
                  className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    watchRole === UserRole.COMPANY_REP
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Company Representative
                </button>
              </div>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...registerField('firstName')}
                      type="text"
                      id="firstName"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="John"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...registerField('lastName')}
                      type="text"
                      id="lastName"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Doe"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...registerField('email')}
                    type="email"
                    id="email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...registerField('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Min. 6 characters"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...registerField('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Re-enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Student-Specific Fields */}
              {watchRole === UserRole.STUDENT && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Student Information
                  </h3>

                  {/* Track Selection */}
                  <div>
                    <label htmlFor="trackId" className="block text-sm font-medium text-slate-700 mb-2">
                      ITI Track
                    </label>
                    <select
                      {...registerField('trackId')}
                      id="trackId"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.trackId ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select a track</option>
                      {MOCK_TRACKS.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.name}
                        </option>
                      ))}
                    </select>
                    {errors.trackId && (
                      <p className="mt-1 text-sm text-red-600">{errors.trackId.message}</p>
                    )}
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-slate-700 mb-2">
                      Expected Graduation Year (Optional)
                    </label>
                    <select
                      {...registerField('graduationYear', { valueAsNumber: true })}
                      id="graduationYear"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isLoading}
                    >
                      <option value={0}>Select year (optional)</option>
                      {graduationYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Company Rep-Specific Fields */}
              {watchRole === UserRole.COMPANY_REP && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company Information
                  </h3>

                  {/* Company Selection */}
                  <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-slate-700 mb-2">
                      Company
                    </label>
                    <select
                      {...registerField('companyId')}
                      id="companyId"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.companyId ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select a company</option>
                      {MOCK_COMPANIES.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {errors.companyId && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
                    )}
                    <p className="mt-2 text-sm text-slate-600">
                      Don't see your company?{' '}
                      <Link href="/companies/new" className="text-blue-600 hover:text-blue-700 font-medium">
                        Register a new company
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            © {new Date().getFullYear()} ITI EMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
