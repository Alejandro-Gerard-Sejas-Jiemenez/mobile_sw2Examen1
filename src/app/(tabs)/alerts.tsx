import { useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, SeverityBadge, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useAlerts, type Alert } from '@/services/api';
import { alertsStyles } from '@/styles';

function AlertRow({ alert }: { alert: Alert }) {
  const theme = useTheme();
  const router = useRouter();
  const isUnread = alert.readState === 'unread';
  const isPhaseAlert = alert.kind === 'phase';
  const isReportAlert = alert.kind === 'report';

  const handlePress = () => {
    if (isReportAlert && alert.auditId) {
      router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: alert.auditId } });
    } else if (isPhaseAlert && alert.auditId) {
      router.push({ pathname: '/(tabs)/audits/[auditId]/findings', params: { auditId: alert.auditId } });
    } else {
      router.push({ pathname: '/(tabs)/findings/[findingId]', params: { findingId: alert.findingId } });
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={alert.message || `Alerta de ${alert.severityLabel} para el hallazgo ${alert.findingId}`}
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={alertsStyles.alertCard}>
        {isUnread ? <View style={[alertsStyles.unreadDot, { backgroundColor: theme.tint }]} /> : null}
        <View style={alertsStyles.alertContent}>
          <View style={alertsStyles.alertHeaderRow}>
            <SeverityBadge label={alert.severityLabel} />
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(alert.deliveredAt).toLocaleString()}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {alert.message || `Finding ${alert.findingId}`}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const { data: alerts, isLoading, isError } = useAlerts();

  return (
    <ThemedView style={alertsStyles.container}>
      <SafeAreaView style={alertsStyles.safeArea} edges={['top']}>
        <ScreenHeader title="ALERTAS" />

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={alertsStyles.centerMessage}>
            Loading alerts…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={alertsStyles.centerMessage}>
            Couldn't load alerts. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : alerts && alerts.length > 0 ? (
          <FlatList
            data={alerts}
            keyExtractor={(alert) => alert.id}
            renderItem={({ item }) => <AlertRow alert={item} />}
            contentContainerStyle={alertsStyles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={alertsStyles.centerMessage}>
            No alerts yet.
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
