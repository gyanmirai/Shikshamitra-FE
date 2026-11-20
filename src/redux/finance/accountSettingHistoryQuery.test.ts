import { it, expect } from 'vitest';
import { accountSettingHistoryRequest } from './accountSettingHistoryQuery';

it('preserves string callers and requests every history page explicitly', () => {
  expect(accountSettingHistoryRequest('bank-accounts', 'bank')).toEqual({ url: '/bank-accounts/bank/versions', method: 'GET', params: { skipCount: 0, maxResultCount: 50 } });
  expect(accountSettingHistoryRequest('income-categories', { id: 'income', skipCount: 50, maxResultCount: 50 })).toEqual({ url: '/income-categories/income/versions', method: 'GET', params: { skipCount: 50, maxResultCount: 50 } });
});
