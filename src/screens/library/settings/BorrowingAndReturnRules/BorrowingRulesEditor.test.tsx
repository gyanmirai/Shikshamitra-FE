import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { BorrowingRulesEditor } from './BorrowingRulesEditor';

const items = [
  { role: 'Student', maxBooksAtTime: 3, reservationLimit: 2 },
  { role: 'Staff', maxBooksAtTime: 5, reservationLimit: 3 },
];

vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

describe('borrowing policy edits', () => {
  it('keeps the entered draft and a retryable save after server rejection', async () => {
    const save = vi.fn().mockRejectedValue(new Error('The school policy could not be saved.'));
    render(<BorrowingRulesEditor items={items} canEdit onSave={save} />);
    const input = screen.getAllByLabelText(/Borrow limit at a time/)[0];
    fireEvent.change(input, { target: { value: '7' } });
    await waitFor(() =>
      expect(screen.getByTestId('library-settings-borrowing-rules-save-button')).toBeEnabled()
    );
    fireEvent.click(screen.getByTestId('library-settings-borrowing-rules-save-button'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('The school policy could not be saved.')).toBeInTheDocument();
    expect(input).toHaveValue('7');
    expect(screen.getByTestId('library-settings-borrowing-rules-save-button')).toBeEnabled();
    expect(save).toHaveBeenCalledOnce();
  });

  it('keeps view-only policy controls disabled', () => {
    render(<BorrowingRulesEditor items={items} canEdit={false} onSave={vi.fn()} />);
    expect(screen.getByTestId('library-settings-borrowing-rules-save-button')).toBeDisabled();
    expect(screen.getAllByLabelText(/Borrow limit at a time/)[0]).toBeDisabled();
  });

  it('keeps an edited policy visible when its background refresh fails', async () => {
    const { rerender } = render(<BorrowingRulesEditor items={items} canEdit onSave={vi.fn()} />);
    const input = screen.getAllByLabelText(/Borrow limit at a time/)[0];
    fireEvent.change(input, { target: { value: '8' } });
    rerender(
      <BorrowingRulesEditor
        items={items}
        canEdit
        onSave={vi.fn()}
        requestError="Refresh failed. Your changes are retained."
      />
    );
    expect(
      await screen.findByText('Refresh failed. Your changes are retained.')
    ).toBeInTheDocument();
    expect(input).toHaveValue('8');
  });
});
