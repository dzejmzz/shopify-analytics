// Modern Dark Blue Design System
// Professional color palette with dark blue primary and light blue accents

export const colors = {
  // Primary Dark Blue Palette
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Blue
    600: '#2563eb',  // Dark blue (primary)
    700: '#1d4ed8',  // Darker blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Deepest blue
    950: '#172554',  // Navy blue
  },
  
  // Background Colors (Light Blueish)
  background: {
    primary: '#fafbff',    // Very light blue-white
    secondary: '#f1f5ff',  // Light blue-gray
    tertiary: '#e0e7ff',   // Soft blue
    card: '#ffffff',       // Pure white for cards
    overlay: 'rgba(30, 58, 138, 0.05)', // Subtle blue overlay
  },
  
  // Text Colors
  text: {
    primary: '#1e3a8a',    // Dark blue for headings
    secondary: '#374151',   // Dark gray for body text
    tertiary: '#6b7280',   // Medium gray for secondary text
    muted: '#9ca3af',      // Light gray for muted text
    inverse: '#ffffff',    // White text for dark backgrounds
  },
  
  // Border Colors
  border: {
    light: '#e5e7eb',      // Light gray border
    medium: '#d1d5db',     // Medium gray border
    primary: '#3b82f6',    // Blue border for focus states
    dark: '#374151',       // Dark border
  },
  
  // Status Colors
  status: {
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
  },
  
  // Gradient Colors
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    background: 'linear-gradient(135deg, #fafbff 0%, #f1f5ff 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// Spacing System (8px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Blue-tinted shadows for primary elements
  primarySm: '0 1px 2px 0 rgba(37, 99, 235, 0.1)',
  primary: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
  primaryLg: '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)',
} as const;

// Animation & Transitions
export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
} as const;

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      background: colors.primary[600],
      color: colors.text.inverse,
      border: colors.primary[600],
      hover: {
        background: colors.primary[700],
        border: colors.primary[700],
      },
      focus: {
        ring: colors.primary[500],
      },
    },
    secondary: {
      background: colors.background.card,
      color: colors.primary[600],
      border: colors.border.medium,
      hover: {
        background: colors.primary[50],
        border: colors.primary[300],
      },
      focus: {
        ring: colors.primary[500],
      },
    },
    ghost: {
      background: 'transparent',
      color: colors.primary[600],
      border: 'transparent',
      hover: {
        background: colors.primary[50],
        border: 'transparent',
      },
      focus: {
        ring: colors.primary[500],
      },
    },
  },
  
  card: {
    default: {
      background: colors.background.card,
      border: colors.border.light,
      shadow: shadows.base,
      hover: {
        shadow: shadows.md,
      },
    },
    elevated: {
      background: colors.background.card,
      border: colors.border.light,
      shadow: shadows.lg,
      hover: {
        shadow: shadows.xl,
      },
    },
    primary: {
      background: colors.gradients.card,
      border: colors.primary[200],
      shadow: shadows.primary,
      hover: {
        shadow: shadows.primaryLg,
      },
    },
  },
  
  input: {
    default: {
      background: colors.background.card,
      border: colors.border.medium,
      color: colors.text.primary,
      placeholder: colors.text.muted,
      focus: {
        border: colors.primary[500],
        ring: colors.primary[500],
      },
    },
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Export the complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentVariants,
  breakpoints,
  zIndex,
} as const;

export default designSystem;