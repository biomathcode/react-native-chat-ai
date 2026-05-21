import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import OnboardingScreen from '@/app/onboarding';
import { OnboardingProvider, useOnboarding } from '@/state/onboarding';

function AppContent({ colorScheme }: { colorScheme: ReturnType<typeof useColorScheme> }) {
  const { hasCompletedOnboarding, isLoadingOnboardingState } = useOnboarding();
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';
  const statusBarBackground = colorScheme === 'dark' ? '#000000' : '#ffffff';

  return (
    <>
      <StatusBar backgroundColor={statusBarBackground} style={statusBarStyle} />
      {isLoadingOnboardingState ? null : hasCompletedOnboarding ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <OnboardingScreen />
      )}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <OnboardingProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppContent colorScheme={colorScheme} />
        </ThemeProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
