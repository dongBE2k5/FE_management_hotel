// app/_layout.tsx
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
<<<<<<< Updated upstream
    <ThemeProvider value={colorScheme !== 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
        name="booking/[id]"
        options={{
          headerShown: false,
          presentation: "containedModal", // 👈 GIỮ TAB BAR Ở DƯỚI
        }}
      />
      </Stack>
      <StatusBar style="auto" />
=======
    <ThemeProvider value={DarkTheme}>
      <Slot />
      <StatusBar style="auto" hidden />
>>>>>>> Stashed changes
    </ThemeProvider>
  );
}
