import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, fonts, tracking } from '@/theme';

/**
 * Contact — port of src/app/contact/page.tsx. Like the website, submission
 * is a client-side mock that shows the "Message Sent" confirmation (the
 * website has no contact backend endpoint).
 */
export default function ContactScreen() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !comment.trim()) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader showCart={false} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Contact Us</Text>

          {submitted ? (
            <View style={styles.sentPanel}>
              <Text style={styles.sentTitle}>Message Sent</Text>
              <Text style={styles.sentBody}>
                Thank you for reaching out to us. Our client services team will
                get back to you shortly.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <InputField
                label="Full Name"
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />
              <InputField
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <View style={styles.field}>
                <Text style={styles.label}>Comment</Text>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={styles.textarea}
                />
              </View>

              <View style={styles.submitWrap}>
                <PrimaryButton label="Send Message" onPress={handleSubmit} style={styles.submit} />
              </View>
            </View>
          )}
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
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wider,
    color: colors.black,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: 4,
    minHeight: 140,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.black,
    letterSpacing: tracking.base,
  },
  submitWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.black,
    paddingTop: 24,
    marginTop: 16,
  },
  submit: {
    width: '100%',
    minHeight: 56,
  },
  sentPanel: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.fog,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  sentTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  sentBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.charcoal,
    textAlign: 'center',
  },
});
