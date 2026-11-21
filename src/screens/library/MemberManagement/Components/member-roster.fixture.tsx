import { vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import MemberManagementTable from './MemberManagementTable';
import { memberRecordWrapper } from './ViewDetailsComponent/member-record-test-fixture';

const location = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
  return { query: '', listeners: new Set<() => void>(), replace: vi.fn() };
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    usePathname: () => '/library/member-management',
    useRouter: () => ({ replace: location.replace }),
    useSearchParams: () => {
      const query = useSyncExternalStore(
        (listener) => {
          location.listeners.add(listener);
          return () => {
            location.listeners.delete(listener);
          };
        },
        () => location.query
      );
      return new URLSearchParams(query);
    },
  };
});
beforeEach(() => {
  clearCachedAuthSession();
  localStorage.clear();
  location.query = '';
  location.replace.mockReset().mockImplementation((href: string) => {
    location.query = href.split('?')[1] || '';
    location.listeners.forEach((listener) => listener());
  });
});
export function mountRoster() {
  const onView = vi.fn();
  const fixture = memberRecordWrapper();
  return {
    onView,
    store: fixture.store,
    ...render(<MemberManagementTable onView={onView} />, { wrapper: fixture.wrapper }),
  };
}
export { location as rosterLocation };
export {
  rosterApi,
  rosterRows,
  serveRoster,
  rosterMember,
  rosterResponse,
} from './member-roster-data.fixture';
