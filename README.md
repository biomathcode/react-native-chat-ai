# Sage

Voice-first Expo and React Native companion for chat, medicine recall, and daily dose reminders.

<p align="center">
  <img src="./assets/images/icon.png" alt="Sage app icon" width="104" />
</p>

<p align="center">
  <a href="https://expo.dev/accounts/pratiksharm/projects/Sage-ai/builds/c487bd5a-3823-4886-b2cc-67c1c69f62ec">
    <img alt="Expo development build" src="https://img.shields.io/badge/Expo%20Dev%20Build-Install-000020?logo=expo&logoColor=white" />
  </a>
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo%20SDK-55-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.83.6-61DAFB?logo=react&logoColor=111111" />
  <img alt="React" src="https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=111111" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-10.12.1-F69220?logo=pnpm&logoColor=white" />
  <a href="https://react-native-chat-ai.vercel.app">
    <img alt="API deployment" src="https://img.shields.io/badge/API-Vercel-000000?logo=vercel&logoColor=white" />
  </a>
  <img alt="Status" src="https://img.shields.io/badge/status-active-426256" />
</p>

### Watch -> 

<p align="center">
  <video src="./assets/showcase/framedrop_video.mp4" width="320" controls muted playsinline>
    A video walkthrough of Sage.
  </video>
</p>



### Problem Statement
In India as well as the world, Chronic diseases are on the rise. Medication at the right time is crucial for managing these conditions effectively. More often It a care taker responsibility to remind the patients to take their medicines on time. This can be a challenging task, especially when there are multiple medications with different schedules. Additionally, patients may have questions about their medications, such as potential side effects or interactions with other drugs. A voice assistant can provide timely reminders and answer medication-related queries, improving adherence and patient outcomes.


## Showcase

<p align="center">
  <img src="./assets/showcase/WhatsApp%20Image%202026-05-23%20at%2016.12.19%20(2).jpeg" alt="Sage medicine schedule screen" width="260" />
  <img src="./assets/showcase/WhatsApp%20Image%202026-05-23%20at%2016.12.19%20(1).jpeg" alt="Sage previous conversations screen" width="260" />
  <img src="./assets/showcase/WhatsApp%20Image%202026-05-23%20at%2016.12.19.jpeg" alt="Sage chat screen with medicine cards" width="260" />

</p>



## Overview

Sage combines a conversational voice interface with medicine-aware responses and daily dose scheduling. The mobile app is built with Expo Router, React Native, Expo Audio, React Native Gesture Handler, Reanimated, Skia, and Sarvam AI services.

The app uses a hosted Expo Router server API for chat, speech-to-text, and text-to-speech, so the Sarvam API key stays on the server and is not shipped in the mobile client.

This project uses pnpm for dependency installation and script execution. Use `pnpm install`, not `npm install`.


## User Interface
My initial thought was to make the interface voice only. As People use less cognitive effort and give out information. This make will help us Collect great about out audio data which can be much more informative in the future as well. The Text Input for the chat bot was added for accessibility and convenience of the people. I am using shader for the animated orb using react-native-skia, which does increases the size of our application but it gives us a great experience. I have also added the medicine cards which gives the user a quick glance at the medicines that they are taking.


In the Onboarding experience, We let the use select the voice that they like. This is very important for the whole experience. Selecting the voice give the user a sense of ownership of the assistant they are talking to.

In My research, I found that ChatGPT still can't send timely reminders to the users. So there is a space where the assistance not becomes a companion but also a tool that the user can use. The Voice Assistant can list of information about the medicine that the patient is taking, and also help to set the reminders for the medicines.



### Short Coming of the Solution

I have not still implemented the user notification/ reminders. I have mostly focus on the UI and the experience of the user interface. We have latency issue as well. Sarvam Agents do have great voices, transcription and response generation but the latency is bit high. I am looking forward to optimize the latency in the future using Live-kit. Even profile more tools, like medicine search api and medicine information api.


## Deployment

| Target                    | URL                                                                                                | Notes                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Android development build | https://expo.dev/accounts/pratiksharm/projects/Sage-ai/builds/c487bd5a-3823-4886-b2cc-67c1c69f62ec | Internal Expo development client build for Android. |
| API and web deployment    | https://react-native-chat-ai.vercel.app                                                            | Vercel deployment for Expo Router server endpoints. |

The Android development profile in `eas.json` sets:

```json
{
  "EXPO_PUBLIC_API_BASE_URL": "https://react-native-chat-ai.vercel.app"
}
```

Native clients use `EXPO_PUBLIC_API_BASE_URL` first, then fall back to `expo.extra.apiBaseUrl` from `app.json`.

## API Routes

Base URL:

```txt
https://react-native-chat-ai.vercel.app
```

