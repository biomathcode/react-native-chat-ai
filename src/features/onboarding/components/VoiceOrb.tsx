import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { styles } from '@/features/onboarding/styles';
import type { VoiceOption } from '@/features/onboarding/constants';

import { VoiceGradientOrb } from './VoiceGradientOrb';

type VoiceOrbProps = {
  audioLevel: number;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  itemSpacing: number;
  itemSize: number;
  item: VoiceOption;
  onPress: () => void;
  scrollX: SharedValue<number>;
};

export function VoiceOrb({
  audioLevel,
  index,
  isActive,
  isPlaying,
  itemSpacing,
  itemSize,
  item,
  onPress,
  scrollX,
}: VoiceOrbProps) {
  const playPulse = useSharedValue(0);
  const reactiveLevel = useSharedValue(0);

  useEffect(() => {
    reactiveLevel.value = withTiming(isActive && isPlaying ? audioLevel : 0, {
      duration: 110,
      easing: Easing.out(Easing.quad),
    });
  }, [audioLevel, isActive, isPlaying, reactiveLevel]);

  useEffect(() => {
    if (isActive && isPlaying) {
      playPulse.value = withRepeat(
        withTiming(1, { duration: 760, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      return;
    }

    cancelAnimation(playPulse);
    playPulse.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [isActive, isPlaying, playPulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const itemOffset = index * itemSpacing;
    const inputRange = [
      (index - 2) * itemSpacing,
      (index - 1) * itemSpacing,
      itemOffset,
      (index + 1) * itemSpacing,
      (index + 2) * itemSpacing,
    ];
    const activeLift = isActive ? reactiveLevel.value * itemSize * 0.13 + playPulse.value * 4 : 0;
    const activeScale = isActive ? reactiveLevel.value * 0.16 + playPulse.value * 0.05 : 0;

    return {
      opacity: interpolate(scrollX.value, inputRange, [0.38, 0.74, 1, 0.74, 0.38], Extrapolation.CLAMP),
      transform: [
        {
          translateY:
            interpolate(
              scrollX.value,
              inputRange,
              [itemSize, itemSize * 0.46, 0, itemSize * 0.46, itemSize],
              Extrapolation.CLAMP
            ) - activeLift,
        },
        {
          scale:
            interpolate(scrollX.value, inputRange, [0.62, 0.82, 1.2, 0.82, 0.62], Extrapolation.CLAMP) +
            activeScale,
        },
        {
          rotateZ: `${interpolate(scrollX.value, inputRange, [26, 14, 0, -14, -26], Extrapolation.CLAMP)}deg`,
        },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={[styles.orbPressable, { width: itemSpacing, height: itemSize * 2.3 }]}
    >
      <Animated.View style={animatedStyle}>
        <VoiceGradientOrb
          color={item.color}
          initial={item.name.slice(0, 1)}
          isActive={isActive}
          isPlaying={isPlaying}
          itemSize={itemSize}
          name={item.name}
        />
      </Animated.View>
    </Pressable>
  );
}
