import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import { admissionFormsApi } from './admission-forms-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn().mockResolvedValue(null) }));

it('reads a saved approved source through GET without a draft or approval mutation', async () => {
  const store = createDocumentTestStore();
  const request = vi.fn();
  mswServer.use(
    http.get(
      '*/api/student/enrollment/admissions/forms/registration/inheritance-preview',
      ({ request: input }) => {
        const url = new URL(input.url);
        request(input.method, Object.fromEntries(url.searchParams));
        return HttpResponse.json({
          data: {
            inquiryFormDefinitionId: 'approved-source',
            isValid: true,
            definition: { id: 'registration' },
            inquiryContextSections: [],
          },
        });
      }
    )
  );
  try {
    const result = await store
      .dispatch(
        admissionFormsApi.endpoints.getSavedAdmissionFormInheritancePreview.initiate({
          id: 'registration',
          inquiryFormDefinitionId: 'approved-source',
        })
      )
      .unwrap();
    expect(request).toHaveBeenCalledWith('GET', { inquiryFormDefinitionId: 'approved-source' });
    expect(result.inquiryFormDefinitionId).toBe('approved-source');
  } finally {
    store.dispatch(api.util.resetApiState());
  }
});
