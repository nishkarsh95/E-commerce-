export interface BrandGuideline {
  brandName: string;
  tagline: string;
  domain: string;
  palette: {
    light: {
      canvas: string;
      surface: string;
      card: string;
      border: string;
      textPrimary: string;
      textSecondary: string;
      accent: string;
      accentHover: string;
      error: string;
    };
    dark: {
      canvas: string;
      surface: string;
      card: string;
      border: string;
      textPrimary: string;
      textSecondary: string;
      accent: string;
      accentHover: string;
      error: string;
    };
  };
  typography: {
    display: string;
    body: string;
    mono: string;
  };
  rules: string[];
}

export const lumenBrandGuidelines: BrandGuideline = {
  brandName: "LUMEN",
  tagline: "Architectural Living & Curated Goods",
  domain: "Luxury E-Commerce & Artisanal Goods",
  palette: {
    light: {
      canvas: "#FBFBF9", // 60% warm ivory travertine
      surface: "#F4F4F0", // 30% structural neutral
      card: "#FFFFFF",
      border: "rgba(0, 0, 0, 0.08)",
      textPrimary: "#18181B", // Zinc 900
      textSecondary: "#71717A", // Zinc 500
      accent: "#B8860B", // Dark Goldenrod / Antique Gold
      accentHover: "#996F07",
      error: "#DC2626", // Red 600
    },
    dark: {
      canvas: "#0F0F11", // 60% deep obsidian slate
      surface: "#18181B", // 30% structural zinc
      card: "#202024",
      border: "rgba(255, 255, 255, 0.08)",
      textPrimary: "#F4F4F5", // Zinc 100
      textSecondary: "#A1A1AA", // Zinc 400
      accent: "#D4AF37", // Metallic Champagne Gold
      accentHover: "#E5C158",
      error: "#EF4444", // Red 500
    },
  },
  typography: {
    display: "Cormorant Garamond (Serif, 400-600)",
    body: "Plus Jakarta Sans (Sans-serif, 400-500)",
    mono: "JetBrains Mono (Monospace, Tabular)",
  },
  rules: [
    "60-30-10 Color Discipline: 60% dominant canvas, 30% structural surfaces, 10% champagne gold accent.",
    "Zero-Pill Discipline: No static pill containers or badge clusters; clean typography with middle-dot separators.",
    "Dark Mode Optical Compensation: +0.01em letter tracking and elevated zinc surfaces in dark mode for maximum legibility.",
    "WCAG AA Compliance: 4.5:1 minimum text contrast against canvas and input backgrounds.",
    "Explicit Test Selectors: Strict data-testid and semantic IDs for high-reliability Selenium automation.",
  ],
};
