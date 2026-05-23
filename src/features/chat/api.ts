import Constants from 'expo-constants';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

import type { ChatMessage, ChatResponse, SttResponse } from './types';
import type { SarvamVoiceId } from '@/constants/sarvam-voices';

function getApiUrl(path: string) {
  if (Platform.OS === 'web') {
    return path;
  }

  const publicBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, '')}${path}`;
  }

  const constants = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string };
    expoConfig?: typeof Constants.expoConfig & { extra?: { apiBaseUrl?: string } };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  const configuredBaseUrl = constants.expoConfig?.extra?.apiBaseUrl;

  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/, '')}${path}`;
  }

  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.expoGoConfig?.debuggerHost ??
    constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    return `http://${hostUri}${path}`;
  }

  return path;
}

export async function sendChatRequest(messages: ChatMessage[], voiceName: string) {
  const response = await expoFetch(getApiUrl('/api/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation: messages.map(({ role, content }) => ({ role, content })),
      voiceName,
    }),
  });

  const responseText = await response.text();
  const result = responseText ? (JSON.parse(responseText) as ChatResponse) : {};

  if (!response.ok || result.error) {
    throw new Error(result.error ?? `Unable to get Sarvam response. (${response.status})`);
  }

  return result.text?.trim() ?? '';
}

export async function transcribeAudio(audioUri: string) {
  const audioFile = new File(audioUri);
  const formData = new FormData();
  formData.append('audio', audioFile as unknown as Blob);
  formData.append('languageCode', 'en-IN');

  const response = await expoFetch(getApiUrl('/api/stt'), {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  const result = responseText ? (JSON.parse(responseText) as SttResponse) : {};

  if (!response.ok || result.error) {
    throw new Error(result.error ?? `Unable to transcribe recording. (${response.status})`);
  }

  return result.text?.trim() ?? '';
}

export async function generateSpeechAudio(text: string, voiceId: SarvamVoiceId | null) {
  const response = await expoFetch(getApiUrl('/api/tts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voiceId }),
  });
  const responseText = await response.text();
  const result = responseText
    ? (JSON.parse(responseText) as { base64?: string; contentType?: string; error?: string })
    : {};

  if (!response.ok || result.error || !result.base64) {
    throw new Error(result.error ?? `Unable to generate speech. (${response.status})`);
  }

  if (Platform.OS !== 'web') {
    if (!FileSystem.cacheDirectory) {
      throw new Error('Unable to access the audio cache directory.');
    }

    const fileUri = `${FileSystem.cacheDirectory}assistant-${Date.now()}.wav`;
    await FileSystem.writeAsStringAsync(fileUri, result.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { uri: fileUri };
  }

  return {
    uri: `data:${result.contentType ?? 'audio/wav'};base64,${result.base64}`,
  };
}
