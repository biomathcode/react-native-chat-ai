import { FlatList, ListRenderItemInfo, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ONBOARDING_SAMPLE_TEXT, sarvamVoiceOptions } from '@/constants/sarvam-voices';
import { VoiceOrb } from '@/features/onboarding/components/VoiceOrb';
import { VoiceVisualizer } from '@/features/onboarding/components/VoiceVisualizer';
import { LOOPED_VOICES } from '@/features/onboarding/constants';
import { styles } from '@/features/onboarding/styles';
import { useVoiceOnboardingController } from '@/features/onboarding/useVoiceOnboardingController';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export function OnboardingScreen() {
  const onboarding = useVoiceOnboardingController();
  const renderItem = ({ item, index }: ListRenderItemInfo<(typeof LOOPED_VOICES)[number]>) => (
    <VoiceOrb
      audioLevel={onboarding.averageLevel}
      index={index}
      isActive={index === onboarding.selectedIndex}
      isPlaying={onboarding.playerStatus.playing}
      itemSpacing={onboarding.itemSpacing}
      itemSize={onboarding.itemSize}
      item={item}
      onPress={() => {
        onboarding.listRef.current?.scrollToIndex({ index, animated: true });
        onboarding.setSelectedIndex(index);
      }}
      scrollX={onboarding.scrollX}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { top: onboarding.headerTop }]}>
          <ThemedText style={styles.eyebrow}></ThemedText>
          <ThemedText
            style={[
              styles.title,
              { fontSize: onboarding.titleSize, lineHeight: onboarding.titleSize + 6 },
            ]}
          >
            Choose Your Voice
          </ThemedText>
          <ThemedText
            style={[
              styles.sampleText,
              {
                fontSize: onboarding.sampleSize,
                lineHeight: Math.round(onboarding.sampleSize * 1.42),
                maxWidth: Math.min(360, onboarding.width - onboarding.horizontalPadding * 2),
              },
            ]}
          >
            {ONBOARDING_SAMPLE_TEXT}
          </ThemedText>
        </View>

        <View
          style={[
            styles.visualizerWrap,
            { top: onboarding.visualizerTop, height: onboarding.visualizerHeight + 72 },
          ]}
        >
          <VoiceVisualizer
            color={onboarding.selectedVoice.color}
            height={onboarding.visualizerHeight}
            levels={onboarding.levels}
            width={onboarding.visualizerWidth}
          />
        </View>

        <Animated.View
          style={[
            styles.voiceDetails,
            { top: onboarding.detailsTop },
            onboarding.selectedDetailsStyle,
          ]}
        >
          <ThemedText style={styles.voiceName}>{onboarding.selectedVoice.name}</ThemedText>
          <ThemedText style={styles.voiceTone}>{onboarding.selectedVoice.tone}</ThemedText>
        </Animated.View>

        <AnimatedFlatList
          ref={onboarding.listRef}
          data={LOOPED_VOICES}
          horizontal
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          getItemLayout={onboarding.getItemLayout}
          initialScrollIndex={sarvamVoiceOptions.length}
          snapToInterval={onboarding.itemSpacing}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onboarding.scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / onboarding.itemSpacing
            );
            onboarding.setSelectedIndex(nextIndex);
          }}
          contentContainerStyle={[
            styles.voiceListContent,
            { paddingHorizontal: onboarding.contentPadding },
          ]}
          style={[
            styles.voiceList,
            { top: onboarding.carouselTop, height: onboarding.itemSize * 2.7 },
          ]}
        />



        <Pressable
          accessibilityRole="button"
          onPress={() => onboarding.completeOnboarding(onboarding.selectedVoice.id)}
          style={({ pressed }) => [styles.continueButton, { opacity: pressed ? 0.78 : 1 }]}
        >
          <ThemedText style={styles.continueText}>Continue</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
