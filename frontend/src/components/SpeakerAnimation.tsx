interface SpeakerAnimationProps {
  isPlaying?: boolean;
  audioLevel?: number; // 0..1
}

export const SpeakerAnimation = ({ isPlaying, audioLevel = 0 }: SpeakerAnimationProps) => {
  const bars = 6;
  const level = Math.min(1, Math.max(0, audioLevel));

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-32 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50" />

        <div className="relative z-10 flex items-end gap-1 h-20 px-4">
          {Array.from({ length: bars }).map((_, i) => {
            // stagger heights across bars for nicer visual
            const factor = 0.4 + (i / bars) * 0.8;
            const height = 4 + Math.round(level * 100 * factor);
            return (
              <div
                key={i}
                style={{ height: `${height}px`, transition: 'height 120ms linear' }}
                className="w-2 bg-white rounded"
              />
            );
          })}
        </div>

        <svg
          className="absolute bottom-2 right-3 z-20 w-10 h-10 text-white opacity-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414a2 2 0 001.414.586h2v-4H7a2 2 0 00-2 2v1a1 1 0 001 1zm0 0l6-6v10"
          />
        </svg>
      </div>
    </div>
  );
};