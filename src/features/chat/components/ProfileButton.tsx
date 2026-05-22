import { GlassView } from 'expo-glass-effect';
import { View } from 'react-native';

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
        <ThemedText style={styles.profileText}>Me</ThemedText>
      </View>
    </View>
  );
}
