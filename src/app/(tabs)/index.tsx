import { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuditRow, ScreenHeader, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { AUDITS_POLL_INTERVAL_MS, useAudits } from '@/services/api';
import { useLogout } from '@/services/auth';
import { monitoringStyles } from '@/styles';

const STALE_THRESHOLD_MS = AUDITS_POLL_INTERVAL_MS * 1.5;

export default function MonitoringPanelScreen() {
  const { data: audits, dataUpdatedAt, isLoading, isError } = useAudits();
  const logout = useLogout();
  const theme = useTheme();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isDataStale = dataUpdatedAt > 0 && now - dataUpdatedAt > STALE_THRESHOLD_MS;

  return (
    <ThemedView style={monitoringStyles.container}>
      <SafeAreaView style={monitoringStyles.safeArea} edges={['top']}>

        <ScreenHeader
          title="MONITORING"
          rightSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              onPress={() => logout()}
              style={({ pressed }) => [
                monitoringStyles.logoutBtn,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.6 : 1 },
              ]}>
              <Ionicons name="log-out-outline" size={20} color={theme.textSecondary} />
            </Pressable>
          }
        />

        {isDataStale ? (
          <ThemedView type="backgroundSelected" style={monitoringStyles.staleBanner}>
            <ThemedText type="small">
              Datos de hace {Math.round((now - dataUpdatedAt) / 1000)}s — conexión interrumpida.
            </ThemedText>
          </ThemedView>
        ) : null}

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.centerMessage}>
            Cargando auditorías…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={monitoringStyles.centerMessage}>
            No se pudieron cargar las auditorías.
          </ThemedText>
        ) : audits && audits.length > 0 ? (
          <FlatList
            data={audits}
            keyExtractor={(audit) => audit.id}
            renderItem={({ item }) => <AuditRow audit={item} />}
            contentContainerStyle={monitoringStyles.listContent}
          />
        ) : (
          <View style={monitoringStyles.emptyContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.centerMessage}>
              No hay auditorías activas.
            </ThemedText>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
