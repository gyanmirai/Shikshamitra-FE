import type { PropsWithChildren } from 'react';
import type { RenderOptions } from '@testing-library/react';

import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

/** Default medium used in all tests unless overridden via preloadedState */
export const DEFAULT_MEDIUM = { id: 'medium-1', name: 'English Medium' };

/** Shape of the preloaded state accepted by the test store */
type TestStorePreloadedState = Partial<{
  globalState: Record<string, unknown>;
  confirmPopup: Record<string, unknown>;
}>;

/**
 * Creates a minimal Redux store for testing, with the same slice keys as the
 * production store but without redux-persist or RTK Query middleware.
 */
export const createTestStore = (preloadedState?: TestStorePreloadedState) =>
  configureStore({
    reducer: {
      /* eslint-disable @typescript-eslint/default-param-last */
      globalState: (
        state: Record<string, unknown> = {
          currentMedium: DEFAULT_MEDIUM,
          currentYear: {},
          currentBoard: {},
        },
        _action
      ) => state,
      confirmPopup: (state: Record<string, unknown> = { isChanges: false }, _action) => state,
      /* eslint-enable @typescript-eslint/default-param-last */
    },
    preloadedState,
  });

/**
 * Wraps the given UI in a Redux Provider using a test store.
 * Accepts optional `preloadedState` to control initial Redux state.
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions & { preloadedState?: TestStorePreloadedState }
) => {
  const { preloadedState, ...renderOptions } = options ?? {};
  const store = createTestStore(preloadedState);

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
