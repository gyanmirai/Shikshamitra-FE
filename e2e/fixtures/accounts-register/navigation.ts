// Standalone component QA has no Next app-router provider.
const router = {
  push: (url: string) => window.history.pushState({}, '', url),
  replace: (url: string) => window.history.replaceState({}, '', url),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => undefined,
  prefetch: () => undefined,
};

export const useRouter = () => router;
export const usePathname = () => window.location.pathname;
export const useSearchParams = () => new URLSearchParams(window.location.search);
