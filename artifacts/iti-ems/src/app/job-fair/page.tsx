import { Link } from 'wouter';
import { Globe, Mail } from 'lucide-react';

export default function JobFairIndexPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#C1272D]/10 flex items-center justify-center mx-auto mb-6">
          <Globe className="w-8 h-8 text-[#C1272D]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] mb-3">Job Fair Portal</h1>
        <p className="text-slate-500 mb-8">
          Companies can only access this page through an invitation link sent via email. If you haven't received an invitation, please contact the admin.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#C1272D] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#C1272D]/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Sign In to Dashboard
          </Link>
          <p className="text-xs text-slate-400">
            Need an invitation? Contact your ITI admin coordinator.
          </p>
        </div>
      </div>
    </div>
  );
}
