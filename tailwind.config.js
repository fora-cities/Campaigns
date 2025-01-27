const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "false",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // Tremor module
  ],
  theme: {
    extend: {
      backgroundImage: {
        "button-gradient": "linear-gradient(90deg, #5832d5, #1300e0)",
        "button-gradient-lighten": "linear-gradient(90deg, #6140e0, #1b0de8)",
        "button-gradient-darken": "linear-gradient(90deg, #5030ca, #1200d6)"
      },
      colors: {
        accent: {
          orange: '#FF7C0A',
          red: '#FF3700',
          green: '#00C907',
          violet: '#8A2BE2',
          blue: '#034FCA',
        },
        warm: {
          50: "#fbfaf8",
          100: "#f8f6f2",
          150: "#f5f2eb",
          200: "#f2ede5",
          250: "#efe9de",
          300: "#ece5d8",
          350: "#e9e0d1",
          400: "#e6dccb",
          450: "#e3d8c4",
          500: "#e0d4be",
          550: "#c9beab",
          600: "#b3a998",
          650: "#9c9485",
          700: "#867f72",
          750: "#706a5f",
          800: "#59544c",
          850: "#433f39",
          900: "#2c2a26",
          950: "#161513",
        },
        gray: {
          "50": "#FFFFFF",
          "100": "#F8F8F8",
          "150": "#F1F1F1",
          "200": "#EBEBEB",
          "250": "#E4E4E4",
          "300": "#E2E3E8",
          "350": "#DCDBDD",
          "400": "#D5D3D2",
          "450": "#CECBC6",
          "500": "#C7C4BB",
          "550": "#B0ADA7",
          "600": "#999693",
          "650": "#82807E",
          "700": "#6B6A69",
          "750": "#545354",
          "800": "#333333",
          "850": "#2C2B2B",
          "900": "#252424",
          "950": "#1E1D1D"
        },
        brand: {
          primary: "#00FFEA",
          secondary: "#FF8000",
          magenta: "#FF0062",
          lightBase: "#fbfaf8",
          darkBase: "#2C2A26",
          gray: {
            50: "#fbfaf8",
            100: "#f8f6f2",
            150: "#f5f2eb",
            200: "#f2ede5",
            250: "#efe9de",
            300: "#ece5d8",
            350: "#e9e0d1",
            400: "#e6dccb",
            450: "#e3d8c4",
            500: "#e0d4be",
            550: "#c9beab",
            600: "#b3a998",
            650: "#9c9485",
            700: "#867f72",
            750: "#706a5f",
            800: "#59544c",
            850: "#433f39",
            900: "#2c2a26",
            950: "#161513",
          },
        },
        // light mode
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        // dark mode
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // custom
            muted: "#172554", // blue-950
            subtle: "#1e40af", // blue-800
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#60a5fa", // blue-400
            inverted: "#030712", // gray-950
          },
          background: {
            muted: "#131A2B", // custom
            subtle: "#1f2937", // gray-800
            DEFAULT: "#111827", // gray-900
            emphasis: "#d1d5db", // gray-300
          },
          border: {
            DEFAULT: "#1f2937", // gray-800
          },
          ring: {
            DEFAULT: "#1f2937", // gray-800
          },
          content: {
            subtle: "#4b5563", // gray-600
            DEFAULT: "#6b7280", // gray-600
            emphasis: "#e5e7eb", // gray-200
            strong: "#f9fafb", // gray-50
            inverted: "#000000", // black
          },
        },
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      width: {
        1536: "1536px",
      },
      height: {
        150: "37.5rem",
      },
      margin: {
        30: "7.5rem",
      },
      fontFamily: {
        default: ["var(--font-avenir-next)", ...fontFamily.sans],
        serif: ["var(--font-reckless-neue)", ...fontFamily.serif],
        sans: ["var(--font-avenir-next)", ...fontFamily.sans],
        cal: ["var(--font-cal)", ...fontFamily.sans],
        title: ["var(--font-title)", ...fontFamily.sans],
        mono: ["Consolas", ...fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: "Reckless Neue",
            },
            h2: {
              fontFamily: "Reckless Neue",
            },
            h3: {
              fontFamily: "Reckless Neue",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
          },
        },
      },
      keyframes: {
        wiggle: {
          "0%, 100%": {
            transform: "translateX(0%)",
            transformOrigin: "50% 50%",
          },
          "15%": { transform: "translateX(-6px) rotate(-6deg)" },
          "30%": { transform: "translateX(9px) rotate(6deg)" },
          "45%": { transform: "translateX(-9px) rotate(-3.6deg)" },
          "60%": { transform: "translateX(3px) rotate(2.4deg)" },
          "75%": { transform: "translateX(-2px) rotate(-1.2deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.8s both",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};
