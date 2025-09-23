/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Futuristic CV Color Palette
        primary: {
          DEFAULT: '#3B82F6', // Electric Blue
          50: '#EBF4FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          DEFAULT: '#10B981', // Green
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Dark theme colors
        background: 'hsl(220 20% 5%)',
        foreground: 'hsl(210 40% 98%)',
        card: {
          DEFAULT: 'hsl(220 15% 8%)',
          foreground: 'hsl(210 40% 98%)',
          glass: 'hsl(220 15% 10%)',
        },
        border: 'hsl(220 15% 20%)',
        input: 'hsl(220 15% 15%)',
        ring: 'hsl(217 91% 60%)',
        muted: {
          DEFAULT: 'hsl(220 15% 15%)',
          foreground: 'hsl(210 20% 70%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 70% 55%)',
          foreground: 'hsl(210 40% 98%)',
        },
        // CV Semantic Colors for Skills and Sections
        skill: {
          primary: '#3B82F6',      // Electric Blue for Primary Skills
          secondary: '#8B5CF6',    // Purple for Secondary Skills
          accent: '#10B981',       // Green for Accent Skills
          expert: '#60A5FA',       // Bright Blue for Expert Level
          advanced: '#A78BFA',     // Bright Purple for Advanced Level
          intermediate: '#34D399', // Bright Green for Intermediate Level
          beginner: '#F59E0B',     // Orange for Beginner Level
        },
        // Section-specific colors
        hero: {
          accent: '#3B82F6',       // Electric Blue for Hero
        },
        experience: {
          accent: '#8B5CF6',       // Purple for Experience
        },
        projects: {
          accent: '#10B981',       // Green for Projects
        },
        contact: {
          accent: '#3B82F6',       // Electric Blue for Contact
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 2s',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'slide-in-up': 'slideInUp 0.6s ease-out',
        'fade-in-scale': 'fadeInScale 0.5s ease-out',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 20px hsl(217 91% 60% / 0.3)' },
          '100%': { boxShadow: '0 0 40px hsl(217 91% 60% / 0.6)' },
        },
        slideInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInScale: {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right top'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px hsl(217 91% 60% / 0.3)',
        'glow-lg': '0 0 40px hsl(217 91% 60% / 0.4)',
        'glow-primary': '0 0 30px hsl(217 91% 60% / 0.3)',
        'glow-secondary': '0 0 30px hsl(280 70% 50% / 0.3)',
        'glow-accent': '0 0 30px hsl(150 80% 45% / 0.3)',
        'glass': '0 8px 32px hsl(220 20% 2% / 0.3), inset 0 1px 0 hsl(220 15% 20% / 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(217 91% 60%), hsl(280 70% 50%))',
        'gradient-secondary': 'linear-gradient(135deg, hsl(280 70% 50%), hsl(150 80% 45%))',
        'gradient-accent': 'linear-gradient(135deg, hsl(150 80% 45%), hsl(217 91% 60%))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
