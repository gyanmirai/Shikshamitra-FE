import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import { it, expect } from 'vitest';

import { collectionReceiptAmounts } from './collectionReceiptAmounts';

const collection = (overrides: Partial<CollectFeeOutput> = {}) =>
  ({
    receiptGrouping: 'Separate',
    feeReceiptId: 'fee',
    chargeReceiptId: 'charge',
    feeReceiptAmount: 20000,
    chargeReceiptAmount: 60600,
    paidFeeHeads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', amountPaid: 20000 }],
    paidLateFees: [{ dueFeeId: 'due', feeHeadId: 'tuition', amountPaid: 60600 }],
    paidCharges: [],
    receivedAmount: 80600,
    ...overrides,
  }) as CollectFeeOutput;

it('separates principal 20000 from late fees 60600', () => {
  expect(collectionReceiptAmounts(collection())).toEqual({
    feeTotal: 20000,
    feeLateFee: 0,
    chargeTotal: 60600,
    combined: false,
  });
});

it('combines principal and late fees once in one 80600 receipt', () => {
  expect(
    collectionReceiptAmounts(
      collection({
        receiptGrouping: 'Combined',
        chargeReceiptId: undefined,
        feeReceiptAmount: 80600,
      })
    )
  ).toEqual({
    feeTotal: 80600,
    feeLateFee: 60600,
    chargeTotal: 0,
    combined: true,
  });
});

it('includes ordinary charges with late fees without changing principal', () => {
  expect(
    collectionReceiptAmounts(
      collection({
        paidCharges: [{ chargeId: 'manual', chargeName: 'Manual', amountPaid: 1000 }],
        receivedAmount: 81600,
        chargeReceiptAmount: 61600,
      })
    )
  ).toMatchObject({
    feeTotal: 20000,
    chargeTotal: 61600,
  });
});

it('preserves a legacy fee-only response that already issued late fees on its fee receipt', () => {
  expect(
    collectionReceiptAmounts(
      collection({
        chargeReceiptId: undefined,
        feeReceiptAmount: undefined,
        chargeReceiptAmount: undefined,
      })
    )
  ).toEqual({
    feeTotal: 80600,
    feeLateFee: 60600,
    chargeTotal: 0,
    combined: false,
  });
});

it.each([
  {
    canonical: false,
    feeReceiptAmount: undefined,
    chargeReceiptAmount: undefined,
    feeTotal: 80600,
    chargeTotal: 400,
    feeLateFee: 60600,
  },
  {
    canonical: true,
    feeReceiptAmount: 20000,
    chargeReceiptAmount: 61000,
    feeTotal: 20000,
    chargeTotal: 61000,
    feeLateFee: 0,
  },
  {
    canonical: 'replayed legacy document',
    feeReceiptAmount: 80600,
    chargeReceiptAmount: 400,
    feeTotal: 80600,
    chargeTotal: 400,
    feeLateFee: 60600,
  },
])(
  'preserves actual separate document totals with canonical fields: $canonical',
  ({ feeReceiptAmount, chargeReceiptAmount, feeTotal, chargeTotal, feeLateFee }) => {
    expect(
      collectionReceiptAmounts(
        collection({
          feeReceiptAmount,
          chargeReceiptAmount,
          paidCharges: [{ chargeId: 'manual', chargeName: 'Manual', amountPaid: 400 }],
          receivedAmount: 81000,
        })
      )
    ).toEqual({ feeTotal, chargeTotal, feeLateFee, combined: false });
  }
);

it('routes a late-fee-only collection to its actual charge receipt', () => {
  expect(
    collectionReceiptAmounts(
      collection({ feeReceiptId: undefined, paidFeeHeads: [], receivedAmount: 60600 })
    )
  ).toMatchObject({
    feeTotal: 0,
    chargeTotal: 60600,
  });
});
