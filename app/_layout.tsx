import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContactProvider } from 'src/context/ContactContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ContactProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ContactProvider>
    </SafeAreaProvider>
  );
}
