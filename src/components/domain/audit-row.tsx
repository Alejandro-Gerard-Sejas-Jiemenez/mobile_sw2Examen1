import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ProgressBar } from '../ui/progress-bar';
import { colorTokenFor, StatusBadge } from '../ui/status-badge';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { type Audit } from '@/services/api';
import { monitoringStyles } from '@/styles';

interface AuditRowProps {
  audit: Audit;
}

export function AuditRow({ audit }: AuditRowProps) {
  const theme = useTheme();
  const router = useRouter();
  const accentColor = theme[colorTokenFor(audit.status)];
  const isCompleted = audit.status === 'completed';

  return (
    <ThemedView type="backgroundElement" style={monitoringStyles.auditCard}>
      <View style={[monitoringStyles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={monitoringStyles.auditCardContent}>
        <View style={monitoringStyles.auditHeaderRow}>
          <ThemedText type="smallBold" style={monitoringStyles.auditName}>
            {audit.name.toUpperCase()}
          </ThemedText>
          <StatusBadge status={audit.status} />
        </View>

        <View style={monitoringStyles.batteryList}>
          {audit.testBatteries.map((battery) => (
            <View key={battery.id} style={monitoringStyles.batteryRow}>
              <View style={monitoringStyles.batteryHeaderRow}>
                <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.batteryName}>
                  {battery.name}
                </ThemedText>
                {/* Completed → solo punto de color, no texto repetido */}
                {battery.status !== 'completed' ? (
                  <StatusBadge status={battery.status} size="small" />
                ) : (
                  <View
                    style={[
                      monitoringStyles.batteryDot,
                      { backgroundColor: theme[colorTokenFor(battery.status)] },
                    ]}
                  />
                )}
              </View>
              <ProgressBar progress={battery.progressPercent} color={theme[colorTokenFor(battery.status)]} />
            </View>
          ))}
        </View>

        <View style={[monitoringStyles.auditFooterRow, { borderTopColor: theme.backgroundSelected }]}>
          <ThemedText type="code" themeColor="textSecondary" style={monitoringStyles.metricsLine}>
            {audit.metrics.requestsSent} req · {audit.metrics.pagesScanned} p.
          </ThemedText>

          <View style={monitoringStyles.cardActionsRow}>
            {/* Hallazgos — ícono lupa */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver Hallazgos"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/findings', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                monitoringStyles.cardActionBtn,
                { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="search" size={16} color={theme.text} />
            </Pressable>

            {/* Reporte — ícono doc */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver Reporte IA"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                monitoringStyles.cardActionBtn,
                {
                  backgroundColor: isCompleted ? theme.tint : theme.backgroundSelected,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Ionicons
                name="document-text"
                size={16}
                color={isCompleted ? theme.onTint : theme.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}
