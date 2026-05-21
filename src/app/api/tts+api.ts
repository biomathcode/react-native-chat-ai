import { experimental_generateSpeech as generateSpeech } from 'ai';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSarvam } from 'sarvam-ai-sdk';

import type { SarvamVoiceId } from '@/constants/sarvam-voices';

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
    text?: string;
    voiceId?: SarvamVoiceId;
  };
  const text = body.text?.trim();
  const apiKey = getSarvamApiKey();

  if (!text) {
    return Response.json({ error: 'Missing text.' }, { status: 400 });
  }

  if (!apiKey) {
    return Response.json(
      { error: 'SARVAM_API_KEY is not configured. Add it to .env and restart pnpm start.' },
      { status: 500 }
    );
  }

  const sarvamProvider = createSarvam({ apiKey });
  const { audio } = await generateSpeech({
    model: sarvamProvider.speech('bulbul:v3', 'en-IN', {
      output_audio_codec: 'wav',
      speaker: body.voiceId ?? 'shubh',
    }),
    text,
  });

  return Response.json({
    base64: audio.base64,
    contentType: 'audio/wav',
  });
}
