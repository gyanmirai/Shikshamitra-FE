import React, { forwardRef, useSyncExternalStore } from 'react';
const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  window.addEventListener('fixture-navigation', listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('fixture-navigation', listener);
  };
};
const navigate = (href: string) => {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new Event('fixture-navigation'));
};
const router = {
  push: navigate,
  replace: (href: string) => {
    window.history.replaceState(null, '', href);
    window.dispatchEvent(new Event('fixture-navigation'));
  },
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => {},
  prefetch: () => {},
};
export const useRouter = () => router;
export function useSearchParams() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => ''
  );
  return new URLSearchParams(search);
}
export const usePathname = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/'
  );
export const useParams = () => ({});
export const useActiveLink = () => false;
const Link = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function Link({ children, ...props }, ref) {
    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    );
  }
);
export default Link;
