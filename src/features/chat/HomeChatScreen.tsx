import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, TextInput, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { MeshListeningButton } from '@/components/mesh-listening-button';
import { MeshGradientBackground } from '@/components/mesh-gradient-background';
import { WebBadge } from '@/components/web-badge';
import { ChatSessionsButton } from '@/features/chat/components/ChatSessionsButton';
import { ChatSessionsScreen } from '@/features/chat/components/ChatSessionsScreen';
import { ChatThread } from '@/features/chat/components/ChatThread';
import { styles } from '@/features/chat/styles';
import { useChatController } from '@/features/chat/useChatController';
import { MedicineSchedulesScreen } from '@/features/medicine-schedules/MedicineSchedulesScreen';

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function HomeChatScreen() {
  const { medicineSchedules, medicineSchedulesRequest } = useLocalSearchParams<{
    medicineSchedules?: string | string[];
    medicineSchedulesRequest?: string | string[];
  }>();
  const medicineSchedulesParam = getFirstParam(medicineSchedules);
  const medicineSchedulesRequestParam =
    getFirstParam(medicineSchedulesRequest) ?? medicineSchedulesParam ?? null;
  const chat = useChatController({
    initialMedicineSchedulesOpen: medicineSchedulesParam === 'open',
  });
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const lastMedicineSchedulesRequest = useRef<string | null>(
    medicineSchedulesParam === 'open' ? medicineSchedulesRequestParam : null
  );
  const topControlOffset = insets.top + chat.profileTopOffset;
  const voiceModeProgress = useSharedValue(chat.isVoiceMode ? 1 : 0);
  const compactOrbWidth = useSharedValue(44);
  const composerFocusProgress = useSharedValue(0);

  useEffect(() => {
    voiceModeProgress.value = withTiming(chat.isVoiceMode ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [chat.isVoiceMode, voiceModeProgress]);

  useEffect(() => {
    composerFocusProgress.value = withTiming(isComposerFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [composerFocusProgress, isComposerFocused]);

  const composerTransitionStyle = useAnimatedStyle(() => ({
    opacity: 1 - voiceModeProgress.value,
    transform: [{ translateY: -18 * voiceModeProgress.value }],
  }));

  const voiceTransitionStyle = useAnimatedStyle(() => ({
    opacity: voiceModeProgress.value,
    transform: [
      { translateY: 42 * (1 - voiceModeProgress.value) },
      { scale: 0.92 + voiceModeProgress.value * 0.08 },
    ],
  }));

  const composerOrbStyle = useAnimatedStyle(() => ({
    width: 44 * (1 - composerFocusProgress.value),
    opacity: 1 - composerFocusProgress.value,
    transform: [{ scale: 1 - composerFocusProgress.value * 0.28 }],
  }));

  const isComposerExpanded = isComposerFocused && keyboardHeight > 0;
  const composerInputWidth = isComposerExpanded
    ? chat.composerFocusedInputWidth
    : chat.composerInputWidth;
  const composerInputLeft = isComposerExpanded ? 0 : chat.composerInputLeft;

  useEffect(() => {
    if (medicineSchedulesParam !== 'open') {
      lastMedicineSchedulesRequest.current = null;
      return;
    }

    if (
      lastMedicineSchedulesRequest.current === medicineSchedulesRequestParam
    ) {
      return;
    }

    lastMedicineSchedulesRequest.current = medicineSchedulesRequestParam;
    chat.openMedicineSchedulesImmediately();
  }, [chat, medicineSchedulesParam, medicineSchedulesRequestParam]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ChatSessionsButton
        iconProgress={chat.medicineSchedulesProgress}
        isCloseButton={chat.isMedicineSchedulesOpen}
        isOpen={chat.isSessionsOpen}
        leftOffset={chat.horizontalPadding}
        onPress={
          chat.isMedicineSchedulesOpen
            ? chat.closeMedicineSchedules
            : chat.toggleSessions
        }
        progress={chat.sessionsProgress}
        screenWidth={chat.width}
        topOffset={topControlOffset}
      />
      <GestureDetector gesture={chat.drawerGesture}>
        <Animated.View
          style={[
            styles.drawerTrack,
            { width: chat.width * 3 },
            chat.drawerTrackStyle,
          ]}
        >
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <ChatSessionsScreen
              activeSessionId={chat.activeSessionId}
              onCreateSession={chat.createNewSession}
              onSelectSession={chat.selectSession}
              sessions={chat.sessions}
            />
          </View>
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <SafeAreaView style={styles.safeArea}>
              {/* <ProfileButton topOffset={topControlOffset} /> */}

              <ChatThread
                bubbleMaxWidth={chat.bubbleMaxWidth}
                bubblePaddingHorizontal={chat.bubblePaddingHorizontal}
                bubblePaddingVertical={chat.bubblePaddingVertical}
                chatBottomPadding={chat.chatBottomPadding + keyboardHeight}
                chatScrollRef={chat.chatScrollRef}
                chatTopPadding={chat.chatTopPadding + insets.top}
                horizontalPadding={chat.horizontalPadding}
                isThinking={chat.isThinking}
                isTranscribing={chat.isTranscribing}
                messages={chat.messages}
                minHeight={chat.minHeight}
                selectedVoiceId={chat.selectedVoiceId}
                transcriptCardStyle={chat.transcriptCardStyle}
                transcriptTextStyle={chat.transcriptTextStyle}
              />
              <Animated.View
                pointerEvents={chat.isVoiceMode ? 'auto' : 'none'}
                style={[
                  styles.voiceModeArea,
                  { bottom: chat.listenBottomOffset + keyboardHeight },
                  voiceTransitionStyle,
                ]}
              >
                <View style={styles.voiceModeStack}>
                  <MeshListeningButton
                    isListening={chat.isListening}
                    audioLevel={chat.audioLevel}
                    expandedWidth={chat.listeningButtonWidth}
                    onPress={chat.toggleListening}
                  />
                  <Animated.Text
                    pointerEvents="none"
                    style={[styles.listeningText, chat.listeningTextStyle]}
                  >
                    Listening
                  </Animated.Text>
                  <Pressable
                    accessibilityLabel="Switch to text"
                    accessibilityRole="button"
                    onPress={chat.enableTextMode}
                    style={({ pressed }) => [
                      styles.voiceModeCloseButton,
                      pressed && styles.pressedControl,
                    ]}
                  >
                    <Ionicons name="close" size={16} color="#426256" />
                  </Pressable>
                </View>
              </Animated.View>
              <Animated.View
                pointerEvents={chat.isVoiceMode ? 'none' : 'auto'}
                style={[
                  styles.chatComposerRow,
                  {
                    bottom:
                      keyboardHeight > 0
                        ? keyboardHeight + chat.composerKeyboardGap
                        : chat.composerBottomOffset,
                    left: chat.composerRowLeft,
                    width: chat.composerControlsRowWidth,
                  },
                  composerTransitionStyle,
                ]}
              >
                <Animated.View
                  pointerEvents={isComposerFocused ? 'none' : 'auto'}
                  style={[styles.chatComposerOrbSlot, composerOrbStyle]}
                >
                  <Pressable
                    accessibilityLabel="Switch to voice"
                    accessibilityRole="button"
                    onPress={() => {
                      Keyboard.dismiss();
                      chat.enableVoiceMode();
                    }}
                    style={({ pressed }) => [
                      styles.chatComposerIconButton,
                      pressed && styles.pressedControl,
                    ]}
                  >
                    <BlurView
                      intensity={28}
                      style={styles.chatComposerControlBlur}
                      tint="light"
                    />
                    <View style={styles.chatComposerOrbClip}>
                      <MeshGradientBackground
                        audioLevel={0.22}
                        buttonWidth={compactOrbWidth}
                        isListening
                      />
                    </View>
                  </Pressable>
                </Animated.View>
                <View
                  style={[
                    styles.chatComposer,
                    { left: composerInputLeft, width: composerInputWidth },
                  ]}
                >
                  <BlurView
                    intensity={32}
                    style={styles.chatComposerBlur}
                    tint="light"
                  />
                  <TextInput
                    accessibilityLabel="Message"
                    editable={!chat.textInputDisabled}
                    multiline
                    onChangeText={chat.setTextInputValue}
                    onBlur={() => setIsComposerFocused(false)}
                    onFocus={() => setIsComposerFocused(true)}
                    onSubmitEditing={chat.sendTextInput}
                    placeholder="Message"
                    placeholderTextColor="#8a9b95"
                    returnKeyType="send"
                    style={styles.chatComposerInput}
                    submitBehavior="submit"
                    value={chat.textInputValue}
                  />
                </View>
                <Pressable
                  accessibilityLabel="Send message"
                  accessibilityRole="button"
                  disabled={
                    chat.textInputDisabled || !chat.textInputValue.trim()
                  }
                  onPress={chat.sendTextInput}
                  style={({ pressed }) => [
                    styles.chatComposerButton,
                    { left: chat.composerSubmitLeft },
                    (pressed ||
                      chat.textInputDisabled ||
                      !chat.textInputValue.trim()) &&
                      styles.pressedControl,
                  ]}
                >
                  <Ionicons name="send" size={18} color="#ffffff" />
                </Pressable>
              </Animated.View>
              {Platform.OS === 'web' && <WebBadge />}
            </SafeAreaView>
          </View>
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <MedicineSchedulesScreen
              calendarScrollAreaLayoutKey={chat.isMedicineSchedulesOpen}
              onCalendarScrollAreaLayout={chat.setDrawerGestureExclusionArea}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
