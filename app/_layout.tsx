import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ContactProvider } from '@/src/context/ContactContext'; // Import ContactProvider

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ContactProvider> {/* Wrap with ContactProvider */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ContactProvider>
  );
}
