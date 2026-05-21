import type { ChatMessage, Medicine } from './types';

export const USER_MEDICINES: Medicine[] = [
  { id: 'neurobion-forte', name: 'Neurobion Forte' },
  { id: 'multivitamin-supreme', name: 'Multivitamin Supreme' },
  { id: 'zincovit', name: 'Zincovit' },
  { id: 'a-to-z-ns-daily-multivitamins', name: 'A to z NS+ Daily multivitamins' },
];

export function isMedicineListRequest(text: string) {
  const normalizedText = text.toLowerCase();
  const asksAboutMedicine =
    normalizedText.includes('medicine') ||
    normalizedText.includes('medicines') ||
    normalizedText.includes('medication') ||
    normalizedText.includes('medications') ||
    normalizedText.includes('supplement') ||
    normalizedText.includes('supplements');

  if (!asksAboutMedicine) {
    return false;
  }

  return (
    normalizedText.includes('taking') ||
    normalizedText.includes('take') ||
    normalizedText.includes('my') ||
    normalizedText.includes('list') ||
    normalizedText.includes('show') ||
    normalizedText.includes('what')
  );
}

export function createMedicineListMessage(): ChatMessage {
  return {
    id: `${Date.now()}-assistant-medicines`,
    role: 'assistant',
    type: 'medicine-list',
    content: 'Here are the medicines you are taking.',
    medicines: USER_MEDICINES,
  };
}
