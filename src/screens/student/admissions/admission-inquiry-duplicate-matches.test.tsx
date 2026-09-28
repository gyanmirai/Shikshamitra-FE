import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';

const match: DuplicateMatch = {
  applicantId: 'applicant-1',
  familyId: 'family-1',
  applicantName: 'Asha Patel',
  guardianPhone: '9876543210',
  canLinkFamily: true,
};

function renderMatches(guardianPhone: string, candidate = match) {
  const onUseExisting = vi.fn();
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[candidate]}
      guardianPhone={guardianPhone}
      busy={false}
      onUseExisting={onUseExisting}
      onOpenExisting={vi.fn()}
      onCreateSeparate={vi.fn()}
      overrideReason=""
      onOverrideReasonChange={vi.fn()}
    />
  );
  return onUseExisting;
}

it('allows adding a sibling when the selected family and guardian mobile are verified', () => {
  const onUseExisting = renderMatches('9876543210');

  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  expect(onUseExisting).toHaveBeenCalledWith('family-1');
});

it('does not offer family linking for a name-only match with a different mobile', () => {
  const onUseExisting = renderMatches('9876543211');

  expect(screen.getByRole('button', { name: 'Add sibling' })).toBeDisabled();
  expect(screen.getByText(/Guardian mobile does not match/)).toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
});

it('honors the server decision even when the mobile numbers match', () => {
  const onUseExisting = renderMatches('9876543210', { ...match, canLinkFamily: false });

  expect(screen.getByRole('button', { name: 'Add sibling' })).toBeDisabled();
  expect(screen.getByText(/not available for linking/)).toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
});
