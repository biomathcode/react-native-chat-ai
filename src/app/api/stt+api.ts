import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type SarvamSttLanguageCode =
  | 'hi-IN'
  | 'bn-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'mr-IN'
  | 'od-IN'
  | 'pa-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'en-IN'
  | 'gu-IN'
  | 'as-IN'
  | 'ur-IN'
  | 'ne-IN'
  | 'kok-IN'
  | 'ks-IN'
  | 'sd-IN'
  | 'sa-IN'
  | 'sat-IN'
  | 'mni-IN'
  | 'brx-IN'
  | 'mai-IN'
  | 'doi-IN'
  | 'unknown';

const languageCodes = new Set<string>([
  'hi-IN',
  'bn-IN',
  'kn-IN',
  'ml-IN',
  'mr-IN',
  'od-IN',
  'pa-IN',
  'ta-IN',
  'te-IN',
  'en-IN',
  'gu-IN',
  'as-IN',
  'ur-IN',
  'ne-IN',
  'kok-IN',
  'ks-IN',
  'sd-IN',
  'sa-IN',
  'sat-IN',
  'mni-IN',
  'brx-IN',
  'mai-IN',
  'doi-IN',
  'unknown',
]);

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
  const formData = await req.formData();
  const audio = formData.get('audio');
  const languageCode = formData.get('languageCode');
  const resolvedLanguageCode: SarvamSttLanguageCode =
    typeof languageCode === 'string' && languageCodes.has(languageCode)
      ? (languageCode as SarvamSttLanguageCode)
      : 'en-IN';

  if (!(audio instanceof Blob)) {
    return Response.json({ error: 'Missing audio file.' }, { status: 400 });
  }

  if (audio.size === 0) {
    return Response.json({ error: 'Audio file is empty.' }, { status: 400 });
  }

  const apiKey = getSarvamApiKey();

  if (!apiKey) {
    return Response.json(
      { error: 'SARVAM_API_KEY is not configured. Add it to .env and restart pnpm start.' },
      { status: 500 }
    );
  }

  const fileName =
    'name' in audio && typeof audio.name === 'string' ? audio.name : 'recording.m4a';

  const sarvamFormData = new FormData();
  sarvamFormData.append('file', audio, fileName);
  sarvamFormData.append('model', 'saaras:v3');
  sarvamFormData.append('mode', 'transcribe');
  sarvamFormData.append('language_code', resolvedLanguageCode);

  const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
    },
    body: sarvamFormData,
  });

  const responseText = await sarvamResponse.text();
  const transcript = responseText ? JSON.parse(responseText) : {};

  if (!sarvamResponse.ok) {
    return Response.json(
      {
        error:
          transcript?.error?.message ??
          transcript?.error?.code ??
          transcript?.message ??
          responseText ??
          'Sarvam speech-to-text request failed.',
      },
      { status: sarvamResponse.status }
    );
  }

  return Response.json({
    text: transcript.transcript,
    language: transcript.language_code,
    requestId: transcript.request_id,
  });
}
