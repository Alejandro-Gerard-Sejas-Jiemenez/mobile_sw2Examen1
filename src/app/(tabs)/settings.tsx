import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AiModelCard, ScreenHeader, ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useAiModelManager } from '@/hooks/use-ai-model-manager';
import { useWhisperModelManager } from '@/hooks/use-whisper-model-manager';
import { commonStyles, layoutStyles, settingsStyles } from '@/styles';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const llamaModel = useAiModelManager();
  const whisperModel = useWhisperModelManager();

  return (
    <ThemedView style={settingsStyles.container}>
      <SafeAreaView style={settingsStyles.safeArea} edges={['top']}>
        <ScreenHeader title="AJUSTES" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={settingsStyles.scrollContent}>
          <ThemedText type="small" themeColor="textSecondary" style={settingsStyles.sectionLabel}>
            MODELO IA LOCAL
          </ThemedText>
          <AiModelCard
            {...llamaModel}
            title="MODELO IA LOCAL DE REPORTES"
            readyDescription="Disponible para generación de reportes offline"
          />

          <ThemedText type="small" themeColor="textSecondary" style={settingsStyles.sectionLabel}>
            MODELO DE VOZ
          </ThemedText>
          <AiModelCard
            {...whisperModel}
            title="MODELO DE VOZ LOCAL (DICTADO)"
            readyDescription="Disponible para transcribir directivas por voz offline"
          />

          <ThemedText type="small" themeColor="textSecondary" style={settingsStyles.sectionLabel}>
            REPORTES
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Historial de Reportes"
            onPress={() => router.push('/(tabs)/report-history')}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <ThemedView type="backgroundElement" style={commonStyles.card}>
              <View style={layoutStyles.rowBetween}>
                <ThemedText type="smallBold">Historial de Reportes</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Reportes generados guardados localmente en el dispositivo.
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

