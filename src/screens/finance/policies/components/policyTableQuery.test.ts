import type { IParams } from 'src/components/customizabaleTable/types';

import { it, expect } from 'vitest';

import { policyTableFilterArgs } from './policyTableQuery';

const filter = (column: string, type: string, value: unknown): IParams['filters'][number] => ({
  column,
  type,
  value,
  valueType: 'string',
});

it('maps collection numeric and boolean filters without losing false', () => {
  const args = policyTableFilterArgs([
    filter('policyName', 'startsWith', 'Late'),
    filter('enableLateFee', 'equals', 'false'),
    filter('lateFeeType', 'equals', 'PerDay'),
    filter('gracePeriodDays', 'between', { min: 2, max: 8 }),
    filter('allowOnlineCollection', 'equals', 'true'),
  ]);

  expect(args).toMatchObject({
    policyNameFilter: 'Late',
    policyNameOperator: 'startsWith',
    enableLateFee: false,
    lateFeeType: 'PerDay',
    graceDaysOperator: 'between',
    graceDaysValue: 2,
    graceDaysMax: 8,
    allowOnlineCollection: true,
  });
});

it('maps refund membership, proration count, and last-updated date filters', () => {
  const args = policyTableFilterArgs([
    filter('amountMode', 'equals', 'FixedAmount'),
    filter('feeHeadScope', 'equals', 'SelectedFeeHeads'),
    filter('allowedPayoutMethods', 'equals', 'BankTransfer'),
    filter('allowPartialRefund', 'equals', 'false'),
    filter('feeHeadRules', 'greaterThan', 3),
    filter('updatedAt', 'after', '07-10-2026'),
  ]);

  expect(args).toMatchObject({
    amountMode: 'FixedAmount',
    feeHeadScope: 'SelectedFeeHeads',
    allowedPayoutMethod: 'BankTransfer',
    allowPartialRefund: false,
    ruleCountOperator: 'greaterThan',
    ruleCountValue: 3,
    updatedAtOperator: 'after',
    updatedAt: new Date(2026, 9, 7).toISOString(),
    updatedAtEnd: new Date(2026, 9, 8).toISOString(),
  });
});
