import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLogin } from '@/services/auth/use-login';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isSubmitting, error } = useLogin();
  const theme = useTheme();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    login(email.trim(), password).catch(() => {
      // Error state is already surfaced via the `error` value from useLogin.
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Auditor Console
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Sign in with your platform credentials
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[styles.input, { color: theme.text }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoComplete="password"
            style={[styles.input, { color: theme.text }]}
          />

          {error ? (
            <ThemedText type="small" themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.tint, opacity: canSubmit && !pressed ? 1 : 0.6 },
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={styles.submitLabel}>
                Sign in
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  input: {
    // paddingVertical: Spacing.three (not .two) so the tappable field is at
    // least ~44pt tall (mobile-touch-ergonomics skill, rule 2) — .two left it
    // under the floor.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    color: '#fff',
  },
});
