import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckoutError,
  placeOrder,
  type CheckoutPayload,
} from '@/api/orders';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/cartStore';
import { colors, fonts, tracking } from '@/theme';

/**
 * Checkout — port of src/app/checkout/page.tsx. Same form fields and
 * requirements as the website's zod schema, same order summary. Placing an
 * order posts to the existing /api/orders backend so validation, trusted
 * prices and the Mailgun confirmation email behave identically.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { items, clearCart, getTotal } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Same rule as the website middleware: checkout requires sign-in.
  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/login');
    }
  }, [initializing, user, router]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  if (initializing) return null;

  if (items.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <ScreenHeader showCart={false} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <PrimaryButton
            label="Return to shop"
            onPress={() => router.replace('/shop')}
            style={{ paddingHorizontal: 48 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setError('');
    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
    };
    if (
      !trimmed.name ||
      !trimmed.email ||
      !trimmed.phone ||
      !trimmed.address ||
      !trimmed.city ||
      !trimmed.state ||
      !trimmed.country
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      setError('Invalid email');
      return;
    }

    const payload: CheckoutPayload = {
      ...trimmed,
      postal_code: postalCode.trim() || undefined,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    };

    setLoading(true);
    try {
      const result = await placeOrder(payload);
      clearCart();
      router.replace({
        pathname: '/confirmation',
        params: { order: result.order_number },
      });
    } catch (err) {
      const message =
        err instanceof CheckoutError ? err.message : 'Checkout failed';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader showCart={false} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Checkout</Text>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <InputField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={[styles.section, styles.sectionDivider]}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              autoComplete="street-address"
            />
            <InputField label="City" value={city} onChangeText={setCity} />
            <InputField
              label="State / Province"
              value={state}
              onChangeText={setState}
            />
            <InputField
              label="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <InputField
              label="Country"
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <View style={[styles.section, styles.sectionDivider]}>
            <PrimaryButton
              label={loading ? 'Processing...' : 'Place Order'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.placeOrder}
            />
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>In Your Cart</Text>
            {items.map((item) => {
              const uri = resolveImageUrl(item.image_url);
              return (
                <View key={item.id} style={styles.summaryLine}>
                  <View style={styles.summaryLineLeft}>
                    <View style={styles.summaryThumb}>
                      {uri ? (
                        <Image
                          source={{ uri }}
                          style={styles.summaryImage}
                          contentFit="cover"
                        />
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryName}>{item.name}</Text>
                      <Text style={styles.summaryMeta}>Qty: {item.quantity}</Text>
                      {item.size && (
                        <Text style={styles.summaryMeta}>Size: {item.size}</Text>
                      )}
                      {item.color && (
                        <Text style={styles.summaryMeta}>Color: {item.color}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.summaryLineTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                ${getTotal().toFixed(2)}
              </Text>
            </View>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 32,
    paddingVertical: 80,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: colors.black,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
  },
  section: {
    gap: 20,
    marginBottom: 32,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.black,
    paddingTop: 32,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  placeOrder: {
    width: '100%',
    minHeight: 56,
  },
  summary: {
    borderWidth: 1,
    borderColor: colors.black,
    padding: 24,
    marginTop: 8,
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
    marginBottom: 8,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  summaryLineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  summaryThumb: {
    width: 44,
    height: 58,
    backgroundColor: colors.fog,
    overflow: 'hidden',
    flexShrink: 0,
  },
  summaryImage: {
    width: '100%',
    height: '100%',
  },
  summaryName: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    color: colors.black,
  },
  summaryMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.charcoal,
    marginTop: 2,
  },
  summaryLineTotal: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.black,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.black,
    paddingTop: 16,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    color: colors.black,
  },
  summaryTotalValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
  },
});

