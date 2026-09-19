import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { StoreProvider, useStore } from '@/store';
import { ThemeProvider, useTheme } from '@/theme';
import { SheetHost } from '@/sheets';
import { ToastHost } from '@/components/toast';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

/** Theme sits inside the store so the user's choice drives it. */
function Themed() {
  const { settings } = useStore();
  return (
    <ThemeProvider preference={settings.theme}>
      <Shell />
    </ThemeProvider>
  );
}

function Shell() {
  const { c, scheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SheetHost>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
        </Stack>
        <ToastHost />
      </SheetHost>
    </View>
  );
}
