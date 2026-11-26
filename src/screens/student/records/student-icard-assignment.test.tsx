import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import StudentICardAssignment from './student-icard-assignment';

const fixture = vi.hoisted(() => ({
  permissions: ['View', 'Add', 'Delete'],
  canManage: true,
  hasTemplate: true,
  assignmentRefreshing: false,
  rosterRefreshing: false,
  templateStamp: 'template-v1',
  param: '',
  push: vi.fn(),
  preview: vi.fn(),
  export: vi.fn(),
  downloadPdf: vi.fn(),
  saveTemplate: vi.fn(),
  issue: vi.fn(),
  refresh: vi.fn(),
  dispatch: vi.fn(),
  rosterQuery: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => fixture.dispatch,
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: fixture.permissions.map((action) => ({
          name: `Students.Records.StudentICard.${action}`,
          isGranted: true,
        })),
      },
      globalState: { currentYear: { id: 'year-1', name: '2026–27' } },
      confirmPopup: { isChanges: false },
    }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/student/student-i-card',
  useSearchParams: () => new URLSearchParams(fixture.param),
  useRouter: () => ({ push: fixture.push, replace: fixture.push }),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: () => ({
    currentData: {
      boards: [{ id: 'board-1', name: 'GSEB' }],
      mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
      standards: [
        { id: 'class-5', name: 'Class 5', parentId: 'medium-1' },
        { id: 'class-6', name: 'Class 6', parentId: 'medium-1' },
      ],
      divisions: [
        { id: 'division-a', name: 'A', parentId: 'class-5' },
        { id: 'division-c', name: 'C', parentId: 'class-5' },
        { id: 'division-b', name: 'B', parentId: 'class-6' },
      ],
    },
    refetch: fixture.refresh,
  }),
}));

vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplatesQuery: () => ({
    currentData: [{ id: 'blue', name: 'Blue' }],
    refetch: fixture.refresh,
  }),
  useGetRecordIdPhotoQuery: () => ({}),
  downloadRecordPdf: fixture.downloadPdf,
}));

vi.mock('src/redux/student/records/student-icard-assignment-api', () => ({
  isICardAssignmentConflict: (error: { status?: number }) => error?.status === 409,
  useGetICardAssignmentClassesQuery: () => ({
    currentData: {
      totalCount: 1,
      items: [
        {
          standardId: 'class-5',
          standardName: 'Class 5',
          ...(fixture.hasTemplate && {
            templateId: 'blue',
            templateName: 'Blue',
            concurrencyStamp: 'assignment-v1',
            templateConcurrencyStamp: fixture.templateStamp,
          }),
          canManage: fixture.canManage,
        },
      ],
    },
    isFetching: fixture.assignmentRefreshing,
    refetch: fixture.refresh,
  }),
  useGetICardAssignmentRosterQuery: (input: unknown) => {
    fixture.rosterQuery(input);
    return {
      currentData: {
        totalCount: 2,
        items: [
          { studentId: 'new-student', studentName: 'Asha Patel', hasValidIssuedCard: false },
          { studentId: 'issued-student', studentName: 'Diya Patel', hasValidIssuedCard: true },
        ],
      },
      isFetching: fixture.rosterRefreshing,
      refetch: fixture.refresh,
    };
  },
  usePutICardAssignmentMutation: () => [fixture.saveTemplate, {}],
  useDeleteICardAssignmentMutation: () => [vi.fn(), {}],
  usePreviewAssignedICardsMutation: () => [fixture.preview, {}],
  useExportAssignedICardsMutation: () => [fixture.export, {}],
  useIssueAssignedICardsMutation: () => [fixture.issue, {}],
}));

const assignmentPage = () => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <StudentICardAssignment />
  </ThemeProvider>
);
const renderAssignment = () => render(assignmentPage());

beforeEach(() => {
  vi.clearAllMocks();
  fixture.permissions = ['View', 'Add', 'Delete'];
  fixture.canManage = true;
  fixture.hasTemplate = true;
  fixture.assignmentRefreshing = false;
  fixture.rosterRefreshing = false;
  fixture.templateStamp = 'template-v1';
  fixture.param = '';
  fixture.preview.mockReturnValue({
    unwrap: async () => [
      {
        studentId: 'new-student',
        studentSnapshot: { StudentName: 'Asha Patel' },
        templateSnapshot: {
          name: 'Blue',
          cardsPerPage: 8,
          backgroundColor: '#ffffff',
          primaryColor: '#111111',
          fields: [],
        },
      },
      {
        studentId: 'issued-student',
        studentSnapshot: { StudentName: 'Diya Patel' },
        templateSnapshot: {
          name: 'Blue',
          cardsPerPage: 8,
          backgroundColor: '#ffffff',
          primaryColor: '#111111',
          fields: [],
        },
      },
    ],
  });
  fixture.issue.mockReturnValue({ unwrap: async () => [{ id: 'card-1' }] });
  fixture.saveTemplate.mockReturnValue({ unwrap: async () => ({ templateId: 'blue' }) });
});

