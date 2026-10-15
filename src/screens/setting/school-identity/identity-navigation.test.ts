import { it, expect, describe } from 'vitest';

import { identityTab, identityHref } from './identity-navigation';

describe('school identity navigation', () => {
  it('opens existing board deep links in the override scope', () => {
    expect(identityTab(new URLSearchParams('boardId=board-1&mediumId=medium-1'))).toBe(1);
  });
  it('respects an explicit defaults scope while preserving an earlier context', () => {
    expect(identityTab(new URLSearchParams('scope=defaults&boardId=board-1'))).toBe(0);
  });
  it('supports the override view before a board is selected', () => {
    expect(identityTab(new URLSearchParams('scope=overrides'))).toBe(1);
  });
  it('preserves unrelated query parameters and selected context when switching scopes', () => {
    const href = identityHref(
      '/setting/school-identity',
      new URLSearchParams('boardId=board-1&mediumId=medium-1&source=academic'),
      { scope: 'defaults' }
    );
    const next = new URL(href, 'http://localhost');
    expect(next.searchParams.get('source')).toBe('academic');
    expect(next.searchParams.get('boardId')).toBe('board-1');
    expect(next.searchParams.get('mediumId')).toBe('medium-1');
    expect(identityTab(next.searchParams)).toBe(0);
  });
  it('clears the previous board and medium when the academic year changes', () => {
    const href = identityHref(
      '/setting/school-identity',
      new URLSearchParams(
        'scope=overrides&academicYearId=old&boardId=old-board&mediumId=old-medium'
      ),
      { academicYearId: 'new', boardId: '', mediumId: '' }
    );
    const next = new URL(href, 'http://localhost');
    expect(next.searchParams.get('academicYearId')).toBe('new');
    expect(next.searchParams.has('boardId')).toBe(false);
    expect(next.searchParams.has('mediumId')).toBe(false);
  });
  it('encodes context identifiers without allowing additional query parameters', () => {
    const href = identityHref('/setting/school-identity', new URLSearchParams(), {
      boardId: 'board & mediumId=unexpected',
    });
    const next = new URL(href, 'http://localhost');
    expect(next.searchParams.get('boardId')).toBe('board & mediumId=unexpected');
    expect(next.searchParams.has('mediumId')).toBe(false);
  });
});
