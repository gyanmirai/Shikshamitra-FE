import { it, expect, describe } from 'vitest';

import { readCatalogQuery, changeCatalogQuery } from './catalog-query';

describe('catalog query scope', () => {
  it('starts at the first page when the global academic year changes', () => {
    const location = new URLSearchParams('year=previous&page=4&search=History&view=cover');
    expect(readCatalogQuery(location, 'current')).toMatchObject({
      page: 1,
      search: 'History',
      view: 'cover',
    });
  });

  it('restores the requested page only for its own academic year', () => {
    expect(
      readCatalogQuery(new URLSearchParams('year=current&page=4&pageSize=25'), 'current')
    ).toMatchObject({ page: 4, pageSize: 25 });
  });

  it('rejects malformed and unsupported query values', () => {
    expect(
      readCatalogQuery(
        new URLSearchParams('year=current&page=-3&pageSize=10000&view=unknown&alphabet=12'),
        'current'
      )
    ).toMatchObject({ page: 1, pageSize: 10, view: 'list', alphabet: 'ALL' });
  });

  it('updates search and paging atomically without deleting unrelated route state', () => {
    const previous = new URLSearchParams('page=4&year=previous&panel=books');
    const next = changeCatalogQuery(previous, 'current', { search: 'ગુજરાતી', page: 1 });
    expect(next.get('search')).toBe('ગુજરાતી');
    expect(next.get('page')).toBe('1');
    expect(next.get('year')).toBe('current');
    expect(next.get('panel')).toBe('books');
    expect(previous.get('page')).toBe('4');
  });
});
