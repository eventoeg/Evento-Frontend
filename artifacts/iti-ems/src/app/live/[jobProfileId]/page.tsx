import { useParams } from 'wouter';
import { InterviewerConsole } from '@/features/interviews/components/InterviewerConsole';
import AuthGuard from '@/components/AuthGuard';

export default function LiveQueuePage() {
  const params = useParams<{ jobProfileId: string }>();
  const jobProfileId = params.jobProfileId;

  if (!jobProfileId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-on-surface-variant">No job profile specified.</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface p-6">
        <InterviewerConsole jobProfileId={jobProfileId} />
      </div>
    </AuthGuard>
  );
}
