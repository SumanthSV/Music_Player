import { Mic, MicOff } from 'lucide-react';

interface VoiceControlProps {
  isListening: boolean;
  // isMusyMode: boolean;
  isSupported: boolean;
  // onToggleMusyMode: () => void;
  onMicClick: () => void;
}

export const VoiceControl = ({
  isListening,
  // isMusyMode,
  isSupported,
  // onToggleMusyMode,
  onMicClick,
}: VoiceControlProps) => {
  if (!isSupported) {
    return (
      <div className="text-center text-red-400 bg-red-950/50 px-6 py-3 rounded-lg">
        Voice recognition not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onMicClick}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:scale-105 shadow-lg shadow-cyan-500/50'
        }`}
      >
        {isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}

        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
        )}
      </button>

      {isListening && (
        <div className="text-cyan-400 text-sm animate-pulse">Listening...</div>
      )}
    </div>
  );
};
