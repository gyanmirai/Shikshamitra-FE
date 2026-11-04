import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import CollectionLateFeeSection from './CollectionLateFeeSection';

vi.mock('src/screens/finance/components/FinanceRoutingFields', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('collection common late-fee rules', () => {
  it('shows a common rule without a fee-head selector even when legacy selections exist', () => {
    render(
      <CollectionLateFeeSection
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
    expect(
      screen.queryByRole('combobox', { name: /Apply late fee on fee heads/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Fee head name unavailable (saved selection)')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Flat late fee amount/)).toBeInTheDocument();
  });
});
