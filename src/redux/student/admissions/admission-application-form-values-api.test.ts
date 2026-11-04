import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationsApi } from './admission-applications-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

it.each([{ hints: undefined }, { hints: [] }, { hints: ['GENERIC'] }])(
  'preserves the changed-only PATCH transport and optional projection hints $hints',
  async ({ hints }) => {
    const store = createDocumentTestStore();
    let submitted: unknown;
    mswServer.use(
      http.patch(
        '*/api/student/enrollment/admissions/applications/application/form-values',
        async ({ request }) => {
          submitted = await request.json();
          return HttpResponse.json({ data: { values: [] } });
        }
      )
    );
    const values = [
      { fieldCode: 'CANONICAL', valueJson: '""' },
      { fieldCode: 'GENERIC', valueJson: '"Teacher"' },
    ];
    try {
      await store
        .dispatch(
          admissionApplicationsApi.endpoints.updateAdmissionApplicationFormValues.initiate({
            id: 'application',
            concurrencyStamp: 'current',
            values,
            autoFilledFieldCodes: hints,
          })
        )
        .unwrap();
      expect(submitted).toEqual(
        hints?.length
          ? { concurrencyStamp: 'current', values, autoFilledFieldCodes: ['GENERIC'] }
          : { concurrencyStamp: 'current', values }
      );
    } finally {
      store.dispatch(api.util.resetApiState());
    }
  }
);
