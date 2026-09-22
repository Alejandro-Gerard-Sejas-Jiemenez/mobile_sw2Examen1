import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  createAudioPlayer,
  type AudioPlayer,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { AUDIO_CONSTANTS } from '@/constants/audio.constants';
import { WHISPER_AUDIO_CONFIG } from '@/constants/ai.constants';
import { STORAGE_FILENAMES } from '@/constants/storage.constants';
import { AudioError } from '@/errors/audio-error';
import { writePcmChunksToWavFile } from './pcm-to-wav';

// `@fugood/react-native-audio-pcm-stream` ships an index.d.ts that declares
// the WRONG ambient module name (a leftover from the package it was forked
// from) and describes an API that doesn't match its actual native
// implementation (e.g. `stop()` returns void, not a path). Importing it
// through `require` + this hand-written interface (matching the real native
// module read in android/.../RNLiveAudioStreamModule.java) avoids depending
// on those incorrect types.
interface PcmAudioRecorder {
  init(options: {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    audioSource?: number;
    bufferSize?: number;
  }): Promise<void>;
  start(): void;
  stop(): void;
  on(event: 'data', callback: (base64Chunk: string) => void): void;
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AudioRecord = require('@fugood/react-native-audio-pcm-stream').default as PcmAudioRecorder;

export interface RecordingResult {
  uri: string | null;
  durationSeconds: number;
}

const RECORDINGS_DIR = `${FileSystem.documentDirectory || ''}${STORAGE_FILENAMES.VOICE_RECORDINGS_DIRECTORY}`;

async function ensureRecordingsDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

export class SafeVoiceRecorder {
  private activePlayer: AudioPlayer | null = null;
  private startTime = 0;
  private isRecording = false;
  private pcmChunks: string[] = [];

  async start(): Promise<boolean> {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      this.pcmChunks = [];
      // Records raw mono 16-bit PCM at the exact sample rate Whisper expects
      // (see `WHISPER_AUDIO_CONFIG`) — no resampling/transcoding step needed
      // before transcription, unlike expo-audio's AAC/.m4a output which
      // whisper.rn can't decode at all (WAV/PCM16 only).
      AudioRecord.on('data', (base64Chunk) => {
        this.pcmChunks.push(base64Chunk);
      });
      await AudioRecord.init({
        sampleRate: WHISPER_AUDIO_CONFIG.SAMPLE_RATE,
        channels: WHISPER_AUDIO_CONFIG.CHANNELS,
        bitsPerSample: WHISPER_AUDIO_CONFIG.BITS_PER_SAMPLE,
        audioSource: WHISPER_AUDIO_CONFIG.ANDROID_AUDIO_SOURCE,
      });
      AudioRecord.start();

      this.isRecording = true;
      this.startTime = Date.now();
      return true;
    } catch (err) {
      console.warn('[voice-recorder] Native recorder start error:', err);
      this.isRecording = false;
      return false;
    }
  }

  async stop(): Promise<RecordingResult> {
    const elapsedSeconds = Math.max(
      AUDIO_CONSTANTS.MIN_RECORDING_DURATION_SECONDS,
      Math.round((Date.now() - this.startTime) / AUDIO_CONSTANTS.RECORDING_TIMER_INTERVAL_MS)
    );
    let fileUri: string | null = null;

    if (this.isRecording) {
      AudioRecord.stop();
      this.isRecording = false;

      // The native module's recording thread flushes its last buffer(s)
      // asynchronously after `stop()` — give it a beat before reading
      // `pcmChunks` so the tail of the recording isn't dropped.
      await new Promise((resolve) => setTimeout(resolve, 150));

      if (this.pcmChunks.length > 0) {
        try {
          await ensureRecordingsDirectory();
          const uri = `${RECORDINGS_DIR}voice-${Date.now()}.wav`;
          await writePcmChunksToWavFile(this.pcmChunks, uri);
          fileUri = uri;
        } catch (err) {
          const audioErr = new AudioError(
            'AUDIO_RECORDING_STOP_FAILED',
            'Failed to write recorded audio to a WAV file',
            { cause: err }
          );
          console.warn(audioErr.message);
        }
      }
      this.pcmChunks = [];
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch {}

    return {
      uri: fileUri,
      durationSeconds: elapsedSeconds,
    };
  }

  async playAudio(uri: string): Promise<void> {
    if (!uri) return;
    try {
      if (this.activePlayer) {
        this.activePlayer.remove();
        this.activePlayer = null;
      }
      this.activePlayer = createAudioPlayer(uri);
      this.activePlayer.play();
    } catch (err) {
      const audioErr = new AudioError(
        'AUDIO_PLAYBACK_FAILED',
        `Failed to play audio file at ${uri}`,
        { cause: err }
      );
      console.warn(audioErr.message);
    }
  }

  stopPlayback(): void {
    if (this.activePlayer) {
      try {
        this.activePlayer.pause();
        this.activePlayer.remove();
      } catch {}
      this.activePlayer = null;
    }
  }
}

export const safeVoiceRecorder = new SafeVoiceRecorder();
