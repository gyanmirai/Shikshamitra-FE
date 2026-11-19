import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import CertificateGenerationDrawer from './certificate-generation-drawer';

const mocks = vi.hoisted(() => ({
  year: 'year-1',
  issue: vi.fn(),
  preview: vi.fn(),
  download: vi.fn(),
  save: vi.fn(),
  close: vi.fn(),
  history: vi.fn(),
  transitions: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: mocks.year } },
      auth: {
        permissions: ['Certificates.View', 'Certificates.Add', 'Transitions.View'].map(
          (action) => ({
            name: `Students.Records.${action}`,
            isGranted: true,
          })
        ),
      },
    }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: (_dirty: boolean, options: any) => ({
    confirmation: null,
    requestNavigation: (next: () => void) => {
      if (!options.blockNavigation) next();
    },
  }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, disabled, onChange }: any) => (
    <input
      aria-label={label}
      type="date"
      disabled={disabled}
      value={value?.format('YYYY-MM-DD') ?? ''}
      onChange={(event) =>
        onChange({
          isValid: () => !!event.target.value,
          toISOString: () => new Date(`${event.target.value}T00:00:00+05:30`).toISOString(),
          format: () => `${event.target.value}T00:00:00+05:30`,
        })
      }
    />
  ),
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, action, children }: any) => (
    <section aria-label={title}>
      <h3>{title}</h3>
      {action}
      {children}
    </section>
  ),
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../../onboarding/student-setup/student-assignment-drawer', () => ({
  default: ({ title, children, actions, onClose, busy, context }: any) => (
    <section role="dialog" aria-label={title}>
      <button type="button" onClick={onClose} disabled={busy}>
        Close drawer
      </button>
      {context}
      {children}
      {actions}
    </section>
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ children, toastAction }: any) => (
    <div>
      {children}
      {toastAction}
    </div>
  ),
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionsQuery: ({ studentId }: { studentId: string }) => ({
    currentData: { items: mocks.transitions(studentId) },
    isFetching: false,
  }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => {
  const preview = (input: any) => ({ unwrap: () => mocks.preview(input) });
  return {
    usePreviewRecordCertificateMutation: () => [preview],
    useIssueRecordCertificateMutation: () => [
      (input: any) => ({ unwrap: () => mocks.issue(input) }),
    ],
    useDownloadRecordDocumentMutation: () => [
      (input: any) => ({ unwrap: () => mocks.download(input) }),
      { isLoading: false },
    ],
    downloadRecordPdf: (...args: any[]) => mocks.save(...args),
  };
});
const students: StudentDirectoryItem[] = [
  {
    id: 'ravi',
    studentId: 'ravi',
    firstName: 'Ravi',
    lastName: 'Shah',
    maskedFields: [],
    status: 6,
    entrySource: 'CompletedOnboarding',
    hasPhoto: false,
    academicYearId: 'year-1',
  },
  {
    id: 'asha',
    studentId: 'asha',
    firstName: 'Asha',
    lastName: 'Patel',
    maskedFields: [],
    status: 6,
    entrySource: 'CompletedOnboarding',
    hasPhoto: false,
    academicYearId: 'year-1',
  },
];
const response = (id: string) => ({
  certificateId: `certificate-${id}`,
  certificateNo: `BON-${id}`,
  certificateType: 'Bonafide',
  issueDate: '2026-11-16T00:00:00Z',
  status: 'Generated',
  student: { studentId: id, studentName: id === 'ravi' ? 'Ravi Shah' : 'Asha Patel' },
  template: { renderedHeaderContent: 'School certificate', renderedFooterContent: '' },
  certificateData: {},
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.year = 'year-1';
  mocks.transitions.mockReturnValue([]);
  mocks.preview.mockImplementation(async ({ studentId }) => ({
    ...response(studentId),
    certificateId: null,
  }));
  mocks.issue.mockImplementation(async ({ studentId }) => response(studentId));
  mocks.download.mockResolvedValue(new Blob(['pdf']));
});
const renderDrawer = (chosen = [students[0]]) =>
  render(
    <CertificateGenerationDrawer
      students={chosen}
      academicYearId="year-1"
      onClose={mocks.close}
      onViewHistory={mocks.history}
    />
  );

