export const ONBOARDING_SAMPLE_TEXT = 'hey, i am here, how are you feeling today?';

export const sarvamVoiceOptions = [
  {
    id: 'shubh',
    name: 'Shubh',
    tone: 'Warm',
    color: '#5AA7A7',
    gradient: ['#5AA7A7', '#96D7C6'],
    source: require('@/assets/voices/shubh.wav'),
  },
  {
    id: 'priya',
    name: 'Priya',
    tone: 'Gentle',
    color: '#96D7C6',
    gradient: ['#96D7C6', '#BAC94A'],
    source: require('@/assets/voices/priya.wav'),
  },
  {
    id: 'neha',
    name: 'Neha',
    tone: 'Bright',
    color: '#BAC94A',
    gradient: ['#BAC94A', '#E2D36B'],
    source: require('@/assets/voices/neha.wav'),
  },
  {
    id: 'rahul',
    name: 'Rahul',
    tone: 'Calm',
    color: '#E2D36B',
    gradient: ['#E2D36B', '#96D7C6'],
    source: require('@/assets/voices/rahul.wav'),
  },
  {
    id: 'pooja',
    name: 'Pooja',
    tone: 'Soft',
    color: '#6C8CBF',
    gradient: ['#6C8CBF', '#96D7C6'],
    source: require('@/assets/voices/pooja.wav'),
  },
  {
    id: 'rohan',
    name: 'Rohan',
    tone: 'Steady',
    color: '#5AA7A7',
    gradient: ['#5AA7A7', '#E2D36B'],
    source: require('@/assets/voices/rohan.wav'),
  },
  {
    id: 'kavya',
    name: 'Kavya',
    tone: 'Clear',
    color: '#6C8CBF',
    gradient: ['#6C8CBF', '#BAC94A'],
    source: require('@/assets/voices/kavya.wav'),
  },
] as const;

export type SarvamVoiceId = (typeof sarvamVoiceOptions)[number]['id'];
