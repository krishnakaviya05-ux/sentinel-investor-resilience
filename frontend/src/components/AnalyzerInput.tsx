import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, AlertCircle, ChevronRight, Lock } from 'lucide-react';

const MAX_CHARS = 10000;
const MIN_CHARS = 10;

const EXAMPLES = [
  {
    id: 1,
    label: 'Guaranteed return',
    text: 'Guaranteed 40% return in 30 days. Join our exclusive group now and pay the registration fee immediately. Limited slots!',
  },
  {
    id: 2,
    label: 'Fee to withdraw',
    text: 'Your investment of ₹50,000 is ready. To unlock your withdrawal, pay a small processing fee of ₹2,000 to our registered account immediately.',
  },
  {
    id: 3,
    label: 'Insider tip group',
    text: 'Join our exclusive Telegram group for insider market tips. SEBI approved. Our experts give 100% accurate stock picks every day. No risk!',
  },
];

interface AnalyzerInputProps {
  onAnalyze: (content: string) => void;
  isLoading: boolean;
}

export function AnalyzerInput({ onAnalyze, isLoading }: AnalyzerInputProps) {
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExample = (text: string) => {
    setContent(text);
    setValidationError('');
    textareaRef.current?.focus();
  };

  const validate = useCallback((value: string): string => {
    if (!value.trim()) return 'Please enter a message or claim to analyze.';
    if (value.trim().length < MIN_CHARS) return 'Please provide more context so SENTINEL can analyze the message.';
    if (value.length > MAX_CHARS) return `Message is too long. Maximum ${MAX_CHARS.toLocaleString()} characters.`;
    return '';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate(content);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onAnalyze(content.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (validationError) setValidationError('');
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charColor = isOverLimit
    ? 'text-risk-high'
    : charCount > MAX_CHARS * 0.9
    ? 'text-risk-medium'
    : 'text-text-muted';

  return (
    <section id="analyze" className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="sentinel-card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Analyze a suspicious message
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Paste a message, claim, or financial offer below. SENTINEL will identify potential risk indicators and explain what you should verify.
            </p>
          </div>

          {/* Textarea */}
          <div className="relative">
            <label htmlFor="content" className="sr-only">
              Suspicious financial message
            </label>
            <textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              disabled={isLoading}
              rows={6}
              placeholder={`Example:\nGuaranteed 40% return in 30 days. Join our exclusive group now and pay the registration fee immediately...`}
              aria-label="Suspicious financial message"
              aria-describedby={validationError ? 'content-error' : 'content-hint'}
              aria-invalid={!!validationError}
              className={`w-full bg-canvas-900 text-text-primary placeholder-text-muted
                border rounded-lg p-4 resize-none text-sm leading-relaxed
                transition-colors duration-200
                focus:outline-none focus:border-accent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${validationError ? 'border-risk-high' : 'border-border hover:border-border-bright'}
              `}
            />
            {/* Character counter */}
            <div className={`absolute bottom-3 right-3 text-xs font-mono ${charColor}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </div>
          </div>

          {/* Validation error */}
          {validationError && (
            <div id="content-error" role="alert" className="flex items-center gap-2 text-sm text-risk-high">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isLoading || isOverLimit}
              className="btn-primary w-full sm:w-auto"
              aria-busy={isLoading}
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Analyzing...' : 'Analyze with SENTINEL'}
            </button>

            {/* Privacy note */}
            <div id="content-hint" className="flex items-center gap-1.5 text-xs text-text-muted">
              <Lock className="w-3 h-3 flex-shrink-0" />
              Do not enter passwords, OTPs, or bank details.
            </div>
          </div>
        </div>
      </form>

      {/* Example chips */}
      <div className="mt-6">
        <p className="text-xs text-text-muted mb-3 font-medium uppercase tracking-wider">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleExample(ex.text)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-canvas-800 hover:bg-canvas-700
                         border border-border hover:border-border-bright
                         text-text-secondary hover:text-text-primary
                         text-xs font-medium transition-all duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3 h-3 text-accent" />
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
