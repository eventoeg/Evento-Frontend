'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Building, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { profileUpdateSchema, passwordChangeSchema } from '@/validations/auth.schema';
import type { ProfileUpdateFormData, PasswordChangeFormData } from '@/validations/auth.schema';
import { getRoleDisplayName, getInitials, getStatusColor } from '@/lib/utils';
import { UserRole } from '@/types';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, updateProfile, logout, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'details'>('account');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

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

  // Reset form when user loads
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
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getRoleDisplayName(user.role)}
                </span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Account Settings
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Role Details
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        {...register('firstName')}
                        type="text"
                        id="firstName"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.firstName ? 'border-red-500' : 'border-slate-300'
                        }`}
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
                        {...register('lastName')}
                        type="text"
                        id="lastName"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.lastName ? 'border-red-500' : 'border-slate-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Role Details Tab */}
            {activeTab === 'details' && <RoleDetails user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Role Details Component
function RoleDetails({ user }: { user: any }) {
  if (user.role === UserRole.STUDENT && user.student) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Student Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Track</label>
              <p className="text-slate-900 font-medium">
                {user.student.track?.name || 'Not assigned'}
              </p>
              {user.student.track?.description && (
                <p className="text-sm text-slate-600 mt-1">{user.student.track.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expected Graduation Year
              </label>
              <p className="text-slate-900 font-medium">
                {user.student.graduationYear || 'Not specified'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.student.status)}`}>
                {user.student.status === 'current' ? 'Current Student' : 'Alumni'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === UserRole.COMPANY_REP && user.company) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Company Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <p className="text-slate-900 font-medium">{user.company.companyName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <p className="text-slate-900 font-medium">{user.company.location}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.company.status)}`}>
                {user.company.status.charAt(0).toUpperCase() + user.company.status.slice(1)}
              </span>
            </div>

            {user.company.description && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <p className="text-slate-700">{user.company.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-600">No additional role details available</p>
    </div>
  );
}
