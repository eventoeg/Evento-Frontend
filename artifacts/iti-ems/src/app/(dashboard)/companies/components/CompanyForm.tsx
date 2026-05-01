
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompanyStatus } from '@/types';
import { companySchema, CompanyFormData } from '@/validations/company.schema';
import { Loader2, Building2, MapPin, AlignLeft, Info } from 'lucide-react';

// Use material symbols for some icons to match the theme
 

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function CompanyForm({ initialData, onSubmit, isLoading, isEdit }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData || {
      status: CompanyStatus.PENDING,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      {/* Company Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <Building2 className="w-3 h-3" />
          Legal Entity Name
        </label>
        <input
          {...register('companyName')}
          className={`w-full bg-surface border ${errors.companyName ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
          placeholder="e.g. Global Tech Solutions"
        />
        {errors.companyName && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.companyName.message}</p>}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          Operational Location
        </label>
        <input
          {...register('location')}
          className={`w-full bg-surface border ${errors.location ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
          placeholder="e.g. Cairo, Egypt"
        />
        {errors.location && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.location.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <AlignLeft className="w-3 h-3" />
          Entity Description
        </label>
        <textarea
          {...register('description')}
          rows={5}
          className={`w-full bg-surface border ${errors.description ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none`}
          placeholder="Provide a brief overview of the company's focus and recruitment needs..."
        />
        {errors.description && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.description.message}</p>}
      </div>

      {/* Status Selection (Only if Edit or Admin mode) */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <Info className="w-3 h-3" />
          Registration Status
        </label>
        <select
          {...register('status')}
          className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
        >
          {Object.values(CompanyStatus).map((status) => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

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
                {isEdit ? 'save' : 'app_registration'}
              </span>
              {isEdit ? 'Commit Registry Updates' : 'Execute Partner Registration'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
