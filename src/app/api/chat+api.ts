import { convertToModelMessages, generateText, streamText, UIMessage } from 'ai';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSarvam } from 'sarvam-ai-sdk';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function normalizeVoiceName(voiceName: unknown) {
  if (typeof voiceName !== 'string') {
    return 'Shubh';
  }

  const normalizedName = voiceName.trim().replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 32);

  return normalizedName || 'Shubh';
}

function buildSystemPrompt(voiceName: string) {
  return [
    `You are ${voiceName}, a warm, concise AI voice companion.`,
    `Speak in first person as ${voiceName} when your identity is relevant, but do not force your name into every reply.`,
    'Keep responses natural, supportive, and easy to say aloud.',
    'Prefer one or two short sentences unless the user asks for more detail.',
  ].join(' ');
}

function readSarvamApiKeyFromEnvFile() {
  try {
    const env = readFileSync(join(process.cwd(), '.env'), 'utf8');
    const match = env.match(/^SARVAM_API_KEY=(["']?)(.+?)\1\s*$/m);

    return match?.[2];
  } catch {
    return undefined;
  }
}

function getSarvamApiKey() {
  return process.env.SARVAM_API_KEY ?? readSarvamApiKeyFromEnvFile();
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    conversation?: ConversationMessage[];
    messages?: UIMessage[];
    prompt?: string;
    voiceName?: string;
  };
  const apiKey = getSarvamApiKey();

  if (!apiKey) {
    return Response.json(
      { error: 'SARVAM_API_KEY is not configured. Add it to .env and restart pnpm start.' },
      { status: 500 }
    );
  }

  const sarvamProvider = createSarvam({ apiKey });
  const system = buildSystemPrompt(normalizeVoiceName(body.voiceName));

  if (body.conversation?.length || body.prompt) {
    const conversation = (body.conversation ?? [])
      .filter((message) => message.content.trim())
      .slice(-12);

    const result = await generateText({
      model: sarvamProvider('sarvam-30b'),
      system,
      messages: conversation.length
        ? conversation
        : [{ role: 'user', content: body.prompt ?? '' }],
    });

    return Response.json({ text: result.text });
  }

  const result = streamText({
    model: sarvamProvider('sarvam-30b'),
    system,
    messages: await convertToModelMessages(body.messages ?? []),
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
