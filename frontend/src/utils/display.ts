import type { RiskLevel, IndicatorSeverity, ClaimAssessment } from '../types';

export function getRiskConfig(level: RiskLevel) {
  switch (level) {
    case 'HIGH':
      return {
        label: 'HIGH RISK',
        badgeClass: 'risk-badge-high',
        cardBg: 'bg-risk-high-bg border-risk-high-border',
        textColor: 'text-risk-high',
        dotColor: 'bg-risk-high',
        icon: '🚨',
        description: 'Multiple high-risk indicators detected. Exercise extreme caution.',
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM RISK',
        badgeClass: 'risk-badge-medium',
        cardBg: 'bg-risk-medium-bg border-risk-medium-border',
        textColor: 'text-risk-medium',
        dotColor: 'bg-risk-medium',
        icon: '⚠️',
        description: 'Suspicious patterns detected. Verify through official channels before acting.',
      };
    case 'LOW':
      return {
        label: 'LOW RISK',
        badgeClass: 'risk-badge-low',
        cardBg: 'bg-risk-low-bg border-risk-low-border',
        textColor: 'text-risk-low',
        dotColor: 'bg-risk-low',
        icon: '✓',
        description: 'Few risk signals detected. Remain cautious and verify through official sources.',
      };
    case 'INSUFFICIENT_EVIDENCE':
      return {
        label: 'INSUFFICIENT EVIDENCE',
        badgeClass: 'risk-badge-insufficient',
        cardBg: 'bg-risk-insufficient-bg border-risk-insufficient-border',
        textColor: 'text-risk-insufficient',
        dotColor: 'bg-risk-insufficient',
        icon: '?',
        description: 'Not enough information to assess the risk. Verify independently.',
      };
  }
}

export function getSeverityConfig(severity: IndicatorSeverity) {
  switch (severity) {
    case 'HIGH':
      return { label: 'HIGH', color: 'text-risk-high', bg: 'bg-risk-high-bg border-risk-high-border' };
    case 'MEDIUM':
      return { label: 'MED', color: 'text-risk-medium', bg: 'bg-risk-medium-bg border-risk-medium-border' };
    case 'LOW':
      return { label: 'LOW', color: 'text-risk-low', bg: 'bg-risk-low-bg border-risk-low-border' };
  }
}

export function getAssessmentConfig(assessment: ClaimAssessment) {
  switch (assessment) {
    case 'MISLEADING':
      return { label: 'Misleading', color: 'text-risk-high', bg: 'bg-risk-high-bg border-risk-high-border' };
    case 'UNSUPPORTED':
      return { label: 'Unsupported', color: 'text-risk-medium', bg: 'bg-risk-medium-bg border-risk-medium-border' };
    case 'UNVERIFIED':
      return { label: 'Unverified', color: 'text-risk-insufficient', bg: 'bg-risk-insufficient-bg border-risk-insufficient-border' };
    case 'SUPPORTED':
      return { label: 'Supported', color: 'text-risk-low', bg: 'bg-risk-low-bg border-risk-low-border' };
  }
}

export function getIndicatorIcon(indicator: string): string {
  const lower = indicator.toLowerCase();
  if (lower.includes('guarant') || lower.includes('return') || lower.includes('profit')) return '💰';
  if (lower.includes('urgency') || lower.includes('limited') || lower.includes('hurry') || lower.includes('act now')) return '⏰';
  if (lower.includes('fee') || lower.includes('payment') || lower.includes('send money') || lower.includes('registration')) return '💳';
  if (lower.includes('whatsapp') || lower.includes('telegram') || lower.includes('group')) return '📱';
  if (lower.includes('otp') || lower.includes('password')) return '🔐';
  if (lower.includes('sebi') || lower.includes('rbi') || lower.includes('government') || lower.includes('regulatory')) return '🏛️';
  if (lower.includes('insider') || lower.includes('secret') || lower.includes('tip')) return '🕵️';
  if (lower.includes('impersonat')) return '🎭';
  if (lower.includes('risk-free') || lower.includes('risk free')) return '⛔';
  if (lower.includes('double')) return '📈';
  return '🚩';
}

export function truncateId(id: string): string {
  return id.length > 16 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id;
}
