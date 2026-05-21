import { VISUALIZER_BARS } from './constants';

export function buildWaveform(frames: number[]) {
  const bucketSize = Math.max(1, Math.floor(frames.length / VISUALIZER_BARS));

  return Array.from({ length: VISUALIZER_BARS }, (_, index) => {
    const start = index * bucketSize;
    const bucket = frames.slice(start, start + bucketSize);
    const peak = bucket.reduce((max, frame) => Math.max(max, Math.abs(frame)), 0);

    return Math.max(0.08, Math.min(1, peak * 3.4));
  });
}
