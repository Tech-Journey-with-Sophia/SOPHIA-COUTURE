import { CheckCircle2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';

/**
 * Confirmation — port of src/app/confirmation/page.tsx (same copy, same
 * order-number card, same link to order history).
 */
export default function ConfirmationScreen() {
  const router = useRouter();
  const { order } = useLocalSearchParams<{ order?: string }>();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <CheckCircle2 size={64} strokeWidth={1.5} color="#22c55e" style={styles.icon} />
          <Text style={styles.heading}>Order Confirmed!</Text>
          <Text style={styles.body}>
            Thank you for your purchase. Your order has been placed successfully
            and a confirmation email has been sent.
          </Text>

          {order ? (
            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>Order Number</Text>
              <Text style={styles.orderNumber}>{order}</Text>
            </View>
          ) : null}

          <Pressable
            style={styles.button}
            onPress={() => router.replace('/orders')}
          >
            <Text style={styles.buttonText}>View Order History</Text>
          </Pressable>
        </View>
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
    padding: 16,
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginBottom: 24,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: '#111827',
    marginBottom: 16,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 32,
  },
  orderLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderNumber: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#111827',
  },
  button: {
    backgroundColor: colors.black,
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
