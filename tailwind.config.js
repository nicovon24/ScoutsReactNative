/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────
        mainBg:   '#0F0F0F',
        surface:  '#161616',
        card:     '#1C1C1C',
        'card-2': '#222222',
        input:    '#252525',
        sidebar:  '#131313',

        // ── Borders ──────────────────────────────────────
        border:   '#2C2C2C',
        'border-h': '#3C3C3C',

        // ── Text ─────────────────────────────────────────
        primary:   '#F2F2F2',
        secondary: '#B8B8B8',
        muted:     '#717171',

        // ── Brand accent ─────────────────────────────────
        green: {
          DEFAULT: '#64ffda',  // cyan accent
          dark:    '#26d4b3',
          light:   '#9fffe9',
        },

        // ── Semantic ─────────────────────────────────────
        gold:    '#E8A838',
        danger:  '#F04444',
        warn:    '#F0A04B',
        success: '#64ffda',

        // ── Legacy (keep for backward compat) ────────────
        lime: {
          400: '#64ffda',
          500: '#26d4b3',
        },
      },
      boxShadow: {
        'glow-green':  '0 0 20px rgba(100,255,218,0.18)',
        'glow-gold':   '0 0 20px rgba(232,168,56,0.18)',
        card:          '0 2px 8px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '28px',
      },
      fontSize: {
        '2xs': ['10px', '1'],
      },
    },
  },
  plugins: [],
};
