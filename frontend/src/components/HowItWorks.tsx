import { ClipboardPaste, ScanSearch, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: ClipboardPaste,
    title: 'Paste',
    description:
      'Paste a suspicious financial message, promotional claim, or offer you received.',
  },
  {
    num: '02',
    icon: ScanSearch,
    title: 'Analyze',
    description:
      'SENTINEL identifies claims, detects risk indicators, and explains potential red flags.',
  },
  {
    num: '03',
    icon: ShieldCheck,
    title: 'Verify',
    description:
      'Understand the evidence, uncertainty, and safe next steps before you act.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-3">
            Simple Process
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-border" aria-hidden="true" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative">
                <div className="sentinel-card flex flex-col items-center text-center gap-4">
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-xl bg-canvas-700 border border-border-bright flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted font-mono mb-1">
                      {step.num}
                    </p>
                    <h3 className="text-text-primary font-semibold text-base mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
