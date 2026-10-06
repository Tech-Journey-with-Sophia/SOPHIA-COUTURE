import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProductBySlug, type Product } from '@/api/products';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QtyStepper } from '@/components/QtyStepper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { resolveImageUrl } from '@/lib/imageUrl';
import { useCartStore } from '@/store/cartStore';
import { colors, fonts, tracking } from '@/theme';

/** Same hardcoded sizes the website uses in AddToCartButton. */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/** Port of the website product page + AddToCartButton. */
export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (typeof slug !== 'string') {
      setLoading(false);
      return;
    }
    fetchProductBySlug(slug)
      .then((data) => mounted && setProduct(data))
      .catch(() => mounted && setProduct(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${size}`,
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image_url: product.image_url ?? '',
      quantity,
      stock_quantity: product.stock_quantity,
      size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageUri = resolveImageUrl(product?.image_url);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={colors.black} />
        ) : !product ? (
          <View style={styles.missing}>
            <Text style={styles.missingText}>Product not found.</Text>
            <PrimaryButton
              label="Back to Shop"
              onPress={() => router.replace('/shop')}
            />
          </View>
        ) : (
          <>
            <View style={styles.imageBox}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Text style={styles.noImage}>No Image</Text>
              )}
            </View>

            <View style={styles.details}>
              <Text style={styles.category}>
                {(product.category ?? '').toUpperCase()}
              </Text>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>

              <View style={styles.descriptionWrap}>
                <Text style={styles.description}>{product.description}</Text>
              </View>

              {product.stock_quantity > 0 ? (
                <View style={styles.buyBlock}>
                  <View style={styles.sizeHeader}>
                    <Text style={styles.sizeLabel}>Size</Text>
                    <Pressable onPress={() => setShowSizeGuide(true)} hitSlop={6}>
                      <Text style={styles.sizeGuideLink}>Size Guide</Text>
                    </Pressable>
                  </View>
                  <View style={styles.sizeRow}>
                    {SIZES.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSize(s)}
                        style={[styles.sizeButton, size === s && styles.sizeButtonActive]}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            size === s && styles.sizeButtonTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.qtyRow}>
                    <Text style={styles.sizeLabel}>Qty</Text>
                    <QtyStepper
                      quantity={quantity}
                      max={product.stock_quantity}
                      onChange={setQuantity}
                    />
                    <Text style={styles.stockText}>
                      {product.stock_quantity} available
                    </Text>
                  </View>

                  <PrimaryButton
                    label={added ? 'Added to Cart' : 'Add to Cart'}
                    onPress={handleAdd}
                    disabled={added}
                    style={styles.addButton}
                  />
                </View>
              ) : (
                <View style={styles.outOfStock}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
              )}
            </View>
          </>



        )}
      </ScrollView>

      <SizeGuideModal visible={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
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
    paddingTop: 16,
    paddingBottom: 48,
  },
  missing: {
    alignItems: 'center',
    gap: 24,
    paddingVertical: 64,
  },
  missingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.fog,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.black,
  },
  details: {
    paddingTop: 24,
  },
  category: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
    letterSpacing: tracking.base,
    marginBottom: 8,
  },
  name: {
    fontFamily: fonts.regular,
    fontSize: 28,
    color: colors.black,
    lineHeight: 34,
    marginBottom: 6,
  },
  price: {
    fontFamily: fonts.medium,
    fontSize: 20,
    color: colors.black,
    marginBottom: 32,
  },
  descriptionWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.black,
    paddingTop: 24,
    marginBottom: 32,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.35,
    color: colors.black,
  },
  buyBlock: {
    gap: 20,
  },
  sizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  sizeGuideLink: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.charcoal,
    textDecorationLine: 'underline',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonActive: {
    backgroundColor: colors.black,
  },
  sizeButtonText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
    color: colors.black,
  },
  sizeButtonTextActive: {
    color: colors.white,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  stockText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.charcoal,
  },
  addButton: {
    width: '100%',
    minHeight: 56,
  },
  outOfStock: {
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.black,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outOfStockText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    color: colors.black,
  },
});
