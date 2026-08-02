/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#A855F7',
          light: '#C084FC',
          dark: '#9333EA',
        },
        accent: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          dark: '#DB2777',
        },
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#ab7676',
          raised: '#a9c8e8',
        },
        ink: '#0F172A',
        glow: '#7C3AED',
        bloom: '#EC4899',
        border: {
          DEFAULT: '#26282b',
          light: '#444b52',
        },
        text: {
          primary: '#0F172A',
          muted: '#64748B',
          faint: '#94A3B8',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 8px 30px -6px rgba(124, 58, 237, 0.35)',
        'glow-lg': '0 20px 60px -12px rgba(124, 58, 237, 0.4)',
        bloom: '0 8px 24px -6px rgba(236, 72, 153, 0.35)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.06), 0 16px 40px -10px rgba(124, 58, 237, 0.18)',
        floating: '0 24px 70px -20px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.12) 100%)',
        'gradient-radial-glow':
          'radial-gradient(circle at 15% 0%, rgba(124,58,237,0.16), transparent 45%), radial-gradient(circle at 85% 20%, rgba(236,72,153,0.14), transparent 45%), radial-gradient(circle at 50% 100%, rgba(168,85,247,0.12), transparent 50%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: 0, transform: 'scale(0.94)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.3)' },
          '60%': { transform: 'scale(0.95)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-in': 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'heart-beat': 'heartBeat 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
