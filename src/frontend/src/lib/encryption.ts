/**
 * Client-side encryption utility using Web Crypto API.
 * Uses PBKDF2 key derivation from user's principal + AES-GCM encryption.
 * Sensitive data never leaves the browser in plaintext.
 */

const SALT_PREFIX = "foreverraw-lineage-anchor-v1";

async function deriveKey(principal: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(principal),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const salt = encoder.encode(SALT_PREFIX + principal.slice(0, 8));

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt plaintext using the user's principal as the key source.
 * Returns a Uint8Array containing [iv (12 bytes) | ciphertext].
 */
export async function encryptText(
  plaintext: string,
  principal: string,
): Promise<Uint8Array> {
  const key = await deriveKey(principal);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  const result = new Uint8Array(12 + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), 12);
  return result;
}

/**
 * Decrypt a Uint8Array (iv + ciphertext) using the user's principal.
 * Returns empty string on failure.
 */
export async function decryptText(
  data: Uint8Array,
  principal: string,
): Promise<string> {
  try {
    if (data.length < 13) return "";
    const key = await deriveKey(principal);
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    return "";
  }
}
