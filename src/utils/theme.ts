export const LIGHT_COLORS = {
  // Primary brand
  primary: '#0F2942',        // Deep Navy
  primaryDark: '#0A1C2E',
  primaryLight: '#1E3A5F',
  accent: '#10B981',         // Emerald Green
  accentDark: '#059669',
  accentLight: '#34D399',

  // Secondary & Accents
  secondary: '#3B82F6',      // Royal Blue
  secondaryLight: '#60A5FA',
  purple: '#8B5CF6',
  gold: '#F59E0B',

  // Statuses
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Backgrounds & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  cardBorder: '#E2E8F0',
  divider: '#EEF2F6',

  // Text
  textPrimary: '#0F172A',    // Very dark slate
  textSecondary: '#475569',  // Medium slate
  textMuted: '#94A3B8',      // Light slate
  textInverted: '#FFFFFF',
  textSuccess: '#065F46',
  textWarning: '#92400E',
  textDanger: '#991B1B',
  textInfo: '#1E40AF',

  // Overlay
  modalOverlay: 'rgba(15, 23, 42, 0.65)',
};

export const DARK_COLORS = {
  // Primary brand
  primary: '#38BDF8',        // Bright blue highlight for dark mode
  primaryDark: '#0284C7',
  primaryLight: '#0F172A',
  accent: '#10B981',         // Emerald Green
  accentDark: '#059669',
  accentLight: '#34D399',

  // Secondary & Accents
  secondary: '#60A5FA',
  secondaryLight: '#93C5FD',
  purple: '#A78BFA',
  gold: '#FBBF24',

  // Statuses
  success: '#34D399',
  successBg: 'rgba(16, 185, 129, 0.2)',
  warning: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.2)',
  danger: '#F87171',
  dangerBg: 'rgba(239, 68, 68, 0.2)',
  info: '#60A5FA',
  infoBg: 'rgba(59, 130, 246, 0.2)',

  // Backgrounds & Surfaces
  background: '#0B1120',     // Deep midnight slate
  surface: '#1E293B',        // Dark slate surface
  surfaceSubtle: '#334155',  // Medium slate
  cardBorder: '#334155',     // Border for cards
  divider: '#334155',

  // Text
  textPrimary: '#F8FAFC',    // Pure light text
  textSecondary: '#CBD5E1',  // Soft slate text
  textMuted: '#94A3B8',      // Muted slate
  textInverted: '#0F172A',
  textSuccess: '#6EE7B7',
  textWarning: '#FDE68A',
  textDanger: '#FCA5A5',
  textInfo: '#93C5FD',

  // Overlay
  modalOverlay: 'rgba(0, 0, 0, 0.82)',
};

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

export const SHADOWS = {
  none: {},
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const formatCurrency = (amount: number, currency = 'KES'): string => {
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${parts}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
