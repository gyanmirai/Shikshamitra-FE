import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FormHistoryCard } from './form-history-card';

it('shows correction reason and field labels while preserving older entries without exposing the fingerprint', () => {
  render(
    <FormHistoryCard
      history={[
        {
          id: 'draft',
          changeType: 'DraftSaved',
          changedFieldsJson: '["DOB"]',
          occurredAt: '2026-10-30T10:00:00Z',
        },
        {
          id: 'correction',
          changeType: 'FormCorrected',
          changedFieldsJson: JSON.stringify({
            Version: 1,
            Reason: 'Verified birth certificate',
            ChangedFields: ['Date of birth'],
            FieldCodes: ['DOB'],
            Fingerprint: 'private-hash',
          }),
          occurredAt: '2026-11-01T10:00:00Z',
        },
        {
          id: 'legacy',
          changeType: 'FormCorrected',
          changedFieldsJson: '{invalid',
          occurredAt: '2026-11-01T10:01:00Z',
        },
      ]}
    />
  );
  expect(screen.getByText('DraftSaved')).toBeVisible();
  expect(screen.getByText('Verified birth certificate')).toBeVisible();
  expect(screen.getByText('Date of birth')).toBeVisible();
  expect(screen.queryByText(/private-hash/)).not.toBeInTheDocument();
});
