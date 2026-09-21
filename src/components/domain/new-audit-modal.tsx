import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { QrScannerModal } from './qr-scanner-modal';
import { useNewAudit } from '@/hooks/use-new-audit';
import { AUDIT_DEMO_PRESETS } from '@/constants/audit.constants';
import { commonStyles, layoutStyles, newAuditModalStyles } from '@/styles';

interface NewAuditModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewAuditModal({ visible, onClose }: NewAuditModalProps) {
  const theme = useTheme();

  const {
    targetUrl,
    setTargetUrl,
    auditName,
    setAuditName,
    errorMessage,
    isQrModalOpen,
    setIsQrModalOpen,
    isRecordingName,
    isPending,
    handleStart,
    handleSelectPreset,
    handleQrScanned,
    toggleVoiceAuditName,
  } = useNewAudit({
    onSuccess: onClose,
  });

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={layoutStyles.modalBackdrop}>
        <ThemedView type="backgroundElement" style={commonStyles.modalCard}>
          <View style={layoutStyles.rowBetween}>
            <ThemedText type="subtitle" style={newAuditModalStyles.title}>
              NUEVA AUDITORÍA
            </ThemedText>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                X
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={newAuditModalStyles.description}>
            Ingresa la URL del chatbot o escanea el código QR en pantalla con la cámara para iniciar el escaneo.
          </ThemedText>

          {errorMessage ? (
            <ThemedView type="backgroundSelected" style={commonStyles.errorBox}>
              <ThemedText type="small" themeColor="danger">
                {errorMessage}
              </ThemedText>
            </ThemedView>
          ) : null}

          <View style={layoutStyles.gap1}>
            <View style={layoutStyles.rowBetween}>
              <ThemedText type="smallBold">URL Objetivo *</ThemedText>
              <Pressable
                style={[commonStyles.chip, { backgroundColor: theme.backgroundSelected }]}
                onPress={() => setIsQrModalOpen(true)}>
                <ThemedText type="smallBold" style={{ color: theme.tint }}>
                  Escanear QR
                </ThemedText>
              </Pressable>
            </View>
            <TextInput
              style={[
                newAuditModalStyles.input,
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

          <View style={layoutStyles.gap1}>
            <View style={layoutStyles.rowBetween}>
              <ThemedText type="smallBold">Nombre de la Auditoría (Opcional)</ThemedText>
              <Pressable
                style={[
                  commonStyles.chip,
                  { backgroundColor: isRecordingName ? theme.danger : theme.backgroundSelected },
                ]}
                onPress={toggleVoiceAuditName}>
                <ThemedText
                  type="smallBold"
                  style={isRecordingName ? newAuditModalStyles.chipActiveText : { color: theme.tint }}>
                  {isRecordingName ? 'Detener' : 'Dictar'}
                </ThemedText>
              </Pressable>
            </View>
            <TextInput
              style={[
                newAuditModalStyles.input,
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

          <View style={[layoutStyles.gap1, newAuditModalStyles.presetsContainer]}>
            <ThemedText type="small" themeColor="textSecondary">
              Objetivos Rápidos de Prueba:
            </ThemedText>
            <View style={[layoutStyles.rowWrap, layoutStyles.gap1]}>
              {AUDIT_DEMO_PRESETS.map((preset, index) => (
                <Pressable
                  key={index}
                  style={[commonStyles.chip, { backgroundColor: theme.background }]}
                  onPress={() => handleSelectPreset(preset.url, preset.name)}>
                  <ThemedText type="code" style={newAuditModalStyles.presetChipText}>
                    {preset.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[layoutStyles.row, newAuditModalStyles.actionsRow]}>
            <Pressable
              style={[newAuditModalStyles.cancelButton, { backgroundColor: theme.background }]}
              onPress={onClose}>
              <ThemedText type="smallBold">Cancelar</ThemedText>
            </Pressable>

            <Pressable
              style={[
                newAuditModalStyles.submitButton,
                { backgroundColor: theme.tint, opacity: isPending ? 0.7 : 1 },
              ]}
              onPress={handleStart}
              disabled={isPending}>
              {isPending ? (
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
