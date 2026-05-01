
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Building, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, LogOut, Shield, Key } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { profileUpdateSchema } from '@/validations/auth.schema';
import type { ProfileUpdateFormData } from '@/validations/auth.schema';
import { getRoleDisplayName, getInitials, getStatusColor } from '@/lib/utils';
import { UserRole } from '@/types';

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, updateProfile, logout, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'details'>('account');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    clearError();
    setSuccessMessage(null);
    try {
      await updateProfile(data);
      setSuccessMessage('Profile identity updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-on-surface text-white flex items-center justify-center text-4xl font-black shadow-2xl">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div>
            <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3 rounded-sm">
              Identity Profile
            </div>
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface">
              {user.firstName} <span className="font-black text-primary">{user.lastName}</span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
               <span className="px-2.5 py-1 bg-on-surface text-white text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  {getRoleDisplayName(user.role)}
               </span>
               <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside className="lg:col-span-3 space-y-2 sticky top-32">
           <button 
             onClick={() => setActiveTab('account')}
             className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === 'account' ? 'bg-white text-primary shadow-glass border border-outline/30' : 'text-on-surface-variant hover:bg-white/50'
             }`}
           >
             <User className="w-4 h-4" />
             Account Registry
           </button>
           <button 
             onClick={() => setActiveTab('details')}
             className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === 'details' ? 'bg-white text-primary shadow-glass border border-outline/30' : 'text-on-surface-variant hover:bg-white/50'
             }`}
           >
             <Key className="w-4 h-4" />
             Role Permissions
           </button>
        </aside>

        <main className="lg:col-span-9 bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          <div className="p-10">
            {successMessage && (
              <div className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg flex items-center gap-3 animate-slide-in">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg flex items-center gap-3 animate-slide-in">
                <AlertCircle className="w-5 h-5 text-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest">{error}</p>
              </div>
            )}

            {activeTab === 'account' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Given Name</label>
                    <input 
                      {...register('firstName')}
                      disabled={isLoading}
                      className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    />
                    {errors.firstName && <p className="text-[10px] font-bold text-primary uppercase mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Family Name</label>
                    <input 
                      {...register('lastName')}
                      disabled={isLoading}
                      className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    />
                    {errors.lastName && <p className="text-[10px] font-bold text-primary uppercase mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Auth Email Identifier</label>
                  <input 
                    {...register('email')}
                    disabled={isLoading}
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  />
                  {errors.email && <p className="text-[10px] font-bold text-primary uppercase mt-1">{errors.email.message}</p>}
                </div>

                <div className="pt-8 border-t border-outline/20">
                   <button 
                     type="submit"
                     disabled={isLoading}
                     className="bg-primary text-white px-8 py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Commit Registry Update
                   </button>
                </div>
              </form>
            ) : (
              <div className="space-y-10">
                 <div className="bg-surface/50 p-8 rounded-2xl border border-outline/30">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.1em] mb-6 flex items-center gap-3">
                       <Shield className="w-5 h-5 text-primary" />
                       Authorization Context
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Assigned Role</p>
                          <p className="text-sm font-black text-on-surface">{getRoleDisplayName(user.role)}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Account Status</p>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-100">Verified</span>
                       </div>
                    </div>
                 </div>

                 {user.role === UserRole.STUDENT && user.student && (
                   <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                      <h3 className="text-sm font-black text-primary uppercase tracking-[0.1em] mb-6 flex items-center gap-3">
                         <GraduationCap className="w-5 h-5" />
                         Academic Profile
                      </h3>
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Academic Track</p>
                               <p className="text-sm font-black text-on-surface">{user.student.track?.name || 'Unassigned Pathway'}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Target Graduation</p>
                               <p className="text-sm font-black text-on-surface">{user.student.graduationYear || '2026'}</p>
                            </div>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Pathway Abstract</p>
                            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                               {user.student.track?.description || 'Your curriculum stream is currently under administrative definition.'}
                            </p>
                         </div>
                      </div>
                   </div>
                 )}

                 {user.role === UserRole.COMPANY_REP && user.company && (
                   <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                      <h3 className="text-sm font-black text-primary uppercase tracking-[0.1em] mb-6 flex items-center gap-3">
                         <Building className="w-5 h-5" />
                         Enterprise Profile
                      </h3>
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Legal Entity</p>
                               <p className="text-sm font-black text-on-surface">{user.company.companyName}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">HQ Location</p>
                               <p className="text-sm font-black text-on-surface">{user.company.location}</p>
                            </div>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Business Vision</p>
                            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                               {user.company.description}
                            </p>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
