import { it, expect, describe } from 'vitest';

import { buildEsiWorkspaceHref, parseEsiWorkspaceQuery } from './esi-statutory-utils';

describe('ESI workspace URL state', () => {
  it.each([
    ['applicability', 'overview'],
    ['wages', 'advanced'],
    ['employees', 'employees'],
    ['review', 'overview'],
  ])('maps the old %s tab to %s', (tab, view) => {
    expect(parseEsiWorkspaceQuery(new URLSearchParams(`tab=${tab}`)).view).toBe(view);
  });

  it('sanitizes unsupported filters, paging, and sort values', () => {
    const state = parseEsiWorkspaceQuery(
      new URLSearchParams('view=employees&page=-1&pageSize=500&sort=unsafe&coverage=unsafe')
    );

    expect(state).toEqual(
      expect.objectContaining({
        view: 'employees',
        page: 0,
        pageSize: 25,
        sortBy: 'employeeName',
        coverage: 'all',
      })
    );
  });

  it('removes legacy tab state when building a new workspace link', () => {
    const href = buildEsiWorkspaceHref(new URLSearchParams('tab=review&month=2026-08'), {
      view: 'employees',
      page: 0,
    });

    expect(href).toContain('view=employees');
    expect(href).not.toContain('tab=');
  });
});
