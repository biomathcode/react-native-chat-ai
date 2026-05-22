import { Pressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { styles } from '@/features/chat/styles';

type ChatSessionsButtonProps = {
  isCloseButton?: boolean;
  isOpen: boolean;
  iconProgress?: SharedValue<number>;
  onPress: () => void;
  progress: SharedValue<number>;
  screenWidth: number;
  topOffset: number;
};

const CONTROL_SIZE = 44;

export function ChatSessionsButton({
  isCloseButton = false,
  isOpen,
  iconProgress,
  onPress,
  progress,
  screenWidth,
  topOffset,
}: ChatSessionsButtonProps) {
  const travelDistance = Math.max(0, screenWidth - Spacing.two * 2 - CONTROL_SIZE);
  const buttonPositionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, travelDistance]) }],
  }));
  const topLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 1], [0, 7]) },
      { rotateZ: `${interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 1], [0, 45])}deg` },
    ],
  }));
  const middleLineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 0.5, 1], [1, 0.2, 0]),
    transform: [{ scaleX: interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 1], [1, 0.2]) }],
  }));
  const bottomLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 1], [0, -7]) },
      { rotateZ: `${interpolate(Math.max(progress.value, iconProgress?.value ?? 0), [0, 1], [0, -45])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.sessionsButtonFrame, { top: topOffset }, buttonPositionStyle]}>
      <Pressable
        accessibilityLabel={isCloseButton ? 'Close medicine schedules' : isOpen ? 'Close chat sessions' : 'Open chat sessions'}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.sessionsButton, pressed && styles.pressedControl]}
      >
        <Animated.View style={[styles.sessionsButtonLine, topLineStyle]} />
        <Animated.View style={[styles.sessionsButtonLine, middleLineStyle]} />
        <Animated.View style={[styles.sessionsButtonLine, bottomLineStyle]} />
      </Pressable>
    </Animated.View>
  );
}
