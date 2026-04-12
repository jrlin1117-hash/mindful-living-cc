import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 鼠尾草绿 - 主色调
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d4dac9',
          300: '#b8c2a7',
          400: '#9aa882',
          500: '#829064',
          600: '#67744f',
          700: '#525c3f',
          800: '#444c35',
          900: '#3a4030',
        },
        // 苔藓绿 - 强调色
        moss: {
          50: '#f4f7f2',
          100: '#e6ebe0',
          200: '#ccd7c1',
          300: '#a8be96',
          400: '#85a46d',
          500: '#688a52',
          600: '#527042',
          700: '#435837',
          800: '#384930',
          900: '#2f3e28',
        },
        // 米白色背景
        cream: {
          50: '#fdfcfa',
          100: '#f9f7f3',
          200: '#f3efe8',
          300: '#e8e2d8',
        },
        // 柔和蓝绿
        softteal: {
          50: '#f0f9f7',
          100: '#dff2ec',
          200: '#bfe5d9',
          300: '#94d2bd',
          400: '#5eb89d',
          500: '#3d9e82',
          600: '#28806a',
          700: '#236655',
          800: '#1f5345',
          900: '#1e463b',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-xl': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
