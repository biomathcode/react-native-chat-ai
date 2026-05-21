import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

import type { SarvamVoiceId } from '@/constants/sarvam-voices';

type OnboardingContextValue = {
  selectedVoiceId: SarvamVoiceId | null;
  hasCompletedOnboarding: boolean;
  isLoadingOnboardingState: boolean;
  completeOnboarding: (voiceId: SarvamVoiceId) => void;
};

const ONBOARDING_STORAGE_KEY = 'react-native-chat-ai:onboarding-complete';
const VOICE_STORAGE_KEY = 'react-native-chat-ai:selected-sarvam-voice';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function readWebStoredValue(key: string) {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

async function readStoredValue(key: string) {
  const webValue = readWebStoredValue(key);

  if (webValue) {
    return webValue;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string) {
  SecureStore.setItemAsync(key, value).catch(() => {});

  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Native Expo Go does not provide localStorage by default.
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [selectedVoiceId, setSelectedVoiceId] = useState<SarvamVoiceId | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoadingOnboardingState, setIsLoadingOnboardingState] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      readStoredValue(VOICE_STORAGE_KEY),
      readStoredValue(ONBOARDING_STORAGE_KEY),
    ]).then(([storedVoiceId, storedOnboardingState]) => {
      if (!isMounted) {
        return;
      }

      setSelectedVoiceId(storedVoiceId as SarvamVoiceId | null);
      setHasCompletedOnboarding(storedOnboardingState === 'true');
      setIsLoadingOnboardingState(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      selectedVoiceId,
      hasCompletedOnboarding,
      isLoadingOnboardingState,
      completeOnboarding: (voiceId) => {
        setSelectedVoiceId(voiceId);
        setHasCompletedOnboarding(true);
        writeStoredValue(VOICE_STORAGE_KEY, voiceId);
        writeStoredValue(ONBOARDING_STORAGE_KEY, 'true');
      },
    }),
    [hasCompletedOnboarding, isLoadingOnboardingState, selectedVoiceId]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }

  return context;
}