it('shows students directly for the selected division without a class-rule write action', () => {
  fixture.canManage = false;
  fixture.param = 'class=class-5&division=division-a';
  renderAssignment();

  expect(screen.getByRole('heading', { name: 'I-Card Assignment' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 5');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('A');
  expect(screen.getByRole('row', { name: /Asha Patel/ })).toBeVisible();
  expect(
    within(screen.getByRole('region', { name: 'I-Card selection' })).getByText('Blue')
  ).toBeVisible();
  expect(
    screen.queryByRole('button', { name: /Change template for Class 5/ })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'View issued cards' })).toBeNull();
  expect(fixture.rosterQuery).toHaveBeenCalledWith(
    expect.objectContaining({ standardId: 'class-5', divisionId: 'division-a' })
  );
});

it('keeps the selected students after saving a template and previews them with the saved rule', async () => {
  fixture.hasTemplate = false;
  fixture.param = 'class=class-5&division=division-a';
  const { rerender } = renderAssignment();

  const student = screen.getByRole('checkbox', { name: 'Select Asha Patel' });
  const summary = screen.getByRole('region', { name: 'I-Card selection' });
  const assign = within(summary).getByRole('button', { name: 'Assign template for Class 5' });
  expect(assign).toBeDisabled();
  expect(summary.nextElementSibling).toContainElement(screen.getByRole('table'));
  const previewButton = within(summary).getByRole('button', { name: 'Preview cards' });

  fireEvent.click(student);
  expect(assign).toBeEnabled();
  expect(within(summary).getByText('1 of 100 selected')).toBeVisible();
  expect(within(summary).getByRole('button', { name: 'Preview cards' })).toBeDisabled();
  expect(within(summary).queryByRole('button', { name: 'Clear selection' })).toBeNull();
  fireEvent.click(student);
  expect(assign).toBeDisabled();

  fireEvent.click(student);
  fireEvent.click(assign);
  const editor = screen.getByRole('dialog', { name: 'Assign Class Template' });
  expect(
    within(editor).getByText('Choose the template for all divisions of Class 5.')
  ).toBeVisible();
  fireEvent.mouseDown(within(editor).getByRole('combobox', { name: /^Template/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Blue' }));
  let finishSave!: () => void;
  fixture.saveTemplate.mockReturnValueOnce({
    unwrap: () =>
      new Promise<void>((resolve) => {
        finishSave = resolve;
      }),
  });
  const submit = within(editor).getByRole('button', { name: 'Submit' });
  fireEvent.click(submit);
  await waitFor(() =>
    expect(fixture.saveTemplate).toHaveBeenCalledWith({
      academicYearId: 'year-1',
      standardId: 'class-5',
      templateId: 'blue',
      concurrencyStamp: undefined,
    })
  );
  expect(submit).toBeDisabled();
  expect(submit).toHaveClass('MuiButton-loadingPositionStart');
  await act(async () => finishSave());
  await waitFor(() => expect(editor).not.toBeInTheDocument());

  fixture.hasTemplate = true;
  fixture.assignmentRefreshing = true;
  fixture.rosterRefreshing = true;
  rerender(assignmentPage());
  const loadingTable = screen.getByRole('table', { name: 'Students in Class 5 table' });
  expect(within(loadingTable).getByRole('columnheader', { name: 'Student' })).toBeVisible();
  expect(loadingTable.querySelectorAll('tbody tr .MuiSkeleton-root').length).toBeGreaterThan(1);
  expect(screen.queryByRole('checkbox', { name: 'Select Asha Patel' })).toBeNull();
  expect(screen.getByText('1 of 100 selected')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Preview cards' })).toBeDisabled();
  expect(screen.queryByRole('status', { name: 'Refreshing Students in Class 5' })).toBeNull();
  expect(screen.queryByRole('progressbar', { name: 'Refreshing Students in Class 5' })).toBeNull();

  fixture.assignmentRefreshing = false;
  fixture.rosterRefreshing = false;
  rerender(assignmentPage());
  expect(screen.getByRole('checkbox', { name: 'Select Asha Patel' })).toBeChecked();
  const preview = screen.getByRole('button', { name: 'Preview cards' });
  expect(preview).toBe(previewButton);
  expect(preview).toBeEnabled();
  fireEvent.click(preview);
  expect(await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' })).toBeVisible();
  expect(fixture.preview).toHaveBeenCalledWith({
    academicYearId: 'year-1',
    standardId: 'class-5',
    studentIds: ['new-student'],
    concurrencyStamp: 'assignment-v1',
    templateConcurrencyStamp: 'template-v1',
  });
});

it('closes an outdated preview when the template changes but keeps the student selection', async () => {
  fixture.param = 'class=class-5&division=division-a';
  const { rerender } = renderAssignment();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));
  const oldPreview = await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' });

  fixture.templateStamp = 'template-v2';
  rerender(assignmentPage());
  await waitFor(() => expect(oldPreview).not.toBeInTheDocument());
  expect(screen.getByRole('checkbox', { name: 'Select Asha Patel' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));
  expect(fixture.preview).toHaveBeenLastCalledWith(
    expect.objectContaining({
      studentIds: ['new-student'],
      templateConcurrencyStamp: 'template-v2',
    })
  );
  expect(await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' })).toBeVisible();
});

it('loads the first available class with all divisions when the URL omits the class', () => {
  renderAssignment();

  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 5');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('All divisions');
  expect(fixture.rosterQuery).toHaveBeenCalledWith(
    expect.objectContaining({ standardId: 'class-5', divisionId: undefined })
  );

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Division' }));
  fireEvent.click(screen.getByRole('option', { name: 'A' }));
  expect(fixture.push).toHaveBeenLastCalledWith(
    '/student/student-i-card?class=class-5&division=division-a',
    { scroll: false }
  );
});

it('keeps a valid explicit class and rejects a division from another class', () => {
  fixture.param = 'class=class-6';
  const { rerender } = renderAssignment();

  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 6');
  fixture.rosterQuery.mockClear();
  fixture.param = 'class=class-5&division=division-b';
  rerender(assignmentPage());
  expect(fixture.rosterQuery).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Reset filters' })).toBeVisible();
});

it('keeps class rule actions with Preview and requires confirmation to remove a rule', () => {
  fixture.param = 'class=class-5';
  renderAssignment();

  const summary = screen.getByRole('region', { name: 'I-Card selection' });
  const remove = within(summary).getByRole('button', { name: 'Remove' });
  expect(
    within(summary).getByRole('button', { name: 'Change template for Class 5' })
  ).toBeDisabled();
  expect(within(summary).getByRole('button', { name: 'Preview cards' })).toBeDisabled();
  fireEvent.click(remove);
  expect(screen.getByRole('dialog', { name: 'Remove I-Card Assignment?' })).toBeVisible();
});

it('clears the current batch and paging when the division changes', () => {
  fixture.param = 'class=class-5&division=division-a&page=2';
  const { rerender } = renderAssignment();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  expect(screen.getByRole('button', { name: 'Preview cards' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Change template for Class 5' })).toBeEnabled();

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Division' }));
  fireEvent.click(screen.getByRole('option', { name: 'C' }));
  expect(fixture.push).toHaveBeenLastCalledWith(
    '/student/student-i-card?class=class-5&division=division-c',
    { scroll: false }
  );
  fixture.param = 'class=class-5&division=division-c';
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardAssignment />
    </ThemeProvider>
  );
  expect(screen.getByRole('checkbox', { name: 'Select Asha Patel' })).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Preview cards' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Change template for Class 5' })).toBeDisabled();
  expect(fixture.rosterQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({ divisionId: 'division-c', skipCount: 0 })
  );
});

it('sends class and version stamps and issues only students without a valid card', async () => {
  fixture.param = 'class=class-5&division=division-a';
  renderAssignment();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Diya Patel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));

  const roster = await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' });
  expect(await within(roster).findByText('1 already issued')).toBeVisible();
  expect(within(roster).queryByRole('link', { name: 'View issued cards' })).toBeNull();
  expect(fixture.preview).toHaveBeenCalledWith({
    academicYearId: 'year-1',
    standardId: 'class-5',
    studentIds: ['new-student', 'issued-student'],
    concurrencyStamp: 'assignment-v1',
    templateConcurrencyStamp: 'template-v1',
  });

  fireEvent.click(within(roster).getByRole('button', { name: 'Issue cards' }));
  const confirm = screen.getByRole('dialog', { name: 'Issue I-Cards?' });
  fireEvent.click(within(confirm).getByRole('button', { name: 'Issue cards' }));

  await waitFor(() =>
    expect(fixture.issue).toHaveBeenCalledWith({
      academicYearId: 'year-1',
      standardId: 'class-5',
      studentIds: ['new-student'],
      concurrencyStamp: 'assignment-v1',
      templateConcurrencyStamp: 'template-v1',
      idempotencyKey: expect.any(String),
    })
  );
});

it('keeps the same idempotency key when retrying a submitted batch', async () => {
  fixture.issue.mockReturnValueOnce({
    unwrap: () => Promise.reject(new Error('Connection lost')),
  });
  fixture.param = 'class=class-5';
  renderAssignment();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));
  const roster = await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' });
  fireEvent.click(await within(roster).findByRole('button', { name: 'Issue cards' }));
  const confirm = screen.getByRole('dialog', { name: 'Issue I-Cards?' });
  const issueButton = within(confirm).getByRole('button', { name: 'Issue cards' });
  fireEvent.click(issueButton);

  const { shikshaMitraToast } = await import('src/components/toast');
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalled());
  fireEvent.click(issueButton);

  await waitFor(() => expect(fixture.issue).toHaveBeenCalledTimes(2));
  expect(fixture.issue.mock.calls[1][0]).toEqual(fixture.issue.mock.calls[0][0]);
});

