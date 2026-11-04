import { beforeEach, expect, it } from 'vitest';

import {
  fixtureBaseQuery,
  resetFixture,
} from '../../e2e/fixtures/fee-collection-late-fees/mock-service';

beforeEach(() => resetFixture());

it('refreshes the synthetic grid net charge total after waiving a charge while retaining gross evidence', async () => {
  await fixtureBaseQuery({
    url: '/fee-collections/waivers',
    method: 'POST',
    body: { sourceType: 'LateFee', sourceId: 'tuition-0', reason: 'Waiver regression' },
  });
  const summary = (await fixtureBaseQuery('/fee-collections')).data as any;
  expect(summary.items[0].totalCharges).toBe(300);
  expect(summary.items[0].paidCharges).toBe(0);
  expect(summary.items[0].pendingCharges).toBe(300);
  const form = (await fixtureBaseQuery('/fee-collections/collect-form')).data as any;
  expect(form.charges.find((charge: any) => charge.sourceId === 'tuition-0')).toMatchObject({
    amount: 100,
    paidAmount: 0,
    waivedAmount: 100,
    pendingAmount: 0,
  });
});

it.each([
  ['waiver-full', 0, 0, 1],
  ['waiver-partial', 800, 500, 1],
  ['waiver-mixed', 800, 500, 2],
] as const)(
  'provides the %s browser scenario with net totals and independent source evidence',
  async (scenario, total, pending, count) => {
    resetFixture(scenario as Parameters<typeof resetFixture>[0]);
    const summary = (await fixtureBaseQuery('/fee-collections')).data as any;
    expect(summary.items[0].totalCharges).toBe(total);
    expect(summary.items[0].paidCharges).toBe(scenario === 'waiver-full' ? 0 : 300);
    expect(summary.items[0].pendingCharges).toBe(pending);
    const form = (await fixtureBaseQuery('/fee-collections/collect-form')).data as any;
    expect(form.charges).toHaveLength(count);
    if (scenario !== 'waiver-full') {
      expect(form.charges.find((charge: any) => charge.sourceType === 'LateFee')).toMatchObject({
        amount: 1000,
        paidAmount: 300,
        waivedAmount: 200,
        pendingAmount: 500,
      });
    }
    if (scenario !== 'waiver-partial') {
      expect(form.charges.find((charge: any) => charge.sourceType === 'Charge')).toMatchObject({
        amount: 5000,
        paidAmount: 0,
        waivedAmount: 5000,
        pendingAmount: 0,
      });
    }
  }
);
