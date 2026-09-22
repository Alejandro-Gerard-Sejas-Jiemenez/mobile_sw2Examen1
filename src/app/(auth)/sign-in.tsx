import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useLogin } from '@/services/auth';
import { signInStyles } from '@/styles';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isSubmitting, error } = useLogin();
  const theme = useTheme();
  const router = useRouter();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    login(email.trim(), password).catch(() => {
      // Error state is surfaced via the `error` state from useLogin.
    });
  };

  return (
    <ThemedView style={signInStyles.container}>
      <SafeAreaView style={signInStyles.safeArea}>
        <ThemedText type="title" style={signInStyles.title}>
          Auditor Console
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={signInStyles.subtitle}>
          Sign in with your platform credentials
        </ThemedText>

        <ThemedView type="backgroundElement" style={signInStyles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[signInStyles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoComplete="password"
            style={[signInStyles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          {error ? (
            <ThemedText type="small" themeColor="danger" style={signInStyles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={({ pressed }) => [
              signInStyles.submitButton,
              { backgroundColor: theme.tint, opacity: canSubmit && !pressed ? 1 : 0.6 },
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.onTint} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                Sign in
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Ver Términos y Condiciones"
          onPress={() => router.push('/(auth)/terms')}
          style={({ pressed }) => [signInStyles.termsLink, { opacity: pressed ? 0.6 : 1 }]}>
          <ThemedText type="small" themeColor="tint">
            Términos y Condiciones
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
