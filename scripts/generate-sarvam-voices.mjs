import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SAMPLE_TEXT = 'hey, i am here, how are you feeling today?';
const OUTPUT_DIR = path.join(process.cwd(), 'assets', 'voices');
const VOICES = ['shubh', 'priya', 'neha', 'rahul', 'pooja', 'rohan', 'kavya'];

async function readSarvamApiKey() {
  if (process.env.SARVAM_API_KEY) {
    return process.env.SARVAM_API_KEY;
  }

  const envPath = path.join(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return undefined;
  }

  const env = await readFile(envPath, 'utf8');
  const match = env.match(/^SARVAM_API_KEY=(["']?)(.+?)\1\s*$/m);

  return match?.[2];
}

async function generateVoiceSample(voice) {
  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'api-subscription-key': await readSarvamApiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [SAMPLE_TEXT],
      target_language_code: 'en-IN',
      speaker: voice,
      model: 'bulbul:v3',
      pace: 0.95,
      speech_sample_rate: 24000,
      output_audio_codec: 'wav',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? payload?.message ?? `Sarvam TTS failed for ${voice}`);
  }

  const base64Audio = payload.audios?.[0] ?? payload.audio;

  if (!base64Audio) {
    throw new Error(`Sarvam TTS returned no audio for ${voice}`);
  }

  await writeFile(path.join(OUTPUT_DIR, `${voice}.wav`), Buffer.from(base64Audio, 'base64'));
}

async function main() {
  const apiKey = await readSarvamApiKey();

  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is missing. Add it to .env before generating voice samples.');
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const voice of VOICES) {
    await generateVoiceSample(voice);
    console.log(`saved assets/voices/${voice}.wav`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
