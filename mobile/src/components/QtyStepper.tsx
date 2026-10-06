import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, tracking } from '@/theme';

/**
 * Native replacement for the website's quantity <select>: keeps the same
 * semantics (1 .. min(10, stock_quantity)) with tap targets suited to touch.
 */
export function QtyStepper({
  quantity,
  onChange,
  max,
}: {
  quantity: number;
  onChange: (next: number) => void;
  max: number;
}) {
  const upper = Math.max(1, Math.min(10, max));
  return (
    <View style={styles.stepper}>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        accessibility-label="Decrease quantity"
      >
        <Minus size={14} strokeWidth={1.5} color={quantity <= 1 ? colors.stone : colors.black} />
      </Pressable>
      <Text style={styles.value}>{quantity}</Text>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.min(upper, quantity + 1))}
        disabled={quantity >= upper}
        accessibility-label="Increase quantity"
      >
        <Plus
          size={14}
          strokeWidth={1.5}
          color={quantity >= upper ? colors.stone : colors.black}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: 4,
    height: 40,
    alignSelf: 'flex-start',
  },
  button: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.black,
    letterSpacing: tracking.base,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.charcoal,
    lineHeight: 38,
  },
});
