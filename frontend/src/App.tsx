import { useState, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyzerInput } from './components/AnalyzerInput';
import { LoadingState } from './components/LoadingState';
import { AnalysisResult } from './components/AnalysisResult';
import { SafetyBlock } from './components/SafetyBlock';
import { ErrorDisplay } from './components/ErrorDisplay';
import { HowItWorks } from './components/HowItWorks';
import { SafetyPrinciples } from './components/SafetyPrinciples';
import { analyzeContent } from './services/api';
import type { AnalyzeResponse, SafetyResponse, ApiError } from './types';
import { isAnalyzeResponse, isSafetyResponse } from './types';
import { Shield } from 'lucide-react';

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'result'; data: AnalyzeResponse }
  | { status: 'safety'; data: SafetyResponse }
  | { status: 'error'; error: ApiError };

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = useCallback(async (content: string) => {
    setState({ status: 'loading' });

    // Scroll to results area smoothly
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const response = await analyzeContent(content);

      if (isAnalyzeResponse(response)) {
        setState({ status: 'result', data: response });
      } else if (isSafetyResponse(response)) {
        setState({ status: 'safety', data: response });
      } else {
        setState({
          status: 'error',
          error: { type: 'parse', message: 'Unexpected response format from backend.' },
        });
      }
    } catch (err) {
      setState({ status: 'error', error: err as ApiError });
    }

    // Scroll after state update
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRetry = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const isLoading = state.status === 'loading';
  const showInputForm = state.status === 'idle' || state.status === 'loading';

  return (
    <div className="min-h-screen bg-canvas-900">
      <Navbar />

      {/* Main content */}
      <main className="pt-14">
        {/* Hero section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 text-center border-b border-border bg-canvas-950">
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-accent/10 border border-accent/20 text-accent text-xs font-semibold
                            uppercase tracking-wider mb-6">
              <Shield className="w-3.5 h-3.5" />
              AI-Powered Financial Safety
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              <span className="text-gradient">Don't Trust the Message.</span>
              <br />
              <span className="text-text-primary">Verify the Claim.</span>
            </h1>

            {/* Subtext */}
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Analyze suspicious financial messages and claims, identify red flags, and understand what to verify before you act.
            </p>
          </div>
        </section>

        {/* Analyzer area */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Input form — only shown when not in result/error */}
            {showInputForm && (
              <AnalyzerInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}

            {/* Results anchor */}
            <div ref={resultRef} aria-live="polite" aria-atomic="true">
              {state.status === 'loading' && <LoadingState />}

              {state.status === 'result' && (
                <AnalysisResult result={state.data} onReset={handleReset} />
              )}

              {state.status === 'safety' && (
                <>
                  <SafetyBlock response={state.data} />
                  <div className="flex justify-center mt-6">
                    <button onClick={handleReset} className="btn-secondary text-sm">
                      ← Back to Analyzer
                    </button>
                  </div>
                </>
              )}

              {state.status === 'error' && (
                <ErrorDisplay error={state.error} onRetry={handleRetry} />
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Safety Principles */}
        <SafetyPrinciples />

        {/* Footer */}
        <footer className="border-t border-border bg-canvas-950 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-text-muted text-sm font-medium">SENTINEL</span>
            </div>
            <p className="text-text-dim text-xs text-center max-w-md leading-relaxed">
              SENTINEL provides educational risk analysis for investor safety only.
              It does not provide investment advice, buy/sell/hold recommendations,
              or stock price predictions. SANGYAN Investor Resilience Hackathon — IIT (BHU) × SEBI × NSDL.
            </p>
            <p className="text-text-dim text-xs">Track A — Digital Fraud Resilience</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
