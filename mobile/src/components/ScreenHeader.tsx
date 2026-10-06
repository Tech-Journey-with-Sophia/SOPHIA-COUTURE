import { useRouter } from 'expo-router';
import { ChevronLeft, ShoppingBag } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCartCount } from '@/store/cartStore';
import { colors, fonts } from '@/theme';
import { AnnouncementBar } from './AnnouncementBar';

/**
 * Header for stack screens (product, checkout, orders, ...) — adapts the
 * website navbar with a back affordance while keeping the wordmark.
 */
export function ScreenHeader({
  showCart = true,
}: {
  showCart?: boolean;
}) {
  const router = useRouter();
  const cartCount = useCartCount();

  return (
    <View style={styles.header}>
      <AnnouncementBar />
      <View style={styles.nav}>
        <View style={styles.side}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
            hitSlop={8}
            accessibility-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={1.5} color={colors.black} />
          </Pressable>
        </View>

        <Text style={styles.wordmark} numberOfLines={1}>
          SOPHIA COUTURE
        </Text>

        <View style={[styles.side, styles.sideRight]}>
          {showCart && (
            <Pressable onPress={() => router.push('/cart')} hitSlop={8} accessibility-label="Cart">
              <View>
                <ShoppingBag size={16} strokeWidth={1.5} color={colors.black} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
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
  },
  sideRight: {
    justifyContent: 'flex-end',
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
