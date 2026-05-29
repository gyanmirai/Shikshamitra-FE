import { sanitizeHtml } from 'src/utils/sanitize-html';
import { it, vi, expect, describe, beforeEach } from 'vitest';

type SanitizeConfig = {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
};

// vi.mock is hoisted to the top of the file, so the factory cannot reference
// a const declared below it. vi.hoisted() runs before hoisting and is safe.
const mockSanitize = vi.hoisted(() => vi.fn((html: string, _config?: SanitizeConfig) => html));

const getSanitizeConfig = (): SanitizeConfig => {
  const config = mockSanitize.mock.calls[0]?.[1];
  expect(config).toBeDefined();
  return config as SanitizeConfig;
};

vi.mock('dompurify', () => ({
  default: { sanitize: mockSanitize },
}));

describe('sanitizeHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: passthrough – return whatever html was given
    mockSanitize.mockImplementation((html: string) => html);
  });

  // ── Null / undefined handling ────────────────────────────────────────────────

  it('converts null to empty string before calling DOMPurify', () => {
    sanitizeHtml(null as unknown as string);
    expect(mockSanitize).toHaveBeenCalledWith('', expect.any(Object));
  });

  it('converts undefined to empty string before calling DOMPurify', () => {
    sanitizeHtml(undefined as unknown as string);
    expect(mockSanitize).toHaveBeenCalledWith('', expect.any(Object));
  });

  it('passes an empty string input straight through', () => {
    sanitizeHtml('');
    expect(mockSanitize).toHaveBeenCalledWith('', expect.any(Object));
  });

  // ── ALLOWED_TAGS config ───────────────────────────────────────────────────────

  it('allows safe formatting tags in ALLOWED_TAGS', () => {
    sanitizeHtml('<p>hello</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_TAGS).toContain('p');
    expect(config.ALLOWED_TAGS).toContain('strong');
    expect(config.ALLOWED_TAGS).toContain('em');
    expect(config.ALLOWED_TAGS).toContain('ul');
    expect(config.ALLOWED_TAGS).toContain('ol');
    expect(config.ALLOWED_TAGS).toContain('li');
    expect(config.ALLOWED_TAGS).toContain('h1');
    expect(config.ALLOWED_TAGS).toContain('h2');
    expect(config.ALLOWED_TAGS).toContain('h3');
    expect(config.ALLOWED_TAGS).toContain('br');
  });

  it('does NOT include <script> in ALLOWED_TAGS', () => {
    sanitizeHtml('<p>safe</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_TAGS).not.toContain('script');
  });

  it('does NOT include <iframe> in ALLOWED_TAGS', () => {
    sanitizeHtml('<p>safe</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_TAGS).not.toContain('iframe');
  });

  it('does NOT include <object> or <embed> in ALLOWED_TAGS', () => {
    sanitizeHtml('<p>safe</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_TAGS).not.toContain('object');
    expect(config.ALLOWED_TAGS).not.toContain('embed');
  });

  // ── ALLOWED_ATTR config ───────────────────────────────────────────────────────

  it('allows class and style in ALLOWED_ATTR', () => {
    sanitizeHtml('<p class="x" style="color:red">styled</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_ATTR).toContain('class');
    expect(config.ALLOWED_ATTR).toContain('style');
  });

  it('does NOT include event handler attributes in ALLOWED_ATTR', () => {
    sanitizeHtml('<p>safe</p>');
    const config = getSanitizeConfig();
    expect(config.ALLOWED_ATTR).not.toContain('onclick');
    expect(config.ALLOWED_ATTR).not.toContain('onerror');
    expect(config.ALLOWED_ATTR).not.toContain('onload');
    expect(config.ALLOWED_ATTR).not.toContain('onmouseover');
  });

  // ── Return value ──────────────────────────────────────────────────────────────

  it('passes the input string to DOMPurify.sanitize', () => {
    sanitizeHtml('<p>Hello</p>');
    expect(mockSanitize).toHaveBeenCalledWith('<p>Hello</p>', expect.any(Object));
  });

  it('returns the exact value that DOMPurify.sanitize returns', () => {
    mockSanitize.mockReturnValue('<p>cleaned</p>');
    expect(sanitizeHtml('<p>raw</p>')).toBe('<p>cleaned</p>');
  });

  it('returns empty string when DOMPurify returns empty string', () => {
    mockSanitize.mockReturnValue('');
    expect(sanitizeHtml('<script>bad</script>')).toBe('');
  });
});
