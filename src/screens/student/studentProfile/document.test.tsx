import type { StudentAdmissionEvidence } from 'src/redux/student/admissions/student-admission-evidence-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalState from 'src/redux/globalState/globalSlice';
import { studentRegistrationType } from 'src/redux/tagTypes';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, cleanup } from '@testing-library/react';

import Document from './document';
import { studentDocumentUploadStatuses } from './student-document-table-model';

const responsive = vi.hoisted(() => ({ compact: false }));
vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => responsive.compact }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('@mui/icons-material', () => {
  const Icon = () => <svg aria-hidden="true" />;
  return Object.fromEntries(
    [
      'Close',
      'Info',
      'Error',
      'CheckCircle',
      'WarningAmber',
      'ArrowUpward',
      'ArrowDownward',
      'Clear',
      'Search',
      'RemoveRedEye',
      'ExpandLess',
      'ExpandMore',
    ].map((name) => [name, Icon])
  );
});
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const studentId = 'ad400001-0000-4000-8000-000000000001';
const documentsPath = '*/api/app/student-document/required-documents-status/:studentId';
const filePath = '*/api/app/student-document/document';
const uploadPath = '*/api/app/student-document/upload-document/:studentId';
const evidencePath = '*/api/student/records/students/:studentId/admission-evidence';
const evidence: StudentAdmissionEvidence = {
  id: 'evidence-1',
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  requirementCode: 'birth',
  requirementLabel: 'Birth certificate',
  versionNumber: 1,
  kind: 'upload',
  fileName: 'birth.pdf',
  originalSeen: true,
  submittedBy: 'staff-1',
  submittedAt: '2026-10-10T10:00:00Z',
  status: 'accepted',
  canDownload: true,
  reviews: [
    {
      id: 'review-1',
      decision: 'accepted',
      reviewedBy: 'staff-1',
      reviewedAt: '2026-10-10T11:00:00Z',
      reason: 'Verified against the original',
    },
  ],
};
const requirement = {
  documentTypeId: 'type-1',
  documentTypeName: 'Student photo',
  isUploaded: false,
};
const createStore = () =>
  configureStore({
    reducer: { auth, globalState, confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const stores: ReturnType<typeof createStore>[] = [];
function stubDocumentUrls(url = 'blob:student-document') {
  const createUrl = vi.fn(() => url);
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createUrl;

      static revokeObjectURL = vi.fn();
    }
  );
  return createUrl;
}
const showDocuments = (
  grants = [
    'Students.Records.StudentList.View',
    'Students.Records.StudentList.Add',
    'Students.Admissions.Documents.View',
  ],
  status = 6
) => {
  const store = createStore();
  stores.push(store);
  store.dispatch(setPermissions(grants.map((name) => ({ name, isGranted: true }))));
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Document
          student={{
            id: studentId,
            studentId,
            firstName: 'Aanya',
            middleName: null,
            lastName: 'Patel',
            grNo: 123,
            grNumber: 'GR-123',
            rollNo: 7,
            standardId: null,
            standardName: null,
            divisionId: null,
            divisionName: null,
            academicMediumId: 'medium-1',
            academicMediumName: 'English',
            status,
            dateOfBirth: null,
            gender: null,
          }}
        />
      </ThemeProvider>
    </Provider>
  );
};
beforeEach(() => {
  responsive.compact = false;
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-document-token' })),
    http.get(documentsPath, () => HttpResponse.json({ data: [] })),
    http.get(evidencePath, () => HttpResponse.json({ data: [] }))
  );
});
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Student profile documents', { timeout: 15000 }, () => {
  it('keeps compact document names readable while pinning 44px Actions and allowing Status to scroll', async () => {
    responsive.compact = true;
    mswServer.use(
      http.get(documentsPath, () => HttpResponse.json([requirement])),
      http.get(evidencePath, () => HttpResponse.json([evidence]))
    );
    showDocuments();
    expect(await screen.findByText('Birth certificate')).toBeVisible();
    const nameCell = screen.getByText('Student photo').closest('td');
    expect(nameCell).toHaveStyle({ whiteSpace: 'normal', minWidth: '136px' });
    expect(screen.getByText('Accepted').closest('td')).toHaveStyle({ position: 'static' });
    const buttons = [
      'View Student photo',
      'Download Student photo',
      'More actions for Student photo',
    ].map((name) => screen.getByRole('button', { name }));
    buttons.forEach((button) => expect(button).toHaveStyle({ width: '44px', height: '44px' }));
    expect(buttons[0].closest('td')).toHaveStyle({ position: 'sticky', minWidth: '156px' });
  });
  it('skips both document sources when Student List access is unavailable', async () => {
    let reads = 0;
    mswServer.use(
      http.get(documentsPath, () => {
        reads += 1;
        return HttpResponse.json({ data: [requirement] });
      }),
      http.get(evidencePath, () => {
        reads += 1;
        return HttpResponse.json({ data: [evidence] });
      })
    );
    showDocuments([]);
    expect(
      screen.getByText('Student document access is unavailable.', { exact: false })
    ).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await waitFor(() => expect(reads).toBe(0));
  });
  it('places retained evidence and ordinary requirements in one searchable table without an evidence card or fabricated uploads', async () => {
    mswServer.use(
      http.get(documentsPath, () => HttpResponse.json({ data: [requirement] })),
      http.get(evidencePath, () => HttpResponse.json({ data: [evidence] }))
    );
    showDocuments();
    expect(await screen.findByText('Birth certificate')).toBeVisible();
    expect(screen.getByText('Student photo')).toBeVisible();
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.queryByText('Admission evidence')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for Birth certificate' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Student photo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download Student photo' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Version 1 · Latest')).toBeVisible();
    expect(within(dialog).getByText('Verified against the original')).toBeVisible();
  });

  it('downloads evidence only through its canonical student Records endpoint', async () => {
    let requestStudentId: unknown;
    mswServer.use(
      http.get(evidencePath, () => HttpResponse.json({ data: [evidence] })),
      http.get(`${evidencePath}/:evidenceId/download`, ({ params }) => {
        requestStudentId = params.studentId;
        return new HttpResponse('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } });
      })
    );
    const createUrl = stubDocumentUrls();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    showDocuments();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Download Birth certificate' })
    );
    await waitFor(() => expect(requestStudentId).toBe(studentId));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(createUrl).toHaveBeenCalledOnce();
  });

  it('does not query or reveal protected evidence without its existing admission document permission', async () => {
    let evidenceReads = 0;
    mswServer.use(
      http.get(evidencePath, () => {
        evidenceReads += 1;
        return HttpResponse.json({ data: [evidence] });
      })
    );
    showDocuments(['Students.Records.StudentList.View']);
    expect(await screen.findByText('No documents are available for this student.')).toBeVisible();
    expect(evidenceReads).toBe(0);
    expect(screen.queryByText('Birth certificate')).not.toBeInTheDocument();
  });

  it('keeps ordinary document uploads unavailable with an explanation for a View-only staff member', async () => {
    let uploads = 0;
    mswServer.use(
      http.get(documentsPath, () => HttpResponse.json([requirement])),
      http.post(uploadPath, () => {
        uploads += 1;
        return HttpResponse.json({ documentId: 'file-1' });
      })
    );
    showDocuments(
      ['Students.Records.StudentList.View', 'Students.Admissions.Documents.View'],
      studentDocumentUploadStatuses.registration
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'More actions for Student photo' })
    );
    expect(screen.getByRole('button', { name: 'Upload document' })).toBeDisabled();
    expect(
      screen.getByText('Student record update access is required to upload documents.')
    ).toBeVisible();
    const input = screen.getByLabelText('Upload Student photo');
    expect(input).toBeDisabled();
    await userEvent.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
    expect(uploads).toBe(0);
  });

  it('preserves successful evidence rows during a student-document failure and retries only that source', async () => {
    let documentReads = 0;
    let evidenceReads = 0;
    mswServer.use(
      http.get(documentsPath, () => {
        documentReads += 1;
        return documentReads === 1
          ? HttpResponse.json({ detail: 'Temporary outage' }, { status: 503 })
          : HttpResponse.json({ data: [requirement] });
      }),
      http.get(evidencePath, () => {
        evidenceReads += 1;
        return HttpResponse.json({ data: [evidence] });
      })
    );
    showDocuments();
    expect(await screen.findByText('Birth certificate')).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Retry Student Documents' })).toBeVisible();
    expect(
      screen.queryByText('No documents are available for this student.')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry Student Documents' }));
    expect(await screen.findByText('Student photo')).toBeVisible();
    expect(documentReads).toBe(2);
    expect(evidenceReads).toBe(1);
  });

  it.each([6, 7, 8])(
    'preserves the existing registration-only upload rule for lifecycle status %s even with Add access',
    async (status) => {
      let uploads = 0;
      mswServer.use(
        http.get(documentsPath, () => HttpResponse.json([requirement])),
        http.post(uploadPath, () => {
          uploads += 1;
          return HttpResponse.json({ documentId: 'file-1' });
        })
      );
      showDocuments(undefined, status);
      await userEvent.click(
        await screen.findByRole('button', { name: 'More actions for Student photo' })
      );
      expect(screen.getByRole('button', { name: 'Upload document' })).toBeDisabled();
      expect(
        screen.getByText('Student documents can be uploaded during registration.')
      ).toBeVisible();
      const input = screen.getByLabelText('Upload Student photo');
      expect(input).toBeDisabled();
      await userEvent.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
      expect(uploads).toBe(0);
    }
  );

  it('shows a blocking source failure instead of presenting an empty success', async () => {
    mswServer.use(
      http.get(evidencePath, () =>
        HttpResponse.json({ detail: 'Temporary outage' }, { status: 503 })
      )
    );
    showDocuments();
    expect(await screen.findByRole('button', { name: 'Retry Admission Documents' })).toBeVisible();
    expect(
      screen.queryByText('No documents are available for this student.')
    ).not.toBeInTheDocument();
  });

  it('retains loaded rows after a transient refetch failure and masks them when the retry loses access', async () => {
    let reads = 0;
    mswServer.use(
      http.get(documentsPath, () => {
        reads += 1;
        return reads === 1
          ? HttpResponse.json([requirement])
          : HttpResponse.json({ detail: 'Unavailable' }, { status: reads === 2 ? 503 : 403 });
      })
    );
    showDocuments();
    expect(await screen.findByText('Student photo')).toBeVisible();
    await act(async () => {
      stores
        .at(-1)!
        .dispatch(
          api.util.invalidateTags([
            { type: studentRegistrationType.studentDocument, id: studentId },
          ])
        );
    });
    expect(await screen.findByRole('button', { name: 'Retry Student Documents' })).toBeVisible();
    expect(screen.getByText('Student photo')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Retry Student Documents' }));
    await waitFor(() => expect(screen.queryByText('Student photo')).not.toBeInTheDocument());
    expect(reads).toBe(3);
  });

  it('uses table-shaped loading and restores documents when no-results search is cleared', async () => {
    mswServer.use(
      http.get(evidencePath, async () => {
        await delay(150);
        return HttpResponse.json({ data: [evidence] });
      })
    );
    showDocuments();
    expect(screen.getByRole('textbox', { name: 'Search student documents' })).toBeVisible();
    expect(
      screen.queryByText('No documents are available for this student.')
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Birth certificate')).toBeVisible();
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search student documents' }),
      'no-document-match'
    );
    const recovery = await screen.findByText('Clear search', { selector: 'button' });
    expect(recovery).toHaveAccessibleName('Clear search');
    await userEvent.click(recovery);
    expect(await screen.findByText('Birth certificate')).toBeVisible();
  });

  it('uploads an ordinary requirement using its existing endpoint and retains inline invalid-format feedback', async () => {
    let uploadedType: unknown;
    mswServer.use(
      http.get(documentsPath, () => HttpResponse.json({ data: [requirement] })),
      http.post(uploadPath, async ({ request }) => {
        const payload = (await request.json()) as Record<string, unknown>;
        uploadedType = payload.documentTypeId;
        expect(payload).toMatchObject({
          fileName: 'photo.txt',
          contentType: 'text/plain',
          size: 7,
          content: btoa('invalid'),
        });
        return HttpResponse.json(
          { error: { code: 'Document:InvalidFormat', data: { AcceptedFormats: ['JPG', 'PNG'] } } },
          { status: 400 }
        );
      })
    );
    showDocuments(undefined, studentDocumentUploadStatuses.registration);
    await userEvent.click(
      await screen.findByRole('button', { name: 'More actions for Student photo' })
    );
    const input = screen.getByLabelText('Upload Student photo');
    await userEvent.upload(input, new File(['invalid'], 'photo.txt', { type: 'text/plain' }));
    expect(
      await screen.findByText('Invalid format for Student photo. Accepted formats: JPG, PNG')
    ).toBeVisible();
    expect(uploadedType).toBe('type-1');
    expect(screen.getByRole('button', { name: 'View Student photo' })).toBeDisabled();
  });

  it('preserves the student document preview context after a failed file read and retries that exact file', async () => {
    let fileReads = 0;
    mswServer.use(
      http.get(documentsPath, () =>
        HttpResponse.json({
          data: [{ ...requirement, isUploaded: true, uploadedDocumentId: 'student-file-1' }],
        })
      ),
      http.get(filePath, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('studentId')).toBe(studentId);
        expect(params.get('documentId')).toBe('student-file-1');
        fileReads += 1;
        return fileReads === 1
          ? HttpResponse.json({ detail: 'Temporary outage' }, { status: 503 })
          : HttpResponse.json({
              fileName: 'photo.pdf',
              contentType: 'application/pdf',
              content: btoa('%PDF-1.7'),
            });
      })
    );
    stubDocumentUrls('about:blank');
    showDocuments();
    await userEvent.click(await screen.findByRole('button', { name: 'View Student photo' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('button', { name: 'Retry preview' })).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Retry preview' }));
    expect(await within(dialog).findByTitle('Student document')).toBeVisible();
    expect(fileReads).toBe(2);
  });
});
