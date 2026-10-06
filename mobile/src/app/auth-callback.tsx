import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { completeAuthCallback } from '@/lib/authCallback';
import { getAuthRedirectUri } from '@/lib/authRedirect';
import { colors, fonts } from '@/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useLinkingURL();
  const params = useLocalSearchParams<{
    code?: string;
    access_token?: string;
    refresh_token?: string;
    token_hash?: string;
    type?: string;
    error?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState('');
  const handledUrl = useRef('');

  useEffect(() => {
    const hasAuthParams = Object.values(params).some(Boolean);
    if (!hasAuthParams && !linkingUrl) return;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') query.set(key, value);
    }
    const routeUrl = query.size > 0 ? `${getAuthRedirectUri()}?${query}` : '';
    const callbackUrl = routeUrl || linkingUrl || '';
    if (!callbackUrl || handledUrl.current === callbackUrl) return;
    handledUrl.current = callbackUrl;

    let active = true;
    completeAuthCallback(callbackUrl)
      .then(() => {
        if (active) router.replace('/');
      })
      .catch((callbackError) => {
        if (active) {
          setError(callbackError instanceof Error ? callbackError.message : 'Could not complete authentication.');
        }
      });

    return () => {
      active = false;
    };
  }, [linkingUrl, params, router]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {error ? (
          <>
            <Text style={styles.message}>{error}</Text>
            <PrimaryButton label="Return to Sign In" onPress={() => router.replace('/login')} />
          </>
        ) : (
          <ActivityIndicator color={colors.black} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    textAlign: 'center',
  },
});