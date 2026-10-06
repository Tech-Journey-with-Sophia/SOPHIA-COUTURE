import * as Linking from 'expo-linking';

/** Uses Expo Go's current host in Expo Go and the app scheme in native builds. */
export function getAuthRedirectUri(): string {
  return Linking.createURL('auth-callback');
}