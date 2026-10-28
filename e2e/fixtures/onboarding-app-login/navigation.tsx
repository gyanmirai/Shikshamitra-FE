import type { AnchorHTMLAttributes } from 'react';

export const useRouter = () => ({
  push: () => undefined,
  replace: () => undefined,
  back: () => undefined,
});
export const usePathname = () => '/student/onboarding/preview';
export const useSearchParams = () => new URLSearchParams(window.location.search);
export default function Link({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props}>{children}</a>;
}
