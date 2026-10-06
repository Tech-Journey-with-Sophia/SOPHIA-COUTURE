import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '@/lib/imageUrl';
import { colors, fonts, tracking } from '@/theme';
import type { Product } from '@/api/products';

/**
 * Port of the website product card (home grid): 3:4 image on warm-fog
 * background, 12px name/price, "Out of stock" note, decorative wishlist heart.
 */
export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const uri = resolveImageUrl(product.image_url);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
        style={styles.imageWrap}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} />
        ) : null}
        <View style={styles.heart}>
          <Heart size={16} strokeWidth={1.5} color={colors.black} />
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
        style={styles.details}
      >
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.stock_quantity === 0 && (
          <Text style={styles.outOfStock}>Out of stock</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'column',
  },
  imageWrap: {
    position: 'relative',
    aspectRatio: 3 / 4,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.fog,
    marginBottom: 12,
  },
  image: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heart: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  details: {
    flexDirection: 'column',
  },
  name: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.black,
    lineHeight: 17,
    letterSpacing: tracking.base,
  },
  price: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.black,
    marginTop: 4,
    letterSpacing: tracking.base,
  },
  outOfStock: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
    marginTop: 4,
  },
});
