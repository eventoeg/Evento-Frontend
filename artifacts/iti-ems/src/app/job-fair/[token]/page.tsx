
import { Suspense, useEffect, useState } from 'react';
import { useParams, useLocation, useSearch } from 'wouter';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building,
  Mail,
  MapPin,
  FileText,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { invitationsService } from '@/services/invitations.service';
import { companiesService } from '@/services/companies.service';
import { CompanyInvitation, CompanyStatus } from '@/types';
import { useToastStore } from '@/store/toast.store';

// Validation schema for company application form
const companyApplicationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  location: z.string().min(2, 'Location is required').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  representativeName: z.string().min(2, 'Representative name is required').max(100),
  representativeEmail: z.string().email('Invalid email address'),
  representativeTitle: z.string().min(2, 'Title is required').max(100),
});

type CompanyApplicationData = z.infer<typeof companyApplicationSchema>;

function JobFairApplicationForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const token = params.token as string;
  const { success, error } = useToastStore();

  const [invitation, setInvitation] = useState<CompanyInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyApplicationData>({
    resolver: zodResolver(companyApplicationSchema),
    defaultValues: {
      companyName: '',
      location: '',
      description: '',
      representativeName: '',
      representativeEmail: '',
      representativeTitle: '',
    },
  });

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const response = await invitationsService.findByToken(token);
        if (response.success && response.data) {
          setInvitation(response.data);
        } else {
          error('Invalid or expired invitation link');
        }
      } catch (err) {
        error('Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInvitation();
    }
  }, [token, error]);

  const onSubmit = async (data: CompanyApplicationData) => {
    setSubmitting(true);
    try {
      // Create company with pending status
      const companyResponse = await companiesService.create({
        companyName: data.companyName,
        location: data.location,
        description: data.description,
        status: CompanyStatus.PENDING,
      });

      if (companyResponse.success && companyResponse.data) {
        success('Application submitted successfully! Admin will review your application.');
        setApplicationSubmitted(true);
      } else {
        error(Array.isArray(companyResponse.message) ? companyResponse.message.join(', ') : companyResponse.message);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Invalid Invitation</h2>
          <p className="text-slate-500 mb-6">This invitation link is invalid or has expired.</p>
          <Link href="/login" className="text-[#C1272D] font-semibold hover:underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Already Accepted</h2>
          <p className="text-slate-500 mb-6">This company has already been accepted to the Job Fair.</p>
          <Link href="/login" className="text-[#C1272D] font-semibold hover:underline">
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="text-center max-w-md bg-white p-12 rounded-2xl shadow-lg">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Your Job Fair application has been submitted successfully. The admin will review your application and you'll receive an acceptance email shortly.
          </p>
          <Link href="/login" className="text-[#C1272D] font-semibold hover:underline">
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C1272D] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1F2937]">ITI EMS</h1>
              <p className="text-xs text-slate-500">Job Fair 2026</p>
            </div>
          </div>
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-[#C1272D] transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Event Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#C1272D]/10 flex items-center justify-center flex-shrink-0">
              <Building className="w-7 h-7 text-[#C1272D]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
                Job Fair Invitation
              </h2>
              <p className="text-slate-600 mb-4">
                You've been invited to participate in the ITI Job Fair 2026. Please complete the application form below to get started.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Invitation Status: <span className="font-semibold capitalize">{invitation.status}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-[#1F2937] mb-6">Company Application Form</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company Information
              </h4>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Company Name *
                </label>
                <input
                  {...register('companyName')}
                  type="text"
                  id="companyName"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.companyName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Enter your company name"
                  disabled={submitting}
                />
                {errors.companyName && (
                  <p className="mt-2 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register('location')}
                    type="text"
                    id="location"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                      errors.location ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="City, Country"
                    disabled={submitting}
                  />
                </div>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Company Description *
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all resize-none ${
                      errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="Describe your company, its mission, and what you do..."
                    disabled={submitting}
                  />
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">Minimum 20 characters</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Representative Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                Representative Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="representativeName" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('representativeName')}
                    type="text"
                    id="representativeName"
                    className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                      errors.representativeName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="John Doe"
                    disabled={submitting}
                  />
                  {errors.representativeName && (
                    <p className="mt-2 text-sm text-red-600">{errors.representativeName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="representativeEmail" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('representativeEmail')}
                      type="email"
                      id="representativeEmail"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                        errors.representativeEmail ? 'border-red-400 bg-red-50' : 'border-slate-200'
                      }`}
                      placeholder="john@company.com"
                      disabled={submitting}
                    />
                  </div>
                  {errors.representativeEmail && (
                    <p className="mt-2 text-sm text-red-600">{errors.representativeEmail.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="representativeTitle" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Job Title / Position *
                </label>
                <input
                  {...register('representativeTitle')}
                  type="text"
                  id="representativeTitle"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all ${
                    errors.representativeTitle ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="e.g., HR Manager, CEO"
                  disabled={submitting}
                />
                {errors.representativeTitle && (
                  <p className="mt-2 text-sm text-red-600">{errors.representativeTitle.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-slate-200 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C1272D] hover:bg-[#C1272D]/90 disabled:bg-[#C1272D]/50 text-white font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C1272D]/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function JobFairInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
        </div>
      }
    >
      <JobFairApplicationForm />
    </Suspense>
  );
}
