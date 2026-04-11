'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, User, Building, GraduationCap, Loader2, Globe, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { registerSchema, type RegisterFormData } from '@/validations/auth.schema';
import { UserRole } from '@/types';

// Mock tracks data - replace with API call
const MOCK_TRACKS = [
  { id: '1', name: 'Full Stack Development' },
  { id: '2', name: 'Cyber Security' },
  { id: '3', name: 'Cloud Computing' },
  { id: '4', name: 'Data Science & AI' },
  { id: '5', name: 'DevOps Engineering' },
];

// Mock companies data - replace with API call
const MOCK_COMPANIES = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'InnovateSoft Inc.' },
  { id: '3', name: 'DataDriven Labs' },
  { id: '4', name: 'CloudFirst Systems' },
  { id: '5', name: 'CyberGuard Technologies' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  useEffect(() => {
    setValue('role', watchRole);
  }, [watchRole, setValue]);

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
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen flex bg-[#F7FAFC]">
      {/* Left Side - Dark branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#1F2937] flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        {/* Top - Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C1272D] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">ITI Enterprise Core</h1>
            </div>
          </div>
        </div>

        {/* Center - Branding content */}
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#C1272D]/20 flex items-center justify-center mb-8">
            <GraduationCap className="w-8 h-8 text-[#C1272D]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start your journey<br />with ITI EMS
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Create your account to access employment opportunities, events, and real-time interview queues.
          </p>

          {/* Benefits list */}
          <div className="mt-12 space-y-5">
            {[
              { icon: GraduationCap, text: 'Access job fairs and interview opportunities' },
              { icon: Building, text: 'Manage your CV and professional portfolio' },
              { icon: CheckCircle2, text: 'Join real-time interview queues instantly' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#006DBE]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#006DBE]" />
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed pt-2">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom - Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© 2026 ITI Enterprise Core</p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#C1272D] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-[#1F2937] text-lg">ITI EMS</span>
          </div>

          {/* Back to Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#C1272D] transition-colors mb-8"
          >
            ← Back to Sign In
          </Link>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1F2937]">Create Account</h1>
            <p className="text-slate-500 mt-2">Register as a Student or Company Representative</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role Toggle */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#1F2937] mb-3">
              I am registering as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', UserRole.STUDENT)}
                className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  watchRole === UserRole.STUDENT
                    ? 'border-[#006DBE] bg-[#006DBE]/5 text-[#006DBE]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setValue('role', UserRole.COMPANY_REP)}
                className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  watchRole === UserRole.COMPANY_REP
                    ? 'border-[#006DBE] bg-[#006DBE]/5 text-[#006DBE]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Building className="w-5 h-5" />
                Company Rep
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#1F2937] mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...registerField('firstName')}
                    type="text"
                    id="firstName"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                      errors.firstName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...registerField('lastName')}
                    type="text"
                    id="lastName"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                      errors.lastName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerField('email')}
                  type="email"
                  id="email"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="you@company.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerField('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Min. 6 characters"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F2937] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerField('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Re-enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Student-Specific Fields */}
            {watchRole === UserRole.STUDENT && (
              <div className="space-y-4 p-5 bg-[#006DBE]/5 rounded-xl border border-[#006DBE]/20">
                <h3 className="font-semibold text-[#006DBE] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Student Information
                </h3>

                {/* Track Selection */}
                <div>
                  <label htmlFor="trackId" className="block text-sm font-medium text-[#1F2937] mb-2">
                    ITI Track
                  </label>
                  <select
                    {...registerField('trackId')}
                    id="trackId"
                    className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#006DBE]/20 focus:border-[#006DBE] transition-all appearance-none ${
                      errors.trackId ? 'border-red-400 bg-red-50' : 'border-slate-200'
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
                    <p className="mt-2 text-sm text-red-600">{errors.trackId.message}</p>
                  )}
                </div>

                {/* Graduation Year */}
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Expected Graduation Year
                  </label>
                  <select
                    {...registerField('graduationYear', { valueAsNumber: true })}
                    id="graduationYear"
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#006DBE]/20 focus:border-[#006DBE] transition-all appearance-none"
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
              <div className="space-y-4 p-5 bg-[#C1272D]/5 rounded-xl border border-[#C1272D]/20">
                <h3 className="font-semibold text-[#C1272D] flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </h3>

                {/* Company Selection */}
                <div>
                  <label htmlFor="companyId" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Company
                  </label>
                  <select
                    {...registerField('companyId')}
                    id="companyId"
                    className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all appearance-none ${
                      errors.companyId ? 'border-red-400 bg-red-50' : 'border-slate-200'
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
                    <p className="mt-2 text-sm text-red-600">{errors.companyId.message}</p>
                  )}
                  <p className="mt-2 text-sm text-slate-500">
                    Don't see your company?{' '}
                    <span className="text-[#C1272D] font-medium cursor-pointer hover:underline">
                      Register a new company
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C1272D] hover:bg-[#C1272D]/90 disabled:bg-[#C1272D]/50 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C1272D]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#C1272D] hover:text-[#C1272D]/80 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
