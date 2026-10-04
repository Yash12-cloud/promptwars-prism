/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sidebar-mist": "#f9f9f9",
        "pure-white": "#ffffff",
        "graphite-ink": "#0d0d0d",
        "mid-ash": "#5d5d5d",
        hollow: "#767676", // 4.54:1 on white — WCAG AA for normal text
        hairline: "rgba(0,0,0,0.10)",
        "hover-veil": "rgba(0,0,0,0.05)",
        "ink-press": "#000000",
        "deep-charcoal": "rgba(0,0,0,0.50)",
        "edge-gray": "#e6e6e6",
        // legacy aliases still used in some components during transition
        paper: "#ffffff",
        ink: "#0d0d0d",
        muted: "#5d5d5d",
        line: "rgba(0,0,0,0.10)",
        violet: "#0d0d0d",
        "violet-light": "#f9f9f9",
        amber: "#8f8f8f",
        teal: "#5d5d5d",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        nav: "10px",
        cards: "10px",
        links: "16px",
        buttons: "10px",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
};
