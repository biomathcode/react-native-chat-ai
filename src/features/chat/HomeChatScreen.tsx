import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MeshListeningButton } from '@/components/mesh-listening-button';
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
  const medicineSchedulesRequestParam = getFirstParam(medicineSchedulesRequest) ?? medicineSchedulesParam ?? null;
  const chat = useChatController({ initialMedicineSchedulesOpen: medicineSchedulesParam === 'open' });
  const insets = useSafeAreaInsets();
  const lastMedicineSchedulesRequest = useRef<string | null>(
    medicineSchedulesParam === 'open' ? medicineSchedulesRequestParam : null
  );
  const topControlOffset = insets.top + chat.profileTopOffset;

  useEffect(() => {
    if (medicineSchedulesParam !== 'open') {
      lastMedicineSchedulesRequest.current = null;
      return;
    }

    if (lastMedicineSchedulesRequest.current === medicineSchedulesRequestParam) {
      return;
    }

    lastMedicineSchedulesRequest.current = medicineSchedulesRequestParam;
    chat.openMedicineSchedulesImmediately();
  }, [chat, medicineSchedulesParam, medicineSchedulesRequestParam]);

  return (
    <View style={styles.container}>
      <ChatSessionsButton
        iconProgress={chat.medicineSchedulesProgress}
        isCloseButton={chat.isMedicineSchedulesOpen}
        isOpen={chat.isSessionsOpen}
        onPress={chat.isMedicineSchedulesOpen ? chat.closeMedicineSchedules : chat.toggleSessions}
        progress={chat.sessionsProgress}
        screenWidth={chat.width}
        topOffset={topControlOffset}
      />
      <GestureDetector gesture={chat.drawerGesture}>
        <Animated.View style={[styles.drawerTrack, { width: chat.width * 3 }, chat.drawerTrackStyle]}>
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
                chatBottomPadding={chat.chatBottomPadding}
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
              <View style={styles.listenArea}>
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
              </View>
              {Platform.OS === 'web' && <WebBadge />}
            </SafeAreaView>
          </View>
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <MedicineSchedulesScreen />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
