import { Platform, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MeshListeningButton } from '@/components/mesh-listening-button';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { ChatThread } from '@/features/chat/components/ChatThread';
import { ChatSessionsButton } from '@/features/chat/components/ChatSessionsButton';
import { ChatSessionsScreen } from '@/features/chat/components/ChatSessionsScreen';
import { ProfileButton } from '@/features/chat/components/ProfileButton';
import { styles } from '@/features/chat/styles';
import { useChatController } from '@/features/chat/useChatController';

export function HomeChatScreen() {
  const chat = useChatController();
  const insets = useSafeAreaInsets();
  const topControlOffset = insets.top + chat.profileTopOffset;

  return (
    <ThemedView style={styles.container}>
      <ChatSessionsButton
        isOpen={chat.isSessionsOpen}
        onPress={chat.toggleSessions}
        progress={chat.sessionsProgress}
        screenWidth={chat.width}
        topOffset={topControlOffset}
      />
      <GestureDetector gesture={chat.drawerGesture}>
        <Animated.View style={[styles.drawerTrack, { width: chat.width * 2 }, chat.drawerTrackStyle]}>
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <ChatSessionsScreen onClose={chat.closeSessions} sessions={chat.sessions} />
          </View>
          <View style={[styles.drawerPane, { width: chat.width }]}>
            <SafeAreaView style={styles.safeArea}>
              <ProfileButton topOffset={topControlOffset} />
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
        </Animated.View>
      </GestureDetector>
    </ThemedView>
  );
}
