export function isValidPhoneNumber(value: string): boolean {
  const compact = value.trim().replace(/[\s().-]/g, "");
  const hasValidFormat = /^(?:\+?[1-9]\d{6,14}|0\d{6,14})$/.test(compact);
  const hasNonZeroDigit = /[1-9]/.test(compact);

  return hasValidFormat && hasNonZeroDigit;
}
