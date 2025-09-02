import { create } from "zustand";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

// Get initial system theme
const systemTheme = Appearance.getColorScheme() ?? "light";

export const useTheme = create<ThemeState>((set) => ({
  theme: systemTheme,
  setTheme: (t) => set({ theme: t }),
}));
