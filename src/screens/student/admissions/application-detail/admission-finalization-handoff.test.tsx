import type { AdmissionFinalizationResult } from 'src/redux/student/admissions/admission-applications-api';

import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { useAdmissionApplicationDecisions } from './use-admission-application-decisions';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const path = '*/api/student/enrollment/admissions/applications/application-1';
const values = { confirmCreateNew: true, confirmGuardianContactVerified: true };

function FinalizationHarness({
  onFinalized,
}: {
  onFinalized: (value: AdmissionFinalizationResult) => void;
}) {
  const actions = useAdmissionApplicationDecisions('application-1', 6, true);
  const [completed, setCompleted] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={actions.isBusy}
        onClick={async () => {
          setCompleted(await actions.runFinalization('approved-stamp', values, onFinalized));
        }}
      >
        Finalize
      </button>
      <output>{completed ? 'Complete' : 'Pending'}</output>
    </>
  );
}

it('hands off only a successful returned case and retains its idempotency key across a failed retry', async () => {
  const requests: Record<string, unknown>[] = [];
  const finalized = vi.fn();
  mswServer.use(
    http.get(`${path}/decision-history`, () => HttpResponse.json([])),
    http.get(`${path}/finalization-preview`, () => HttpResponse.json({ items: [] })),
    http.post(`${path}/finalize`, async ({ request }) => {
      requests.push((await request.json()) as Record<string, unknown>);
      if (requests.length === 1)
        return HttpResponse.json({ detail: 'Please retry the saved request.' }, { status: 503 });
      return HttpResponse.json({
        application: { id: 'application-1', status: 11 },
        studentId: 'student-1',
        onboardingCaseId: 'case-1',
        reusedExistingStudent: false,
      });
    })
  );
  renderDocumentUi(<FinalizationHarness onFinalized={finalized} />, [
    'Students.Admissions.Applications.Add',
  ]);
  await userEvent.click(screen.getByRole('button', { name: 'Finalize' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Finalize' })).toBeEnabled());
  expect(finalized).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Finalize' }));
  await waitFor(() => expect(finalized).toHaveBeenCalledOnce());
  expect(requests[0].idempotencyKey).toBeTruthy();
  expect(requests[1]).toEqual(requests[0]);
  expect(requests[1]).toMatchObject({ concurrencyStamp: 'approved-stamp', ...values });
  expect(finalized).toHaveBeenCalledWith(
    expect.objectContaining({ studentId: 'student-1', onboardingCaseId: 'case-1' })
  );
  expect(screen.getByText('Complete')).toBeVisible();
});
