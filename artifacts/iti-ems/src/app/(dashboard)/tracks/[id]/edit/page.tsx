
import { useLocation, useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { tracksService } from '@/services/tracks.service';
import { useToastStore } from '@/store/toast.store';
import TrackForm from '../../components/TrackForm';
import { TrackFormData } from '@/validations/track.schema';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

export default function EditTrackPage() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const { success, error } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [trackData, setTrackData] = useState<any>(null);

  useEffect(() => {
    async function fetchTrack() {
      try {
        setFetching(true);
        const res = await tracksService.findById(id as string);
        if (res.success && res.data) {
          setTrackData(res.data);
        }
      } catch (err) {
        error('Failed to retrieve academic pathway data');
        navigate('/tracks');
      } finally {
        setFetching(false);
      }
    }
    fetchTrack();
  }, [id, error, navigate]);

  const handleSubmit = async (data: TrackFormData) => {
    setLoading(true);
    try {
      const res = await tracksService.update(id as string, data);
      if (res.success) {
        success('Academic pathway parameters successfully updated');
        navigate('/tracks');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update academic pathway');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">
          Accessing Curricular Node...<br />
          <span className="font-medium normal-case opacity-50">Syncing academic parameters</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Navigation */}
      <Link 
        href="/tracks" 
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
      >
        <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curriculum Index</span>
      </Link>

      {/* Header */}
      <section>
        <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
          Academic Infrastructure
        </div>
        <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
          Refine <span className="font-black text-primary">Academic pathway</span>
        </h2>
        <p className="text-on-surface-variant text-base font-medium max-w-2xl">
          Update the curricular focus and professional objectives for this learning pathway.
        </p>
      </section>

      {/* Form Card */}
      <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-glass border border-outline/30">
        <TrackForm 
          initialData={trackData} 
          onSubmit={handleSubmit} 
          isLoading={loading} 
          isEdit={true} 
        />
      </div>
    </div>
  );
}
