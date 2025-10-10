// app/_layout.tsx
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Slot />
      <StatusBar style="auto" hidden />

    </ThemeProvider>
  );
}
