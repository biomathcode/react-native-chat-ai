import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { styles } from '@/features/chat/styles';
import type { ChatSessionSummary } from '@/features/chat/types';

type ChatSessionsScreenProps = {
  activeSessionId: string;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  sessions: ChatSessionSummary[];
};

export function ChatSessionsScreen({
  activeSessionId,
  onCreateSession,
  onSelectSession,
  sessions,
}: ChatSessionsScreenProps) {
  return (
    <SafeAreaView style={styles.sessionsScreen}>
      <View style={styles.sessionsHeader}>
        <View>
          <ThemedText style={styles.sessionsTitle}>Chats</ThemedText>
          <ThemedText style={styles.sessionsSubtitle}>Previous conversations</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.sessionsList}
        contentContainerStyle={styles.sessionsListContent}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length ? (
          sessions.map((session) => (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              onPress={() => onSelectSession(session.id)}
              style={({ pressed }) => [
                styles.sessionItem,
                session.id === activeSessionId && styles.activeSessionItem,
                pressed && styles.pressedControl,
              ]}
            >
              <ThemedText style={styles.sessionTitle}>{session.title}</ThemedText>
              <ThemedText style={styles.sessionPreview}>{session.preview}</ThemedText>
              <ThemedText style={styles.sessionMeta}>{session.messageCount} messages</ThemedText>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptySessions}>
            <ThemedText style={styles.emptySessionsTitle}>No previous chats yet</ThemedText>
            <ThemedText style={styles.emptySessionsText}>
              Your conversations will appear here after you start chatting.
            </ThemedText>
          </View>
        )}
      </ScrollView>
      <Pressable
        accessibilityLabel="Create a new chat session"
        accessibilityRole="button"
        onPress={onCreateSession}
        style={({ pressed }) => [styles.newSessionButton, pressed && styles.pressedControl]}
      >
        <Ionicons color={Palette.white} name="chatbubble-ellipses-outline" size={25} />
      </Pressable>
    </SafeAreaView>
  );
}
