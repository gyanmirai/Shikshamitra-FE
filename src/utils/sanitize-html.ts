import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Only allows safe formatting tags; strips all scripts, event handlers, and unknown tags.
 */
export const sanitizeHtml = (html: string | undefined | null): string =>
  DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS: [
      'b',
      'i',
      'u',
      'strong',
      'em',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'span',
    ],
    ALLOWED_ATTR: ['class', 'style'],
  });
