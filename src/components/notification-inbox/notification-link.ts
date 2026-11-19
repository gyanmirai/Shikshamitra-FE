export function notificationLink(value: string | null) {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  if (Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  return value;
}
