import { CryptoDigestAlgorithm, digest, getRandomValues } from 'expo-crypto';
import { Platform } from 'react-native';

if (Platform.OS !== 'web' && !globalThis.crypto?.subtle) {
  const cryptoShim = Object.create(globalThis.crypto ?? null) as Crypto;
  const subtle = {
    digest(algorithm: AlgorithmIdentifier, data: BufferSource) {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name.toUpperCase() !== 'SHA-256') {
        return Promise.reject(new Error(`Unsupported digest algorithm: ${name}`));
      }
      return digest(CryptoDigestAlgorithm.SHA256, data);
    },
  } as SubtleCrypto;

  Object.defineProperties(cryptoShim, {
    getRandomValues: { value: getRandomValues },
    subtle: { value: subtle },
  });
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: cryptoShim,
  });
}