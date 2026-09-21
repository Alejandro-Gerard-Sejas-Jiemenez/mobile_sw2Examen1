import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  createAudioPlayer,
  type AudioPlayer,
} from 'expo-audio';

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
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    let fileUri: string | null = null;

    if (this.activeRecorder) {
      try {
        await this.activeRecorder.stop();
        fileUri = this.activeRecorder.uri || null;
      } catch (err) {
        console.warn('[voice-recorder] Error stopping native recorder:', err);
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
      console.warn('[voice-recorder] Error playing audio:', err);
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
