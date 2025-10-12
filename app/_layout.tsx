
import { UserProvider } from '@/context/UserContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>



    // export default function RootLayout() {
    //   return (
    //     <ThemeProvider value={DarkTheme}>
    //       <Slot />
    //       <StatusBar style="auto" hidden />

    //     </ThemeProvider>

  );
}
