/**
 * Test Examples for distributeConcessionAcrossDueFees
 *
 * This file demonstrates the utility function with various scenarios
 * including edge cases to validate the implementation.
 */

import {
  calculatePerLineConcession,
  distributeConcessionAcrossDueFees,
} from 'src/utils/distributeConcession';

// ─── Test Cases ────────────────────────────────────────────────────────────

export const testDistributeConcession = () => {
  console.group('Testing distributeConcessionAcrossDueFees');

  // ─── Case 1: Normal Distribution (20000 across 6 fees) ──────────────────
  console.group('Case 1: Normal Distribution (20000 across 6 fees)');
  const case1 = distributeConcessionAcrossDueFees(
    ['fee1', 'fee2', 'fee3', 'fee4', 'fee5', 'fee6'],
    20000
  );
  console.log('Result:', case1);
  const sum1 = case1.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum1, '(Expected: 20000)');
  console.log('Distribution:', case1.map((a) => a.concessionAmount).join(' + '));
  // Expected: [3334, 3334, 3333, 3333, 3333, 3333] -> Total: 20000
  console.groupEnd();

  // ─── Case 2: Perfect Division (12000 across 4 fees) ──────────────────────
  console.group('Case 2: Perfect Division (12000 across 4 fees)');
  const case2 = distributeConcessionAcrossDueFees(['fee1', 'fee2', 'fee3', 'fee4'], 12000);
  console.log('Result:', case2);
  const sum2 = case2.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum2, '(Expected: 12000)');
  console.log('Distribution:', case2.map((a) => a.concessionAmount).join(' + '));
  // Expected: [3000, 3000, 3000, 3000] -> Total: 12000
  console.groupEnd();

  // ─── Case 3: Single Due Fee (5000 across 1 fee) ────────────────────────
  console.group('Case 3: Single Due Fee (5000 across 1 fee)');
  const case3 = distributeConcessionAcrossDueFees(['fee1'], 5000);
  console.log('Result:', case3);
  const sum3 = case3.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum3, '(Expected: 5000)');
  console.log('Distribution:', case3.map((a) => a.concessionAmount).join(' + '));
  // Expected: [5000] -> Total: 5000
  console.groupEnd();

  // ─── Case 4: Amount Smaller Than Count (10 across 25 fees) ──────────────
  console.group('Case 4: Amount Smaller Than Count (10 across 25 fees)');
  const case4 = distributeConcessionAcrossDueFees(
    Array.from({ length: 25 }, (_, i) => `fee${i + 1}`),
    10
  );
  console.log('Result (first 5):', case4.slice(0, 5));
  console.log('Result (last 5):', case4.slice(-5));
  const sum4 = case4.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum4, '(Expected: 10)');
  console.log('Distribution:', case4.map((a) => a.concessionAmount).join(' + '));
  // Expected: First 10 get 1, rest get 0 -> Total: 10
  console.groupEnd();

  // ─── Case 5: Large Amount (100000 across 3 fees) ──────────────────────
  console.group('Case 5: Large Amount (100000 across 3 fees)');
  const case5 = distributeConcessionAcrossDueFees(['fee1', 'fee2', 'fee3'], 100000);
  console.log('Result:', case5);
  const sum5 = case5.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum5, '(Expected: 100000)');
  console.log('Distribution:', case5.map((a) => a.concessionAmount).join(' + '));
  // Expected: [33334, 33333, 33333] -> Total: 100000
  console.groupEnd();

  // ─── Case 6: Zero Amount (0 across 5 fees) ──────────────────────────────
  console.group('Case 6: Zero Amount (0 across 5 fees)');
  const case6 = distributeConcessionAcrossDueFees(['fee1', 'fee2', 'fee3', 'fee4', 'fee5'], 0);
  console.log('Result:', case6);
  const sum6 = case6.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum6, '(Expected: 0)');
  console.log('Distribution:', case6.map((a) => a.concessionAmount).join(' + '));
  // Expected: [0, 0, 0, 0, 0] -> Total: 0
  console.groupEnd();

  // ─── Case 7: No Due Fees (Empty array) ────────────────────────────────
  console.group('Case 7: No Due Fees (Empty array)');
  const case7 = distributeConcessionAcrossDueFees([], 5000);
  console.log('Result:', case7);
  console.log(
    'Total Sum:',
    case7.reduce((sum, alloc) => sum + alloc.concessionAmount, 0)
  );
  // Expected: [] -> Total: 0
  console.groupEnd();

  // ─── Case 8: Negative Amount (Treated as 0) ───────────────────────────
  console.group('Case 8: Negative Amount (-1000 across 3 fees)');
  const case8 = distributeConcessionAcrossDueFees(['fee1', 'fee2', 'fee3'], -1000);
  console.log('Result:', case8);
  const sum8 = case8.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum8, '(Expected: 0)');
  // Expected: [0, 0, 0] -> Total: 0
  console.groupEnd();

  // ─── Case 9: Many Fees (1000 across 100 fees) ────────────────────────
  console.group('Case 9: Many Fees (1000 across 100 fees)');
  const case9 = distributeConcessionAcrossDueFees(
    Array.from({ length: 100 }, (_, i) => `fee${i + 1}`),
    1000
  );
  const sum9 = case9.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  console.log('Total Sum:', sum9, '(Expected: 1000)');
  console.log('Base Amount:', Math.floor(1000 / 100), 'Remainder:', 1000 % 100);
  console.log(
    'First 5 allocations:',
    case9.slice(0, 5).map((a) => a.concessionAmount)
  );
  console.log(
    'Last 5 allocations:',
    case9.slice(-5).map((a) => a.concessionAmount)
  );
  // Expected: First 0 get 11, rest get 10 -> Total: 1000
  console.groupEnd();

  console.groupEnd();
};

