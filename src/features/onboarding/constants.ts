import { sarvamVoiceOptions } from '@/constants/sarvam-voices';

export const VISUALIZER_BARS = 28;
export const LOOPED_VOICES = [
  ...sarvamVoiceOptions,
  ...sarvamVoiceOptions,
  ...sarvamVoiceOptions,
];
export const START_INDEX = sarvamVoiceOptions.length;
export type VoiceOption = (typeof sarvamVoiceOptions)[number];
