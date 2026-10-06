import { Tabs } from 'expo-router';
import { House, Search, ShoppingBag, User } from 'lucide-react-native';
import { useCartCount } from '@/store/cartStore';
import { colors, fonts, tracking } from '@/theme';

/**
 * Bottom tabs — the native counterpart of the website navbar's main
 * destinations: Home (shop front), Shop (catalog + search), Cart, Account.
 */
export default function TabsLayout() {
  const cartCount = useCartCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.stone,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.black,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: tracking.wide,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <House size={size} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Search size={size} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            fontFamily: fonts.bold,
            fontSize: 9,
            backgroundColor: colors.black,
            color: colors.white,
          },
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <User size={size} strokeWidth={1.5} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
