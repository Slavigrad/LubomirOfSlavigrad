/** @type {import('tailwindcss').Config} */

/*
 * ─────────────────────────────────────────────────────────────────
 *  SLAVIGRAD CHRONICLES — "Smoked Crystal" design tokens (2026)
 *
 *  Concept: glassmorphism reinterpreted as Bohemian smoked crystal.
 *  One material (dark green-black glass), one metal (aged gold),
 *  warm ivory ink. No rainbow gradients, no neon glow.
 *
 *  Token API is unchanged (primary / secondary / accent / muted /
 *  skill.* / section accents) so components compile as-is.
 * ─────────────────────────────────────────────────────────────────
 */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Aged Gold — the single signature accent ──────────────
        primary: {
          DEFAULT: '#CFA050', // aged gold
          50:  '#FBF6EC',
          100: '#F5EAD3',
          200: '#EBD6A8',
          300: '#E0C07D',
          400: '#D8B065',
          500: '#CFA050',
          600: '#B2853C',
          700: '#8E6930',
          800: '#6B4F26',
          900: '#4A371B',
          950: '#2B2010',
        },
        // ── Jade — quiet supporting hue (smoked-glass green) ─────
        secondary: {
          DEFAULT: '#7FA893', // muted jade
          50:  '#F0F5F2',
          100: '#DCE8E1',
          200: '#BCD3C5',
          300: '#9DBEAC',
          400: '#8DB39F',
          500: '#7FA893',
          600: '#638A77',
          700: '#4D6C5D',
          800: '#394F45',
          900: '#27352F',
          950: '#161E1B',
        },
        // ── Champagne — highlight tone for emphasis text/borders ─
        accent: {
          DEFAULT: '#E6D3AC', // champagne
          50:  '#FDFBF5',
          100: '#F9F3E4',
          200: '#F2E6C9',
          300: '#ECDCBA',
          400: '#E9D8B3',
          500: '#E6D3AC',
          600: '#CDB585',
          700: '#A78F60',
          800: '#7C6A47',
          900: '#52462F',
          950: '#2D2619',
        },
        // ── Surfaces: warm green-black, not blue-black ───────────
        background: 'hsl(160 14% 5%)',          // smoked bottle-glass black
        foreground: 'hsl(40 30% 93%)',          // warm ivory ink
        card: {
          DEFAULT: 'hsl(160 12% 7%)',
          foreground: 'hsl(40 30% 93%)',
          glass: 'hsl(160 12% 9%)',
        },
        border: 'hsl(160 10% 17%)',
        input:  'hsl(160 10% 12%)',
        ring:   'hsl(40 55% 58%)',              // gold focus ring
        muted: {
          DEFAULT: 'hsl(160 10% 12%)',
          foreground: 'hsl(40 10% 64%)',        // warm stone grey
        },
        destructive: {
          DEFAULT: 'hsl(8 50% 50%)',            // muted brick, not alarm-red
          foreground: 'hsl(40 30% 93%)',
        },
        // ── Skill levels: one material, four finishes ────────────
        // Premium = a single hue ramp, not a rainbow.
        skill: {
          primary:      '#CFA050',
          secondary:    '#7FA893',
          accent:       '#E6D3AC',
          expert:       '#E0C07D',  // bright gold      — most light
          advanced:     '#CDB585',  // burnished gold
          intermediate: '#8DB39F',  // jade
          beginner:     '#8C8577',  // warm stone       — least light
        },
        // ── Sections: gold leads, jade supports — nothing shouts ─
        hero:       { accent: '#CFA050' },
        experience: { accent: '#E6D3AC' },
        projects:   { accent: '#7FA893' },
        contact:    { accent: '#CFA050' },
      },
      fontFamily: {
        // Hanken Grotesk: quiet humanist body face
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        // Marcellus: lapidary, inscription-like display face —
        // carries the "chronicle" identity. Use for headings only.
        display: ['Marcellus', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        display: '0.02em', // Marcellus likes a little air
        caps: '0.14em',    // for small-caps eyebrows/labels
      },
      animation: {
        // Same names, drastically calmer values.
        'float':        'float 12s ease-in-out infinite',
        'float-delay':  'float 12s ease-in-out infinite 4s',
        'pulse-glow':   'pulseGlow 5s ease-in-out infinite alternate',
        'slide-in-up':  'slideInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in-scale':'fadeInScale 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        // Gradient animations retired: resolve to a slow, barely
        // perceptible drift so existing usages degrade gracefully.
        'gradient-x':   'gradient-x 40s ease infinite',
        'gradient-y':   'gradient-y 40s ease infinite',
        'gradient-xy':  'gradient-xy 40s ease infinite',
      },
      keyframes: {
        // Float: 4px drift, not 20px bounce.
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        // Pulse: a faint warm breath on the edge, not a neon strobe.
        pulseGlow: {
          '0%':   { boxShadow: '0 0 0 1px hsl(40 55% 58% / 0.10)' },
          '100%': { boxShadow: '0 0 0 1px hsl(40 55% 58% / 0.28)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'center top' },
          '50%':      { 'background-size': '200% 200%', 'background-position': 'center bottom' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%':      { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-xy': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left top' },
          '50%':      { 'background-size': '200% 200%', 'background-position': 'right bottom' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // "Glow" tokens survive in name but become candlelight,
        // not neon: very low alpha warm halos + real drop shadow.
        'glow':           '0 1px 2px hsl(160 20% 2% / 0.5), 0 0 24px hsl(40 55% 58% / 0.08)',
        'glow-lg':        '0 2px 6px hsl(160 20% 2% / 0.5), 0 0 48px hsl(40 55% 58% / 0.10)',
        'glow-primary':   '0 1px 2px hsl(160 20% 2% / 0.5), 0 0 28px hsl(40 55% 58% / 0.12)',
        'glow-secondary': '0 1px 2px hsl(160 20% 2% / 0.5), 0 0 28px hsl(155 22% 56% / 0.10)',
        'glow-accent':    '0 1px 2px hsl(160 20% 2% / 0.5), 0 0 28px hsl(42 48% 78% / 0.10)',
        // The crystal shadow: tight contact line + deep soft ambient
        // + inner top light. This is what makes the glass read as
        // a physical slab instead of a translucent div.
        'glass': '0 1px 1px hsl(160 20% 2% / 0.55), 0 12px 32px -8px hsl(160 20% 2% / 0.55), inset 0 1px 0 hsl(40 30% 93% / 0.07)',
      },
      backgroundImage: {
        // Metal, not rainbow: gold → champagne → gold.
        'gradient-primary':   'linear-gradient(135deg, #CFA050, #E6D3AC)',
        'gradient-secondary': 'linear-gradient(135deg, #7FA893, #CDB585)',
        'gradient-accent':    'linear-gradient(135deg, #E6D3AC, #CFA050)',
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        // Slightly tighter than before; crystal is cut, not pebbled.
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
