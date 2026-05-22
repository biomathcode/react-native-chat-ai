import { Canvas, Circle, LinearGradient, vec } from '@shopify/react-native-skia';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import type { SarvamVoiceId } from '@/constants/sarvam-voices';
import { generateSpeechAudio } from '@/features/chat/api';
import { styles } from '@/features/chat/styles';
import type { ChatMessage } from '@/features/chat/types';

type AssistantSpeechControlProps = {
  autoGenerate: boolean;
  gradientColors: readonly [string, string];
  localAudioSource?: number;
  message: ChatMessage;
  selectedVoiceId: SarvamVoiceId | null;
};

export function AssistantSpeechControl({
  autoGenerate,
  gradientColors,
  localAudioSource,
  message,
  selectedVoiceId,
}: AssistantSpeechControlProps) {
  const player = useAudioPlayer(null, { updateInterval: 150 });
  const status = useAudioPlayerStatus(player);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const generatedRequestRef = useRef<string | null>(null);
  const isGeneratingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const playLocalAudio = useCallback(() => {
    if (!localAudioSource) return;

    setHasFailed(false);
    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false })
      .then(() => {
        if (!isMountedRef.current) {
          return;
        }

        player.replace(localAudioSource);
        return player.seekTo(0);
      })
      .then(() => {
        if (isMountedRef.current) {
          player.play();
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setHasFailed(true);
        }
      });
  }, [localAudioSource, player]);

  const generateAndPlay = useCallback(() => {
    if (localAudioSource) {
      playLocalAudio();
      return;
    }

    const requestKey = `${message.id}:${selectedVoiceId ?? 'default'}`;

    if (isGeneratingRef.current || generatedRequestRef.current === requestKey) {
      return;
    }

    isGeneratingRef.current = true;
    generatedRequestRef.current = requestKey;
    setIsGenerating(true);
    setHasFailed(false);

    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false })
      .then(() => generateSpeechAudio(message.content, selectedVoiceId))
      .then(({ uri }) => {
        if (!isMountedRef.current) {
          return;
        }

        setAudioUri(uri);
        player.replace({ uri });
        player.play();
      })
      .catch(() => {
        if (!isMountedRef.current) {
          return;
        }

        generatedRequestRef.current = null;
        setHasFailed(true);
      })
      .finally(() => {
        isGeneratingRef.current = false;

        if (isMountedRef.current) {
          setIsGenerating(false);
        }
      });
  }, [localAudioSource, message.content, message.id, playLocalAudio, player, selectedVoiceId]);

  useEffect(() => {
    if (autoGenerate) {
      generateAndPlay();
    }

  }, [autoGenerate, generateAndPlay]);

  const play = () => {
    if (localAudioSource) {
      playLocalAudio();
      return;
    }

    if (!audioUri) {
      generateAndPlay();
      return;
    }

    player.replace({ uri: audioUri });
    player.seekTo(0).finally(() => player.play());
  };

  const stop = () => {
    player.pause();
    player.seekTo(0).catch(() => {});
  };

  return (
    <Pressable
      accessibilityLabel={status.playing ? 'Stop assistant audio' : 'Play assistant audio'}
      accessibilityRole="button"
      disabled={isGenerating}
      onPress={status.playing ? stop : play}
      style={({ pressed }) => [
        styles.assistantAudioButton,
        pressed && !isGenerating && !hasFailed && styles.pressedControl,
      ]}
    >
      <Canvas pointerEvents="none" style={styles.assistantAudioGradient}>
        <Circle cx={18} cy={18} r={18}>
          <LinearGradient
            start={vec(4, 4)}
            end={vec(32, 32)}
            colors={[gradientColors[0], gradientColors[1], '#ffffff']}
            positions={[0, 0.72, 1]}
          />
        </Circle>
      </Canvas>
      {isGenerating ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : status.playing ? (
        <View style={styles.assistantAudioStopIcon} />
      ) : (
        <View style={styles.assistantAudioPlayIcon} />
      )}
    </Pressable>
  );
}
