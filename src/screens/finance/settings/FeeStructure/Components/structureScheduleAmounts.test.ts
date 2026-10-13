import type { StructureInstallment } from 'src/redux/finance/feeStructureWorkspace';

import { it, expect } from 'vitest';

import { structureScheduleAmounts } from './structureScheduleAmounts';

const rows = (...percentages: (number | null)[]) =>
  percentages.map((allocationPercentage) => ({ allocationPercentage }) as StructureInstallment);

it('floors installment shares and assigns the remainder to the final installment', () => {
  expect(structureScheduleAmounts(1000.25, rows(33.33, 33.33, 33.34))).toEqual([333, 333, 335]);
  expect(structureScheduleAmounts(10, rows(25, 25, 25, 25))).toEqual([2, 2, 2, 4]);
  expect(structureScheduleAmounts(1234.5, rows(100))).toEqual([1235]);
});

it('preserves whole-rupee boundaries and zero amounts', () => {
  expect(structureScheduleAmounts(100, rows(29, 71))).toEqual([29, 71]);
  expect(structureScheduleAmounts(0, rows(50, 50))).toEqual([0, 0]);
});

it('withholds amounts while allocations or the fee amount are incomplete or invalid', () => {
  expect(structureScheduleAmounts(null, rows(50, 50))).toEqual([null, null]);
  expect(structureScheduleAmounts(100, rows(50, 40))).toEqual([null, null]);
  expect(structureScheduleAmounts(100, rows(null, 100))).toEqual([null, null]);
  expect(structureScheduleAmounts(100, rows(-20, 120))).toEqual([null, null]);
  expect(structureScheduleAmounts(NaN, rows(100))).toEqual([null]);
});
