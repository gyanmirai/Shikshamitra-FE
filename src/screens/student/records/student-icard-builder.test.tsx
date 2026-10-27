import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentICardBuilder, { StudentCardPreview } from './student-icard-builder';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  preview: vi.fn(),
  export: vi.fn(),
  issue: vi.fn(),
  download: vi.fn(),
  options: {
    boards: [{ id: 'board-1', name: 'CBSE' }],
    mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
    standards: [{ id: 'class-1', name: 'Class 1', parentId: 'medium-1' }],
    divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
    academicYears: [{ id: 'year-1', name: '2026-2027' }],
  },
  template: {
    // Older template responses can omit name even though the current API type requires it.
    presetKey: 'formal-student',
    orientation: 'Horizontal',
    schoolName: 'School',
    schoolAddress: '',
    headerText: 'Student Identity Card',
    footerText: '',
    primaryColor: '#00897B',
    backgroundColor: '#FFFFFF',
    cardsPerPage: 8,
    showQrCode: false,
    showPhoto: true,
    fields: ['StudentName'],
  },
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.toast,
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-stepper', () => ({ default: () => <div /> }));
vi.mock('src/screens/setting/school-identity/components/template-identity-asset', () => ({
  TemplateIdentityAsset: () => <div />,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, disabled, multiple, onChange }: any) => (
    <select
      aria-label={label}
      value={value}
      multiple={multiple}
      disabled={disabled}
      onChange={(event) =>
        onChange(
          multiple
            ? Array.from(event.target.selectedOptions, (item: any) => item.value)
            : event.target.value
        )
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
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div /> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: () => ({
    currentData: mocks.options,
    isFetching: false,
  }),
  useGetStudentRecordsDirectoryQuery: () => ({
    currentData: { items: [], totalCount: 0 },
    isFetching: false,
  }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplateQuery: () => ({
    currentData: mocks.template,
    isError: false,
  }),
  useSaveRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  useCreateRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  useUpdateRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  usePreviewRecordIdsMutation: () => [
    (input: any) => ({ unwrap: () => mocks.preview(input) }),
    { isLoading: false },
  ],
  useExportRecordIdsMutation: () => [
    (input: any) => ({ unwrap: () => mocks.export(input) }),
    { isLoading: false },
  ],
  useIssueRecordIdsMutation: () => [
    (input: any) => ({ unwrap: () => mocks.issue(input) }),
    { isLoading: false },
  ],
  downloadRecordPdf: mocks.download,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const selectedStudents: StudentDirectoryItem[] = ['Asha', 'Neha'].map((firstName, index) => ({
  id: `student-${index + 1}`,
  studentId: `student-${index + 1}`,
  firstName,
  lastName: 'Patel',
  standardId: 'class-1',
  standardName: 'Class 1',
  divisionId: 'division-1',
  divisionName: 'A',
  academicMediumId: 'medium-1',
  academicYearId: 'year-1',
  maskedFields: [],
  status: 6,
  entrySource: 'CompletedOnboarding',
  hasPhoto: false,
}));
const academicScope = {
  boardIds: ['board-1'],
  mediumIds: ['medium-1'],
  standardIds: ['class-1'],
  divisionIds: ['division-1'],
};
const renderDirectory = (props = {}) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardBuilder
        onClose={vi.fn()}
        initialStudents={selectedStudents}
        academicYearId="year-1"
        {...props}
      />
    </ThemeProvider>
  );
const nextStep = () =>
  fireEvent.click(
    screen
      .getAllByRole('button', { name: 'Next' })
      .find((button) => !button.hasAttribute('disabled'))!
  );
const preparePreviews = () =>
  mocks.preview.mockResolvedValue(
    selectedStudents.map((student) => ({
      studentId: student.studentId,
      studentSnapshot: { StudentName: `${student.firstName} Patel`, AcademicYear: '2026-2027' },
      hasPhoto: false,
      cardNumber: 'Preview',
    }))
  );

it('pins every academic field to the captured Student List scope for bulk printing', async () => {
  renderDirectory({ initialAcademicScope: academicScope, lockAcademicScope: true });
  expect(await screen.findByRole('textbox', { name: 'Board' })).toHaveValue('CBSE');
  ['Board', 'Medium', 'Class', 'Division'].forEach((label) => {
    expect(screen.getByRole('textbox', { name: label })).toHaveAttribute('readonly');
  });
  expect(screen.getByRole('textbox', { name: 'Medium' })).toHaveValue('English');
  expect(screen.getByRole('textbox', { name: 'Class' })).toHaveValue('Class 1');
  expect(screen.getByRole('textbox', { name: 'Division' })).toHaveValue('A');
  expect(screen.getByRole('button', { name: 'Choose Students information' })).toBeVisible();
  expect(
    screen.queryByText(
      'Select one or more boards, mediums, classes, and divisions. The choices narrow from left to right.'
    )
  ).not.toBeInTheDocument();
});

it('reviews one complete selected card with a student chooser and bounded pager', async () => {
  preparePreviews();
  renderDirectory();
  await screen.findByText('2/100 selected');
  nextStep();
  expect(await screen.findByRole('heading', { name: 'Review Cards' })).toBeVisible();
  expect(screen.getAllByRole('img', { name: /I-card preview for/ })).toHaveLength(1);
  expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
  expect(screen.getByText('2 missing photos')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Previous student' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Next student' }));
  expect(screen.getByRole('img', { name: 'I-card preview for Neha Patel' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next student' })).toBeDisabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Student to preview' }), {
    target: { value: 'student-1' },
  });
  expect(screen.getByRole('img', { name: 'I-card preview for Asha Patel' })).toBeVisible();
});

it('exports the selected cohort with A4 capacity without issuing cards or saving a template', async () => {
  preparePreviews();
  mocks.export.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
  renderDirectory();
  await screen.findByText('2/100 selected');
  nextStep();
  await screen.findByRole('heading', { name: 'Review Cards' });
  nextStep();
  expect(await screen.findByRole('heading', { name: 'A4 Print Preview' })).toBeVisible();
  expect(screen.getByText('8 slots per page · 2 cards on this page')).toBeVisible();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Cards per A4 page' }), {
    target: { value: '1' },
  });
  expect(screen.getByText('1 slot per page · 1 card on this page')).toBeVisible();
  expect(screen.getByText('Page 1 of 2')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Next A4 page' }));
  expect(screen.getByRole('img', { name: 'I-card preview for Neha Patel' })).toBeVisible();
  expect(screen.getByText('Page 2 of 2')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Export bulk PDF' }));
  await waitFor(() => expect(mocks.download).toHaveBeenCalled());
  expect(mocks.export).toHaveBeenCalledWith({
    studentIds: ['student-1', 'student-2'],
    cardsPerPage: 1,
    templateId: undefined,
  });
  expect(mocks.issue).not.toHaveBeenCalled();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('uses the refreshed server template snapshot when another admin changes the print design', async () => {
  mocks.preview.mockResolvedValue(
    selectedStudents.map((student) => ({
      studentId: student.studentId,
      cardNumber: 'Preview',
      hasPhoto: false,
      studentSnapshot: { StudentName: `${student.firstName} Patel` },
      templateSnapshot: {
        ...mocks.template,
        orientation: 'Vertical',
        schoolName: 'Updated School',
      },
    }))
  );
  renderDirectory();
  await screen.findByText('2/100 selected');
  nextStep();
  expect(await screen.findByText('Updated School')).toBeVisible();
  expect(screen.queryByText('School')).not.toBeInTheDocument();
  nextStep();
  expect(await screen.findByText('Layout: Vertical')).toBeVisible();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('keeps a captured academic scope when the opener changes its props', async () => {
  const view = renderDirectory({ initialAcademicScope: academicScope, lockAcademicScope: true });
  await screen.findByRole('textbox', { name: 'Board' });
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardBuilder
        onClose={vi.fn()}
        initialStudents={selectedStudents}
        academicYearId="year-1"
        initialAcademicScope={{ ...academicScope, boardIds: [] }}
        lockAcademicScope
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('textbox', { name: 'Board' })).toHaveValue('CBSE');
  expect(screen.getByText('2/100 selected')).toBeVisible();
});

it('retains editable academic controls for a row print opened without the bulk lock', async () => {
  renderDirectory({ initialAcademicScope: academicScope });
  const board = await screen.findByRole('listbox', { name: 'Board' });
  expect(board).not.toBeDisabled();
  expect(board).toHaveValue(['board-1']);
});

it('scales the full card proportionally when its container is narrower than the card', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 210,
  } as DOMRect);
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentCardPreview
        template={{ ...mocks.template, name: 'QA', orientation: 'Horizontal' }}
        card={{
          studentSnapshot: { StudentName: 'Asha Patel' },
          hasPhoto: false,
          cardNumber: 'Preview',
        }}
      />
    </ThemeProvider>
  );
  const preview = screen.getByRole('img', { name: 'I-card preview for Asha Patel' });
  await waitFor(() =>
    expect(preview.firstElementChild).toHaveStyle({
      width: '420px',
      height: '260px',
      transform: 'scale(0.5)',
    })
  );
  expect(preview).toHaveStyle({ aspectRatio: '420 / 260' });
});

