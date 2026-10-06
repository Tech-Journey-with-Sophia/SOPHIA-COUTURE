import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, tracking, type as fontSize } from '@/theme';

/** Black announcement strip shown above the navbar on the website. */
export function AnnouncementBar() {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>
        Free 24hr delivery in Lagos | 7-day returns
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.black,
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
