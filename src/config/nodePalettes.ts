export interface NodePalette {
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string; // Ensure text is readable
}

export const nodePalettes: NodePalette[] = [
  { name: "Default", bgColor: "#ffffff", borderColor: "#d1d5db", textColor: "#374151" }, // White, Gray-300, Gray-700
  { name: "Warm Peach", bgColor: "#FFC09F", borderColor: "#FFAA7E", textColor: "#6b4f3a" }, // Dark Brown text
  { name: "Ocean Breeze", bgColor: "#ADF7B6", borderColor: "#A0CED9", textColor: "#3d5e44" }, // Dark Green text
  { name: "Deep Space", bgColor: "#003f5c", borderColor: "#444b6e", textColor: "#f3f4f6" }, // Gray-100 text
  { name: "Pastel Dream", bgColor: "#FBF8CC", borderColor: "#FDE4CF", textColor: "#7c6f4a" }, // Dark Yellow/Brown text
  { name: "Forest Walk", bgColor: "#80B9AD", borderColor: "#5C948A", textColor: "#f9fafb" }, // Gray-50 text
  // Added palettes inspired by Canva
  { name: "Sunset Vibes", bgColor: "#F9D5A7", borderColor: "#FFB87F", textColor: "#8B5E3C" }, // Brown text
  { name: "Mint Chocolate", bgColor: "#A7D8B8", borderColor: "#6AAB9C", textColor: "#3A5A40" }, // Dark green text
  { name: "Lavender Fields", bgColor: "#D8BFD8", borderColor: "#BFA8BF", textColor: "#4B3F72" }, // Dark purple text
  { name: "Coral Reef", bgColor: "#FF7F50", borderColor: "#E57373", textColor: "#FFFFFF" }, // White text
  { name: "Steel Blue", bgColor: "#A9CCE3", borderColor: "#7FB3D5", textColor: "#2C3E50" }, // Dark blue/gray text
  { name: "Earthy Tones", bgColor: "#D3C1A5", borderColor: "#B8A990", textColor: "#5D4037" }, // Dark brown text
  { name: "Rose Gold", bgColor: "#FADBD8", borderColor: "#F5B7B1", textColor: "#8E44AD" }, // Purple text
  { name: "Teal Appeal", bgColor: "#85D4CE", borderColor: "#4DB6AC", textColor: "#004D40" }, // Dark teal text
  { name: "Mustard Yellow", bgColor: "#F1C40F", borderColor: "#D4AC0D", textColor: "#584507" }, // Dark yellow/brown text
  { name: "Graphite Gray", bgColor: "#AEB6BF", borderColor: "#85929E", textColor: "#212F3D" }, // Dark slate text
  // Added palettes based on image
  { name: "Noir & Blanc", bgColor: "#000000", borderColor: "#FFFFFF", textColor: "#FFFFFF" }, // Black, White, White
  { name: "Mono Light", bgColor: "#f0f0f0", borderColor: "#808080", textColor: "#333333" }, // Light Gray, Med Gray, Dark Gray
  { name: "Sky Blue", bgColor: "#cde1f0", borderColor: "#6a8caf", textColor: "#2c3e50" }, // Light Blue, Med Blue, Dark Blue
  { name: "Mint Green", bgColor: "#d4ebd4", borderColor: "#6a996a", textColor: "#3a5a40" }, // Light Green, Med Green, Dark Green
  { name: "Warm Sand", bgColor: "#fcdbb9", borderColor: "#d4a373", textColor: "#6b4f3a" }, // Light Peach, Orange-Brown, Dark Brown
  { name: "Desert Sun", bgColor: "#f7f0ce", borderColor: "#a6985d", textColor: "#584507" }, // Light Yellow, Olive, Dark Brown
  { name: "Rose Dust", bgColor: "#f7d6d6", borderColor: "#a67c7c", textColor: "#800000" }, // Light Pink, Maroon, Dark Red
  { name: "Lavender Haze", bgColor: "#e6dcf0", borderColor: "#7c6a9e", textColor: "#4b3f72" }, // Light Purple, Dark Purple, Dark Purple
];

// Helper function to get palette by name
export const getPaletteByName = (name?: string): NodePalette | undefined => {
  if (!name) return undefined;
  return nodePalettes.find(p => p.name === name);
}; 