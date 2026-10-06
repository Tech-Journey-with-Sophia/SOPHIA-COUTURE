import { X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, tracking } from '@/theme';

const SIZE_ROWS = [
  { size: 'S', chest: '34 - 36', waist: '28 - 30' },
  { size: 'M', chest: '38 - 40', waist: '32 - 34' },
  { size: 'L', chest: '42 - 44', waist: '36 - 38' },
  { size: 'XL', chest: '46 - 48', waist: '40 - 42' },
  { size: 'XXL', chest: '50 - 52', waist: '44 - 46' },
];

/** Port of the website's minimalist size-guide modal. */
export function SizeGuideModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
            <X size={20} strokeWidth={1.5} color={colors.black} />
          </Pressable>

          <Text style={styles.title}>SIZE GUIDE</Text>

          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, styles.sizeCol]}>Size</Text>
              <Text style={[styles.cell, styles.headerCell]}>Chest (in)</Text>
              <Text style={[styles.cell, styles.headerCell]}>Waist (in)</Text>
            </View>
            {SIZE_ROWS.map((r) => (
              <View key={r.size} style={styles.row}>
                <Text style={[styles.cell, styles.sizeCol]}>{r.size}</Text>
                <Text style={styles.cell}>{r.chest}</Text>
                <Text style={styles.cell}>{r.waist}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  box: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
    marginBottom: 8,
  },
  table: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.stone,
    paddingVertical: 10,
  },
  headerRow: {
    borderBottomColor: colors.stone,
  },
  cell: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.black,
    letterSpacing: tracking.base,
  },
  headerCell: {
    fontFamily: fonts.medium,
  },
  sizeCol: {
    flex: 0.7,
  },
});
