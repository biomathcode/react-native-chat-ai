import { type StyleProp, type TextStyle, View } from 'react-native';
import { sarvamVoiceOptions, type SarvamVoiceId } from '@/constants/sarvam-voices';

import { ThemedText } from '@/components/themed-text';
import { INITIAL_ASSISTANT_MESSAGE } from '@/features/chat/chat-history';
import { styles } from '@/features/chat/styles';
import type { ChatMessage } from '@/features/chat/types';

import { AnimatedChatBubble } from './AnimatedChatBubble';
import { AnimatedTranscriptText } from './AnimatedTranscriptText';
import { MedicineCards } from './MedicineCards';
import { AssistantSpeechControl } from './AssistantSpeechControl';

type ChatMessageBubbleProps = {
  bubbleMaxWidth: string;
  bubblePaddingHorizontal: number;
  bubblePaddingVertical: number;
  index: number;
  message: ChatMessage;
  messagesLength: number;
  selectedVoiceId: SarvamVoiceId | null;
  transcriptTextStyle: StyleProp<TextStyle>;
};

export function ChatMessageBubble({
  bubbleMaxWidth,
  bubblePaddingHorizontal,
  bubblePaddingVertical,
  index,
  message,
  messagesLength,
  selectedVoiceId,
  transcriptTextStyle,
}: ChatMessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const isLatest = index === messagesLength - 1;
  const isInitialAssistantMessage = message.id === INITIAL_ASSISTANT_MESSAGE.id;
  const shouldStreamMessage = isLatest || message.id === INITIAL_ASSISTANT_MESSAGE.id;
  const typingDelay = shouldStreamMessage ? 260 : 0;
  const bubbleStyle = isAssistant ? styles.assistantBubble : styles.userBubble;
  const selectedVoice =
    sarvamVoiceOptions.find((voice) => voice.id === selectedVoiceId) ?? sarvamVoiceOptions[0];
  const bubbleContent =
    message.type === 'medicine-list' && message.medicines ? (
      <>
        <ThemedText style={[styles.transcriptText, transcriptTextStyle]}>{message.content}</ThemedText>
        <MedicineCards medicines={message.medicines} />
      </>
    ) : shouldStreamMessage ? (
      <AnimatedTranscriptText
        text={message.content}
        startDelay={typingDelay}
        textStyle={transcriptTextStyle}
      />
    ) : (
      <ThemedText style={[styles.transcriptText, transcriptTextStyle]}>{message.content}</ThemedText>
    );

  if (isAssistant) {
    return (
      <View style={[styles.assistantMessageRow, { maxWidth: bubbleMaxWidth }]}>
        <AssistantSpeechControl
          autoGenerate={isLatest}
          gradientColors={selectedVoice.gradient}
          localAudioSource={isInitialAssistantMessage ? selectedVoice.source : undefined}
          message={message}
          selectedVoiceId={selectedVoice.id}
        />
        <AnimatedChatBubble
          style={[
            bubbleStyle,
            styles.assistantBubbleInRow,
            {
              paddingHorizontal: bubblePaddingHorizontal,
              paddingVertical: bubblePaddingVertical,
            },
          ]}
        >
          <ThemedText style={styles.chatLabel}>{selectedVoice.name}</ThemedText>
          {bubbleContent}
        </AnimatedChatBubble>
      </View>
    );
  }

  return (
    <AnimatedChatBubble
      style={[
        bubbleStyle,
        {
          maxWidth: bubbleMaxWidth,
          paddingHorizontal: bubblePaddingHorizontal,
          paddingVertical: bubblePaddingVertical,
        },
      ]}
    >
      <ThemedText style={styles.chatLabel}>You</ThemedText>
      {bubbleContent}
    </AnimatedChatBubble>
  );
}