it('opens for the selected student with type choices, without academic/student re-selection or issuing on open', () => {
  renderDrawer();
  expect(screen.getByRole('dialog', { name: 'Generate Certificate' })).toBeInTheDocument();
  expect(screen.getByText('Ravi Shah')).toBeInTheDocument();
  expect(screen.getByRole('radiogroup', { name: 'Certificate Type' })).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  expect(screen.getByText('Choose a certificate type to preview it.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Certificate preview for Ravi Shah')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Class' })).not.toBeInTheDocument();
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(mocks.issue).not.toHaveBeenCalled();
});

it('uses the same school branding choice for the preview, issuance and retry', async () => {
  const image = 'data:image/png;base64,banner';
  mocks.preview.mockImplementation(async ({ studentId, includeBranding, omitSchoolBranding }) => ({
    ...response(studentId),
    certificateId: null,
    template: {
      ...response(studentId).template,
      schoolIdentity: omitSchoolBranding ? {} : { bannerAssetId: 'banner-1' },
    },
    branding: includeBranding && !omitSchoolBranding ? { bannerDataUrl: image } : undefined,
  }));
  mocks.issue.mockRejectedValueOnce(new Error('Response lost after issuance'));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  const toggle = screen.getByRole('switch', { name: 'Include school logo / banner' });
  expect(toggle).toBeChecked();
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  await waitFor(() => expect(screen.getByRole('img', { name: 'School letterhead' })).toBeVisible());

  fireEvent.click(toggle);
  const submit = screen.getByRole('button', { name: 'Generate & download' });
  expect(submit).toBeDisabled();
  expect(screen.queryByRole('img', { name: 'School letterhead' })).not.toBeInTheDocument();
  await waitFor(() => expect(submit).toBeEnabled());
  expect(screen.queryByRole('img', { name: 'School letterhead' })).not.toBeInTheDocument();
  expect(mocks.preview).toHaveBeenLastCalledWith(
    expect.objectContaining({ omitSchoolBranding: true, includeBranding: false })
  );

  fireEvent.click(toggle);
  await waitFor(() => expect(screen.getByRole('img', { name: 'School letterhead' })).toBeVisible());
  fireEvent.click(toggle);
  await waitFor(() => expect(submit).toBeEnabled());
  fireEvent.click(submit);
  const retry = await screen.findByRole('button', { name: 'Retry remaining certificates' });
  expect(toggle).toBeDisabled();
  expect(mocks.preview).toHaveBeenLastCalledWith(
    expect.objectContaining({ omitSchoolBranding: true })
  );
  const attemptedRequest = mocks.issue.mock.calls[0][0];
  expect(attemptedRequest.omitSchoolBranding).toBe(true);
  fireEvent.click(retry);
  await waitFor(() => expect(mocks.save).toHaveBeenCalled());
  expect(mocks.issue).toHaveBeenLastCalledWith(attemptedRequest);
  expect(mocks.download).toHaveBeenCalledWith({ kind: 'certificates', id: 'certificate-ravi' });
});
it('previews inline, issues only after confirmation and downloads without closing the generated result', async () => {
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByLabelText('Certificate preview for Ravi Shah')).toBeInTheDocument()
  );
  expect(mocks.issue).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() => expect(screen.getByText('BON-ravi')).toBeInTheDocument());
  expect(mocks.issue.mock.calls[0][0].studentId).toBe('ravi');
  expect(mocks.issue.mock.calls[0][0].expectedAcademicYearId).toBe('year-1');
  expect(mocks.preview.mock.calls[0][0].expectedAcademicYearId).toBe('year-1');
  expect(mocks.save).toHaveBeenCalled();
  expect(mocks.close).not.toHaveBeenCalled();
});
it('retries an unchanged failed preview while preserving the entered purpose', async () => {
  mocks.preview.mockRejectedValueOnce(new Error('temporary preview failure'));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Purpose / reason' }), {
    target: { value: 'Scholarship application' },
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry preview' })).toBeInTheDocument()
  );
  const initialRequest = mocks.preview.mock.calls[0][0];
  fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  expect(mocks.preview.mock.calls[1][0]).toEqual(initialRequest);
  expect(initialRequest.certificateFields.Reason).toBe('Scholarship application');
  expect(screen.getByRole('textbox', { name: 'Purpose / reason' })).toHaveValue(
    'Scholarship application'
  );
  expect(mocks.issue).not.toHaveBeenCalled();
});
it('retries partial issuance with the original student keys and does not issue again when downloading an existing result', async () => {
  mocks.issue
    .mockImplementationOnce(async () => response('ravi'))
    .mockRejectedValueOnce(new Error('temporary'));
  renderDrawer(students);
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry remaining certificates' })).toBeInTheDocument()
  );
  const firstKey = mocks.issue.mock.calls[1][0].idempotencyKey;
  fireEvent.click(screen.getByRole('button', { name: 'Retry remaining certificates' }));
  await waitFor(() => expect(screen.getByText('BON-asha')).toBeInTheDocument());
  expect(mocks.issue.mock.calls.filter(([input]) => input.studentId === 'ravi')).toHaveLength(1);
  expect(mocks.issue.mock.calls[2][0].idempotencyKey).toBe(firstKey);
});
it('retains an issued certificate after a PDF failure and retries download without generating it again', async () => {
  mocks.download.mockRejectedValueOnce(new Error('PDF unavailable'));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Download BON-ravi' })).toBeInTheDocument()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Download BON-ravi' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalled());
  expect(mocks.issue).toHaveBeenCalledTimes(1);
});
it('blocks issuance when the global academic year changes', async () => {
  const view = renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  mocks.year = 'year-2';
  view.rerender(
    <CertificateGenerationDrawer
      students={[students[0]]}
      academicYearId="year-1"
      onClose={mocks.close}
    />
  );
  expect(screen.getByText(/academic year changed/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Generate & download' })).toBeDisabled();
  expect(mocks.issue).not.toHaveBeenCalled();
});

it('moves Leaving validation to the first student missing a linked exit case', async () => {
  mocks.transitions.mockImplementation((studentId: string) =>
    studentId === 'ravi'
      ? [{ id: 'exit-ravi', outcome: 'Transfer', status: 'Approved' }]
      : [
          { id: 'exit-asha-transfer', outcome: 'Transfer', status: 'Approved' },
          { id: 'exit-asha-withdraw', outcome: 'Withdraw', status: 'Approved' },
        ]
  );
  renderDrawer(students);
  fireEvent.click(screen.getByRole('radio', { name: /Leaving/ }));
  const submit = screen.getByRole('button', { name: 'Generate & download' });
  await waitFor(() => expect(submit).toBeEnabled());

  fireEvent.click(submit);

  expect(await screen.findByText('Choose an eligible exit case for Asha Patel.')).toHaveAttribute(
    'role',
    'alert'
  );
  expect(screen.getByRole('region', { name: 'Selected certificate student' })).toHaveTextContent(
    'Asha Patel'
  );
  expect(screen.getByRole('combobox', { name: /Linked exit case/ })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  expect(mocks.issue).not.toHaveBeenCalled();
});

it('does not issue through form submission while the inline preview is still pending', async () => {
  mocks.preview.mockImplementationOnce(() => new Promise(() => {}));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(1));
  const button = screen.getByRole('button', { name: 'Generate & download' }) as HTMLButtonElement;
  expect(button).toBeDisabled();
  fireEvent.submit(button.form!);
  await act(async () => {
    await Promise.resolve();
  });
  expect(mocks.issue).not.toHaveBeenCalled();
});

it('does not issue further batch students after the drawer unmounts', async () => {
  let finishIssue: (value: any) => void = () => {};
  mocks.issue.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishIssue = resolve;
      })
  );
  const view = renderDrawer(students);
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() => expect(mocks.issue).toHaveBeenCalledTimes(1));
  view.unmount();
  await act(async () => finishIssue(response('ravi')));
  expect(mocks.issue).toHaveBeenCalledTimes(1);
  expect(mocks.download).not.toHaveBeenCalled();
});

