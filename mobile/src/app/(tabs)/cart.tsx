import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QtyStepper } from '@/components/QtyStepper';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/cartStore';
import { colors, fonts, tracking } from '@/theme';

/**
 * Cart — port of the website cart page (src/app/cart/page.tsx): line items
 * with size/qty/remove, order summary, and a Checkout button that respects
 * the website's auth gate (unauthenticated users are sent to /login, exactly
 * like the middleware redirect).
 */
export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, isLoading } = useCartStore();
  const { user, initializing } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>YOUR CART</Text>

        {isLoading ? null : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your cart is currently empty.</Text>
            <PrimaryButton
              label="Continue Shopping"
              onPress={() => router.push('/shop')}
              style={{ paddingHorizontal: 48 }}
            />
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.lines}>
              {items.map((item) => {
                const uri = resolveImageUrl(item.image_url);
                return (
                  <View key={item.id} style={styles.line}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/product/[slug]',
                          params: { slug: item.slug },
                        })
                      }
                      style={styles.lineImage}
                    >
                      {uri ? (
                        <Image
                          source={{ uri }}
                          style={styles.image}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={styles.noImage}>NO IMAGE</Text>
                      )}
                    </Pressable>

                    <View style={styles.lineDetails}>
                      <View style={styles.lineTop}>
                        <Text style={styles.lineName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.lineTotal}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.lineEach}>
                        ${item.price.toFixed(2)} each
                      </Text>
                      {item.size && (
                        <Text style={styles.lineSize}>Size: {item.size}</Text>
                      )}
                      {item.color && (
                        <Text style={styles.lineSize}>Color: {item.color}</Text>
                      )}

                      <View style={styles.lineActions}>
                        <QtyStepper
                          quantity={item.quantity}
                          max={item.stock_quantity}
                          onChange={(q) => updateQuantity(item.id, q)}
                        />
                        <Pressable onPress={() => removeItem(item.id)} hitSlop={6}>
                          <Text style={styles.remove}>Remove</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>



                );
              })}
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${getTotal().toFixed(2)}</Text>
              </View>
              <Text style={styles.summaryNote}>
                Shipping and taxes calculated at checkout.
              </Text>
              <PrimaryButton
                label="Checkout"
                onPress={handleCheckout}
                disabled={initializing}
                style={styles.checkoutButton}
              />
            </View>
          </View>
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
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 32,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  body: {
    gap: 32,
  },
  lines: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.black,
  },
  line: {
    flexDirection: 'row',
    paddingVertical: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  lineImage: {
    width: 96,
    height: 128,
    backgroundColor: colors.fog,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.black,
    textTransform: 'uppercase',
  },
  lineDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  lineName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
    color: colors.black,
  },
  lineTotal: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.black,
  },
  lineEach: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.charcoal,
    marginTop: 4,
  },
  lineSize: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    color: colors.black,
    marginTop: 4,
  },
  lineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  remove: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    textDecorationLine: 'underline',
  },
  summary: {
    borderWidth: 1,
    borderColor: colors.black,
    padding: 24,
    gap: 16,
  },
  summaryTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textTransform: 'uppercase',
    color: colors.black,
  },
  summaryValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  summaryNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.charcoal,
    lineHeight: 16,
  },
  checkoutButton: {
    width: '100%',
    minHeight: 56,
    marginTop: 8,
  },
});
