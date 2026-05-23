import * as SecureStore from 'expo-secure-store';

import type { ChatMessage, ChatSession, ChatSessionSummary } from './types';

export const CHAT_HISTORY_STORAGE_KEY = 'react-native-chat-ai:chat-history';
export const MAX_STORED_MESSAGES = 16;
export const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'initial-assistant-message',
  role: 'assistant',
  content: 'Hello, I am here. How are you feeling today?',
};

export function createEmptyChatSession(): ChatSession {
  const now = new Date().toISOString();

  return {
    id: `chat-session-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    messages: [INITIAL_ASSISTANT_MESSAGE],
  };
}

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

export function parseStoredChatSessions(storedSessions: string | null) {
  if (!storedSessions) {
    return [];
  }

  try {
    const parsedSessions = JSON.parse(storedSessions);

    if (!Array.isArray(parsedSessions)) {
      return [];
    }

    const migratedMessages = parseStoredMessages(storedSessions);

    if (migratedMessages.length) {
      const now = new Date().toISOString();

      return [
        {
          id: 'current-chat',
          createdAt: now,
          updatedAt: now,
          messages: migratedMessages,
        },
      ];
    }

    return parsedSessions.reduce<ChatSession[]>((sessions, session) => {
      if (
        typeof session?.id !== 'string' ||
        typeof session.createdAt !== 'string' ||
        typeof session.updatedAt !== 'string'
      ) {
        return sessions;
      }

      const messages = parseStoredMessages(JSON.stringify(session.messages));

      if (messages.length) {
        sessions.push({ ...session, messages });
      }

      return sessions;
    }, []);
  } catch {
    return [];
  }
}

function summarizeMessages(messages: ChatMessage[]): ChatSessionSummary | null {
  const contentMessages = messages.filter((message) => message.id !== INITIAL_ASSISTANT_MESSAGE.id);

  if (!contentMessages.length) {
    return null;
  }

  const firstUserMessage = contentMessages.find((message) => message.role === 'user');
  const lastMessage = contentMessages[contentMessages.length - 1];
  const titleSource = firstUserMessage?.content ?? lastMessage.content;
  const preview = lastMessage.content;

  return {
    id: '',
    title: titleSource.length > 34 ? `${titleSource.slice(0, 34)}...` : titleSource,
    preview: preview.length > 74 ? `${preview.slice(0, 74)}...` : preview,
    messageCount: contentMessages.length,
  };
}

export function createChatSessionSummaries(sessions: ChatSession[]) {
  return sessions.reduce<ChatSessionSummary[]>((summaries, session) => {
    const summary = summarizeMessages(session.messages);

    if (summary) {
      summaries.push({ ...summary, id: session.id });
    }

    return summaries;
  }, []);
}
