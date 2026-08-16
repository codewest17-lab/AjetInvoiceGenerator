export const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean blue header, timeless layout",
    premium: false,
    swatch: ["#2F6FED", "#FFFFFF"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Typewriter-style, distraction-free",
    premium: false,
    swatch: ["#222222", "#FFFFFF"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Teal banner with rounded totals card",
    premium: false,
    swatch: ["#00C2A8", "#F2FBFA"],
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Serif type, gold accents, formal tone",
    premium: true,
    swatch: ["#D8A537", "#FFFDF5"],
  },
  {
    id: "bold",
    name: "Bold",
    description: "High-contrast dark header, striking look",
    premium: true,
    swatch: ["#12141C", "#1E4FBB"],
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Structured grid, ideal for larger invoices",
    premium: true,
    swatch: ["#1A1D29", "#F5F7FB"],
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