| Route         | Method | Purpose                                                                                               |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `/api/health` | `GET`  | Health check. Returns `{ "status": "ok" }`.                                                           |
| `/api/chat`   | `POST` | Generates a Sarvam-backed assistant response for a conversation, prompt, or AI SDK UI message stream. |
| `/api/stt`    | `POST` | Transcribes an uploaded audio file using Sarvam speech-to-text.                                       |
| `/api/tts`    | `POST` | Generates WAV speech audio from text using Sarvam Bulbul voices.                                      |

### `GET /api/health`

```bash
curl https://react-native-chat-ai.vercel.app/api/health
```

Response:

```json
{
  "status": "ok"
}
```

### `POST /api/chat`

JSON request options:

```json
{
  "conversation": [
    { "role": "user", "content": "Can you tell me about the medicines I am taking?" }
  ],
  "voiceName": "Rahul"
}
```

Alternative supported fields are `prompt` for a simple one-shot request and `messages` for AI SDK UI message streaming.

Response:

```json
{
  "text": "Here are the medicines you are taking."
}
```

### `POST /api/stt`

Multipart form request:

| Field          | Type   | Required | Description                                |
| -------------- | ------ | -------- | ------------------------------------------ |
| `audio`        | file   | Yes      | Audio file to transcribe.                  |
| `languageCode` | string | No       | Sarvam language code. Defaults to `en-IN`. |

Response:

```json
{
  "text": "Hello, I am here.",
  "language": "en-IN",
  "requestId": "..."
}
```

### `POST /api/tts`

JSON request:

```json
{
  "text": "Hello, I am here.",
  "voiceId": "shubh"
}
```

Response:

```json
{
  "base64": "...",
  "contentType": "audio/wav"
}
```

## Environment Variables

The server routes require a Sarvam API key.

### Local Development

Create a local `.env` file:

```bash
SARVAM_API_KEY=your_sarvam_api_key_here
```

Then restart the Expo development server.

### Vercel

Add the same variable in the Vercel project settings:

```txt
SARVAM_API_KEY=your_sarvam_api_key_here
```

Recommended scopes:

| Environment | Required                                       |
| ----------- | ---------------------------------------------- |
| Production  | Yes                                            |
| Preview     | Yes, if preview deployments should call Sarvam |
| Development | Yes, if using Vercel local development         |

Do not add `SARVAM_API_KEY` as an `EXPO_PUBLIC_*` variable. Public Expo variables are bundled into the client.

## Installation

This project uses pnpm for dependency management.

```bash
pnpm install
```

