import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { FindingRow, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useAudits, useFindings } from '@/services/api';
import { auditFindingsStyles } from '@/styles';

export default function AuditFindingsScreen() {
  const { auditId } = useLocalSearchParams<{ auditId: string }>();
  const resolvedAuditId = auditId ?? '';
  const router = useRouter();
  const handleBack = useSafeBack('/(tabs)');
  const { data: findings, isLoading, isError } = useFindings(resolvedAuditId);
  const { data: audits } = useAudits();
  const audit = audits?.find((a) => a.id === resolvedAuditId);
  const auditName = audit?.name ?? resolvedAuditId;

  const theme = useTheme();

  return (
    <ThemedView style={auditFindingsStyles.container}>
      <SafeAreaView style={auditFindingsStyles.safeArea} edges={['top']}>
        <ThemedView style={auditFindingsStyles.header}>
          {/* Botón volver — solo ícono chevron */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a Monitoreo"
            onPress={handleBack}
            style={({ pressed }) => [auditFindingsStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="chevron-back" size={22} color={theme.tint} />
          </Pressable>
          <ThemedText type="title" style={auditFindingsStyles.headerTitle} numberOfLines={1}>
            {auditName.toUpperCase()}
          </ThemedText>

          {/* Reporte — ícono doc */}
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
            <Ionicons name="document-text" size={18} color={theme.onTint} />
          </Pressable>
        </ThemedView>

        {audit?.lastKnownAttackStatus ? (
          <ThemedText type="small" themeColor="textSecondary" style={auditFindingsStyles.launchNotice}>
            Fase actual: {audit.lastKnownAttackStatus} — seguimiento del ataque creado en la web.
          </ThemedText>
        ) : audit?.lastKnownScanStatus ? (
          <ThemedText type="small" themeColor="textSecondary" style={auditFindingsStyles.launchNotice}>
            Fase actual: {audit.lastKnownScanStatus} — esperando a que se lance el ataque desde la web.
          </ThemedText>
        ) : null}

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
