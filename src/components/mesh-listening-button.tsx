import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { MeshGradientBackground } from './mesh-gradient-background';
import {
  LISTENING_WIDTH,
  RESTING_WIDTH,
  meshListeningButtonSize,
} from './mesh-listening-button-constants';
import { styles } from './mesh-listening-button-styles';

export { meshListeningButtonSize };

type MeshListeningButtonProps = {
  isListening: boolean;
  audioLevel?: number;
  expandedWidth?: number;
  onPress: () => void;
};

export function MeshListeningButton({
  isListening,
  audioLevel = 0,
  expandedWidth = LISTENING_WIDTH,
  onPress,
}: MeshListeningButtonProps) {
  const listeningWidth = Math.max(RESTING_WIDTH, Math.min(LISTENING_WIDTH, expandedWidth));
  const animatedWidth = useSharedValue(isListening ? listeningWidth : RESTING_WIDTH);
  const idlePulse = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(isListening ? listeningWidth : RESTING_WIDTH, {
      duration: 420,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
    });
  }, [animatedWidth, isListening, listeningWidth]);

  useEffect(() => {
    if (isListening) {
      cancelAnimation(idlePulse);
      idlePulse.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    idlePulse.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [idlePulse, isListening]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
    transform: [{ scale: 1 + idlePulse.value * 0.012 }],
  }));

  return (
    <Pressable
      accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pressable, { width: listeningWidth }]}
    >
      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <View style={styles.canvasClip}>
          <MeshGradientBackground
            audioLevel={audioLevel}
            buttonWidth={animatedWidth}
            isListening={isListening}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}
