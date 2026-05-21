import * as SecureStore from 'expo-secure-store';

import type { ChatMessage } from './types';

export const CHAT_HISTORY_STORAGE_KEY = 'react-native-chat-ai:chat-history';
export const MAX_STORED_MESSAGES = 16;
export const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'initial-assistant-message',
  role: 'assistant',
  content: 'Hello, I am here. How are you feeling today?',
};

function readWebStoredValue(key: string) {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export async function readStoredValue(key: string) {
  const webValue = readWebStoredValue(key);

  if (webValue) {
    return webValue;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export function writeStoredValue(key: string, value: string) {
  SecureStore.setItemAsync(key, value).catch(() => {});

  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Native Expo Go does not provide localStorage by default.
  }
}

export function parseStoredMessages(storedMessages: string | null) {
  if (!storedMessages) {
    return [];
  }

  try {
    const parsedMessages = JSON.parse(storedMessages);

    if (!Array.isArray(parsedMessages)) {
      return [];
    }

    return parsedMessages.filter(
      (message): message is ChatMessage =>
        typeof message?.id === 'string' &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        (message.type === undefined || message.type === 'text' || message.type === 'medicine-list') &&
        (message.medicines === undefined ||
          (Array.isArray(message.medicines) &&
            message.medicines.every(
              (medicine: unknown) =>
                typeof (medicine as { id?: unknown })?.id === 'string' &&
                typeof (medicine as { name?: unknown })?.name === 'string'
            )))
    );
  } catch {
    return [];
  }
}

export function createChatSessionSummaries(messages: ChatMessage[]) {
  const contentMessages = messages.filter((message) => message.id !== INITIAL_ASSISTANT_MESSAGE.id);

  if (!contentMessages.length) {
    return [];
  }

  const firstUserMessage = contentMessages.find((message) => message.role === 'user');
  const lastMessage = contentMessages[contentMessages.length - 1];
  const titleSource = firstUserMessage?.content ?? lastMessage.content;
  const preview = lastMessage.content;

  return [
    {
      id: 'current-chat',
      title: titleSource.length > 34 ? `${titleSource.slice(0, 34)}...` : titleSource,
      preview: preview.length > 74 ? `${preview.slice(0, 74)}...` : preview,
      messageCount: contentMessages.length,
    },
  ];
}
