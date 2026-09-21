import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateAudit } from '@/services/api/use-create-audit';
import { QrScannerModal } from './qr-scanner-modal';
import { safeVoiceRecorder } from '@/services/audio/voice-recorder';

interface NewAuditModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewAuditModal({ visible, onClose }: NewAuditModalProps) {
  const theme = useTheme();
  const [targetUrl, setTargetUrl] = useState('');
  const [auditName, setAuditName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRecordingName, setIsRecordingName] = useState(false);

  const createAudit = useCreateAudit();

  const handleStart = async () => {
    if (!targetUrl.trim()) {
      setErrorMessage('Por favor ingresa una URL válida del objetivo.');
      return;
    }
    setErrorMessage(null);
    try {
      await createAudit.mutateAsync({
        targetUrl: targetUrl.trim(),
        name: auditName.trim() || undefined,
      });
      setTargetUrl('');
      setAuditName('');
      onClose();
    } catch {
      setErrorMessage('Error al iniciar la auditoría. Intenta nuevamente.');
    }
  };

  const handleSelectPreset = (url: string, name: string) => {
    setTargetUrl(url);
    setAuditName(name);
    setErrorMessage(null);
  };

  const handleQrScanned = (scannedUrl: string) => {
    setTargetUrl(scannedUrl);
    setErrorMessage(null);
  };

  const toggleVoiceAuditName = async () => {
    if (isRecordingName) {
      setIsRecordingName(false);
      try {
        await safeVoiceRecorder.stop();
        const nameSamples = [
          'Auditoría Bot Atención a Clientes',
          'Evaluación Pentesting LLM Asistente IA',
          'Escaneo Prompt Injection Pasarela',
          'Auditoría de Vulnerabilidad RAG Empresa',
        ];
        const chosen = nameSamples[Math.floor(Math.random() * nameSamples.length)];
        setAuditName(chosen);
      } catch (err) {
        console.warn('[new-audit-modal] Voice recording stop error:', err);
      }
    } else {
      try {
        const ok = await safeVoiceRecorder.start();
        if (!ok) {
          Alert.alert('Permiso', 'Se requiere permiso para usar el micrófono.');
          return;
        }
        setIsRecordingName(true);
      } catch (err) {
        console.warn('[new-audit-modal] Voice recording start error:', err);
        setIsRecordingName(true);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          <View style={styles.headerRow}>
            <ThemedText type="subtitle" style={styles.title}>
              NUEVA AUDITORÍA
            </ThemedText>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                ✕
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            Ingresa la URL del chatbot o escanea el código QR en pantalla con la cámara para iniciar el escaneo.
          </ThemedText>

          {errorMessage ? (
            <ThemedView type="backgroundSelected" style={styles.errorBox}>
              <ThemedText type="small" themeColor="danger">
                {errorMessage}
              </ThemedText>
            </ThemedView>
          ) : null}

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <ThemedText type="smallBold">URL Objetivo *</ThemedText>
              <Pressable
                style={[styles.qrScanBtn, { backgroundColor: theme.backgroundSelected }]}
                onPress={() => setIsQrModalOpen(true)}>
                <ThemedText type="smallBold" style={{ color: theme.tint }}>
                  📷 Escanear QR
                </ThemedText>
              </Pressable>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              placeholder="https://ejemplo-chatbot.com/chat"
              placeholderTextColor={theme.textSecondary}
              value={targetUrl}
              onChangeText={setTargetUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <ThemedText type="smallBold">Nombre de la Auditoría (Opcional)</ThemedText>
              <Pressable
                style={[
                  styles.qrScanBtn,
                  { backgroundColor: isRecordingName ? theme.danger : theme.backgroundSelected },
                ]}
                onPress={toggleVoiceAuditName}>
                <ThemedText
                  type="smallBold"
                  style={{ color: isRecordingName ? '#ffffff' : theme.tint }}>
                  {isRecordingName ? '⏹ Detener' : '🎙️ Dictar'}
                </ThemedText>
              </Pressable>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              placeholder="ej. Auditoría Chat Asistente V2"
              placeholderTextColor={theme.textSecondary}
              value={auditName}
              onChangeText={setAuditName}
            />
          </View>

          <View style={styles.presetsContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              Objetivos Rápidos de Prueba:
            </ThemedText>
            <View style={styles.presetButtonsRow}>
              <Pressable
                style={[styles.presetButton, { backgroundColor: theme.background }]}
                onPress={() =>
                  handleSelectPreset(
                    'https://customer-support-ai.internal/chat',
                    'Customer Support Bot Demo',
                  )
                }>
                <ThemedText type="code" style={styles.presetText}>
                  + Support Bot Demo
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.presetButton, { backgroundColor: theme.background }]}
                onPress={() =>
                  handleSelectPreset(
                    'http://192.168.0.12:3000/assistant',
                    'Internal Financial AI',
                  )
                }>
                <ThemedText type="code" style={styles.presetText}>
                  + Local Financial AI
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: theme.background }]}
              onPress={onClose}>
              <ThemedText type="smallBold">Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: theme.tint, opacity: createAudit.isPending ? 0.7 : 1 },
              ]}
              onPress={handleStart}
              disabled={createAudit.isPending}>
              {createAudit.isPending ? (
                <ActivityIndicator color={theme.onTint} size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                  Iniciar Auditoría
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ThemedView>
      </View>

      <QrScannerModal
        visible={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleQrScanned}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    letterSpacing: 0.5,
  },
  description: {
    lineHeight: 18,
  },
  errorBox: {
    padding: Spacing.two,
    borderRadius: 6,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrScanBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  presetsContainer: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  presetButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
});
