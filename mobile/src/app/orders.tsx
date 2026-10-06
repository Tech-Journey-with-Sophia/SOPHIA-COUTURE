import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMyOrders, type AccountOrder } from '@/api/orders';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/theme';

/**
 * Order history — port of src/app/orders/page.tsx (same query, same card
 * layout; RLS guarantees users only ever see their own orders, which also
 * means orders placed on the website appear here and vice versa).
 */
export default function OrdersScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data);
      setError('');
    } catch {
      setError('Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Same rule as the website: order history requires sign-in.
  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/login');
    }
  }, [initializing, user, router]);

  if (initializing) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader showCart={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Order History</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !orders || orders.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              You haven&apos;t placed any orders yet.
            </Text>
            <PrimaryButton
              label="Start Shopping"
              onPress={() => router.replace('/shop')}
              style={{ paddingHorizontal: 32 }}
            />
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.metaBlock}>
                  <Text style={styles.metaLabel}>Order Placed</Text>
                  <Text style={styles.metaValue}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metaBlock}>
                  <Text style={styles.metaLabel}>Total</Text>
                  <Text style={styles.metaValue}>
                    ${order.total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metaBlock}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={styles.metaValue}>{order.status}</Text>
                </View>
                <View style={[styles.metaBlock, styles.metaRight]}>
                  <Text style={styles.metaLabel}>Order #</Text>
                  <Text style={[styles.metaValue, styles.mono]}>
                    {order.order_number}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsWrap}>
                <Text style={styles.itemsTitle}>Items</Text>
                {order.order_items?.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemQty}>{item.quantity}x</Text>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                    </View>



                    <Text style={styles.itemSubtotal}>
                      ${item.subtotal.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
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
    paddingBottom: 48,
    gap: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderHeader: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaBlock: {
    minWidth: '40%',
    flex: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#6b7280',
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#111827',
  },
  mono: {
    fontFamily: fonts.regular,
  },
  itemsWrap: {
    padding: 16,
  },
  itemsTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemQty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#6b7280',
  },
  itemName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },
  itemSubtotal: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#111827',
  },
});
