import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentRecordDocuments from './student-record-documents';

const mocks = vi.hoisted(() => ({
  state: {
    globalState: { currentYear: { id: 'year-1' } },
    auth: {
      permissions: ['View', 'Add'].map((action) => ({
        name: `Students.Records.StudentICard.${action}`,
        isGranted: true,
      })),
    },
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select(mocks.state),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/student/records/documents',
  useSearchParams: () => new URLSearchParams('view=ids'),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action?: React.ReactNode }) => <>{action}</>,
}));
vi.mock('src/components/student-feedback', () => ({ StudentFeedback: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <section role="dialog">{children}</section> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./student-icard-builder', () => ({
  default: ({
    academicYearId,
    contextInvalid,
  }: {
    academicYearId?: string;
    contextInvalid?: boolean;
  }) => (
    <div
      data-testid="legacy-builder"
      data-year={academicYearId}
      data-invalid={String(Boolean(contextInvalid))}
    >
      <input aria-label="Retained builder draft" defaultValue="Draft" />
    </div>
  ),
}));
vi.mock('./record-document-templates', () => ({ default: () => null }));
vi.mock('./components/record-document-filters', () => ({ default: () => null }));
vi.mock('./student-certificate-workspace', () => ({ default: () => null }));
vi.mock('./components/document-history-actions', () => ({ default: () => null }));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionsQuery: () => ({ currentData: { items: [] } }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdHistoryQuery: () => ({ currentData: [] }),
  useGetRecordCertificateHistoryQuery: () => ({ currentData: [] }),
  useIssueRecordIdsMutation: () => [vi.fn(), {}],
  usePreviewRecordIdsMutation: () => [vi.fn(), {}],
  useVoidRecordDocumentMutation: () => [vi.fn(), {}],
  useReprintRecordDocumentMutation: () => [vi.fn(), {}],
  useIssueRecordCertificateMutation: () => [vi.fn(), {}],
  useDownloadRecordDocumentMutation: () => [vi.fn(), {}],
  usePreviewRecordCertificateMutation: () => [vi.fn(), {}],
  useDuplicateRecordCertificateMutation: () => [vi.fn(), {}],
  downloadRecordPdf: vi.fn(),
}));

beforeEach(() => {
  mocks.state.globalState.currentYear.id = 'year-1';
});

it('captures the global year for the retained history builder and keeps its draft on context changes', () => {
  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create Student I-Card' }));
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-year', 'year-1');
  fireEvent.change(screen.getByRole('textbox', { name: 'Retained builder draft' }), {
    target: { value: 'Still editing' },
  });
  mocks.state.globalState.currentYear.id = 'year-2';
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-year', 'year-1');
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-invalid', 'true');
  expect(screen.getByRole('textbox', { name: 'Retained builder draft' })).toHaveValue(
    'Still editing'
  );
});
