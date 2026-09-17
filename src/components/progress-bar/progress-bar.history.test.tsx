import { it, vi, expect, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';

import { ProgressBar } from './progress-bar';

const fixture = vi.hoisted(() => ({ state: { confirmPopup: { isChanges: false } }, dispatch: vi.fn(), router: { back: vi.fn() } }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select(fixture.state), useDispatch: () => fixture.dispatch }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => fixture.router, usePathname: () => '/security/role', useSearchParams: () => null }));
vi.mock('nprogress', () => ({ default: { configure: vi.fn(), start: vi.fn(), done: vi.fn() } }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); fixture.state.confirmPopup.isChanges = false; });

it('preserves Next router metadata in legacy history entries and cancelled global navigation', () => {
  const metadata = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['synthetic-route'] };
  window.history.replaceState(metadata, '', window.location.href);
  const pushState = vi.spyOn(window.history, 'pushState');
  const { rerender, unmount } = render(<ProgressBar />);
  expect(pushState).toHaveBeenCalledWith(metadata, document.title, window.location.href);
  fixture.state.confirmPopup.isChanges = true;
  vi.stubGlobal('confirm', vi.fn(() => false));
  rerender(<ProgressBar />);
  act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: metadata })); });
  expect(pushState).toHaveBeenLastCalledWith(metadata, document.title, window.location.href);
  expect(fixture.router.back).not.toHaveBeenCalled();
  unmount();
});
