import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { termsStyles } from '@/styles';

const TERMS_SECTIONS = [
  {
    title: '1. USO AUTORIZADO Y EVALUACIÓN OFENSIVA',
    body: 'La plataforma GenAI Security Lab está diseñada exclusivamente para la evaluación de seguridad ofensiva autorizada en chatbots, LLMs y sistemas RAG. El usuario se compromete a realizar pruebas únicamente en activos para los cuales cuente con autorización explícita y por escrito.',
  },
  {
    title: '2. RESPONSABILIDAD SOBRE PAYLOADS Y EVIDENCIAS',
    body: 'El usuario es plenamente responsable del uso de los comandos, pruebas de Prompt Injection, inyecciones de voz y explotación de herramientas. Toda evidencia generada cuenta con firmas hash SHA-256 e identificadores de auditoría.',
  },
  {
    title: '3. CONFIDENCIALIDAD Y MANEJO DE DATOS',
    body: 'Queda estrictamente prohibida la divulgación de credenciales, tokens JWT, prompts de sistema o datos sensibles extraídos durante los procesos de evaluación.',
  },
  {
    title: '4. ACTIVACIÓN POR EL ADMINISTRADOR DEL SISTEMA',
    body: 'Toda cuenta permanecerá en modo pendiente hasta ser revisada y activada por el Administrador del Sistema. Una vez activada, se enviará una copia completa de estos términos a su correo electrónico.',
  },
];

export default function TermsScreen() {
  const handleBack = useSafeBack('/(auth)/sign-in');
  const theme = useTheme();

  return (
    <ThemedView style={termsStyles.container}>
      <SafeAreaView style={termsStyles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={termsStyles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [termsStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="chevron-back" size={22} color={theme.tint} />
          </Pressable>
          <ThemedText type="subtitle" style={termsStyles.headerTitle} numberOfLines={1}>
            TÉRMINOS Y CONDICIONES
          </ThemedText>
        </ThemedView>

        <ScrollView contentContainerStyle={termsStyles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            Sistema GenAI Security Lab — Auditor Mobile Console
          </ThemedText>

          {TERMS_SECTIONS.map((section) => (
            <View key={section.title} style={termsStyles.section}>
              <ThemedText type="smallBold" style={termsStyles.sectionTitle}>
                {section.title}
              </ThemedText>
              <ThemedText type="default" style={termsStyles.sectionBody}>
                {section.body}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
