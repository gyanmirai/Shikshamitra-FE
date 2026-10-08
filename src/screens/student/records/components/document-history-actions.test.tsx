import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import DocumentHistoryActions from './document-history-actions';

// Icon assets come from an external provider; these tests exercise the real UI controls.
vi.mock('@iconify/react', () => ({
  Icon: () => <svg aria-hidden="true" />,
  disableCache: vi.fn(),
}));

it('keeps the complete action menu keyboard accessible and preserves disabled decisions', async () => {
  const user = userEvent.setup();
  const reprint = vi.fn();
  render(
    <DocumentHistoryActions
      number="TEST-001"
      actions={[
        { label: 'Download', icon: 'mdi:download', onClick: vi.fn() },
        { label: 'Reprint', icon: 'mdi:printer', onClick: reprint },
        { label: 'Duplicate', icon: 'mdi:content-copy', onClick: vi.fn() },
        { label: 'Void', icon: 'mdi:cancel', disabled: true, danger: true, onClick: vi.fn() },
      ]}
    />
  );
  await user.click(screen.getByRole('button', { name: 'Actions for TEST-001' }));
  expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  expect(screen.getByRole('menuitem', { name: 'Void TEST-001' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await waitFor(() =>
    expect(screen.getByRole('menuitem', { name: 'Download TEST-001' })).toHaveFocus()
  );
  await user.keyboard('{ArrowDown}{Enter}');
  expect(reprint).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
});
