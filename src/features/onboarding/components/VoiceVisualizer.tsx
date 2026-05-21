import { Canvas, Group, RoundedRect } from '@shopify/react-native-skia';

import { VISUALIZER_BARS } from '@/features/onboarding/constants';
import { styles } from '@/features/onboarding/styles';
import { clamp } from '@/utils/responsive';

type VoiceVisualizerProps = {
  color: string;
  height: number;
  levels: number[];
  width: number;
};

export function VoiceVisualizer({ color, height, levels, width }: VoiceVisualizerProps) {
  const barWidth = clamp(width * 0.02, 4, 6);
  const gap = (width - VISUALIZER_BARS * barWidth) / (VISUALIZER_BARS - 1);

  return (
    <Canvas style={[styles.visualizer, { width, height }]}>
      <Group>
        {levels.map((level, index) => {
          const barHeight = height * 0.14 + level * height * 0.76;
          const x = index * (barWidth + gap);
          const y = (height - barHeight) / 2;

          return (
            <RoundedRect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              r={barWidth / 2}
              color={color}
              opacity={0.24 + level * 0.72}
            />
          );
        })}
      </Group>
    </Canvas>
  );
}
