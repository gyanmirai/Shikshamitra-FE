import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentICardBuilder from './student-icard-builder';
import StudentICardTemplates from './student-icard-templates';

const mocks = vi.hoisted(() => ({
  options: vi.fn(),
  directory: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  legacySave: vi.fn(),
  preview: vi.fn(),
  export: vi.fn(),
  issue: vi.fn(),
  delete: vi.fn(),
  actions: vi.fn(),
  templates: [] as unknown[],
  legacy: {} as unknown,
  state: {
    globalState: { currentYear: { id: 'year-1' as string | undefined } },
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
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-stepper', () => ({ default: () => null }));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ children }: any) => <div role="alert">{children}</div>,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <>
      <h1>{heading}</h1>
      {action}
    </>
  ),
}));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, action }: any) =>
    open ? <section role="dialog">{action}</section> : null,
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: (props: any) => {
    mocks.actions(props);
    return (
      <>
        <button type="button" onClick={props.handleEditClick}>
          {props.editLabel}
        </button>
        {props.showDeleteIcon && (
          <button
            type="button"
            disabled={props.disableDeleteIcon}
            onClick={props.handleDeleteClick}
          >
            {props.deleteLabel}
          </button>
        )}
      </>
    );
  },
}));
vi.mock('src/screens/setting/school-identity/components/template-identity-asset', () => ({
  TemplateIdentityAsset: () => null,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, multiple, disabled, onChange }: any) => (
    <select
      aria-label={label}
      value={value}
      multiple={multiple}
      disabled={disabled}
      onChange={(event) =>
        onChange(Array.from(event.target.selectedOptions, (option) => option.value))
      }
    >
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns, tableId }: any) => (
    <section aria-label={tableId}>
      {data.map((row: any) => (
        <div key={row.studentId ?? row.id}>
          {columns.map((column: any) => (
            <span key={column.id}>
              {column.render ? column.render(row[column.id], row) : row[column.id]}
            </span>
          ))}
        </div>
      ))}
    </section>
  ),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (input: unknown) => mocks.options(input),
  useGetStudentRecordsDirectoryQuery: (input: unknown, options: unknown) =>
    mocks.directory(input, options),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplateQuery: () => ({ currentData: mocks.legacy }),
  useGetRecordIdTemplatesQuery: () => ({ currentData: mocks.templates }),
  useSaveRecordIdTemplateMutation: () => [mocks.legacySave, {}],
  useCreateRecordIdTemplateMutation: () => [mocks.create, {}],
  useUpdateRecordIdTemplateMutation: () => [mocks.update, {}],
  useDeleteRecordIdTemplateMutation: () => [mocks.delete, {}],
  usePreviewRecordIdsMutation: () => [
    (input: unknown) => ({ unwrap: () => mocks.preview(input) }),
    {},
  ],
  useExportRecordIdsMutation: () => [
    (input: unknown) => ({ unwrap: () => mocks.export(input) }),
    {},
  ],
  useIssueRecordIdsMutation: () => [(input: unknown) => ({ unwrap: () => mocks.issue(input) }), {}],
  downloadRecordPdf: vi.fn(),
}));

const scope = {
  boardIds: ['board-1'],
  mediumIds: ['medium-1'],
  standardIds: ['class-1'],
  divisionIds: ['division-1'],
};
const students: StudentDirectoryItem[] = [1, 2, 26].map((index) => ({
  id: `student-${index}`,
  studentId: `student-${index}`,
  firstName: `Pupil ${index}`,
  academicYearId: 'year-1',
  academicMediumId: 'medium-1',
  standardId: 'class-1',
  divisionId: 'division-1',
  standardName: 'Class 1',
  divisionName: 'A',
  maskedFields: [],
  status: 6,
  entrySource: 'CompletedOnboarding',
  hasPhoto: false,
}));
const template: IdCardTemplate = {
  id: 'template-1',
  concurrencyStamp: 'stamp-1',
  name: 'Saved design',
  presetKey: 'formal-student',
  orientation: 'Horizontal',
  schoolName: 'School',
  schoolAddress: '',
  headerText: 'Student card',
  footerText: '',
  primaryColor: '#00897B',
  backgroundColor: '#FFFFFF',
  cardsPerPage: 8,
  showQrCode: false,
  showPhoto: true,
  fields: ['StudentName'],
};
const wrap = (child: React.ReactNode) => (
  <ThemeProvider theme={createTheme(defaultSettings)}>{child}</ThemeProvider>
);
const next = () =>
  fireEvent.click(
    screen
      .getAllByRole('button', { name: 'Next' })
      .find((button) => !button.hasAttribute('disabled'))!
  );
