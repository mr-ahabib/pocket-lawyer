// Clean, Professional White Theme System Design for Pocket Lawyer

export const theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Typography
    textPrimary: '#0F172A',     // Deep Slate
    textSecondary: '#475569',   // Neutral Charcoal
    textMuted: '#94A3B8',       // Light Muted Gray
    
    // Brand Accents
    primary: '#1D4ED8',         // Trust Navy Blue
    primaryLight: '#EFF6FF',    // Light Ice Blue
    primaryHover: '#1E40AF',
    
    // Status Accents
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    
    // Accent Badges
    badgePolice: '#1E3A8A',
    badgeTraffic: '#B45309',
    badgeConsumer: '#047857',
    badgeLand: '#4D7C0F',
    badgeCyber: '#6D28D9',
    badgeFinance: '#0E7490',
  },
  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    }
  }
};
