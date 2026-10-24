/** Read the server's RFC 6266 filename, preferring its UTF-8 form. */
export function getDownloadFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)?.[1];
  if (encoded) {
    try { return decodeURIComponent(encoded.replace(/^"|"$/g, '')); } catch { /* Try the plain fallback. */ }
  }
  return /filename="([^"]+)"/i.exec(contentDisposition)?.[1]
    || /filename=([^;]+)/i.exec(contentDisposition)?.[1]?.trim()
    || null;
}
