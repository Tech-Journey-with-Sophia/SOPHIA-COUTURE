import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, tracking } from '@/theme';

/**
 * Port of the website Footer (src/components/Footer.tsx) — brand, copyright
 * and the newsletter waitlist field (decorative, exactly as on the website).
 */
export function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.row}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>SOPHIA COUTURE</Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Sophia Couture MVP. All rights reserved.
          </Text>
        </View>

        <View style={styles.newsletter}>
          <Text style={styles.newsletterLabel}>
            Join the list for early drops. Get 10% off your first order.
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.placeholder}>ENTER YOUR EMAIL</Text>
            <Pressable
              accessibilityLabel="Subscribe"
              style={styles.submit}
              onPress={() => {}}
            >
              <ArrowRight size={16} strokeWidth={1.5} color={colors.black} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.black,
    backgroundColor: colors.white,
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  row: {
    gap: 32,
  },
  brandBlock: {
    gap: 12,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
    color: colors.black,
  },
  copyright: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.charcoal,
  },
  newsletter: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  newsletterLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: tracking.wide,
    color: 'rgba(0,0,0,0.3)',
  },
  submit: {
    padding: 4,
  },
});
