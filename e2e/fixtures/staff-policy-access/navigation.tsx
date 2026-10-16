import { forwardRef } from 'react';

export const useSearchParams = () => new URLSearchParams(window.location.search);
export const usePathname = () => window.location.pathname;
export const useParams = () => ({});
export const useRouter = () => ({
  push: (url: string) => window.history.pushState({}, '', url),
  replace: (url: string) => window.history.replaceState({}, '', url),
  back: () => window.history.back(),
});
export const redirect = (url: string) => window.history.pushState({}, '', url);
export default forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
  ({ children, ...props }, ref) => (
    <a ref={ref} {...props}>
      {children}
    </a>
  )
);
