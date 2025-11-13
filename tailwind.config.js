/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        customPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.7" },
        },
        softAppear: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        customPulse: "customPulse 1.5s infinite",
        softAppear: "softAppear 0.5s ease-out forwards",
        slideUp: "slideUp 0.3s ease-out",
        slideInRight: "slideInRight 0.3s ease-out",
        "gradient-slow": "gradientMove 15s ease infinite",
      },
      colors: {
        emotion: {
          happy: "#FFF3E9",
          laugh: "#FFFCE2",
          love: "#FFE6EE",
          sad: "#E4F3FB",
          surprise: "#E6FAEE",
          thinking: "#F1EAFB",
        },
        memoria: {
          primary: "#F0A079",
          secondary: "#FFB9AE",
          "secondary-dark": "#E77E6E",
          text: "#2D4B53",
          background: "#FCF8F0",
        },
        "emotion-border": {
          happy: "#FFBE98",
          laugh: "#FDEE93",
          love: "#FFAEC7",
          sad: "#77C3EC",
          surprise: "#8DECB4",
          thinking: "#BEAEE2",
        },
      },
      boxShadow: {
        "glow-happy": "0 0 50px rgba(252, 140, 55, 0.4)",
        "glow-laugh": "0 0 50px rgba(247, 254, 56, 0.4)",
        "glow-love": "0 0 50px rgba(250, 63, 132, 0.4)",
        "glow-sad": "0 0 50px rgba(54, 180, 253, 0.4)",
        "glow-surprise": "0 0 50px rgba(54, 238, 60, 0.4)",
        "glow-thinking": "0 0 50px rgba(184, 55, 240, 0.4)",
        "soft-glow": "0 0 25px rgba(240, 160, 121, 0.4)",
      },
    },
  },
  plugins: [],
};
