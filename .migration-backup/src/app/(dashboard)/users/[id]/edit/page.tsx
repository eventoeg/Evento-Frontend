'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import UserForm from '../../components/UserForm';
import { UserFormData } from '@/validations/user.schema';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const { success, error } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setFetching(true);
        const res = await usersService.findById(id as string);
        if (res.success && res.data) {
          setUserData({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
            role: res.data.role,
            trackId: res.data.student?.track?.id,
            companyId: res.data.company?.id,
            graduationYear: res.data.student?.graduationYear,
          });
        }
      } catch (err) {
        error('Failed to retrieve identity data');
        router.push('/users');
      } finally {
        setFetching(false);
      }
    }
    fetchUser();
  }, [id, error, router]);

  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      const res = await usersService.update(id as string, data as any);
      if (res.success) {
        success('Identity profile successfully updated');
        router.push('/users');
        router.refresh();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update registry entry');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">
          Accessing Secure Data Hub...<br />
          <span className="font-medium normal-case opacity-50">Decrypting identity parameters</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Navigation */}
      <Link 
        href="/users" 
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
      >
        <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Directory</span>
      </Link>

      {/* Header */}
      <section>
        <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
          Identity Management
        </div>
        <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
          Update <span className="font-black text-primary">Identity Profile</span>
        </h2>
        <p className="text-on-surface-variant text-base font-medium max-w-2xl">
          Modify authorization parameters and organizational associations for this identity in the global registry.
        </p>
      </section>

      {/* Form Card */}
      <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-glass border border-outline/30">
        <UserForm 
          initialData={userData} 
          onSubmit={handleSubmit} 
          isLoading={loading} 
          isEdit={true} 
        />
      </div>
    </div>
  );
}
