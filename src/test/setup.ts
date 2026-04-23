import '@testing-library/jest-dom/vitest';
import { mswServer } from 'src/test/mswServer';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  mswServer.resetHandlers();
  cleanup();
});

afterAll(() => {
  mswServer.close();
});