const studentCheckbox = (name: string) => screen.getByRole('checkbox', { name: `Select ${name}` });
const openStudents = async () => {
  next();
  await screen.findByRole('checkbox', { name: 'Student name' });
  next();
  await screen.findByLabelText('Select Pupil 1');
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state.globalState.currentYear.id = 'year-1';
  mocks.state.auth.permissions = ['View', 'Add'].map((action) => ({
    name: `Students.Records.StudentICard.${action}`,
    isGranted: true,
  }));
  mocks.templates = [template];
  mocks.legacy = template;
  mocks.options.mockReturnValue({
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–2027' }],
      boards: [{ id: 'board-1', name: 'CBSE' }],
      mediums: [{ id: 'medium-1', parentId: 'board-1', name: 'English' }],
      standards: [{ id: 'class-1', parentId: 'medium-1', name: 'Class 1' }],
      divisions: [{ id: 'division-1', parentId: 'class-1', name: 'A' }],
    },
    isFetching: false,
  });
  mocks.directory.mockImplementation((input: any, options: any) => ({
    currentData: options?.skip
      ? undefined
      : {
          items: input.studentIds
            ? students.filter((student) => input.studentIds.includes(student.studentId))
            : input.skipCount === 25
              ? [students[2]]
              : students.slice(0, 2),
          totalCount: input.studentIds ? input.studentIds.length : 26,
        },
    isFetching: false,
  }));
  mocks.create.mockImplementation((body: IdCardTemplate) => ({
    unwrap: async () => ({ ...body, id: 'created-1', concurrencyStamp: 'created-stamp' }),
  }));
  mocks.update.mockImplementation(({ body }: { body: IdCardTemplate }) => ({
    unwrap: async () => ({ ...body, concurrencyStamp: 'saved-stamp' }),
  }));
  mocks.legacySave.mockImplementation((body: IdCardTemplate) => ({ unwrap: async () => body }));
  mocks.preview.mockResolvedValue([]);
});

it('passes the selected global academic year into the standalone template builder', async () => {
  render(wrap(<StudentICardTemplates />));
  fireEvent.click(screen.getByRole('button', { name: 'Create Student I-Card' }));
  expect(await screen.findByRole('textbox', { name: /Template name/ })).toBeVisible();
  expect(mocks.options).toHaveBeenLastCalledWith({ academicYearId: 'year-1' });
});

it('saves the complete year, academic filters and selected students across directory pages', async () => {
  const { id: _id, concurrencyStamp: _stamp, ...newDesign } = template;
  render(
    wrap(
      <StudentICardBuilder onClose={vi.fn()} initialTemplate={newDesign} academicYearId="year-1" />
    )
  );
  await openStudents();
  fireEvent.change(screen.getByRole('listbox', { name: 'Board' }), {
    target: { value: 'board-1' },
  });
  fireEvent.click(studentCheckbox('Pupil 1'));
  next();
  await screen.findByLabelText('Select Pupil 26');
  fireEvent.click(studentCheckbox('Pupil 26'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalled());
  expect(mocks.create.mock.calls.at(-1)?.[0].selection).toEqual({
    academicYearId: 'year-1',
    boardIds: ['board-1'],
    mediumIds: [],
    standardIds: [],
    divisionIds: [],
    studentIds: ['student-1', 'student-26'],
  });
});

it('restores saved scope and off-page student selections before editing the design', async () => {
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: {
            academicYearId: 'year-1',
            ...scope,
            studentIds: ['student-1', 'student-26'],
          },
        }}
      />
    )
  );
  await openStudents();
  await waitFor(() => expect(screen.getByText('2/100 selected')).toBeVisible());
  expect(screen.getByRole('listbox', { name: 'Board' })).toHaveValue(['board-1']);
  expect(studentCheckbox('Pupil 1')).toBeChecked();
  next();
  await screen.findByLabelText('Select Pupil 26');
  expect(studentCheckbox('Pupil 26')).toBeChecked();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search students' }), {
    target: { value: 'Pupil' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalled());
  expect(mocks.update.mock.calls.at(-1)?.[0]).toMatchObject({
    id: 'template-1',
    body: {
      concurrencyStamp: 'stamp-1',
      selection: { academicYearId: 'year-1', ...scope, studentIds: ['student-1', 'student-26'] },
    },
  });
  expect(mocks.create).not.toHaveBeenCalled();
});

