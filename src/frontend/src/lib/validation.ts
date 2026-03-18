/**
 * Validates an Internet Computer principal ID format
 * @param principalId - The principal ID string to validate
 * @returns true if the format appears valid, false otherwise
 */
export function validatePrincipalId(principalId: string): boolean {
  if (!principalId || typeof principalId !== "string") {
    return false;
  }

  const trimmed = principalId.trim();

  // Basic format checks
  if (trimmed.length < 10 || trimmed.length > 100) {
    return false;
  }

  // Principal IDs contain alphanumeric characters and hyphens
  // They are base32-encoded with specific formatting
  const principalRegex = /^[a-z0-9-]+$/i;
  if (!principalRegex.test(trimmed)) {
    return false;
  }

  // Should contain at least one hyphen (typical format)
  if (!trimmed.includes("-")) {
    return false;
  }

  // Should not start or end with a hyphen
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return false;
  }

  return true;
}
