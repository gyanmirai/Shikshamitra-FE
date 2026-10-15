import { forwardRef } from 'react';

export const RouterLink = forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>((props, ref) => (
  <a ref={ref} {...props} />
));
export const useRouter = () => ({ push: () => {}, replace: () => {}, back: () => {} });
export const usePathname = () => '/accounts-qa';
export const useSearchParams = () => new URLSearchParams();
