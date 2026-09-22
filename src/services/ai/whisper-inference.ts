// whisper.rn@0.7.4's package.json `exports` map has no root "." entry (only
// "./*" subpath patterns), so the bare `whisper.rn` specifier is not resolvable
// under package-exports resolution (which this project's Metro/TS both use) —
// `whisper.rn/index` matches the "./*" pattern instead and is what actually
// resolves, both for Metro (bundling raw source via the "react-native"
// condition) and for TypeScript (redirected to the compiled .d.ts — see the
// "whisper.rn/index" entry in tsconfig.json `paths`).
import { initWhisper, type WhisperContext } from 'whisper.rn/index';
import { isWhisperModelDownloaded } from './whisper-model-manager';

const TRANSCRIBE_TIMEOUT_MS = 20000;

let contextPromise: Promise<WhisperContext> | null = null;

// Same non-reentrancy constraint as the Llama context in llama-inference.ts —
// only one whisper transcription may run against the shared context at a
// time. Voice directives are short and one-at-a-time by construction (the
// mic button is disabled while recording/transcribing), but this queue keeps
// the guarantee explicit instead of relying on UI state alone.
let transcribeQueue: Promise<void> = Promise.resolve();

async function getContext(): Promise<WhisperContext | null> {
  const status = await isWhisperModelDownloaded();
  if (!status.exists) {
    console.warn('[whisper-inference] ⚠️  Modelo Whisper NO encontrado en disco — dictado por voz no disponible.');
    return null;
  }

  if (!contextPromise) {
    console.log('[whisper-inference] 🚀 Iniciando carga del contexto Whisper…');
    contextPromise = initWhisper({ filePath: status.uri, useGpu: true })
      .then((ctx) => {
        console.log('[whisper-inference] ✅ Contexto Whisper cargado y cacheado correctamente.');
        return ctx;
      })
      .catch((err) => {
        contextPromise = null; // allow a retry on the next call instead of caching a permanent failure
        throw err;
      });
  } else {
    console.log('[whisper-inference] ♻️  Reutilizando contexto Whisper ya cacheado en memoria.');
  }

  try {
    return await contextPromise;
  } catch (err) {
    console.warn('[whisper-inference] ❌ Error al cargar el modelo Whisper:', err);
    return null;
  }
}

/**
 * Transcribes a local `.wav` file (mono 16-bit PCM — see `WHISPER_AUDIO_CONFIG`)
 * using the on-device Whisper model. Returns null — never throws — if the
 * model isn't downloaded, fails to load, times out, or produces empty text,
 * so callers always have a deterministic fallback (the preset directive list).
 */
export async function transcribeAudio(wavUri: string, language: string = 'auto'): Promise<string | null> {
  let release: () => void;
  const myTurn = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previousTurn = transcribeQueue;
  transcribeQueue = myTurn;
  await previousTurn;

  try {
    return await runTranscribeAudio(wavUri, language);
  } finally {
    release!();
  }
}

async function runTranscribeAudio(wavUri: string, language: string): Promise<string | null> {
  const context = await getContext();
  if (!context) return null;

  console.log(`[whisper-inference] 🎙️  Transcribiendo ${wavUri}…`);
  const { stop, promise } = context.transcribe(wavUri, { language });

  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutHandle = setTimeout(() => {
      console.warn(`[whisper-inference] ⏰ TIMEOUT tras ${TRANSCRIBE_TIMEOUT_MS / 1000}s — cancelando.`);
      resolve(null);
    }, TRANSCRIBE_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);

    if (result === null) {
      await stop().catch(() => {});
      return null;
    }

    const text = result.result?.trim();
    if (!text) {
      console.warn('[whisper-inference] ⚠️  Transcripción vacía — retornando null.');
      return null;
    }

    console.log(`[whisper-inference] ✅ Transcripción (${text.length} chars): "${text.slice(0, 80)}…"`);
    return text;
  } catch (err) {
    console.warn('[whisper-inference] ❌ Transcripción falló con error:', err);
    return null;
  }
}
