import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/chat/styles';
import type { ChatSessionSummary } from '@/features/chat/types';

type ChatSessionsScreenProps = {
  onClose: () => void;
  sessions: ChatSessionSummary[];
};

export function ChatSessionsScreen({ onClose, sessions }: ChatSessionsScreenProps) {
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
              onPress={onClose}
              style={({ pressed }) => [styles.sessionItem, pressed && styles.pressedControl]}
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
    </SafeAreaView>
  );
}
