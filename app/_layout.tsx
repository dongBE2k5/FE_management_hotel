import { Slot } from 'expo-router';
import { UserProvider } from '@/context/UserContext';

export default function RootLayout() {
  return (
<<<<<<< HEAD
    <UserProvider>
      <Slot />
    </UserProvider>
=======
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="checkoutScreen" options={{ title: "Xác nhận Check-out" }} />
        {/* <Stack.Screen name="bookingDetail" options={{ title: 'Oops!' }} /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
>>>>>>> 242c8ad (updateEmployee)
  );
}