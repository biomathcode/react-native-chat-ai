import { useEffect, useState } from 'react';
import { View, type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/chat/styles';

type AnimatedTranscriptTextProps = {
  text: string;
  startDelay?: number;
  textStyle?: StyleProp<TextStyle>;
};

export function AnimatedTranscriptText({
  text,
  startDelay = 0,
  textStyle,
}: AnimatedTranscriptTextProps) {
  const [visibleText, setVisibleText] = useState('');

  useEffect(() => {
    setVisibleText('');

    if (!text) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    let characterIndex = 0;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        characterIndex += 1;
        setVisibleText(text.slice(0, characterIndex));

        if (characterIndex >= text.length && interval) {
          clearInterval(interval);
        }
      }, 18);
    }, startDelay);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startDelay, text]);

  return (
    <View style={styles.animatedTranscriptText}>
      <ThemedText style={[styles.transcriptText, textStyle, styles.hiddenTranscriptText]}>
        {text}
      </ThemedText>
      <ThemedText style={[styles.transcriptText, textStyle, styles.visibleTranscriptText]}>
        {visibleText}
      </ThemedText>
    </View>
  );
}
