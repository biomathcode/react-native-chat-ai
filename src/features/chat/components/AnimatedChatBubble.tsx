import { useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type AnimatedChatBubbleProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
};

export function AnimatedChatBubble({ children, style }: AnimatedChatBubbleProps) {
  const enterProgress = useSharedValue(0);

  useEffect(() => {
    enterProgress.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [enterProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterProgress.value,
    transform: [
      { translateY: 18 * (1 - enterProgress.value) },
      { scale: 0.985 + enterProgress.value * 0.015 },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
