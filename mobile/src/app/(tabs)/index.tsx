import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchActiveProducts, filterProducts, type Product } from '@/api/products';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { SiteHeader } from '@/components/SiteHeader';
import { BANNER_IMAGE_URL } from '@/lib/imageUrl';
import { colors, fonts, tracking } from '@/theme';

/**
 * Home — port of the website landing page (src/app/page.tsx): hero banner,
 * "New & Trending" section with category tabs and the product grid.
 * Category tabs are fully functional (filter against the shared database).
 */
export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  const load = useCallback(async () => {
    try {
      const data = await fetchActiveProducts();
      setProducts(data);
      setError('');
    } catch {
      setError('Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visible = useMemo(
    () => filterProducts(products, '', category),
    [products, category]
  );

  const { width } = Dimensions.get('window');
  const heroHeight = Math.round((width * 9) / 16);
  const gridItemWidth = Math.floor((width - 32 - 16) / 2);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SiteHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { height: heroHeight }]}>
          {BANNER_IMAGE_URL && (
            <Image
              source={{ uri: BANNER_IMAGE_URL }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          )}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>THE ULTIMATE OUTFITS</Text>
            <Pressable
              style={styles.heroButton}
              onPress={() => router.push('/shop')}
            >
              <Text style={styles.heroButtonText}>SHOP COLLECTION</Text>
            </Pressable>
          </View>
        </View>

        {/* Static pagination dashes (placeholder on the website too) */}
        <View style={styles.dashes}>
          <View style={styles.dashActive} />
          <View style={styles.dash} />
        </View>

        {/* New & Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New &amp; Trending</Text>
            <View style={styles.chips}>
              {categories.map((c) => {
                const active = c === category;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : visible.length === 0 ? (
            <Text style={styles.message}>No products available.</Text>



          ) : (
            <View style={styles.grid}>
              {visible.map((product) => (
                <View key={product.id} style={{ width: gridItemWidth }}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer />
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
    paddingBottom: 40,
  },
  hero: {
    width: '100%',
    backgroundColor: colors.mist,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
    zIndex: 10,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 28,
    letterSpacing: 0.75,
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  heroButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: tracking.wide,
  },
  dashes: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 56,
  },
  dashActive: {
    width: 32,
    height: 2,
    backgroundColor: colors.black,
  },
  dash: {
    width: 32,
    height: 2,
    backgroundColor: colors.stone,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 56,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.black,
    letterSpacing: tracking.base,
    flexShrink: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    maxWidth: '62%',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 4,
  },
  chipActive: {
    backgroundColor: colors.black,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  chipTextActive: {
    color: colors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 32,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    marginTop: 24,
  },
});