it('keeps shared fields and clears type-specific fields when changing the certificate type', () => {
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Character/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Conduct assessment (optional)' }), {
    target: { value: 'Verified conduct only' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Purpose / reason' }), {
    target: { value: 'School records' },
  });
  fireEvent.click(screen.getByRole('radio', { name: /First Trial/ }));
  expect(screen.getByRole('textbox', { name: 'First trial particulars (optional)' })).toHaveValue(
    ''
  );
  expect(screen.getByRole('textbox', { name: 'Purpose / reason' })).toHaveValue('School records');
});

it('preserves the chosen local issue date with an explicit offset at a year boundary', async () => {
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2027-01-01' } });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() => expect(mocks.issue).toHaveBeenCalled());
  expect(mocks.issue.mock.calls[0][0].issueDate).toBe('2027-01-01T00:00:00+05:30');
});

it('freezes an unconfirmed issuance request and retries its original key after a lost response', async () => {
  mocks.issue.mockRejectedValueOnce(new Error('Response lost after request was sent'));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry remaining certificates' })).toBeInTheDocument()
  );
  expect(screen.getByRole('textbox', { name: 'Purpose / reason' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  const key = mocks.issue.mock.calls[0][0].idempotencyKey;
  fireEvent.click(screen.getByRole('button', { name: 'Retry remaining certificates' }));
  await waitFor(() => expect(screen.getByText('BON-ravi')).toBeInTheDocument());
  expect(mocks.issue.mock.calls[1][0].idempotencyKey).toBe(key);
});

it('preserves entered fields while expanding and restoring the paper preview', async () => {
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Purpose / reason' }), {
    target: { value: 'Scholarship request' },
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Full preview' }));
  expect(screen.queryByRole('textbox', { name: 'Purpose / reason' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show details' }));
  expect(screen.getByRole('textbox', { name: 'Purpose / reason' })).toHaveValue(
    'Scholarship request'
  );
  expect(mocks.issue).not.toHaveBeenCalled();
});

it('reuses unchanged captured branding when editing purpose and keeps preflight image-free', async () => {
  const image = 'data:image/png;base64,iVBORw0KGgo=';
  mocks.preview.mockImplementation(async ({ studentId, includeBranding }) => ({
    ...response(studentId),
    certificateId: null,
    template: { ...response(studentId).template, schoolIdentity: { logoAssetId: 'logo-1' } },
    branding: includeBranding ? { logoDataUrl: image } : undefined,
  }));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute('src', image)
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Purpose / reason' }), {
    target: { value: 'Updated purpose' },
  });
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Generate & download' })).toBeEnabled()
  );
  expect(mocks.preview.mock.calls[0][0].includeBranding).toBe(true);
  expect(mocks.preview.mock.calls[1][0].includeBranding).toBe(false);
  expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute('src', image);
  fireEvent.click(screen.getByRole('button', { name: 'Generate & download' }));
  await waitFor(() => expect(mocks.issue).toHaveBeenCalledTimes(1));
  expect(mocks.preview.mock.calls[2][0].includeBranding).not.toBe(true);
  expect(mocks.issue.mock.calls[0][0].includeBranding).not.toBe(true);
});

it('refreshes branding when a later preview captures a different asset', async () => {
  let asset = 'logo-1';
  mocks.preview.mockImplementation(async ({ studentId, includeBranding }) => ({
    ...response(studentId),
    certificateId: null,
    template: { ...response(studentId).template, schoolIdentity: { logoAssetId: asset } },
    branding: includeBranding ? { logoDataUrl: `data:image/png;base64,${asset}` } : undefined,
  }));
  renderDrawer();
  fireEvent.click(screen.getByRole('radio', { name: /Bonafide/ }));
  await waitFor(() =>
    expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute(
      'src',
      'data:image/png;base64,logo-1'
    )
  );
  asset = 'logo-2';
  fireEvent.change(screen.getByRole('textbox', { name: 'Purpose / reason' }), {
    target: { value: 'New school letterhead' },
  });
  await waitFor(() =>
    expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute(
      'src',
      'data:image/png;base64,logo-2'
    )
  );
  expect(mocks.preview.mock.calls[1][0].includeBranding).toBe(false);
  expect(mocks.preview.mock.calls[2][0].includeBranding).toBe(true);
});
