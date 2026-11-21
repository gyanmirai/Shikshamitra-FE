import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';

import { libraryFinanceApi } from './finance-external-api';
import {
  form,
  source,
  collection,
  receivable,
  collectBody,
  financeTestStore,
} from './finance-external.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const root = 'http://library.test/api/finance/external-receivables';

it.each([true, false])(
  'refreshes source and collection form only after an accepted collection (accepted=%s)',
  async (accepted) => {
    const counts = { source: 0, form: 0 };
    mswServer.use(
      http.get(root, () => {
        counts.source += 1;
        return HttpResponse.json(receivable);
      }),
      http.get(`${root}/collect-form`, () => {
        counts.form += 1;
        return HttpResponse.json(form);
      }),
      http.post(`${root}/collections`, () =>
        accepted
          ? HttpResponse.json(collection)
          : HttpResponse.json({ errorCode: 'Library:Finance:010113' }, { status: 409 })
      )
    );
    const store = financeTestStore();
    const subscriptions = [
      store.dispatch(libraryFinanceApi.endpoints.getFinanceExternalReceivable.initiate(source)),
      store.dispatch(libraryFinanceApi.endpoints.getFinanceExternalCollectForm.initiate(source)),
    ];
    try {
      await Promise.all(subscriptions.map((request) => request.unwrap()));
      const command = store.dispatch(
        libraryFinanceApi.endpoints.collectFinanceExternalReceivable.initiate(collectBody)
      );
      if (accepted) {
        await command.unwrap();
        await waitFor(() => expect(counts).toEqual({ source: 2, form: 2 }));
      } else {
        await expect(command.unwrap()).rejects.toMatchObject({ status: 409 });
        await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
        expect(counts).toEqual({ source: 1, form: 1 });
      }
    } finally {
      subscriptions.forEach((request) => request.unsubscribe());
    }
  }
);
