import type { FinanceSetupState, FinanceSetupProgress } from 'src/redux/finance/setup/types';

import { createApi } from '@reduxjs/toolkit/query/react';
import { tagTypes } from 'src/redux/tagTypes';

const definitions = [
  'income-categories',
  'expense-categories',
  'bank-accounts',
  'fee-categories',
  'payment-terms',
  'charge-categories',
  'concession-types',
  'collection-policy',
  'refund-policy',
  'concession-policy',
  'proration-policy',
  'fee-structures',
];
const documents = new Map<string, FinanceSetupState>();
let conflictRaised = false;

function initialState(year: string): FinanceSetupState {
  const params = new URLSearchParams(window.location.search);
  return {
    academicYearId: year,
    concurrencyStamp: 'v1',
    currentStageKey: 'accounts',
    currentSettingKey: 'income-categories',
    deferredSettingKeys: [],
    reviewedAt: null,
    settings: definitions.map((key, index) => ({
      key,
      canView: !params.has('limited') || index < 3,
      canManage: !params.has('readonly'),
      configurationState: params.has('configured') && year === 'year-a' ? 'configured' : 'empty',
    })),
  };
}

export const api = createApi({
  reducerPath: 'api',
  tagTypes,
  baseQuery: async (
    args: string | { url: string; method?: string; body?: FinanceSetupProgress }
  ) => {
    const request = typeof args === 'string' ? { url: args } : args;
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (new URLSearchParams(window.location.search).has('loadError'))
      return { error: { status: 500, data: { detail: 'Synthetic configuration error' } } };
    const year = /\/finance\/setup\/([^/]+)/.exec(request.url)?.[1];
    if (!year) return { error: { status: 404, data: {} } };
    const state = documents.get(year) ?? initialState(year);
    documents.set(year, state);
    if (request.method === 'PUT' && request.body) {
      if (new URLSearchParams(window.location.search).has('conflict') && !conflictRaised) {
        conflictRaised = true;
        state.concurrencyStamp = 'v2';
        return { error: { status: 409, data: { detail: 'Synthetic conflict' } } };
      }
      if (request.body.concurrencyStamp !== state.concurrencyStamp)
        return { error: { status: 409, data: {} } };
      state.currentStageKey = request.body.currentStageKey;
      state.currentSettingKey = request.body.currentSettingKey;
      state.deferredSettingKeys = request.body.deferredSettingKeys;
      state.reviewedAt = request.body.finishReview ? new Date().toISOString() : null;
      state.concurrencyStamp = `v${Number(state.concurrencyStamp.slice(1)) + 1}`;
    }
    return { data: structuredClone(state) };
  },
  endpoints: () => ({}),
});
