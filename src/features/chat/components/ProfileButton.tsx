import { Canvas, Circle, LinearGradient, vec } from '@shopify/react-native-skia';
import { GlassView } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/chat/styles';

type ProfileButtonProps = {
  topOffset: number;
};

export function ProfileButton({ topOffset }: ProfileButtonProps) {
  return (
    <View style={[styles.profileButton, { top: topOffset }]}>
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        pointerEvents="none"
        style={styles.profileGlass}
        tintColor="rgba(255, 255, 255, 0.66)"
      />
      <View style={styles.profileAvatar}>
        <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Circle cx={22} cy={22} r={22}>
            <LinearGradient
              start={vec(4, 4)}
              end={vec(40, 40)}
              colors={['#f2fbf4', '#d6f4df', '#b8e8c8']}
              positions={[0, 0.52, 1]}
            />
          </Circle>
        </Canvas>
        <ThemedText style={styles.profileText}>Me</ThemedText>
      </View>
    </View>
  );
}
