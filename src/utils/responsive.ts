import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const GUIDELINE_WIDTH = 390;
const GUIDELINE_HEIGHT = 844;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function horizontalScale(size: number, width: number) {
  return (width / GUIDELINE_WIDTH) * size;
}

export function verticalScale(size: number, height: number) {
  return (height / GUIDELINE_HEIGHT) * size;
}

export function moderateScale(size: number, width: number, factor = 0.5) {
  return size + (horizontalScale(size, width) - size) * factor;
}

export function useResponsiveMetrics() {
  const dimensions = useWindowDimensions();
  const shortestSide = Math.min(dimensions.width, dimensions.height);
  const usableWidth = clamp(shortestSide, 320, 430);

  return useMemo(
    () => ({
      ...dimensions,
      horizontal: (size: number, min = size * 0.82, max = size * 1.18) =>
        clamp(horizontalScale(size, usableWidth), min, max),
      vertical: (size: number, min = size * 0.82, max = size * 1.18) =>
        clamp(verticalScale(size, dimensions.height), min, max),
      moderate: (size: number, factor = 0.5, min = size * 0.9, max = size * 1.12) =>
        clamp(moderateScale(size, usableWidth, factor), min, max),
      isCompactHeight: dimensions.height < 720,
      isWide: dimensions.width >= 700,
    }),
    [dimensions, usableWidth]
  );
}
