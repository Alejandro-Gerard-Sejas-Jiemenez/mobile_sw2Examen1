import * as FileSystem from 'expo-file-system/legacy';
import { WHISPER_AUDIO_CONFIG } from '@/constants/ai.constants';

// whisper.rn/whisper.cpp only decodes RIFF/WAVE PCM16 — the raw chunks coming
// from the PCM stream recorder are base64-encoded PCM16 bytes with no
// container, so this module concatenates them and prepends a WAV header
// before writing a single file to disk.

// Same base64<->bytes approach whisper.rn itself uses internally (its only
// npm dependency, already pulled in transitively): avoids relying on
// `atob`/`btoa` globals that aren't guaranteed present on Hermes.
const Buffer: any = (globalThis as any).Buffer || require('safe-buffer').Buffer;

function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

function buildWavHeader(dataSize: number, config: {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const byteRate = config.sampleRate * config.channels * (config.bitsPerSample / 8);
  const blockAlign = config.channels * (config.bitsPerSample / 8);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, config.channels, true);
  view.setUint32(24, config.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, config.bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  return new Uint8Array(header);
}

/**
 * Concatenates base64-encoded raw PCM16 chunks (as emitted by the PCM stream
 * recorder's `data` event) into a single valid `.wav` file on disk.
 * Recordings here are short voice directives (a few seconds to ~1 min), so
 * buffering every chunk in memory before one final write is safe and avoids
 * needing incremental append support from the filesystem API.
 */
export async function writePcmChunksToWavFile(
  chunks: string[],
  destinationUri: string,
  config: { sampleRate: number; channels: number; bitsPerSample: number } = {
    sampleRate: WHISPER_AUDIO_CONFIG.SAMPLE_RATE,
    channels: WHISPER_AUDIO_CONFIG.CHANNELS,
    bitsPerSample: WHISPER_AUDIO_CONFIG.BITS_PER_SAMPLE,
  },
): Promise<void> {
  const pcmByteChunks = chunks.map(base64ToBytes);
  const dataSize = pcmByteChunks.reduce((sum, c) => sum + c.length, 0);

  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(buildWavHeader(dataSize, config), 0);

  let offset = 44;
  for (const chunk of pcmByteChunks) {
    wavBytes.set(chunk, offset);
    offset += chunk.length;
  }

  await FileSystem.writeAsStringAsync(destinationUri, bytesToBase64(wavBytes), {
    encoding: FileSystem.EncodingType.Base64,
  });
}
