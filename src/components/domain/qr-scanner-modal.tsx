import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';

import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { QR_SCANNER_CONSTANTS } from '@/constants/audit.constants';
import { commonStyles, layoutStyles, qrScannerStyles } from '@/styles';

interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (scannedUrl: string) => void;
}

export function QrScannerModal({ visible, onClose, onScanSuccess }: QrScannerModalProps) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || !result.data) return;
    setScanned(true);

    const data = result.data.trim();
    onScanSuccess(data);
    onClose();

    // Reset scanned state after closing
    setTimeout(() => setScanned(false), QR_SCANNER_CONSTANTS.RESET_TIMEOUT_MS);
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={qrScannerStyles.container}>
        <View style={[layoutStyles.rowBetween, qrScannerStyles.header]}>
          <ThemedText type="smallBold" style={qrScannerStyles.headerTitle}>
            ESCANEAR CÓDIGO QR DEL CHATBOT
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              qrScannerStyles.closeButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}>
            <ThemedText type="smallBold" style={qrScannerStyles.closeButtonText}>
              CERRAR
            </ThemedText>
          </Pressable>
        </View>

        {!permission ? (
          <View style={layoutStyles.centerFlex}>
            <ActivityIndicator color={theme.tint} size="large" />
            <ThemedText type="small" style={qrScannerStyles.permissionLoadingText}>
              Comprobando permisos de cámara…
            </ThemedText>
          </View>
        ) : !permission.granted ? (
          <View style={layoutStyles.centerFlex}>
            <ThemedView type="backgroundElement" style={commonStyles.permissionCard}>
              <ThemedText type="subtitle" style={qrScannerStyles.permissionTitle}>
                Acceso a la Cámara Requerido
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={qrScannerStyles.permissionDescription}>
                Para escanear el código QR de la página web objetivo sin escribir la URL a mano, permite el acceso a la cámara.
              </ThemedText>
              <Pressable
                style={[
                  commonStyles.buttonPrimary,
                  qrScannerStyles.permissionButton,
                  { backgroundColor: theme.tint },
                ]}
                onPress={requestPermission}>
                <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                  Conceder Permiso
                </ThemedText>
              </Pressable>
              <Pressable style={qrScannerStyles.permissionCancelButton} onPress={onClose}>
                <ThemedText type="small" themeColor="textSecondary">
                  Cancelar
                </ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        ) : (
          <View style={qrScannerStyles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Viewfinder Target Frame Overlay */}
            <View style={StyleSheet.absoluteFill}>
              <View style={qrScannerStyles.unfocusedContainer} />
              <View style={qrScannerStyles.targetFrameRow}>
                <View style={qrScannerStyles.unfocusedContainer} />
                <View
                  style={[
                    qrScannerStyles.targetFrame,
                    { borderColor: theme.tint },
                  ]}>
                  <View style={[qrScannerStyles.corner, qrScannerStyles.topLeft, { borderColor: theme.tint }]} />
                  <View style={[qrScannerStyles.corner, qrScannerStyles.topRight, { borderColor: theme.tint }]} />
                  <View style={[qrScannerStyles.corner, qrScannerStyles.bottomLeft, { borderColor: theme.tint }]} />
                  <View style={[qrScannerStyles.corner, qrScannerStyles.bottomRight, { borderColor: theme.tint }]} />
                </View>
                <View style={qrScannerStyles.unfocusedContainer} />
              </View>
              <View style={qrScannerStyles.unfocusedContainer}>
                <ThemedText
                  type="small"
                  style={qrScannerStyles.instructionText}>
                  Apunta la cámara al código QR de la página o asistente web
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
