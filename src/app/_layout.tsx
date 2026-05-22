import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingScreen from '@/app/onboarding';
import { MedicineSchedulesProvider } from '@/features/medicine-schedules/MedicineSchedulesContext';
import { OnboardingProvider, useOnboarding } from '@/state/onboarding';

const APP_EDGE_BACKGROUND = '#ffffff';

SystemUI.setBackgroundColorAsync(APP_EDGE_BACKGROUND).catch(() => { });

function AppContent() {
  const { hasCompletedOnboarding, isLoadingOnboardingState } = useOnboarding();

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      {isLoadingOnboardingState ? null : hasCompletedOnboarding ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <OnboardingScreen />
      )}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <MedicineSchedulesProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AppContent />
            </ThemeProvider>
          </MedicineSchedulesProvider>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: APP_EDGE_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: APP_EDGE_BACKGROUND,
  },
});
