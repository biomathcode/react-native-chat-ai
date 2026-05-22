import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Gradients, Palette } from '@/constants/theme';

import { BUTTON_HEIGHT, BUTTON_RADIUS } from './mesh-listening-button-constants';

type MeshGradientBackgroundProps = {
  audioLevel: number;
  buttonWidth: SharedValue<number>;
  isListening: boolean;
};

export function MeshGradientBackground({
  audioLevel,
  buttonWidth,
  isListening,
}: MeshGradientBackgroundProps) {
  const meshLevel = useSharedValue(0);
  const meshPhase = useSharedValue(0);

  useEffect(() => {
    meshLevel.value = withTiming(isListening ? audioLevel : 0, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  }, [audioLevel, isListening, meshLevel]);

  useEffect(() => {
    if (isListening) {
      meshPhase.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      return;
    }

    cancelAnimation(meshPhase);
    meshPhase.value = withRepeat(
      withTiming(0.16, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [isListening, meshPhase]);

  const blueCenter = useDerivedValue(() => ({
    x: buttonWidth.value * (0.48 + meshLevel.value * 0.16 + meshPhase.value * 0.06),
    y: BUTTON_HEIGHT * (0.5 - meshLevel.value * 0.16 + meshPhase.value * 0.08),
  }));
  const pinkCenter = useDerivedValue(() => ({
    x: buttonWidth.value * (0.58 - meshLevel.value * 0.12 + meshPhase.value * 0.08),
    y: BUTTON_HEIGHT * (0.18 + meshLevel.value * 0.22),
  }));
  const whiteCenter = useDerivedValue(() => ({
    x: buttonWidth.value * (0.38 + meshPhase.value * 0.12),
    y: BUTTON_HEIGHT * (0.28 + meshLevel.value * 0.18),
  }));
  const lowerBlueCenter = useDerivedValue(() => ({
    x: buttonWidth.value * (0.34 + meshLevel.value * 0.18),
    y: BUTTON_HEIGHT * (0.78 - meshPhase.value * 0.1),
  }));
  const gradientEnd = useDerivedValue(() => vec(buttonWidth.value, BUTTON_HEIGHT));
  const highlightEnd = useDerivedValue(() => vec(buttonWidth.value, 0));
  const blueRadius = useDerivedValue(() => 48 + meshLevel.value * 42);
  const pinkRadius = useDerivedValue(() => 40 + meshLevel.value * 34);
  const lowerBlueRadius = useDerivedValue(() => 50 + meshLevel.value * 28);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <RoundedRect
        x={0}
        y={0}
        width={buttonWidth}
        height={BUTTON_HEIGHT}
        r={BUTTON_RADIUS}
        color={Palette.meshListeningFallback}
      />
      <RoundedRect x={0} y={0} width={buttonWidth} height={BUTTON_HEIGHT} r={BUTTON_RADIUS}>
        <LinearGradient
          start={vec(0, 4)}
          end={gradientEnd}
          colors={[...Gradients.meshListeningBase]}
          positions={[0, 0.34, 0.68, 1]}
        />
      </RoundedRect>
      <Group opacity={0.95}>
        <Circle c={blueCenter} r={blueRadius}>
          <RadialGradient c={blueCenter} r={58} colors={[...Gradients.meshBlueRadial]} />
        </Circle>
        <Circle c={pinkCenter} r={pinkRadius}>
          <RadialGradient c={pinkCenter} r={46} colors={[...Gradients.meshPinkRadial]} />
        </Circle>
        <Circle c={whiteCenter} r={38}>
          <RadialGradient c={whiteCenter} r={42} colors={[...Gradients.meshWhiteRadial]} />
        </Circle>
        <Circle c={lowerBlueCenter} r={lowerBlueRadius}>
          <RadialGradient c={lowerBlueCenter} r={56} colors={[...Gradients.meshLowerBlueRadial]} />
        </Circle>
      </Group>
      <Rect x={0} y={0} width={buttonWidth} height={BUTTON_HEIGHT} opacity={0.16}>
        <LinearGradient
          start={vec(0, 0)}
          end={highlightEnd}
          colors={[...Gradients.meshHighlight]}
          positions={[0, 0.5, 1]}
        />
      </Rect>
    </Canvas>
  );
}
