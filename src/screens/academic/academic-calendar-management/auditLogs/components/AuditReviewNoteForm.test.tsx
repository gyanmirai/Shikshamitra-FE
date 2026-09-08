import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import AuditReviewNoteForm from './AuditReviewNoteForm';
import { AUDIT_REVIEW_NOTE_MAX_LENGTH } from '../constants/auditLogs.constants';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
  },
}));

describe('AuditReviewNoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces the backend 4,000-character limit before submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<AuditReviewNoteForm onAdd={onAdd} />);

    const input = screen.getByLabelText('Review note');
    fireEvent.change(input, { target: { value: 'a'.repeat(AUDIT_REVIEW_NOTE_MAX_LENGTH + 1) } });

    expect(input).toHaveAttribute('maxlength', String(AUDIT_REVIEW_NOTE_MAX_LENGTH));
    expect(input).toHaveValue('a'.repeat(AUDIT_REVIEW_NOTE_MAX_LENGTH));
    expect(screen.getByText('4000 / 4000')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add Note' }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('a'.repeat(AUDIT_REVIEW_NOTE_MAX_LENGTH));
    });
  });

  it('shows a targeted inline error and toast while preserving a rejected draft', async () => {
    const onAdd = vi.fn().mockRejectedValue({
      data: {
        status: 400,
        detail: 'One or more validation errors occurred.',
        errorCode: 'VALIDATION_ERROR',
        errors: {
          Note: ["The field Note must be a string or array type with a maximum length of '4000'."],
        },
      },
    });
    renderWithProviders(<AuditReviewNoteForm onAdd={onAdd} />);

    const input = screen.getByLabelText('Review note');
    await userEvent.type(input, 'Please verify this calendar change.');
    await userEvent.click(screen.getByRole('button', { name: 'Add Note' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Review note must be 4,000 characters or fewer.'
    );
    expect(input).toHaveValue('Please verify this calendar change.');
    expect(shikshaMitraToast.error).toHaveBeenCalledWith({
      message: 'Review note must be 4,000 characters or fewer.',
    });
  });
});
