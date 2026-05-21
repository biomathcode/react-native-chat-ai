import { Canvas, Circle, LinearGradient, vec } from '@shopify/react-native-skia';
import { type StyleProp, type TextStyle, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { sarvamVoiceOptions, type SarvamVoiceId } from '@/constants/sarvam-voices';
import { styles } from '@/features/chat/styles';

import { AnimatedChatBubble } from './AnimatedChatBubble';

type StatusBubbleProps = {
  bubbleMaxWidth: string;
  bubblePaddingHorizontal: number;
  bubblePaddingVertical: number;
  role: 'user' | 'assistant';
  selectedVoiceId?: SarvamVoiceId | null;
  text: string;
  transcriptTextStyle: StyleProp<TextStyle>;
};

export function StatusBubble({
  bubbleMaxWidth,
  bubblePaddingHorizontal,
  bubblePaddingVertical,
  role,
  selectedVoiceId,
  text,
  transcriptTextStyle,
}: StatusBubbleProps) {
  const isAssistant = role === 'assistant';
  const selectedVoice =
    sarvamVoiceOptions.find((voice) => voice.id === selectedVoiceId) ?? sarvamVoiceOptions[0];

  if (isAssistant) {
    return (
      <View style={[styles.assistantMessageRow, { maxWidth: bubbleMaxWidth }]}>
        <View style={styles.assistantStatusAvatar}>
          <Canvas pointerEvents="none" style={styles.assistantAudioGradient}>
            <Circle cx={18} cy={18} r={18}>
              <LinearGradient
                start={vec(4, 4)}
                end={vec(32, 32)}
                colors={[selectedVoice.gradient[0], selectedVoice.gradient[1], '#ffffff']}
                positions={[0, 0.72, 1]}
              />
            </Circle>
          </Canvas>
        </View>
        <AnimatedChatBubble
          style={[
            styles.assistantBubble,
            styles.assistantBubbleInRow,
            {
              paddingHorizontal: bubblePaddingHorizontal,
              paddingVertical: bubblePaddingVertical,
            },
          ]}
        >
          <ThemedText style={styles.chatLabel}>{selectedVoice.name}</ThemedText>
          <ThemedText style={[styles.transcriptText, transcriptTextStyle]}>{text}</ThemedText>
        </AnimatedChatBubble>
      </View>
    );
  }

  return (
    <AnimatedChatBubble
      style={[
        styles.userBubble,
        {
          maxWidth: bubbleMaxWidth,
          paddingHorizontal: bubblePaddingHorizontal,
          paddingVertical: bubblePaddingVertical,
        },
      ]}
    >
      <ThemedText style={styles.chatLabel}>You</ThemedText>
      <ThemedText style={[styles.transcriptText, transcriptTextStyle]}>{text}</ThemedText>
    </AnimatedChatBubble>
  );
}
