import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeverityBadge, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useAudits, useFindings, type Finding } from '@/services/api';
import { auditFindingsStyles } from '@/styles';

function FindingRow({ finding }: { finding: Finding }) {
  const router = useRouter();
  const isPreliminary = finding.confirmationState === 'preliminary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hallazgo: ${finding.summary}`}
      onPress={() =>
        router.push({ pathname: '/(tabs)/findings/[findingId]', params: { findingId: finding.id } })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={auditFindingsStyles.findingCard}>
        <View style={auditFindingsStyles.findingHeaderRow}>
          <SeverityBadge label={finding.severity} />
          <ThemedText
            type="smallBold"
            themeColor={isPreliminary ? 'textSecondary' : 'success'}>
            {finding.confirmationState.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {finding.type.toUpperCase()}
        </ThemedText>
        <ThemedText type="default">{finding.summary}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function AuditFindingsScreen() {
  const { auditId } = useLocalSearchParams<{ auditId: string }>();
  const resolvedAuditId = auditId ?? '';
  const router = useRouter();
  const { data: findings, isLoading, isError } = useFindings(resolvedAuditId);
  const { data: audits } = useAudits();
  const auditName = audits?.find((audit) => audit.id === resolvedAuditId)?.name ?? resolvedAuditId;

  const theme = useTheme();

  return (
    <ThemedView style={auditFindingsStyles.container}>
      <SafeAreaView style={auditFindingsStyles.safeArea} edges={['top']}>
        <ThemedView style={auditFindingsStyles.header}>
          <View style={auditFindingsStyles.headerTopRow}>
            <View style={auditFindingsStyles.headerTitles}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver a Monitoreo"
                onPress={() => router.back()}
                style={({ pressed }) => [auditFindingsStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
                <ThemedText type="smallBold" themeColor="tint">
                  Volver a Monitoreo
                </ThemedText>
              </Pressable>
              <ThemedText type="title" style={auditFindingsStyles.headerTitle} numberOfLines={1}>
                {auditName.toUpperCase()}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver Reporte IA"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: resolvedAuditId } })
              }
              style={({ pressed }) => [
                auditFindingsStyles.reportHeaderBtn,
                { backgroundColor: theme.tint, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                Reporte IA
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={auditFindingsStyles.centerMessage}>
            Loading findings...
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={auditFindingsStyles.centerMessage}>
            No se pudieron cargar los hallazgos. Desliza para actualizar cuando se restablezca la conexion.
          </ThemedText>
        ) : findings && findings.length > 0 ? (
          <FlatList
            data={findings}
            keyExtractor={(finding) => finding.id}
            renderItem={({ item }) => <FindingRow finding={item} />}
            contentContainerStyle={auditFindingsStyles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={auditFindingsStyles.centerMessage}>
            No hay hallazgos registrados para esta auditoria.
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