// ─── Test calculatePerLineConcession ──────────────────────────────────────

export const testCalculatePerLineConcession = () => {
  console.group('Testing calculatePerLineConcession (for display)');

  const test1 = calculatePerLineConcession(10000, 4);
  console.log('10000 / 4:', test1, '(Expected: 2500)');

  const test2 = calculatePerLineConcession(20000, 6);
  console.log('20000 / 6:', test2, '(Expected: 3333)');

  const test3 = calculatePerLineConcession(5000, 0);
  console.log('5000 / 0:', test3, '(Expected: 0)');

  const test4 = calculatePerLineConcession(0, 5);
  console.log('0 / 5:', test4, '(Expected: 0)');

  console.groupEnd();
};

// ─── Comparison: Old vs New Approach ────────────────────────────────────────

export const compareOldVsNewApproach = () => {
  console.group('Comparison: Old Decimal vs New Integer Approach');

  const amount = 20000;
  const count = 6;

  // Old Approach (Decimal)
  const oldPerLine = amount / count; // 3333.333...
  const oldAllocations = Array(count).fill(oldPerLine);
  const oldSum = oldAllocations.reduce((sum, val) => sum + val, 0);

  console.group('Old Approach (Decimal):');
  console.log('Per Line:', oldPerLine);
  console.log('Allocations:', oldAllocations);
  console.log('Sum:', oldSum);
  console.log('Issue: Decimal values, hard to store/display without rounding');
  console.groupEnd();

  // New Approach (Integer Distribution)
  const newAllocations = distributeConcessionAcrossDueFees(
    Array.from({ length: count }, (_, i) => `fee${i + 1}`),
    amount
  );
  const newSum = newAllocations.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);

  console.group('New Approach (Integer):');
  console.log(
    'Allocations:',
    newAllocations.map((a) => a.concessionAmount)
  );
  console.log('Sum:', newSum);
  console.log('Benefit: Clean integers, always sum to exact total, no rounding errors');
  console.groupEnd();

  console.groupEnd();
};

// ─── Run All Tests ────────────────────────────────────────────────────────────

export const runAllTests = () => {
  testDistributeConcession();
  testCalculatePerLineConcession();
  compareOldVsNewApproach();
};

// Uncomment to run tests in browser console
// runAllTests();