it('browses the selected preview response one at a time or as a scrollable list', async () => {
  fixture.param = 'class=class-5';
  renderAssignment();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Diya Patel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));

  const drawer = await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' });
  const preview = within(drawer);
  expect(preview.getByRole('button', { name: 'Previous student' })).toBeDisabled();
  expect(preview.getByRole('img', { name: 'I-Card preview for Asha Patel' })).toBeVisible();
  fireEvent.click(preview.getByRole('button', { name: 'Next student' }));
  expect(preview.getByRole('img', { name: 'I-Card preview for Diya Patel' })).toBeVisible();
  expect(preview.getByRole('button', { name: 'Next student' })).toBeDisabled();

  fireEvent.mouseDown(preview.getByRole('combobox', { name: 'Student to preview' }));
  fireEvent.click(screen.getByRole('option', { name: 'Asha Patel' }));
  expect(preview.getByRole('img', { name: 'I-Card preview for Asha Patel' })).toBeVisible();

  const showAll = preview.getByRole('button', { name: 'Show all' });
  fireEvent.click(showAll);
  expect(showAll).toHaveAttribute('aria-pressed', 'true');
  expect(preview.getByRole('img', { name: 'I-Card preview for Asha Patel' })).toBeVisible();
  expect(preview.getByRole('img', { name: 'I-Card preview for Diya Patel' })).toBeVisible();
  expect(fixture.preview).toHaveBeenCalledTimes(1);
  expect(preview.getByRole('button', { name: 'Print Sheet' })).toBeVisible();
  expect(preview.queryByRole('button', { name: /^Close$/ })).toBeNull();

  fireEvent.click(showAll);
  expect(preview.queryByRole('img', { name: 'I-Card preview for Diya Patel' })).toBeNull();
  expect(preview.getByRole('img', { name: 'I-Card preview for Asha Patel' })).toBeVisible();
});

