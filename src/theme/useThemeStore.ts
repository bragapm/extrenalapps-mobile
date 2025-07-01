import { create } from "zustand";
import { Appearance } from "react-native";
import colors, { ThemeType, ColorScheme } from "./colors";

interface ThemeState {
  mode: ThemeType;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeType) => void;
}

const initialMode: ThemeType =
  (Appearance.getColorScheme() as ThemeType) || "light";

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  colors: colors[initialMode],
  toggleTheme: () => {
    const newMode = get().mode === "light" ? "dark" : "light";
    set({ mode: newMode, colors: colors[newMode] });
  },
  setTheme: (mode: ThemeType) => set({ mode, colors: colors[mode] }),
}));
