import type { StudentOnboardingDocuments } from 'src/redux/student/admissions/student-onboarding-documents-api';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { studentOnboardingApi } from 'src/redux/student/admissions/student-onboarding-api';

import { OnboardingDocuments } from './onboarding-documents';
import { renderDocumentUi } from '../admissions/document-verification/document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const path = '*/api/student/onboarding/case-1/documents';
const workspace: StudentOnboardingDocuments = {
  caseId: 'case-1',
  studentId: 'student-1',
  concurrencyStamp: 'case-stamp',
  canUpload: true,
  documents: [
    {
      documentTypeId: 'type-1',
      name: 'Birth certificate',
      isRequired: true,
      maxSizeMb: 1,
      allowedExtensions: ['pdf'],
      hasStudentUpload: false,
      hasAcceptedAdmissionEvidence: false,
    },
  ],
};
const file = () => new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' });

describe('onboarding document recovery and upload', { timeout: 15000 }, () => {
  it('uploads through the active case, refreshes the checklist and case readiness', async () => {
    let uploaded = false;
    let submitted: FormData | undefined;
    let caseReads = 0;
    mswServer.use(
      http.get(path, () =>
        HttpResponse.json({
          data: {
            ...workspace,
            documents: workspace.documents.map((item) => ({ ...item, hasStudentUpload: uploaded })),
          },
        })
      ),
      http.get('*/api/student/onboarding/case-1', () => {
        caseReads += 1;
        return HttpResponse.json({ data: { id: 'case-1' } });
      }),
      http.post(path, async ({ request }) => {
        submitted = await request.formData();
        uploaded = true;
        return HttpResponse.json({ data: workspace });
      })
    );
    const store = renderDocumentUi(<OnboardingDocuments caseId="case-1" />, [
      'Students.Onboarding.View',
      'Students.Onboarding.Edit',
    ]);
    const subscription = store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('case-1')
    );
    await subscription.unwrap();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Upload Birth certificate' }));
    const dialog = screen.getByRole('dialog', { name: 'Upload Birth certificate' });
    await user.upload(within(dialog).getByLabelText('Document *'), file());
    await user.click(within(dialog).getByRole('button', { name: 'Upload document' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(submitted?.get('documentTypeId')).toBe('type-1');
    expect(submitted?.get('concurrencyStamp')).toBe('case-stamp');
    expect(submitted?.get('file')).toBeInstanceOf(File);
    await waitFor(() => expect(caseReads).toBe(2));
    expect(await screen.findByText('Student upload on file')).toBeInTheDocument();
    subscription.unsubscribe();
  });
  it('shows accepted admission evidence without offering uploads to a read-only user', async () => {
    mswServer.use(
      http.get(path, () =>
        HttpResponse.json({
          data: {
            ...workspace,
            canUpload: false,
            documents: workspace.documents.map((item) => ({
              ...item,
              hasAcceptedAdmissionEvidence: true,
            })),
          },
        })
      )
    );
    renderDocumentUi(<OnboardingDocuments caseId="case-1" />, ['Students.Onboarding.View']);
    expect(await screen.findByText('Accepted admission evidence')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Upload Birth/ })).not.toBeInTheDocument();
  });
  it('preserves the chosen file after a failed request and permits retry', async () => {
    let attempt = 0;
    mswServer.use(
      http.get(path, () => HttpResponse.json({ data: workspace })),
      http.post(path, () => {
        attempt += 1;
        return attempt === 1
          ? HttpResponse.json({ detail: 'Storage unavailable. Try again.' }, { status: 503 })
          : HttpResponse.json({ data: workspace });
      })
    );
    renderDocumentUi(<OnboardingDocuments caseId="case-1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Upload Birth certificate' }));
    const dialog = screen.getByRole('dialog', { name: 'Upload Birth certificate' });
    await user.upload(within(dialog).getByLabelText('Document *'), file());
    await user.click(within(dialog).getByRole('button', { name: 'Upload document' }));
    expect(await within(dialog).findByText('Storage unavailable. Try again.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Document *')).toHaveValue('C:\\fakepath\\birth.pdf');
    await user.click(within(dialog).getByRole('button', { name: 'Upload document' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(attempt).toBe(2);
  });
});
