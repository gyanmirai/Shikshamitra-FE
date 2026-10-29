import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import CollectionLateFeeSection from './CollectionLateFeeSection';

vi.mock('src/screens/finance/components/FinanceRoutingFields', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('collection late-fee saved fee heads', () => {
  it('keeps historical selections visible when they are absent from the active lookup', () => {
    render(
      <CollectionLateFeeSection
        feeHeads={[]}
        addSlab={vi.fn()}
        removeSlab={vi.fn()}
        formik={{
          values: {
            enableLateFee: true,
            lateFeeApplyOnFeeHeads: ['historical'],
            gracePeriodDays: 0,
            lateFeeType: 'Flat',
            flatAmount: 10,
            escalationRules: [],
            maximumChargingDays: null,
            maximumLateFeeAmount: null,
          },
          touched: {},
          errors: {},
          setFieldValue: vi.fn(),
          handleBlur: vi.fn(),
        }}
      />
    );
    expect(screen.getByText('Fee head name unavailable (saved selection)')).toBeInTheDocument();
  });
});
