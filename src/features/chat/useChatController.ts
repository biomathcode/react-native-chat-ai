import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, type DimensionValue } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BottomTabInset } from '@/constants/theme';
import { sarvamVoiceOptions } from '@/constants/sarvam-voices';
import { getErrorMessage, normalizeMetering } from '@/features/chat/audio';
import { sendChatRequest, transcribeAudio } from '@/features/chat/api';
import {
  CHAT_HISTORY_STORAGE_KEY,
  INITIAL_ASSISTANT_MESSAGE,
  MAX_STORED_MESSAGES,
  createEmptyChatSession,
  createChatSessionSummaries,
  parseStoredChatSessions,
  readStoredValue,
  writeStoredValue,
} from '@/features/chat/chat-history';
import { createMedicineListMessage, isMedicineListRequest } from '@/features/chat/medicine-tool';
import type { ChatMessage } from '@/features/chat/types';
import { useOnboarding } from '@/state/onboarding';
import { useResponsiveMetrics } from '@/utils/responsive';

type UseChatControllerOptions = {
  initialMedicineSchedulesOpen?: boolean;
};

export function useChatController({ initialMedicineSchedulesOpen = false }: UseChatControllerOptions = {}) {
  const metrics = useResponsiveMetrics();
  const { selectedVoiceId } = useOnboarding();
  const selectedVoice =
    sarvamVoiceOptions.find((voice) => voice.id === selectedVoiceId) ?? sarvamVoiceOptions[0];
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isMedicineSchedulesOpen, setIsMedicineSchedulesOpen] = useState(initialMedicineSchedulesOpen);
  const [chatSessions, setChatSessions] = useState(() => [createEmptyChatSession()]);
  const [activeSessionId, setActiveSessionId] = useState(chatSessions[0].id);
  const fallbackMessages = useMemo(() => [INITIAL_ASSISTANT_MESSAGE], []);
  const activeSession = chatSessions.find((session) => session.id === activeSessionId) ?? chatSessions[0];
  const messages = activeSession?.messages ?? fallbackMessages;
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
  const medicineSchedulesProgress = useSharedValue(initialMedicineSchedulesOpen ? 1 : 0);
  const gestureStartOffset = useSharedValue(0);
  const horizontalPadding = metrics.horizontal(24, 16, 32);
  const profileTopOffset = Math.min(34, Math.max(12, metrics.height * 0.024));
  const chatTopPadding = profileTopOffset + metrics.vertical(92, 78, 104);
  const chatBottomPadding = BottomTabInset + metrics.vertical(124, 108, 148);
  const transcriptFontSize = metrics.moderate(15, 0.3, 14, 17);
  const bubbleMaxWidth: DimensionValue = metrics.isWide ? '68%' : '88%';
  const animateSessions = (open: boolean) => {
    setIsSessionsOpen(open);
    setIsMedicineSchedulesOpen(false);
    sessionsProgress.value = withTiming(open ? 1 : 0, {
      duration: 280,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
    medicineSchedulesProgress.value = withTiming(0, {
      duration: 280,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
  };
  const animateMedicineSchedules = (open: boolean) => {
    setIsMedicineSchedulesOpen(open);
    setIsSessionsOpen(false);
    medicineSchedulesProgress.value = withTiming(open ? 1 : 0, {
      duration: 280,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
    sessionsProgress.value = withTiming(0, {
      duration: 280,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
  };
  const setMedicineSchedulesImmediately = (open: boolean) => {
    setIsMedicineSchedulesOpen(open);
    setIsSessionsOpen(false);
    medicineSchedulesProgress.value = open ? 1 : 0;
    sessionsProgress.value = 0;
  };
  const setMessages = (nextMessages: ChatMessage[] | ((currentMessages: ChatMessage[]) => ChatMessage[])) => {
    setChatSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== activeSessionId) {
          return session;
        }

        const resolvedMessages =
          typeof nextMessages === 'function' ? nextMessages(session.messages) : nextMessages;

        return {
          ...session,
          messages: resolvedMessages.slice(-MAX_STORED_MESSAGES),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };
  const createNewSession = () => {
    const newSession = createEmptyChatSession();

    setChatSessions((currentSessions) => [newSession, ...currentSessions]);
    setActiveSessionId(newSession.id);
    animateSessions(false);
  };
  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    animateSessions(false);
  };

  useEffect(() => {
    messagesRef.current = messages;

    if (hasLoadedStoredMessages.current) {
      writeStoredValue(
        CHAT_HISTORY_STORAGE_KEY,
        JSON.stringify(
          chatSessions.map((session) => ({
            ...session,
            messages: session.messages.slice(-MAX_STORED_MESSAGES),
          }))
        )
      );
    }
  }, [chatSessions, messages]);

  useEffect(() => {
    let isMounted = true;

    readStoredValue(CHAT_HISTORY_STORAGE_KEY).then((storedMessages) => {
      if (!isMounted) return;

      const restoredSessions = parseStoredChatSessions(storedMessages);
      const nextSessions = restoredSessions.length ? restoredSessions : [createEmptyChatSession()];

      setChatSessions(nextSessions);
      setActiveSessionId(nextSessions[0].id);
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
          gestureStartOffset.value = sessionsProgress.value - medicineSchedulesProgress.value;
        })
        .onUpdate((event) => {
          let minOffset = -1;
          let maxOffset = 1;

          if (gestureStartOffset.value < -0.5) {
            maxOffset = 0;
          } else if (gestureStartOffset.value > 0.5) {
            minOffset = 0;
          }

          const nextOffset = Math.min(
            maxOffset,
            Math.max(minOffset, gestureStartOffset.value + event.translationX / metrics.width)
          );

          sessionsProgress.value = Math.max(0, nextOffset);
          medicineSchedulesProgress.value = Math.max(0, -nextOffset);
        })
        .onEnd((event) => {
          const currentOffset = sessionsProgress.value - medicineSchedulesProgress.value;
          let targetOffset = 0;

          if (gestureStartOffset.value < -0.5) {
            targetOffset = event.velocityX > 520 || currentOffset > -0.65 ? 0 : -1;
          } else if (gestureStartOffset.value > 0.5) {
            targetOffset = event.velocityX < -520 || currentOffset < 0.65 ? 0 : 1;
          } else if (event.velocityX > 520 || currentOffset > 0.35) {
            targetOffset = 1;
          } else if (event.velocityX < -520 || currentOffset < -0.35) {
            targetOffset = -1;
          }

          sessionsProgress.value = withTiming(Math.max(0, targetOffset), {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          medicineSchedulesProgress.value = withTiming(Math.max(0, -targetOffset), {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          scheduleOnRN(setIsSessionsOpen, targetOffset === 1);
          scheduleOnRN(setIsMedicineSchedulesOpen, targetOffset === -1);
        }),
    [gestureStartOffset, medicineSchedulesProgress, metrics.width, sessionsProgress]
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
    transform: [
      {
        translateX:
          -metrics.width + metrics.width * sessionsProgress.value - metrics.width * medicineSchedulesProgress.value,
      },
    ],
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
    bubbleMaxWidth,
    bubblePaddingHorizontal: metrics.horizontal(14, 12, 18),
    bubblePaddingVertical: metrics.vertical(12, 10, 14),
    chatBottomPadding,
    chatScrollRef,
    chatTopPadding,
    activeSessionId,
    closeSessions: () => animateSessions(false),
    closeMedicineSchedules: () => animateMedicineSchedules(false),
    drawerGesture,
    drawerTrackStyle,
    horizontalPadding,
    isListening,
    isMedicineSchedulesOpen,
    isSessionsOpen,
    isThinking,
    isTranscribing,
    listeningButtonWidth: metrics.width - horizontalPadding * 2,
    listeningTextStyle,
    messages,
    medicineSchedulesProgress,
    minHeight: metrics.height,
    openSessions: () => animateSessions(true),
    openMedicineSchedules: () => animateMedicineSchedules(true),
    openMedicineSchedulesImmediately: () => setMedicineSchedulesImmediately(true),
    profileTopOffset,
    createNewSession,
    selectSession,
    sessions: createChatSessionSummaries(chatSessions),
    sessionsProgress,
    selectedVoiceId,
    toggleListening,
    toggleMedicineSchedules: () => animateMedicineSchedules(!isMedicineSchedulesOpen),
    toggleSessions: () => animateSessions(!isSessionsOpen),
    transcriptCardStyle,
    transcriptTextStyle: {
      fontSize: transcriptFontSize,
      lineHeight: Math.round(transcriptFontSize * 1.4),
    },
    width: metrics.width,
  };
}
