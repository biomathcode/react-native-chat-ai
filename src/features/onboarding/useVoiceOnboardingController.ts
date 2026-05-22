import {
  AudioModule,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioSampleListener,
} from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { Easing, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { sarvamVoiceOptions } from '@/constants/sarvam-voices';
import { LOOPED_VOICES, START_INDEX, VISUALIZER_BARS, type VoiceOption } from '@/features/onboarding/constants';
import { buildWaveform } from '@/features/onboarding/utils';
import { useOnboarding } from '@/state/onboarding';
import { clamp, useResponsiveMetrics } from '@/utils/responsive';

export function useVoiceOnboardingController() {
  const listRef = useRef<FlatList<VoiceOption>>(null);
  const { completeOnboarding } = useOnboarding();
  const metrics = useResponsiveMetrics();
  const { width, height } = metrics;
  const itemSize = metrics.horizontal(78, 64, 86);
  const itemSpacing = Math.min(
    metrics.horizontal(124, 96, 136),
    Math.max(itemSize + 20, width * 0.29)
  );
  const scrollX = useSharedValue(START_INDEX * itemSpacing);
  const [selectedIndex, setSelectedIndex] = useState(START_INDEX);
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
  const [levels, setLevels] = useState(() => Array(VISUALIZER_BARS).fill(0.1));
  const selectedVoice = LOOPED_VOICES[selectedIndex];
  const player = useAudioPlayer(null, { updateInterval: 80 });
  const playerStatus = useAudioPlayerStatus(player);
  const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  const contentPadding = Math.max(0, width / 2 - itemSpacing / 2);
  const horizontalPadding = metrics.horizontal(24, 16, 32);
  const titleSize = metrics.moderate(34, 0.35, 29, 36);
  const sampleSize = metrics.moderate(17, 0.35, 15, 18);
  const visualizerWidth = Math.min(width - horizontalPadding * 2, metrics.horizontal(248, 210, 280));
  const visualizerHeight = metrics.vertical(58, 46, 66);
  const headerTop = clamp(height * 0.07, metrics.isCompactHeight ? 18 : 34, 64);
  const visualizerTop = clamp(height * 0.3, 178, metrics.isCompactHeight ? 220 : 270);
  const detailsTop = clamp(height * 0.62, metrics.isCompactHeight ? 370 : 430, 560);
  const carouselTop = detailsTop + metrics.vertical(42, 32, 52);
  const footerTop = clamp(height * 0.86, carouselTop + itemSize * 1.52, height - 104);
  const selectedDetailsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
  }));

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => {});
  }, []);

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
    scrollX.value = selectedIndex * itemSpacing;
  }, [itemSpacing, scrollX, selectedIndex]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      player.pause();
      player.replace(selectedVoice.source);
      player.seekTo(0).finally(() => player.play());
    }, 420);

    return () => clearTimeout(timeout);
  }, [player, selectedVoice.source]);

  useAudioSampleListener(player, (sample) => {
    const frames = sample.channels[0]?.frames;

    if (frames?.length) {
      setLevels(buildWaveform(frames));
    }
  });

  useEffect(() => {
    if (!playerStatus.playing) {
      setLevels((currentLevels) => currentLevels.map((level) => Math.max(0.1, level * 0.82)));
    }
  }, [playerStatus.playing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });
  const getItemLayout = useMemo(
    () => (_: ArrayLike<VoiceOption> | null | undefined, index: number) => ({
      length: itemSpacing,
      offset: itemSpacing * index,
      index,
    }),
    [itemSpacing]
  );
  const finishOnboarding = async () => {
    if (isCompletingOnboarding) {
      return;
    }

    setIsCompletingOnboarding(true);
    player.pause();

    try {
      await completeOnboarding(selectedVoice.id);
    } catch {
      setIsCompletingOnboarding(false);
    }
  };

  return {
    averageLevel,
    carouselTop,
    completeOnboarding: finishOnboarding,
    contentPadding,
    detailsTop,
    footerTop,
    getItemLayout,
    headerTop,
    horizontalPadding,
    itemSize,
    itemSpacing,
    isCompletingOnboarding,
    levels,
    listRef,
    playerStatus,
    sampleSize,
    scrollHandler,
    scrollX,
    selectedDetailsStyle,
    selectedIndex,
    selectedOptionIndex: selectedIndex % sarvamVoiceOptions.length,
    selectedVoice,
    setSelectedIndex,
    titleSize,
    visualizerHeight,
    visualizerTop,
    visualizerWidth,
    width,
  };
}
