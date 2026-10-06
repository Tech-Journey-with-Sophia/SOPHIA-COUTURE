import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchActiveProducts, filterProducts, type Product } from '@/api/products';
import { ProductCard } from '@/components/ProductCard';
import { SiteHeader } from '@/components/SiteHeader';
import { colors, fonts, tracking } from '@/theme';

/**
 * Shop — the full catalog with fully functional search (name + description)
 * and category filtering, both running against the shared Supabase product
 * data. Reachable from the navbar search icon or a category tap on Home.
 */
export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let mounted = true;
    fetchActiveProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data);
          setError('');
        }
      })
      .catch(() => {
        if (mounted) setError('Could not load products. Please try again.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof params.category === 'string' && params.category) {
      setCategory(params.category);
    }
  }, [params.category]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visible = useMemo(
    () => filterProducts(products, search, category),
    [products, search, category]
  );

  const { width } = Dimensions.get('window');
  const gridItemWidth = Math.floor((width - 32 - 16) / 2);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SiteHeader />
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Shop</Text>

            <View style={styles.searchBox}>
              <SearchIcon size={16} strokeWidth={1.5} color={colors.charcoal} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="SEARCH PRODUCTS"
                placeholderTextColor={colors.stone}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <X size={14} strokeWidth={1.5} color={colors.charcoal} />
                </Pressable>
              )}
            </View>

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
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.black} />
          ) : (
            <Text style={styles.message}>
              {error ||
                (search || category !== 'All'
                  ? 'No products match your search.'
                  : 'No products available.')}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={{ width: gridItemWidth }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    rowGap: 32,
  },
  headerBlock: {
    marginBottom: 8,
    gap: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 28,
    textTransform: 'uppercase',
    letterSpacing: tracking.base,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: tracking.wide,
    color: colors.black,
    paddingVertical: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  message: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    marginTop: 24,
  },
});