Skia postinstall scripts are trusted through `package.json`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@shopify/react-native-skia"]
  }
}
```

## Development

Start the Expo development server:

```bash
pnpm start
```

Run Android locally:

```bash
pnpm android
```

Run iOS locally:

```bash
pnpm ios
```

Run web locally:

```bash
pnpm web
```

Generate Sarvam voice preview assets:

```bash
pnpm voices:generate
```

## Builds

Create an Android development build with EAS:

```bash
pnpm exec eas build --platform android --profile development
```

The current shared Android development build is available here:

```txt
https://expo.dev/accounts/pratiksharm/projects/Sage-ai/builds/c487bd5a-3823-4886-b2cc-67c1c69f62ec
```

## Styling

Sage uses a soft healthcare-inspired visual system:

- Calm green primary actions and selected states.
- Pale mint surfaces for assistant context, medicine cards, and gentle emphasis.
- High-contrast ink text for readability.
- Rounded controls and spacious touch targets for mobile use.
- Voice gradients for assistant identity and listening states.
- Platform-native typography on iOS and Android, with CSS font variables on web.

Core styling tokens live in `src/constants/theme.ts`. Feature-specific styles are grouped beside their screens, including `src/features/chat/styles.ts` and `src/features/medicine-schedules/styles.ts`.

## Brand Guidelines

### Icon

<p>
  <img src="./assets/images/icon.png" alt="Sage app icon" width="120" />
  <img src="./assets/images/splash-icon.png" alt="Sage splash icon" width="120" />
</p>

| Asset                       | Path                                        |
| --------------------------- | ------------------------------------------- |
| App icon                    | `assets/images/icon.png`                    |
| Splash icon                 | `assets/images/splash-icon.png`             |
| Favicon                     | `assets/images/favicon.png`                 |
| Android adaptive foreground | `assets/images/android-icon-foreground.png` |
| Android adaptive background | `assets/images/android-icon-background.png` |
| Android adaptive monochrome | `assets/images/android-icon-monochrome.png` |

### Typography

| Role           | Size | Line height | Usage                             |
| -------------- | ---: | ----------: | --------------------------------- |
| Caption        |   12 |          16 | Metadata and compact labels.      |
| Body           |   14 |          20 | Default readable copy.            |
| Body relaxed   |   15 |          22 | Longer assistant and user text.   |
| Button         |   16 |          20 | Primary controls.                 |
| Item title     |   17 |          23 | Medicine and conversation titles. |
| Section title  |   20 |          26 | Screen sections.                  |
| Calendar title |   22 |          28 | Calendar header.                  |
| Screen title   |   28 |          34 | Main screen headings.             |

Font families:

| Platform | Family                                                                        |
| -------- | ----------------------------------------------------------------------------- |
| iOS      | System UI, rounded, serif, and monospaced system families.                    |
| Android  | Native default sans, serif, and monospace families.                           |
| Web      | `Spline Sans`, `Inter`, system sans, `SF Pro Rounded`, and Georgia fallbacks. |

### Color Palette

<table>
  <tr>
    <th>Token</th>
    <th>Hex</th>
    <th>Swatch</th>
    <th>Usage</th>
  </tr>
  <tr>
    <td><code>primary</code></td>
    <td><code>#426256</code></td>
    <td><img alt="#426256 swatch" src="https://placehold.co/72x20/426256/426256.png" /></td>
    <td>Primary buttons, controls, and selected states.</td>
  </tr>
  <tr>
    <td><code>primaryText</code></td>
    <td><code>#2f6b55</code></td>
    <td><img alt="#2f6b55 swatch" src="https://placehold.co/72x20/2f6b55/2f6b55.png" /></td>
    <td>Brand text and strong green accents.</td>
  </tr>
  <tr>
    <td><code>primarySoft</code></td>
    <td><code>#eef6f4</code></td>
    <td><img alt="#eef6f4 swatch" src="https://placehold.co/72x20/eef6f4/eef6f4.png" /></td>
    <td>Soft cards and low-emphasis backgrounds.</td>
  </tr>
  <tr>
    <td><code>primaryTint</code></td>
    <td><code>#cfe5dc</code></td>
    <td><img alt="#cfe5dc swatch" src="https://placehold.co/72x20/cfe5dc/cfe5dc.png" /></td>
    <td>Borders, tints, and supporting accents.</td>
  </tr>
  <tr>
    <td><code>ink</code></td>
    <td><code>#17231f</code></td>
    <td><img alt="#17231f swatch" src="https://placehold.co/72x20/17231f/17231f.png" /></td>
    <td>Primary text.</td>
  </tr>
  <tr>
    <td><code>textSubtle</code></td>
    <td><code>#5f746e</code></td>
    <td><img alt="#5f746e swatch" src="https://placehold.co/72x20/5f746e/5f746e.png" /></td>
    <td>Secondary text and helper labels.</td>
  </tr>
  <tr>
    <td><code>screen</code></td>
    <td><code>#f8faf9</code></td>
    <td><img alt="#f8faf9 swatch" src="https://placehold.co/72x20/f8faf9/f8faf9.png" /></td>
    <td>App screen background.</td>
  </tr>
  <tr>
    <td><code>surface</code></td>
    <td><code>#ffffff</code></td>
    <td><img alt="#ffffff swatch" src="https://placehold.co/72x20/ffffff/ffffff.png" /></td>
    <td>Cards, panels, and neutral surfaces.</td>
  </tr>
  <tr>
    <td><code>border</code></td>
    <td><code>#e2ebe7</code></td>
    <td><img alt="#e2ebe7 swatch" src="https://placehold.co/72x20/e2ebe7/e2ebe7.png" /></td>
    <td>Subtle outlines and dividers.</td>
  </tr>
</table>

### Gradients

| Token               | Colors                                     | Usage                         |
| ------------------- | ------------------------------------------ | ----------------------------- |
| `primaryBlue`       | `#426256`, `#5f8a78`, `#cfe5dc`            | Brand gradient accents.       |
| `primaryBlueStrong` | `#2f6b55`, `#426256`                       | Strong primary controls.      |
| `meshListeningBase` | `#ead1ee`, `#f8c3d8`, `#c8d8ff`, `#dacbf2` | Listening and voice ambience. |
| `profileAvatar`     | `#f2fbf4`, `#d6f4df`, `#b8e8c8`            | Profile and avatar treatment. |

## Project Structure

```txt
api/                    Vercel adapter entrypoint
assets/                 Icons, showcase media, and voice assets
src/app/                Expo Router screens and server routes
src/components/         Shared UI components
src/constants/          Theme and voice constants
src/features/chat/      Chat, voice, medicine recall, and history
src/features/medicine-schedules/
                        Medicine schedule screens, data, and styles
src/features/onboarding/
                        Voice onboarding experience
```

## License

Private project.
