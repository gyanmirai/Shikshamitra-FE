import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';

const params = new URLSearchParams(window.location.search);
let restored = false;
export function completeSetup() {
  restored = true;
}
export const api = createApi({
  reducerPath: 'prerequisiteFixtureApi',
  tagTypes,
  endpoints: () => ({}),
  baseQuery: async (input: any) => {
    await new Promise((resolve) => setTimeout(resolve, params.has('slow') ? 2500 : 100));
    if (params.has('error'))
      return { error: { status: 500, data: { detail: 'Synthetic lookup failure.' } } };
    const args = typeof input === 'string' ? { url: input } : input;
    if (args.url.endsWith('/fee-heads/active'))
      return {
        data: restored ? [{ id: 'head', name: 'Tuition fee', academicYearId: 'year' }] : [],
      };
    if (args.url === '/finance-routing-options')
      return {
        data: {
          incomeCategories:
            restored || params.get('missing') !== 'category'
              ? [{ id: 'income', label: 'Other income' }]
              : [],
          expenseCategories:
            restored || params.get('missing') !== 'category'
              ? [{ id: 'expense', label: 'Supplies' }]
              : [],
          bankAccounts:
            restored || params.get('missing') !== 'bank'
              ? [{ id: 'bank', label: 'School account - 4321' }]
              : [],
        },
      };
    if (args.url.endsWith('/options'))
      return {
        data: {
          bankAccounts: restored ? [{ id: 'bank', label: 'School account - 4321' }] : [],
          cashSources: [
            {
              id: 'cash',
              label: 'Synthetic cash receipt',
              remainingAmount: 100,
              concurrencyStamp: 'v1',
            },
          ],
        },
      };
    return { data: { items: [], totalCount: 0 } };
  },
});
