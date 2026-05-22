import { memo, useEffect, useMemo, useState } from 'react';
import { View, type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/chat/styles';

type AnimatedTranscriptTextProps = {
  text: string;
  startDelay?: number;
  textStyle?: StyleProp<TextStyle>;
};

const STREAM_TICK_MS = 48;
const MAX_STREAM_FRAMES = 36;

function createRevealFrames(text: string) {
  if (!text) {
    return [];
  }

  const characters = Array.from(text);
  const charactersPerFrame = Math.max(1, Math.ceil(characters.length / MAX_STREAM_FRAMES));
  const frames: string[] = [];

  for (
    let characterCount = charactersPerFrame;
    characterCount < characters.length;
    characterCount += charactersPerFrame
  ) {
    frames.push(characters.slice(0, characterCount).join(''));
  }

  frames.push(text);

  return frames;
}

function AnimatedTranscriptTextComponent({
  text,
  startDelay = 0,
  textStyle,
}: AnimatedTranscriptTextProps) {
  const [visibleText, setVisibleText] = useState('');
  const revealFrames = useMemo(() => createRevealFrames(text), [text]);

  useEffect(() => {
    setVisibleText('');

    if (!revealFrames.length) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let frameIndex = 0;
    const revealNextFrame = () => {
      setVisibleText(revealFrames[frameIndex]);
      frameIndex += 1;

      if (frameIndex < revealFrames.length) {
        timeout = setTimeout(revealNextFrame, STREAM_TICK_MS);
      }
    };

    timeout = setTimeout(() => {
      revealNextFrame();
    }, startDelay);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [revealFrames, startDelay]);

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

export const AnimatedTranscriptText = memo(AnimatedTranscriptTextComponent);
