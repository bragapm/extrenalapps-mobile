const lightColors = {
  primary: "#0477BF",
  background: "#F4F3F1",
  text: "#222222",
  card: "#F5F5F5",
  border: "#E0E0E0",
  tabIcon: "#B0B0B0",
  tabIconActive: "#D32E36",
  tabBg: "#F9F8F7",
  red: "#D32E36",
  green: "#4ED682",
  bgHome: "#F4F3F1",
};

const darkColors = {
  primary: "#3399FF",
  background: "#111111",
  text: "#F2F2F2",
  card: "#232323",
  border: "#333333",
  tabIcon: "#444",
  tabIconActive: "#D32E36",
  tabBg: "#F9F8F7",
  red: "#D32E36",
  green: "#4ED682",
  bgHome: "#F4F3F1",
};

export type ThemeType = "light" | "dark";
export type ColorScheme = typeof lightColors;

const colors: Record<ThemeType, ColorScheme> = {
  light: lightColors,
  dark: darkColors,
};

export default colors;