it('uses the saved assignment year when editing from a different global academic year', async () => {
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: { academicYearId: 'year-2', ...scope, studentIds: ['student-1'] },
        }}
      />
    )
  );
  expect(mocks.options).toHaveBeenLastCalledWith({ academicYearId: 'year-2' });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalled());
  expect(mocks.update.mock.calls.at(-1)?.[0].body.selection.academicYearId).toBe('year-2');
});

it('keeps the current draft and prevents saving after its opener academic year changes', async () => {
  const view = render(wrap(<StudentICardTemplates />));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Saved design' }));
  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Unsaved design name' },
  });
  mocks.state.globalState.currentYear.id = 'year-2';
  view.rerender(wrap(<StudentICardTemplates />));
  expect(screen.getByRole('textbox', { name: /Template name/ })).toHaveValue('Unsaved design name');
  expect(
    screen.getByText('The academic year changed. Close this workspace and select students again.')
  ).toBeVisible();
  const save = screen.getByRole('button', { name: 'Save' });
  expect(save).toBeDisabled();
  fireEvent.click(save);
  expect(mocks.update).not.toHaveBeenCalled();
});

it('keeps every oversized legacy saved ID through bounded hydration and a rejected save', async () => {
  const savedIds = Array.from({ length: 101 }, (_, index) => `student-${index + 1}`);
  mocks.update.mockImplementation(() => ({
    unwrap: async () => {
      throw new Error('Selection exceeds the historical 100-ID bound');
    },
  }));
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: { academicYearId: 'year-1', ...scope, studentIds: savedIds },
        }}
      />
    )
  );
  await openStudents();
  await waitFor(() => expect(screen.getByText('101/100 selected')).toBeVisible());
  await waitFor(() => {
    const calls = mocks.directory.mock.calls.filter(
      ([input, options]) => input.studentIds?.length && !options?.skip
    );
    expect(new Set(calls.flatMap(([input]) => input.studentIds)).size).toBe(101);
    calls.forEach(([input]) => {
      expect(input.studentIds.length).toBeLessThanOrEqual(100);
      expect(input.maxResultCount).toBeLessThanOrEqual(100);
    });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalled());
  expect(mocks.update.mock.calls.at(-1)?.[0].body.selection.studentIds).toEqual(savedIds);
  expect(
    await screen.findByText('The template could not be saved. Refresh if another user changed it.')
  ).toBeVisible();
  expect(screen.getByText('101/100 selected')).toBeVisible();
});

it('retains an unavailable saved student ID without inventing a directory label or dropping the assignment', async () => {
  mocks.directory.mockImplementation((input: any, options: any) => ({
    currentData: options?.skip
      ? undefined
      : { items: input.studentIds ? [students[0]] : students.slice(0, 2), totalCount: 2 },
    isFetching: false,
  }));
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: {
            academicYearId: 'year-1',
            ...scope,
            studentIds: ['student-1', 'student-26'],
          },
        }}
      />
    )
  );
  await openStudents();
  await waitFor(() => expect(screen.getByText('2/100 selected')).toBeVisible());
  expect(screen.queryByText('Pupil 26')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalled());
  expect(mocks.update.mock.calls.at(-1)?.[0].body.selection.studentIds).toEqual([
    'student-1',
    'student-26',
  ]);
});

