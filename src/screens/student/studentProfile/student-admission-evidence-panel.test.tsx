import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { documentEvidence } from 'src/redux/student/admissions/document-test-fixture';
import { renderDocumentUi } from 'src/screens/student/admissions/document-verification/document-ui-test-fixture';

import { StudentAdmissionEvidencePanel } from './student-admission-evidence-panel';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const path = '*/api/student/records/students/student-1/admission-evidence';
it.each([true, false])('shows retained evidence with canonical view grants and server download capability %s, without mutation controls', async (canDownload) => {
  mswServer.use(
    http.get(path, () =>
      HttpResponse.json({
        data: [
          {
            ...documentEvidence,
            canDownload,
            applicationId: 'application-1',
            stageInstanceId: 'stage-documents',
            requirementCode: 'BIRTH_CERTIFICATE',
            requirementLabel: 'Birth certificate',
            studentLinkedAt: '2026-09-10T12:00:00Z',
            status: 'accepted',
          },
        ],
      })
    )
  );
  renderDocumentUi(<StudentAdmissionEvidencePanel studentId="student-1" />, [
    'View',
    'Students.Records.StudentList.View',
  ]);
  await userEvent.click(await screen.findByRole('button', { name: /Birth certificate/ }));
  expect(await screen.findByText('birth-certificate.pdf')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', {
      name: /^(Upload document|Accept|Waive requirement|Request replacement)$/,
    })
  ).not.toBeInTheDocument();
  expect(Boolean(screen.queryByRole('button', { name: 'Download' }))).toBe(canDownload);
});

it.each([['View'], ['Students.Records.StudentList.View']])('does not request student evidence when only %s is granted', (grant) => {
  let requests = 0;
  mswServer.use(
    http.get(path, () => {
      requests += 1;
      return HttpResponse.json([]);
    })
  );
  renderDocumentUi(<StudentAdmissionEvidencePanel studentId="student-1" />, [grant]);
  expect(
    screen.getByText(/Student record and admission document access are required/)
  ).toBeInTheDocument();
  expect(requests).toBe(0);
});
