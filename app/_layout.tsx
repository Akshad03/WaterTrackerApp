import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// 1. Remove the unstable_settings anchor to (tabs)
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}> 
        {/* 'headerShown: false' here hides it for EVERY screen */}
        <Stack.Screen name="index" options={{ title: 'Hydration Tracker' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}