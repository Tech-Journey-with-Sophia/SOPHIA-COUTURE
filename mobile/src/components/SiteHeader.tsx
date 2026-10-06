import { useRouter } from 'expo-router';
import { LogOut, Search, ShoppingBag, User as UserIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, tracking } from '@/theme';
import { useCartCount } from '@/store/cartStore';
import { AnnouncementBar } from './AnnouncementBar';

/**
 * Mobile adaptation of the website Navbar (src/components/Navbar.tsx):
 * announcement bar + Shop/Contact links + SOPHIA COUTURE wordmark +
 * account/cart icons. The web search icon navigates to the Shop tab where
 * the fully functional search lives.
 */
export function SiteHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const cartCount = useCartCount();

  return (
    <View style={styles.header}>
      <AnnouncementBar />
      <View style={styles.nav}>
        <View style={styles.side}>
          <Pressable onPress={() => router.push('/shop')} hitSlop={6}>
            <Text style={styles.link}>Shop</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/contact')} hitSlop={6}>
            <Text style={styles.link}>Contact</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/')} hitSlop={6}>
          <Text style={styles.wordmark} numberOfLines={1}>
            SOPHIA COUTURE
          </Text>
        </Pressable>

        <View style={[styles.side, styles.sideRight]}>
          <Pressable onPress={() => router.push('/shop')} hitSlop={6} accessibilityLabel="Search">
            <Search size={16} strokeWidth={1.5} color={colors.black} />
          </Pressable>
          {user ? (
            <>
              <Pressable onPress={() => router.push('/orders')} hitSlop={6}>
                <Text style={styles.link}>Orders</Text>
              </Pressable>
              <Pressable onPress={signOut} hitSlop={6} accessibilityLabel="Log out">
                <LogOut size={15} strokeWidth={1.5} color={colors.black} />
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => router.push('/login')} hitSlop={6} accessibilityLabel="Sign in">
              <UserIcon size={16} strokeWidth={1.5} color={colors.black} />
            </Pressable>
          )}
          <Pressable onPress={() => router.push('/cart')} hitSlop={6} accessibilityLabel="Cart">
            <View>
              <ShoppingBag size={16} strokeWidth={1.5} color={colors.black} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    width: '100%',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sideRight: {
    justifyContent: 'flex-end',
    gap: 10,
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    color: colors.black,
    letterSpacing: tracking.base,
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 15,
    textTransform: 'uppercase',
    color: colors.black,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -8,
    backgroundColor: colors.black,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 14,
  },
});
