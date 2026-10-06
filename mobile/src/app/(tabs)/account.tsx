import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footer } from '@/components/Footer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, tracking } from '@/theme';

/**
 * Account — mirrors the website's signed-in navbar state (Orders + Logout)
 * plus a sign-in prompt when signed out. The website has no separate profile
 * page, so this screen intentionally stays within the same scope.
 */
export default function AccountScreen() {
  const router = useRouter();
  const { user, initializing, signOut } = useAuth();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Account</Text>

        {initializing ? null : !user ? (
          <View style={styles.signedOut}>
            <Text style={styles.signedOutText}>
              Sign in to view your orders and manage your account.
            </Text>
            <PrimaryButton
              label="Sign In"
              onPress={() => router.push('/login')}
              style={{ paddingHorizontal: 48 }}
            />
            <PrimaryButton
              label="Contact Us"
              variant="ghost"
              onPress={() => router.push('/contact')}
              style={{ paddingHorizontal: 48 }}
            />
          </View>
        ) : (
          <View style={styles.panel}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{user.email}</Text>
            </View>

            <PrimaryButton
              label="Order History"
              onPress={() => router.push('/orders')}
            />
            <PrimaryButton
              label="Contact Us"
              variant="ghost"
              onPress={() => router.push('/contact')}
            />
            <PrimaryButton label="Log Out" variant="ghost" onPress={signOut} />

            <View style={styles.logoutRow}>
              <LogOut size={14} strokeWidth={1.5} color={colors.charcoal} />
              <Text style={styles.logoutHint}>
                Signed in with Google — the same account works on the website.
              </Text>
            </View>
          </View>
        )}

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 0,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 28,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 24,
    marginBottom: 32,
  },
  signedOut: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  signedOutText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.black,
    padding: 24,
    gap: 14,
    marginBottom: 40,
  },
  field: {
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  fieldValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  logoutHint: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.charcoal,
    lineHeight: 15,
  },
});
