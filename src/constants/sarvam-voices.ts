import { Gradients } from '@/constants/theme';

export const ONBOARDING_SAMPLE_TEXT = 'hey, i am here, how are you feeling today?';

export const sarvamVoiceOptions = [
  {
    id: 'shubh',
    name: 'Shubh',
    tone: 'Warm',
    color: Gradients.voiceShubh[0],
    gradient: Gradients.voiceShubh,
    source: require('@/assets/voices/shubh.wav'),
  },
  {
    id: 'priya',
    name: 'Priya',
    tone: 'Gentle',
    color: Gradients.voicePriya[0],
    gradient: Gradients.voicePriya,
    source: require('@/assets/voices/priya.wav'),
  },
  {
    id: 'neha',
    name: 'Neha',
    tone: 'Bright',
    color: Gradients.voiceNeha[0],
    gradient: Gradients.voiceNeha,
    source: require('@/assets/voices/neha.wav'),
  },
  {
    id: 'rahul',
    name: 'Rahul',
    tone: 'Calm',
    color: Gradients.voiceRahul[0],
    gradient: Gradients.voiceRahul,
    source: require('@/assets/voices/rahul.wav'),
  },
  {
    id: 'pooja',
    name: 'Pooja',
    tone: 'Soft',
    color: Gradients.voicePooja[0],
    gradient: Gradients.voicePooja,
    source: require('@/assets/voices/pooja.wav'),
  },
  {
    id: 'rohan',
    name: 'Rohan',
    tone: 'Steady',
    color: Gradients.voiceRohan[0],
    gradient: Gradients.voiceRohan,
    source: require('@/assets/voices/rohan.wav'),
  },
  {
    id: 'kavya',
    name: 'Kavya',
    tone: 'Clear',
    color: Gradients.voiceKavya[0],
    gradient: Gradients.voiceKavya,
    source: require('@/assets/voices/kavya.wav'),
  },
] as const;

export type SarvamVoiceId = (typeof sarvamVoiceOptions)[number]['id'];
