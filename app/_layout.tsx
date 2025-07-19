import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContactProvider } from 'src/context/ContactContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ContactProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ContactProvider>
    </SafeAreaProvider>
  );
}
