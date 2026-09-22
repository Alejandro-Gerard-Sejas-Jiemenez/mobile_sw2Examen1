import { useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSavedReports } from '@/hooks/use-saved-reports';
import type { SavedReport } from '@/services/reports/report-synthesizer';
import type { ThemeColor } from '@/constants/theme';
import { reportHistoryStyles } from '@/styles';

function colorTokenForRiskLevel(level: SavedReport['riskLevel']): ThemeColor {
  switch (level) {
    case 'CRÍTICO':
      return 'severityCritical';
    case 'ALTO':
      return 'severityHigh';
    case 'MEDIO':
      return 'severityMedium';
    case 'BAJO':
      return 'severityLow';
    default:
      return 'success';
  }
}

function ReportRow({ report }: { report: SavedReport }) {
  const theme = useTheme();
  const router = useRouter();
  const color = theme[colorTokenForRiskLevel(report.riskLevel)];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reporte de ${report.auditName}`}
      onPress={() => router.push({ pathname: '/(tabs)/report-history/[reportId]', params: { reportId: report.id } })}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={reportHistoryStyles.reportCard}>
        <View style={reportHistoryStyles.reportHeaderRow}>
          <ThemedText type="smallBold" style={reportHistoryStyles.reportAuditName} numberOfLines={1}>
            {report.auditName.toUpperCase()}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color }}>
            {report.riskLevel} · {report.riskScore.toFixed(1)}
          </ThemedText>
        </View>
        <View style={reportHistoryStyles.reportMetaRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {report.tone.toUpperCase()} · {report.findingsCount} hallazgos
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {new Date(report.generatedAt).toLocaleString()}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

export default function ReportHistoryScreen() {
  const { data: reports, isLoading, isError } = useSavedReports();

  return (
    <ThemedView style={reportHistoryStyles.container}>
      <SafeAreaView style={reportHistoryStyles.safeArea} edges={['top']}>
        <ScreenHeader title="HISTORIAL DE REPORTES" />

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={reportHistoryStyles.centerMessage}>
            Cargando reportes guardados...
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={reportHistoryStyles.centerMessage}>
            No se pudo acceder a la base de datos local de reportes.
          </ThemedText>
        ) : reports && reports.length > 0 ? (
          <FlatList
            data={reports}
            keyExtractor={(report) => report.id}
            renderItem={({ item }) => <ReportRow report={item} />}
            contentContainerStyle={reportHistoryStyles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={reportHistoryStyles.centerMessage}>
            Todavía no guardaste ningún reporte. Generá o exportá un reporte desde una auditoría para
            que aparezca acá.
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