it('opens directory students at the selection step without saving or issuing on open', async () => {
  const student: StudentDirectoryItem = {
    id: 'student-1',
    studentId: 'student-1',
    firstName: 'Asha',
    lastName: 'Patel',
    standardId: 'class-1',
    divisionId: 'division-1',
    academicMediumId: 'medium-1',
    maskedFields: [],
    academicYearId: 'year-1',
    status: 6,
    entrySource: 'CompletedOnboarding',
    hasPhoto: false,
  };
  mocks.save.mockClear();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardBuilder onClose={vi.fn()} initialStudents={[student]} academicYearId="year-1" />
    </ThemeProvider>
  );
  expect(await screen.findByText('1/100 selected')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /Template name/ })).not.toBeInTheDocument();
  expect(mocks.save).not.toHaveBeenCalled();
  mocks.preview.mockResolvedValue([]);
  const next = screen
    .getAllByRole('button', { name: 'Next' })
    .filter((button) => !button.hasAttribute('disabled'));
  expect(next).toHaveLength(1);
  fireEvent.click(next[0]);
  await waitFor(() =>
    expect(mocks.preview).toHaveBeenCalledWith({ studentIds: ['student-1'], templateId: undefined })
  );
  expect(mocks.save).not.toHaveBeenCalled();
});

it('shows a required field error instead of crashing when a template has no name', async () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardBuilder onClose={vi.fn()} />
    </ThemeProvider>
  );

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('');
  expect(screen.getByText('Name this design so you can find and reuse it.')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByText('Template name is required.')).toBeVisible();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('retains the entered name when the save response omits it', async () => {
  mocks.save.mockReturnValue({ unwrap: async () => mocks.template });
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardBuilder onClose={vi.fn()} />
    </ThemeProvider>
  );

  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'QA Student I-Card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue(
    'QA Student I-Card'
  );
});