it('hydrates the legacy oldest-template fallback once without replacing an edited draft on refetch', async () => {
  mocks.legacy = {
    ...template,
    selection: { academicYearId: 'year-1', ...scope, studentIds: ['student-1'] },
  };
  const view = render(wrap(<StudentICardBuilder onClose={vi.fn()} academicYearId="year-1" />));
  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Unsaved legacy draft' },
  });
  await openStudents();
  await waitFor(() => expect(screen.getByText('1/100 selected')).toBeVisible());
  mocks.legacy = {
    ...template,
    name: 'Refetched server name',
    selection: { academicYearId: 'year-2', ...scope, studentIds: ['student-26'] },
  };
  view.rerender(wrap(<StudentICardBuilder onClose={vi.fn()} academicYearId="year-1" />));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.legacySave).toHaveBeenCalled());
  expect(mocks.legacySave.mock.calls.at(-1)?.[0]).toMatchObject({
    name: 'Unsaved legacy draft',
    selection: {
      academicYearId: 'year-1',
      studentIds: ['student-1'],
    },
  });
});

it('omits opaque restricted assignments when saving a design and retains the draft after rejection', async () => {
  const restricted = {
    ...template,
    selection: null,
    selectionRestricted: true,
  } as unknown as IdCardTemplate;
  mocks.update.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('Stale stamp');
    },
  }));
  render(
    wrap(
      <StudentICardBuilder onClose={vi.fn()} initialTemplate={restricted} academicYearId="year-1" />
    )
  );
  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Opaque cohort design draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByText('The template could not be saved. Refresh if another user changed it.');
  expect(mocks.update.mock.calls[0][0].body).not.toHaveProperty('selection');
  expect(screen.getByRole('textbox', { name: /Template name/ })).toHaveValue(
    'Opaque cohort design draft'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
  expect(mocks.update.mock.calls[1][0].body).toMatchObject({
    name: 'Opaque cohort design draft',
    concurrencyStamp: 'stamp-1',
  });
  expect(mocks.update.mock.calls[1][0].body).not.toHaveProperty('selection');
});

it('keeps opaque standalone assignments read-only without querying or inventing cohort members', async () => {
  const restricted = {
    ...template,
    selection: null,
    selectionRestricted: true,
  } as unknown as IdCardTemplate;
  render(
    wrap(
      <StudentICardBuilder onClose={vi.fn()} initialTemplate={restricted} academicYearId="year-1" />
    )
  );
  next();
  await screen.findByRole('checkbox', { name: 'Student name' });
  next();
  expect(
    await screen.findByText(
      'Student assignments are restricted in your current academic scope. You can still save design changes.'
    )
  ).toBeVisible();
  expect(screen.getByRole('listbox', { name: 'Board' })).toBeDisabled();
  expect(screen.queryByLabelText('Select Pupil 1')).not.toBeInTheDocument();
  expect(mocks.directory.mock.calls.filter(([, options]) => !options?.skip)).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  expect(mocks.preview).not.toHaveBeenCalled();
});

it('keeps directory bulk printing independent of an opaque oldest-template assignment', async () => {
  mocks.legacy = { ...template, selection: null, selectionRestricted: true };
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        initialStudents={[students[0]]}
        academicYearId="year-1"
      />
    )
  );
  expect(await screen.findByText('1/100 selected')).toBeVisible();
  // This fixture has a second directory page, so its first Next is pagination.
  fireEvent.click(
    screen
      .getAllByRole('button', { name: 'Next' })
      .filter((button) => !button.hasAttribute('disabled'))
      .at(-1)!
  );
  await waitFor(() =>
    expect(mocks.preview).toHaveBeenCalledWith({
      studentIds: ['student-1'],
      templateId: 'template-1',
    })
  );
  expect(mocks.legacySave).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
});

it('labels an opaque template assignment as restricted rather than reporting an empty cohort', () => {
  mocks.templates = [{ ...template, selection: null, selectionRestricted: true }];
  render(wrap(<StudentICardTemplates />));
  expect(screen.getByText('Restricted')).toBeVisible();
  expect(screen.queryByText('0 / 26')).not.toBeInTheDocument();
});

