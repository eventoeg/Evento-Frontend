'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { companiesService } from '@/services/companies.service';
import { tracksService } from '@/services/tracks.service';
import { usersService } from '@/services/users.service';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { CompanyStatus, type Company, type Track, UserRole } from '@/types';
import { registerSchema, type RegisterFormData } from '@/validations/auth.schema';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  
  // Private link and previous student detection state
  const isPrivateLink = searchParams.get('type') === 'iti-student';
  const [previousStudentEmail, setPreviousStudentEmail] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckDone, setEmailCheckDone] = useState(false);

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
  const watchTrackId = watch('trackId');
  const watchCompanyId = watch('companyId');
  const watchEmail = watch('email');

  // Check if email belongs to a previous student when email changes
  useEffect(() => {
    const checkPreviousStudent = async () => {
      if (!watchEmail || watchEmail.length < 5) {
        setPreviousStudentEmail(null);
        setEmailCheckDone(false);
        return;
      }

      setEmailChecking(true);
      try {
        const response = await usersService.findByEmail(watchEmail);
        if (response.success && response.data) {
          const user = response.data;
          // Check if this user was previously a student
          if (user.student && user.role !== UserRole.STUDENT) {
            setPreviousStudentEmail(watchEmail);
          } else {
            setPreviousStudentEmail(null);
          }
        } else {
          setPreviousStudentEmail(null);
        }
      } catch (err) {
        // Email not found or error - not a previous student
        setPreviousStudentEmail(null);
      } finally {
        setEmailCheckDone(true);
        setEmailChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkPreviousStudent, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchEmail]);

  // Auto-set role if private link
  useEffect(() => {
    if (isPrivateLink) {
      setValue('role', UserRole.STUDENT);
    }
  }, [isPrivateLink, setValue]);

  useEffect(() => {
    const loadReferenceData = async () => {
      setReferenceLoading(true);
      setReferenceError(null);

      const [tracksResult, companiesResult] = await Promise.allSettled([
        tracksService.findAll(1, 100),
        companiesService.findAll(1, 100, CompanyStatus.APPROVED),
      ]);

      const tracksResponse = tracksResult.status === 'fulfilled' ? tracksResult.value : null;
      const companiesResponse = companiesResult.status === 'fulfilled' ? companiesResult.value : null;

      if (tracksResponse?.success && tracksResponse.data) {
        setTracks(tracksResponse.data.items ?? []);
      } else {
        setTracks([]);
      }

      if (companiesResponse?.success && companiesResponse.data) {
        setCompanies(companiesResponse.data.items ?? []);
      } else {
        setCompanies([]);
      }

      const failedLoads: string[] = [];
      if (!tracksResponse?.success) failedLoads.push('tracks');
      if (!companiesResponse?.success) failedLoads.push('companies');

      if (failedLoads.length > 0) {
        setReferenceError(`Unable to load ${failedLoads.join(' and ')} from the API.`);
      }

      setReferenceLoading(false);
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    if (watchRole === UserRole.STUDENT) {
      setValue('companyId', '');
    }
    if (watchRole === UserRole.COMPANY_REP) {
      setValue('trackId', '');
    }
  }, [watchRole, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    clearError();

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
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, index) => currentYear + index);

  return (
    <div className="min-h-screen flex bg-[#F7FAFC]">
      <div className="hidden lg:flex lg:w-[480px] bg-[#1F2937] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

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

          <div className="mt-12 space-y-5">
            {[
              { icon: GraduationCap, text: 'Access job fairs and interview opportunities' },
              { icon: Building, text: 'Manage your CV and professional portfolio' },
              { icon: CheckCircle2, text: 'Join real-time interview queues instantly' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#006DBE]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#006DBE]" />
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed pt-2">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">© 2026 ITI Enterprise Core</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#C1272D] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-[#1F2937] text-lg">ITI EMS</span>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#C1272D] transition-colors mb-8"
          >
            ← Back to Sign In
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1F2937]">Create Account</h1>
            <p className="text-slate-500 mt-2">Register as a Student or Company Representative</p>
          </div>

          {/* Private Link Banner */}
          {isPrivateLink && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">ITI Student Registration</p>
                <p className="text-xs text-blue-700">
                  You're registering through a private ITI student link. Your account will be created with Student role automatically.
                </p>
              </div>
            </div>
          )}

          {/* Previous Student Warning */}
          {previousStudentEmail && emailCheckDone && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">Previous Student Account Detected</p>
                <p className="text-xs text-amber-700">
                  This email belongs to a previous student. Registration will create a new account. 
                  If you want to update your existing account, please contact an administrator.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {referenceError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">{referenceError}</p>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-sm font-medium text-[#1F2937] mb-3">I am registering as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => !isPrivateLink && setValue('role', UserRole.STUDENT)}
                disabled={isPrivateLink}
                className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  watchRole === UserRole.STUDENT
                    ? 'border-[#006DBE] bg-[#006DBE]/5 text-[#006DBE]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } ${isPrivateLink ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <GraduationCap className="w-5 h-5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => !isPrivateLink && setValue('role', UserRole.COMPANY_REP)}
                disabled={isPrivateLink}
                className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  watchRole === UserRole.COMPANY_REP
                    ? 'border-[#006DBE] bg-[#006DBE]/5 text-[#006DBE]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } ${isPrivateLink ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <Building className="w-5 h-5" />
                Company Rep
              </button>
            </div>
            {isPrivateLink && (
              <p className="mt-2 text-xs text-slate-500">
                Role is locked to Student for private ITI student links.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
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
                {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

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
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="you@company.com"
                  disabled={isLoading}
                />
                {emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

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
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

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
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {watchRole === UserRole.STUDENT && (
              <div className="space-y-4 p-5 bg-[#006DBE]/5 rounded-xl border border-[#006DBE]/20">
                <h3 className="font-semibold text-[#006DBE] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Student Information
                </h3>

                <div>
                  <label htmlFor="trackId" className="block text-sm font-medium text-[#1F2937] mb-2">
                    ITI Track
                  </label>
                  <input type="hidden" {...registerField('trackId')} />
                  <SearchableSelect
                    options={tracks.map((track) => ({ value: track.id, label: track.name }))}
                    value={watchTrackId || ''}
                    onChange={(trackId) => setValue('trackId', trackId, { shouldValidate: true, shouldDirty: true })}
                    placeholder={referenceLoading ? 'Loading tracks...' : 'Select a track'}
                    searchPlaceholder="Search tracks..."
                    emptyText="No tracks found"
                    disabled={isLoading || referenceLoading}
                    className={errors.trackId ? '[&>button]:border-red-400 [&>button]:bg-red-50' : ''}
                  />
                  {errors.trackId && <p className="mt-2 text-sm text-red-600">{errors.trackId.message}</p>}
                  {!referenceLoading && tracks.length === 0 && (
                    <p className="mt-2 text-sm text-slate-500">No tracks are available yet.</p>
                  )}
                </div>

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

            {watchRole === UserRole.COMPANY_REP && (
              <div className="space-y-4 p-5 bg-[#C1272D]/5 rounded-xl border border-[#C1272D]/20">
                <h3 className="font-semibold text-[#C1272D] flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </h3>

                <div>
                  <label htmlFor="companyId" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Company
                  </label>
                  <input type="hidden" {...registerField('companyId')} />
                  <SearchableSelect
                    options={companies.map((company) => ({ value: company.id, label: company.companyName }))}
                    value={watchCompanyId || ''}
                    onChange={(companyId) => setValue('companyId', companyId, { shouldValidate: true, shouldDirty: true })}
                    placeholder={referenceLoading ? 'Loading companies...' : 'Select a company'}
                    searchPlaceholder="Search companies..."
                    emptyText="No companies found"
                    disabled={isLoading || referenceLoading}
                    className={errors.companyId ? '[&>button]:border-red-400 [&>button]:bg-red-50' : ''}
                  />
                  {errors.companyId && <p className="mt-2 text-sm text-red-600">{errors.companyId.message}</p>}
                  {!referenceLoading && companies.length === 0 && (
                    <p className="mt-2 text-sm text-slate-500">No approved companies are available yet.</p>
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

            <button
              type="submit"
              disabled={isLoading || referenceLoading}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}