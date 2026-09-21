import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
    setTimeout(() => setScanned(false), 500);
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            ESCANEAR CÓDIGO QR DEL CHATBOT
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
              ✕ CERRAR
            </ThemedText>
          </Pressable>
        </View>

        {!permission ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={theme.tint} size="large" />
            <ThemedText type="small" style={{ color: '#ffffff', marginTop: Spacing.two }}>
              Comprobando permisos de cámara…
            </ThemedText>
          </View>
        ) : !permission.granted ? (
          <View style={styles.centerContent}>
            <ThemedView type="backgroundElement" style={styles.permissionCard}>
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                Acceso a la Cámara Requerido
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                Para escanear el código QR de la página web objetivo sin escribir la URL a mano, permite el acceso a la cámara.
              </ThemedText>
              <Pressable
                style={[styles.permissionBtn, { backgroundColor: theme.tint }]}
                onPress={requestPermission}>
                <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                  Conceder Permiso
                </ThemedText>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <ThemedText type="small" themeColor="textSecondary">
                  Cancelar
                </ThemedText>
              </Pressable>
            </ThemedView>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Viewfinder Target Frame Overlay */}
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.middleContainer}>
                <View style={styles.unfocusedContainer} />
                <View style={[styles.scannerFrame, { borderColor: theme.tint }]}>
                  <View style={[styles.corner, styles.topLeft, { borderColor: theme.tint }]} />
                  <View style={[styles.corner, styles.topRight, { borderColor: theme.tint }]} />
                  <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.tint }]} />
                  <View style={[styles.corner, styles.bottomRight, { borderColor: theme.tint }]} />
                </View>
                <View style={styles.unfocusedContainer} />
              </View>
              <View style={styles.unfocusedContainer}>
                <ThemedText type="small" style={styles.instructionText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10,
  },
  headerTitle: {
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  permissionBtn: {
    width: '100%',
    paddingVertical: Spacing.three,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: Spacing.one,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 260,
  },
  scannerFrame: {
    width: 260,
    height: 260,
    borderWidth: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: Spacing.one,
    borderRadius: 6,
  },
});