it('keeps the print configuration error visible and allows retrying the same selection', async () => {
  fixture.param = 'class=class-5';
  const detail = "Text in 'Name' does not fit. Enlarge the element or reduce its font size.";
  const pdf = new Blob(['%PDF-test'], { type: 'application/pdf' });
  fixture.export
    .mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error(detail), {
            status: 400,
            data: { errorCode: 'ShikshaMitra:IdentityCard:InvalidConfiguration', detail },
          })
        ),
    })
    .mockReturnValueOnce({ unwrap: () => Promise.resolve(pdf) });

  renderAssignment();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview cards' }));
  const preview = within(await screen.findByRole('dialog', { name: 'Preview I-Cards for Class 5' }));
  const print = preview.getByRole('button', { name: 'Print Sheet' });
  fireEvent.click(print);

  expect(await preview.findByRole('alert')).toHaveTextContent(detail);
  expect(fixture.downloadPdf).not.toHaveBeenCalled();
  fireEvent.click(print);

  await waitFor(() => expect(fixture.downloadPdf).toHaveBeenCalledWith(pdf, 'Student-I-Cards.pdf'));
  expect(preview.queryByRole('alert')).toBeNull();
  expect(fixture.export.mock.calls[1][0]).toEqual(fixture.export.mock.calls[0][0]);
});
