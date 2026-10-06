import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fonts, tracking } from '@/theme';

interface Props extends TextInputProps {
  label: string;
}

/**
 * Port of the website .input-field + label pattern: 12px bold uppercase
 * label over a bordered radius-4 input (see src/app/globals.css and the
 * checkout/contact forms).
 */
export function InputField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.stone}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: colors.black,
    fontFamily: fonts.regular,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 10,
    letterSpacing: tracking.base,
  },
});
