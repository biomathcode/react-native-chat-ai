import { type RefObject } from 'react';
import { ScrollView, type StyleProp, type TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { styles } from '@/features/chat/styles';
import type { ChatMessage } from '@/features/chat/types';
import type { SarvamVoiceId } from '@/constants/sarvam-voices';

import { ChatMessageBubble } from './ChatMessageBubble';
import { StatusBubble } from './StatusBubble';

type ChatThreadProps = {
  bubbleMaxWidth: string;
  bubblePaddingHorizontal: number;
  bubblePaddingVertical: number;
  chatBottomPadding: number;
  chatScrollRef: RefObject<ScrollView | null>;
  chatTopPadding: number;
  horizontalPadding: number;
  isThinking: boolean;
  isTranscribing: boolean;
  messages: ChatMessage[];
  minHeight: number;
  selectedVoiceId: SarvamVoiceId | null;
  transcriptCardStyle: StyleProp<object>;
  transcriptTextStyle: StyleProp<TextStyle>;
};

export function ChatThread({
  bubbleMaxWidth,
  bubblePaddingHorizontal,
  bubblePaddingVertical,
  chatBottomPadding,
  chatScrollRef,
  chatTopPadding,
  horizontalPadding,
  isThinking,
  isTranscribing,
  messages,
  minHeight,
  selectedVoiceId,
  transcriptCardStyle,
  transcriptTextStyle,
}: ChatThreadProps) {
  return (
    <Animated.View
      style={[styles.transcriptCard, { paddingHorizontal: horizontalPadding }, transcriptCardStyle]}
    >
      <ScrollView
        ref={chatScrollRef}
        style={styles.chatScroll}
        contentContainerStyle={[
          styles.chatStack,
          {
            minHeight,
            paddingTop: chatTopPadding,
            paddingBottom: chatBottomPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <ChatMessageBubble
            key={message.id}
            bubbleMaxWidth={bubbleMaxWidth}
            bubblePaddingHorizontal={bubblePaddingHorizontal}
            bubblePaddingVertical={bubblePaddingVertical}
            index={index}
            message={message}
            messagesLength={messages.length}
            selectedVoiceId={selectedVoiceId}
            transcriptTextStyle={transcriptTextStyle}
          />
        ))}
        {isTranscribing && (
          <StatusBubble
            bubbleMaxWidth={bubbleMaxWidth}
            bubblePaddingHorizontal={bubblePaddingHorizontal}
            bubblePaddingVertical={bubblePaddingVertical}
            role="user"
            text="Transcribing..."
            transcriptTextStyle={transcriptTextStyle}
          />
        )}
        {isThinking && (
          <StatusBubble
            bubbleMaxWidth={bubbleMaxWidth}
            bubblePaddingHorizontal={bubblePaddingHorizontal}
            bubblePaddingVertical={bubblePaddingVertical}
            role="assistant"
            selectedVoiceId={selectedVoiceId}
            text="Thinking..."
            transcriptTextStyle={transcriptTextStyle}
          />
        )}
      </ScrollView>
    </Animated.View>
  );
}