it('disables deleting an opaque cohort while retaining the existing Delete permission boundary', () => {
  mocks.state.auth.permissions.push({
    name: 'Students.Records.StudentICard.Delete',
    isGranted: true,
  });
  mocks.templates = [{ ...template, selection: null, selectionRestricted: true }];
  render(wrap(<StudentICardTemplates />));
  expect(screen.getByRole('button', { name: 'Delete Saved design' })).toBeDisabled();
  const actions = mocks.actions.mock.calls.at(-1)![0];
  expect(actions.deleteDisabledReason).toBe(
    'Student assignments are restricted in your current academic scope.'
  );
  actions.handleDeleteClick();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mocks.delete).not.toHaveBeenCalled();
});

it('stops a pending card preview when its save response newly makes assignments opaque', async () => {
  mocks.update.mockImplementation(({ body }: { body: IdCardTemplate }) => ({
    unwrap: async () => ({ ...body, selection: null, selectionRestricted: true }),
  }));
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: { academicYearId: 'year-1', ...scope, studentIds: ['student-1'] },
        }}
      />
    )
  );
  await openStudents();
  await waitFor(() => expect(screen.getByText('1/100 selected')).toBeVisible());
  fireEvent.click(
    screen
      .getAllByRole('button', { name: 'Next' })
      .filter((button) => !button.hasAttribute('disabled'))
      .at(-1)!
  );
  expect(
    await screen.findByText(
      'Student assignments are restricted in your current academic scope. You can still save design changes.'
    )
  ).toBeVisible();
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('Select Pupil 1')).not.toBeInTheDocument();
});

it.each(['preview', 'export', 'issue'] as const)(
  'stops %s after the global year changes during its save while retaining the accepted save stamp',
  async (command) => {
    mocks.templates = [
      { ...template, selection: { academicYearId: 'year-1', ...scope, studentIds: ['student-1'] } },
    ];
    mocks.preview.mockResolvedValue([
      {
        studentId: 'student-1',
        studentSnapshot: { StudentName: 'Pupil 1' },
        hasPhoto: false,
        cardNumber: 'Preview',
      },
    ]);
    mocks.export.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
    mocks.issue.mockResolvedValue([]);
    const view = render(wrap(<StudentICardTemplates />));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Saved design' }));
    fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
      target: { value: 'Retained design draft' },
    });
    await openStudents();
    await waitFor(() => expect(screen.getByText('1/100 selected')).toBeVisible());
    const footerNext = () =>
      fireEvent.click(
        screen
          .getAllByRole('button', { name: 'Next' })
          .filter((button) => !button.hasAttribute('disabled'))
          .at(-1)!
      );
    if (command !== 'preview') {
      footerNext();
      await screen.findByRole('heading', { name: 'Review Cards' });
      footerNext();
      await screen.findByRole('heading', { name: 'A4 Print Preview' });
    }
    const previousPreviewCalls = mocks.preview.mock.calls.length;
    let acceptSave!: (value: IdCardTemplate) => void;
    let pendingBody!: IdCardTemplate;
    mocks.update.mockImplementationOnce(({ body }: { body: IdCardTemplate }) => {
      pendingBody = body;
      return {
        unwrap: () =>
          new Promise<IdCardTemplate>((resolve) => {
            acceptSave = resolve;
          }),
      };
    });
    if (command === 'preview') footerNext();
    else
      fireEvent.click(
        screen.getByRole('button', {
          name: command === 'export' ? 'Export bulk PDF' : 'Issue cards',
        })
      );
    await waitFor(() => expect(acceptSave).toBeTypeOf('function'));
    mocks.state.globalState.currentYear.id = 'year-2';
    view.rerender(wrap(<StudentICardTemplates />));
    await act(async () => {
      acceptSave({ ...pendingBody, concurrencyStamp: 'accepted-server-stamp' });
    });
    expect(mocks.preview).toHaveBeenCalledTimes(previousPreviewCalls);
    expect(mocks.export).not.toHaveBeenCalled();
    expect(mocks.issue).not.toHaveBeenCalled();
    mocks.state.globalState.currentYear.id = 'year-1';
    view.rerender(wrap(<StudentICardTemplates />));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mocks.update.mock.calls.at(-1)?.[0].body.concurrencyStamp).toBe(
        'accepted-server-stamp'
      )
    );
    expect(mocks.update.mock.calls.at(-1)?.[0].body.name).toBe('Retained design draft');
  }
);

