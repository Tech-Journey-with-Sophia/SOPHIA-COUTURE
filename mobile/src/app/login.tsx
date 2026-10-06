import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { LOGIN_IMAGE_URL } from '@/lib/imageUrl';
import { colors, fonts, tracking } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const {
    user,
    initializing,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // This will AUTOMATICALLY redirect you the exact millisecond the login is successful!
  useEffect(() => {
    if (!initializing && user) {
      router.replace('/');
    }
  }, [initializing, user, router]);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Account', 'Enter your email and password to continue.');
      return;
    }

    setFormLoading(true);
    try {
      if (mode === 'signup') {
        const confirmationRequired = await signUpWithEmail(email.trim(), password);
        if (confirmationRequired) {
          Alert.alert(
            'Confirm your email',
            'Check your inbox for a confirmation link. Open it on this device to finish signing up.'
          );
          return;
        }
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // REMOVED router.replace('/') here! Let the useEffect handle it.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      Alert.alert(mode === 'signup' ? 'Sign Up' : 'Sign In', message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // REMOVED router.replace('/') here! Let the useEffect handle it.
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (!message.includes('cancelled')) {
        Alert.alert('Sign In', message || 'Could not sign in with Google.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleFill = colors.black; 

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.imageWrap}>
            {LOGIN_IMAGE_URL && (
              <Image
                source={{ uri: LOGIN_IMAGE_URL }}
                alt="Sophia Couture lifestyle"
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
            )}
          </View>

          <View style={styles.form}>
            <Pressable onPress={() => router.replace('/')} hitSlop={6}>
              <Text style={styles.wordmark}>SOPHIA COUTURE</Text>
            </Pressable>

            <Text style={styles.heading}>
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Text>
            <View style={styles.subRow}>
              <Text style={styles.subText}>
                {mode === 'signup' ? 'Already have an account? ' : "Don't have an account yet? "}
              </Text>
              <Pressable
                onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                hitSlop={6}
              >
                <Text style={styles.subLink}>
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="ENTER YOUR EMAIL"
                placeholderTextColor="rgba(0,0,0,0.3)"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.underlineInput, emailFocused && styles.underlineFocused]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="ENTER YOUR PASSWORD"
                placeholderTextColor="rgba(0,0,0,0.3)"
                secureTextEntry
                style={[
                  styles.underlineInput,
                  passwordFocused && styles.underlineFocused,
                ]}
              />
            </View>

            <View style={styles.rememberRow}>
              <Pressable
                style={styles.checkboxRow}
                onPress={() => setRememberMe((v) => !v)}
                hitSlop={6}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                  {rememberMe && <Check size={12} strokeWidth={3} color={colors.white} />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Password reset', 'Contact customer support for help resetting your password.')}
                hitSlop={6}
              >
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            </View>

            <PrimaryButton
              label={formLoading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              onPress={handleEmailAuth}
              loading={formLoading}
              disabled={formLoading}
              style={styles.signIn}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[styles.googleButton, googleLoading && { opacity: 0.6 }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  fill={googleFill}
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <Path
                  fill={googleFill}
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <Path
                  fill={googleFill}
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <Path
                  fill={googleFill}
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </Svg>
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingBottom: 48,
  },
  imageWrap: {
    width: '100%',
    height: 280,
    backgroundColor: colors.fog,
    overflow: 'hidden',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
    color: colors.black,
    marginBottom: 8,
  },
  heading: {
    fontFamily: fonts.regular,
    fontSize: 28,
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
    color: colors.black,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: -12,
  },
  subText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.charcoal,
  },
  subLink: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    textDecorationLine: 'underline',
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
    color: colors.black,
  },
  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.black,
    paddingVertical: 10,
    letterSpacing: tracking.base,
  },
  underlineFocused: {
    borderBottomColor: colors.black,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.black,
  },
  rememberText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  forgot: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.charcoal,
    textDecorationLine: 'underline',
  },
  signIn: {
    width: '100%',
    minHeight: 56,
    marginTop: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.charcoal,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: 4,
    height: 56,
    backgroundColor: 'transparent',
  },
  googleText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
});