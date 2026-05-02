interface FallbackBannerProps {
  visible: boolean;
}

export function FallbackBanner({ visible }: FallbackBannerProps) {
  if (!visible) return null;
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm text-orange-800 flex items-center gap-2">
      <span className="material-symbols-outlined text-base">wifi_off</span>
      Connection lost — polling for updates. Real-time sync will resume automatically.
    </div>
  );
}
