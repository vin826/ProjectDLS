 /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '344px', // Target very small mobile devices (like the user's 344x882)
        // Default Tailwind breakpoints
        // sm: '640px',   
        // md: '768px',   
        // lg: '1024px',  
        // xl: '1280px',  
        // 2xl: '1536px', 
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
