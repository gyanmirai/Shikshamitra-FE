import { lazy, Suspense } from 'react';

export default function dynamic(loader: () => Promise<{ default: React.ComponentType<any> }>) {
  const Component = lazy(loader);
  return function LazyComponent(props: Record<string, unknown>) {
    return (
      <Suspense fallback={null}>
        <Component {...props} />
      </Suspense>
    );
  };
}
