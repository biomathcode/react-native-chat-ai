import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BottomTabInset } from '@/constants/theme';
import { sarvamVoiceOptions } from '@/constants/sarvam-voices';
import { getErrorMessage, normalizeMetering } from '@/features/chat/audio';
import { sendChatRequest, transcribeAudio } from '@/features/chat/api';
import {
  CHAT_HISTORY_STORAGE_KEY,
  INITIAL_ASSISTANT_MESSAGE,
  MAX_STORED_MESSAGES,
  createChatSessionSummaries,
  parseStoredMessages,
  readStoredValue,
  writeStoredValue,
} from '@/features/chat/chat-history';
import { createMedicineListMessage, isMedicineListRequest } from '@/features/chat/medicine-tool';
import type { ChatMessage } from '@/features/chat/types';
import { useOnboarding } from '@/state/onboarding';
import { useResponsiveMetrics } from '@/utils/responsive';

export function useChatController() {
  const metrics = useResponsiveMetrics();
  const { selectedVoiceId } = useOnboarding();
  const selectedVoice =
    sarvamVoiceOptions.find((voice) => voice.id === selectedVoiceId) ?? sarvamVoiceOptions[0];
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);
  const hasLoadedStoredMessages = useRef(false);
  const recorderOptions = useMemo<RecordingOptions>(
    () => ({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true }),
    []
  );
  const audioRecorder = useAudioRecorder(recorderOptions);
  const recorderState = useAudioRecorderState(audioRecorder, 80);
  const listeningProgress = useSharedValue(0);
  const sessionsProgress = useSharedValue(0);
  const gestureStartProgress = useSharedValue(0);
  const horizontalPadding = metrics.horizontal(24, 16, 32);
  const profileTopOffset = Math.min(34, Math.max(12, metrics.height * 0.024));
  const chatTopPadding = profileTopOffset + metrics.vertical(92, 78, 104);
  const chatBottomPadding = BottomTabInset + metrics.vertical(124, 108, 148);
  const transcriptFontSize = metrics.moderate(18, 0.35, 16, 20);
  const animateSessions = (open: boolean) => {
    setIsSessionsOpen(open);
    sessionsProgress.value = withTiming(open ? 1 : 0, {
      duration: 280,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
  };

  useEffect(() => {
    messagesRef.current = messages;

    if (hasLoadedStoredMessages.current) {
      writeStoredValue(
        CHAT_HISTORY_STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
      );
    }
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    readStoredValue(CHAT_HISTORY_STORAGE_KEY).then((storedMessages) => {
      if (!isMounted) return;

      const restoredMessages = parseStoredMessages(storedMessages);
      setMessages(
        restoredMessages.length
          ? restoredMessages.slice(-MAX_STORED_MESSAGES)
          : [INITIAL_ASSISTANT_MESSAGE]
      );
      hasLoadedStoredMessages.current = true;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages, isTranscribing, isThinking]);

  useEffect(() => {
    listeningProgress.value = withTiming(isListening ? 1 : 0, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    });
  }, [isListening, listeningProgress]);

  const drawerGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .failOffsetY([-18, 18])
        .onBegin(() => {
          gestureStartProgress.value = sessionsProgress.value;
        })
        .onUpdate((event) => {
          const nextProgress = gestureStartProgress.value + event.translationX / metrics.width;
          sessionsProgress.value = Math.min(1, Math.max(0, nextProgress));
        })
        .onEnd((event) => {
          const targetProgress =
            event.velocityX > 520 ? 1 : event.velocityX < -520 ? 0 : sessionsProgress.value >= 0.5 ? 1 : 0;

          sessionsProgress.value = withTiming(targetProgress, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          runOnJS(setIsSessionsOpen)(targetProgress === 1);
        }),
    [gestureStartProgress, metrics.width, sessionsProgress]
  );

  const listeningTextStyle = useAnimatedStyle(() => ({
    opacity: listeningProgress.value,
    transform: [{ translateY: 8 * (1 - listeningProgress.value) }],
  }));

  const transcriptCardStyle = useAnimatedStyle(() => ({
    opacity: withTiming(messages.length || isTranscribing || isThinking ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    }),
    transform: [
      {
        translateY: withTiming(messages.length || isTranscribing || isThinking ? 0 : 18, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const drawerTrackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -metrics.width * (1 - sessionsProgress.value) }],
  }));

  const askSarvam = async (nextMessages: ChatMessage[]) => {
    setIsThinking(true);
    const assistantText = await sendChatRequest(nextMessages, selectedVoice.name);

    if (assistantText) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: `${Date.now()}-assistant`, role: 'assistant', content: assistantText },
      ]);
    }

    setIsThinking(false);
  };

  const transcribeRecording = async (audioUri: string) => {
    setIsTranscribing(true);
    const transcribedText = await transcribeAudio(audioUri);
    setIsTranscribing(false);

    if (!transcribedText) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: transcribedText,
    };
    const nextMessages = [...messagesRef.current, userMessage];

    setMessages(nextMessages);

    if (isMedicineListRequest(transcribedText)) {
      setMessages([...nextMessages, createMedicineListMessage()]);
      return;
    }

    await askSarvam(nextMessages);
  };

  const startListening = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Microphone permission needed', 'Please allow microphone access to start listening.');
      return;
    }

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsListening(true);
  };

  const stopListening = async () => {
    let audioUri: string | null = null;

    if (audioRecorder.isRecording || recorderState.isRecording) {
      const previousUrl = recorderState.url;

      await audioRecorder.stop();
      audioUri = audioRecorder.uri ?? previousUrl;
    }

    await setAudioModeAsync({ allowsRecording: false });
    setIsListening(false);

    if (!audioUri) {
      throw new Error('Recording stopped, but Expo did not return an audio file URI.');
    }

    await transcribeRecording(audioUri);
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        await stopListening();
        return;
      }

      await startListening();
    } catch (error) {
      setIsListening(false);
      setIsTranscribing(false);
      setIsThinking(false);
      Alert.alert('Speech unavailable', getErrorMessage(error));
    }
  };

  return {
    audioLevel: normalizeMetering(recorderState.metering),
    bubbleMaxWidth: metrics.isWide ? '68%' : '88%',
    bubblePaddingHorizontal: metrics.horizontal(14, 12, 18),
    bubblePaddingVertical: metrics.vertical(12, 10, 14),
    chatBottomPadding,
    chatScrollRef,
    chatTopPadding,
    closeSessions: () => animateSessions(false),
    drawerGesture,
    drawerTrackStyle,
    horizontalPadding,
    isListening,
    isSessionsOpen,
    isThinking,
    isTranscribing,
    listeningButtonWidth: metrics.width - horizontalPadding * 2,
    listeningTextStyle,
    messages,
    minHeight: metrics.height,
    openSessions: () => animateSessions(true),
    profileTopOffset,
    sessions: createChatSessionSummaries(messages),
    sessionsProgress,
    selectedVoiceId,
    toggleListening,
    toggleSessions: () => animateSessions(!isSessionsOpen),
    transcriptCardStyle,
    transcriptTextStyle: {
      fontSize: transcriptFontSize,
      lineHeight: Math.round(transcriptFontSize * 1.45),
    },
    width: metrics.width,
  };
}
