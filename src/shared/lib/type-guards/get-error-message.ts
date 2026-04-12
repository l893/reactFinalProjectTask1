export function getErrorMessage(value: unknown, fallback: string): string {
  if (value instanceof Error) return value.message;
  return fallback;
}
