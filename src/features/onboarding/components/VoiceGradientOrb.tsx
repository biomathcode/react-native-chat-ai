import { Canvas, Circle } from '@shopify/react-native-skia';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/onboarding/styles';

type VoiceGradientOrbProps = {
  color: string;
  initial: string;
  isActive: boolean;
  isPlaying: boolean;
  itemSize: number;
  name: string;
};

export function VoiceGradientOrb({
  color,
  initial,
  isActive,
  isPlaying,
  itemSize,
  name,
}: VoiceGradientOrbProps) {
  const glowOpacity = isActive && isPlaying ? 0.84 : 0.38;
  const radius = itemSize / 2;

  return (
    <View style={[styles.orb, { width: itemSize, height: itemSize, borderRadius: radius }]}>
      <Canvas style={styles.orbCanvas}>
        <Circle cx={radius} cy={radius} r={radius} color={color} />
      </Canvas>
      {isActive && (
        <View
          style={[
            styles.activeOrbGlow,
            { borderColor: `${color}99`, borderRadius: radius, opacity: glowOpacity },
          ]}
        />
      )}
      <ThemedText
        accessibilityLabel={name}
        style={[
          styles.orbInitial,
          { fontSize: itemSize * 0.38, lineHeight: itemSize * 0.46 },
        ]}
      >
        {initial}
      </ThemedText>
    </View>
  );
}
