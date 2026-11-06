import { it, vi, expect } from 'vitest';

import LegacyHouseSettingsPage from './page';

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock('next/navigation', () => ({ redirect }));

it('redirects the legacy House Settings route to House Management', () => {
  LegacyHouseSettingsPage();

  expect(redirect).toHaveBeenCalledWith('/student/records/houses');
});
