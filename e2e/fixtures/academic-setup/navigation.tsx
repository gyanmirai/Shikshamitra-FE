import { forwardRef } from 'react';

export function useSearchParams() {
  return new URLSearchParams(window.location.search);
}
export function usePathname() {
  return window.location.pathname;
}
export function useRouter() {
  return {
    push: (url: string) => window.location.assign(url),
    replace: (url: string) => window.history.replaceState({}, '', url),
    back: () => window.history.back(),
  };
}
export function redirect(url: string) {
  window.location.assign(url);
}
export default forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
  ({ children, ...props }, ref) => (
    <a ref={ref} {...props}>
      {children}
    </a>
  )
);
