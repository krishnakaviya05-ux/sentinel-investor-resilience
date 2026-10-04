import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  'Analyzing the message...',
  'Extracting claims...',
  'Checking risk indicators...',
  'Preparing safety guidance...',
];

export function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Analyzing message"
      className="w-full max-w-3xl mx-auto animate-fade-in"
    >
      <div className="sentinel-card flex flex-col items-center justify-center py-14 gap-5">
        {/* Spinner */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-full border border-accent/20 animate-pulse-slow" />
        </div>

        {/* Cycling step */}
        <div className="text-center space-y-1">
          <p className="text-text-primary font-medium text-sm transition-all duration-500">
            {STEPS[stepIndex]}
          </p>
          <p className="text-text-muted text-xs">
            SENTINEL is inspecting the message for risk patterns
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'bg-accent scale-125' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
