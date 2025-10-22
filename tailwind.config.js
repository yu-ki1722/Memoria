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
      },
      animation: {
        customPulse: "customPulse 1.5s infinite",
        softAppear: "softAppear 0.5s ease-out forwards",
      },
      colors: {
        emotion: {
          happy: "#FFFAF0",
          laugh: "#fefff0ff",
          love: "#FFF5F7",
          sad: "#E6E9FA",
          surprise: "#eff9f0ff",
          thinking: "#f3eff5ff",
        },
        "emotion-border": {
          happy: "#FC8C37",
          laugh: "#e7ed34ff",
          love: "#FA3F84",
          sad: "#365EFD",
          surprise: "#36ee55ff",
          thinking: "#F037CE",
        },
      },
      boxShadow: {
        "glow-happy": "0 0 50px rgba(252, 140, 55, 0.4)", // ぼかしを大きく、透明度を少し上げる
        "glow-laugh": "0 0 50px rgba(247, 254, 56, 0.4)",
        "glow-love": "0 0 50px rgba(250, 63, 132, 0.4)",
        "glow-sad": "0 0 50px rgba(54, 94, 253, 0.4)",
        "glow-surprise": "0 0 50px rgba(54, 238, 60, 0.4)",
        "glow-thinking": "0 0 50px rgba(184, 55, 240, 0.4)",
      },
    },
  },
  plugins: [],
};