it('ignores a late preview response after the opener academic context changes', async () => {
  mocks.templates = [
    { ...template, selection: { academicYearId: 'year-1', ...scope, studentIds: ['student-1'] } },
  ];
  let finishPreview!: (value: unknown[]) => void;
  mocks.preview.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishPreview = resolve;
      })
  );
  const view = render(wrap(<StudentICardTemplates />));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Saved design' }));
  await openStudents();
  await waitFor(() => expect(screen.getByText('1/100 selected')).toBeVisible());
  fireEvent.click(
    screen
      .getAllByRole('button', { name: 'Next' })
      .filter((button) => !button.hasAttribute('disabled'))
      .at(-1)!
  );
  await waitFor(() => expect(finishPreview).toBeTypeOf('function'));
  mocks.state.globalState.currentYear.id = 'year-2';
  view.rerender(wrap(<StudentICardTemplates />));
  await act(async () => {
    finishPreview([
      {
        studentId: 'student-1',
        studentSnapshot: { StudentName: 'Late old-context pupil' },
        hasPhoto: false,
        cardNumber: 'Preview',
      },
    ]);
  });
  expect(screen.queryByRole('heading', { name: 'Review Cards' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('img', { name: 'I-card preview for Late old-context pupil' })
  ).not.toBeInTheDocument();
});

it.each([true, false])(
  'keeps issued-card history discoverable only with the existing View grant (view=%s)',
  (canView) => {
    if (!canView)
      mocks.state.auth.permissions = mocks.state.auth.permissions.filter(
        (permission) => !permission.name.endsWith('.View')
      );
    render(wrap(<StudentICardTemplates />));
    const history = screen.queryByRole('link', { name: 'View issued cards' });
    if (canView) expect(history).toHaveAttribute('href', '/student/records/documents?view=ids');
    else expect(history).not.toBeInTheDocument();
  }
);

it.each(['create', 'legacy'] as const)(
  'keeps metadata-only %s saves free of automatically attached academic assignment scope',
  async (mode) => {
    render(
      wrap(
        <StudentICardBuilder
          onClose={vi.fn()}
          academicYearId="year-1"
          initialTemplate={mode === 'create' ? { ...template, id: undefined } : undefined}
        />
      )
    );
    await screen.findByRole('textbox', { name: /Template name/ });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const save = mode === 'create' ? mocks.create : mocks.legacySave;
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls.at(-1)?.[0]).not.toHaveProperty('selection');
  }
);

it('allows metadata-only Create to open without a global academic year', async () => {
  mocks.state.globalState.currentYear.id = undefined;
  render(wrap(<StudentICardTemplates />));
  const create = screen.getByRole('button', { name: 'Create Student I-Card' });
  expect(create).toBeEnabled();
  fireEvent.click(create);
  expect(await screen.findByRole('textbox', { name: /Template name/ })).toBeVisible();
});

it('serializes an explicit empty selection when clearing a saved assignment', async () => {
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{
          ...template,
          selection: {
            academicYearId: 'year-1',
            boardIds: [],
            mediumIds: [],
            standardIds: [],
            divisionIds: [],
            studentIds: ['student-1'],
          },
        }}
      />
    )
  );
  await openStudents();
  await waitFor(() => expect(studentCheckbox('Pupil 1')).toBeChecked());
  fireEvent.click(studentCheckbox('Pupil 1'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalled());
  expect(mocks.update.mock.calls.at(-1)?.[0].body.selection).toEqual({
    academicYearId: 'year-1',
    boardIds: [],
    mediumIds: [],
    standardIds: [],
    divisionIds: [],
    studentIds: [],
  });
});

it('keeps filters-only assignment intent explicit even before students are selected', async () => {
  render(
    wrap(
      <StudentICardBuilder
        onClose={vi.fn()}
        academicYearId="year-1"
        initialTemplate={{ ...template, id: undefined }}
      />
    )
  );
  await openStudents();
  fireEvent.change(screen.getByRole('listbox', { name: 'Board' }), {
    target: { value: 'board-1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalled());
  expect(mocks.create.mock.calls.at(-1)?.[0].selection).toMatchObject({
    academicYearId: 'year-1',
    boardIds: ['board-1'],
    studentIds: [],
  });
});
