import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme'; // Deleted
import { COLORS } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // const colorScheme = useColorScheme(); // Deleted

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="health-input" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
