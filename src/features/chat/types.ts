export type Medicine = {
  id: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  medicines?: Medicine[];
  type?: 'text' | 'medicine-list';
};

export type SttResponse = {
  text?: string;
  error?: string;
};

export type ChatResponse = {
  text?: string;
  error?: string;
};

export type ChatSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
};
