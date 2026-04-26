'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackSchema, TrackFormData } from '@/validations/track.schema';
import { Loader2, GraduationCap, AlignLeft } from 'lucide-react';

interface TrackFormProps {
  initialData?: Partial<TrackFormData>;
  onSubmit: (data: TrackFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function TrackForm({ initialData, onSubmit, isLoading, isEdit }: TrackFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      {/* Track Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <GraduationCap className="w-3 h-3" />
          Pathway Designation
        </label>
        <input
          {...register('name')}
          className={`w-full bg-surface border ${errors.name ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none`}
          placeholder="e.g. Full Stack Web Development"
        />
        {errors.name && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
          <AlignLeft className="w-3 h-3" />
          Pathway Curriculum Overview
        </label>
        <textarea
          {...register('description')}
          rows={6}
          className={`w-full bg-surface border ${errors.description ? 'border-primary' : 'border-outline/50'} rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none`}
          placeholder="Describe the learning objectives, core technologies, and professional outcomes..."
        />
        {errors.description && <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{errors.description.message}</p>}
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
                {isEdit ? 'save' : 'add_task'}
              </span>
              {isEdit ? 'Update Curriculum Parameters' : 'Initialize Academic Track'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
