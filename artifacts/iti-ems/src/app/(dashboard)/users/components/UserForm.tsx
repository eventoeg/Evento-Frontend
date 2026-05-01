
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole, Track, Company } from '@/types';
import { userSchema, UserFormData } from '@/validations/user.schema';
import { tracksService } from '@/services/tracks.service';
import { companiesService } from '@/services/companies.service';
import { Loader2, Shield, GraduationCap, Briefcase, Mail, User as UserIcon, Lock } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/utils';

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function UserForm({ initialData, onSubmit, isLoading, isEdit }: UserFormProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      role: UserRole.STUDENT,
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [tracksRes, companiesRes] = await Promise.all([
          tracksService.findAll(1, 100),
          companiesService.findAll(1, 100),
        ]);
        if (tracksRes.success && tracksRes.data) setTracks(tracksRes.data.items);
        if (companiesRes.success && companiesRes.data) setCompanies(companiesRes.data.items);
      } catch (error) {
        console.error('Failed to fetch form dependencies:', error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
            <UserIcon className="w-3 h-3" />
            Given Name
          </label>
          <input
            {...register('firstName')}
            className={`w-full bg-surface border ${errors.firstName ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
            placeholder="e.g. John"
          />
          {errors.firstName && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
            <UserIcon className="w-3 h-3" />
            Family Name
          </label>
          <input
            {...register('lastName')}
            className={`w-full bg-surface border ${errors.lastName ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
            placeholder="e.g. Doe"
          />
          {errors.lastName && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <Mail className="w-3 h-3" />
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          className={`w-full bg-surface border ${errors.email ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
          placeholder="john.doe@example.com"
        />
        {errors.email && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <Lock className="w-3 h-3" />
          {isEdit ? 'New Password (Optional)' : 'Access Password'}
        </label>
        <input
          {...register('password')}
          type="password"
          className={`w-full bg-surface border ${errors.password ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
          placeholder={isEdit ? '••••••••' : 'Minimum 6 characters'}
        />
        {errors.password && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.password.message}</p>}
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <Shield className="w-3 h-3" />
          System Authorization Role
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.values(UserRole).map((role) => (
            <label
              key={role}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                selectedRole === role
                  ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
                  : 'border-outline/30 bg-surface/50 text-on-surface-variant hover:border-outline hover:bg-surface'
              }`}
            >
              <input
                {...register('role')}
                type="radio"
                value={role}
                className="sr-only"
              />
              <span className="material-symbols-outlined mb-2 group-hover:scale-110 transition-transform">
                {role === UserRole.ADMIN ? 'verified_user' : 
                 role === UserRole.STAFF ? 'badge' : 
                 role === UserRole.STUDENT ? 'school' : 
                 role === UserRole.SECURITY ? 'security' : 
                 'business_center'}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center">{getRoleDisplayName(role)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Conditional Fields: Student */}
      {selectedRole === UserRole.STUDENT && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface/50 rounded-2xl border border-outline/30 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
              <GraduationCap className="w-3 h-3" />
              Academic Track
            </label>
            <select
              {...register('trackId')}
              disabled={loadingData}
              className="w-full bg-white border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Select an entry pathway...</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>{track.name}</option>
              ))}
            </select>
            {errors.trackId && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.trackId.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Graduation Year</label>
            <input
              {...register('graduationYear')}
              type="number"
              className="w-full bg-white border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none"
              placeholder="e.g. 2024"
            />
            {errors.graduationYear && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.graduationYear.message}</p>}
          </div>
        </div>
      )}

      {/* Conditional Fields: Company Rep */}
      {selectedRole === UserRole.COMPANY_REP && (
        <div className="p-6 bg-surface/50 rounded-2xl border border-outline/30 animate-in slide-in-from-top-4 duration-300 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
            <Briefcase className="w-3 h-3" />
            Associated Entity
          </label>
          <select
            {...register('companyId')}
            disabled={loadingData}
            className="w-full bg-white border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="">Select partner company...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.companyName}</option>
            ))}
          </select>
          {errors.companyId && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.companyId.message}</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 border-t border-outline/30 flex gap-4">
        <button
          disabled={isLoading}
          type="submit"
          className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                {isEdit ? 'save' : 'how_to_reg'}
              </span>
              {isEdit ? 'Update Profile' : 'Execute Provisioning'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
