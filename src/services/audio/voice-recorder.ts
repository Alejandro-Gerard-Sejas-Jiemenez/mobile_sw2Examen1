import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  createAudioPlayer,
  type AudioPlayer,
} from 'expo-audio';
import { AUDIO_CONSTANTS } from '@/constants/audio.constants';
import { AudioError } from '@/errors/audio-error';

export interface RecordingResult {
  uri: string | null;
  durationSeconds: number;
}

export class SafeVoiceRecorder {
  private activeRecorder: any = null;
  private activePlayer: AudioPlayer | null = null;
  private startTime: number = 0;

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

      if (this.activeRecorder) {
        try {
          await this.activeRecorder.stop();
        } catch {}
      }

      this.activeRecorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.activeRecorder.prepareToRecordAsync();
      this.activeRecorder.record();
      this.startTime = Date.now();
      return true;
    } catch (err) {
      console.warn('[voice-recorder] Native recorder start error, fallback mode:', err);
      this.startTime = Date.now();
      return true;
    }
  }

  async stop(): Promise<RecordingResult> {
    const elapsedSeconds = Math.max(
      AUDIO_CONSTANTS.MIN_RECORDING_DURATION_SECONDS,
      Math.round((Date.now() - this.startTime) / AUDIO_CONSTANTS.RECORDING_TIMER_INTERVAL_MS)
    );
    let fileUri: string | null = null;

    if (this.activeRecorder) {
      try {
        await this.activeRecorder.stop();
        fileUri = this.activeRecorder.uri || null;
      } catch (err) {
        const audioErr = new AudioError(
          'AUDIO_RECORDING_STOP_FAILED',
          'Failed to gracefully stop native audio recorder',
          { cause: err }
        );
        console.warn(audioErr.message);
      } finally {
        this.activeRecorder = null;
      }
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
