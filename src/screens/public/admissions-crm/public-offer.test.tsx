import { it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import {
  AdmissionCrmSeatOfferType,
  AdmissionCrmSeatOfferStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import PublicOffer from './public-offer';

describe('PublicOffer', () => {
  it('shows inline validation and focuses the decline reason', () => {
    renderWithProviders(
      <PublicOffer
        tenantId="tenant-1"
        token="status-token"
        accessSessionToken="access-token"
        offer={{
          offerId: 'offer-1',
          offerNumber: 'OFF-001',
          offerType: AdmissionCrmSeatOfferType.Final,
          status: AdmissionCrmSeatOfferStatus.Issued,
          terms: {},
          language: 'en',
          validFrom: '2026-08-01T00:00:00Z',
          validUntil: '2026-08-31T00:00:00Z',
        }}
        onUpdated={() => undefined}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Decline Offer' }));

    const reason = screen.getByRole('textbox', { name: 'Reason for declining' });
    expect(reason).toHaveFocus();
    expect(reason).toHaveAccessibleDescription('Enter a reason before declining the offer.');
  });
});
