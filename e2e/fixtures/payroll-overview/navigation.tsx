import { forwardRef, useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};
const navigate = (url: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
const router = {
  replace: (url: string) => navigate(url, true),
  push: (url: string) => navigate(url),
  back: () => window.history.back(),
  refresh: () => window.location.reload(),
};
export const useSearchParams = () =>
  new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search));
export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
export const useRouter = () => router;
export const useParams = () => ({});
export default forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
  ({ children, ...props }, ref) => (
    <a ref={ref} {...props}>
      {children}
    </a>
  )
);
