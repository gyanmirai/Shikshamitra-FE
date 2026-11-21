import type { ReactNode } from 'react';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReceivingIndex from 'src/app/(auth-route)/library/receiving/page';

import { libraryPaths } from './library-menus';

vi.mock('src/screens/library/receiving/ReceivingWorkspace', () => ({
  default: () => <div>Create receiving flow</div>,
}));
vi.mock('src/screens/library/receiving/ReceivingHistoryWorkspace', () => ({
  default: ({ copyId }: { copyId?: string }) => (
    <div>
      Receiving register<output aria-label="Receipt copy filter">{copyId}</output>
    </div>
  ),
}));

it('uses the module index for recorded receipt history and preserves its supported exact CopyId filter', async () => {
  const Page: (props: {
    searchParams: Promise<{ copyId: string }>;
  }) => ReactNode | Promise<ReactNode> = ReceivingIndex;
  render(await Page({ searchParams: Promise.resolve({ copyId: 'copy-id' }) }));
  expect(screen.getByText('Receiving register')).toBeVisible();
  expect(screen.getByLabelText('Receipt copy filter')).toHaveTextContent('copy-id');
});

it('provides a distinct real route for receiving new physical copies', () => {
  const paths = libraryPaths as unknown as Record<string, string>;
  expect(paths.receivingNew).toBe('/library/receiving/new');
});
