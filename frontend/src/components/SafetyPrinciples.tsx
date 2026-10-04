const PRINCIPLES = [
  {
    icon: '🛡',
    title: 'Safety First',
    description:
      'No investment recommendations. No buy/sell/hold advice. No stock price predictions. Ever.',
  },
  {
    icon: '🔎',
    title: 'Explainable',
    description:
      'Every risk indicator comes with an explanation so you understand why a message was flagged.',
  },
  {
    icon: '⚠️',
    title: 'Honest Uncertainty',
    description:
      'No fabricated evidence. No false certainty. If something cannot be verified, SENTINEL says so.',
  },
  {
    icon: '🔐',
    title: 'Privacy by Design',
    description:
      'SENTINEL never asks for OTPs, passwords, bank credentials, or any sensitive financial data.',
  },
];

export function SafetyPrinciples() {
  return (
    <section id="safety" className="py-20 border-t border-border bg-canvas-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-3">
            Our Commitment
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Built for Investor Resilience
          </h2>
          <p className="text-text-secondary text-sm mt-3 max-w-md mx-auto leading-relaxed">
            SANGYAN × SEBI × NSDL — Helping first-time investors stay safe in India's digital financial ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="sentinel-card flex items-start gap-4 hover:border-border-bright transition-colors">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {p.icon}
              </span>
              <div>
                <h3 className="text-text-primary font-semibold mb-1">{p.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
