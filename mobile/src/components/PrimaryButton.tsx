import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, tracking } from '@/theme';

type Variant = 'primary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Port of the website .btn-primary / .btn-ghost classes
 * (src/app/globals.css): black pill-less rectangle, 12px medium uppercase,
 * wide tracking, radius 4.
 */
export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !disabled && { opacity: 0.9 },
        disabled && (isPrimary ? styles.primaryDisabled : styles.ghostDisabled),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.black} />
      ) : (
        <Text style={[styles.label, { color: isPrimary ? colors.white : colors.black }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.black,
  },
  primaryDisabled: {
    backgroundColor: colors.charcoal,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.stone,
  },
  ghostDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
});
