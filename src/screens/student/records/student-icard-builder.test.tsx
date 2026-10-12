import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { beforeEach, expect, it, vi } from 'vitest';

import StudentICardBuilder from './student-icard-builder';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  currentYearId: 'year-26',
  optionsQuery: vi.fn(),
  directoryQuery: vi.fn(),
  template: {
    // Older template responses can omit name even though the current API type requires it.
    presetKey: 'formal-student', orientation: 'Horizontal', schoolName: 'School', schoolAddress: '',
    headerText: 'Student Identity Card', footerText: '', primaryColor: '#00897B',
    backgroundColor: '#FFFFFF', cardsPerPage: 8, showQrCode: false, showPhoto: true,
    fields: ['StudentName'],
  },
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.toast } }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({
    globalState: { currentYear: { id: mocks.currentYearId } },
  }),
}));
vi.mock('src/components/custom-stepper', () => ({ default: () => <div /> }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options }: { label: string; options?: { id: string; name: string }[] }) => (
    <div data-testid={`student-filter-${label.toLowerCase()}`}>
      {(options ?? []).map((option) => `${option.name} (${option.id})`).join(', ')}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div /> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: mocks.optionsQuery,
  useGetStudentRecordsDirectoryQuery: mocks.directoryQuery,
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplateQuery: () => ({
    currentData: mocks.template,
    isError: false,
  }),
  useSaveRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  usePreviewRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
  useExportRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
  useIssueRecordIdsMutation: () => [vi.fn(), { isLoading: false }],
}));

beforeEach(() => {
  mocks.currentYearId = 'year-26';
  mocks.optionsQuery.mockReset();
  mocks.directoryQuery.mockReset();
  mocks.optionsQuery.mockReturnValue({
    currentData: {
      boards: [
        { id: 'cbse-25', name: 'CBSE', parentId: 'year-25' },
        { id: 'cbse-26', name: 'CBSE', parentId: 'year-26' },
        { id: 'gseb-26', name: 'GSEB', parentId: 'year-26' },
      ],
      mediums: [], standards: [], divisions: [],
    },
    isFetching: false,
    isError: false,
  });
  mocks.directoryQuery.mockReturnValue({
    currentData: { items: [], totalCount: 0 },
    isFetching: false,
    isError: false,
  });
});

const openStudentsStep = async () => {
  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Year-scoped ID Card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('Choose students')).toBeVisible();
};

it('shows a required field error instead of crashing when a template has no name', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('');
  expect(screen.getByText('Name this design so you can find and reuse it.')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByText('Template name is required.')).toBeVisible();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('retains the entered name when the save response omits it', async () => {
  mocks.save.mockReturnValue({ unwrap: async () => mocks.template });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'QA Student I-Card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('QA Student I-Card');
});

it('scopes the I-Card filters and student directory to the globally selected academic year', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  expect(mocks.optionsQuery).toHaveBeenCalledWith({ academicYearId: 'year-26' }, { skip: false });
  expect(mocks.directoryQuery).toHaveBeenCalledWith(
    expect.objectContaining({ academicYearId: 'year-26', population: 'Active' }),
    { skip: false }
  );
  expect(screen.getByTestId('student-filter-board')).toHaveTextContent('CBSE (cbse-26)');
  expect(screen.getByTestId('student-filter-board')).toHaveTextContent('GSEB (gseb-26)');
  expect(screen.getByTestId('student-filter-board')).not.toHaveTextContent('CBSE (cbse-25)');
});

it('switches API scope and visible boards when the global academic year changes', async () => {
  const view = render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  mocks.currentYearId = 'year-25';
  view.rerender(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  await waitFor(() => {
    expect(mocks.optionsQuery).toHaveBeenLastCalledWith({ academicYearId: 'year-25' }, { skip: false });
  });
  expect(mocks.directoryQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({ academicYearId: 'year-25', boardIds: [] }),
    { skip: false }
  );
  expect(screen.getByTestId('student-filter-board')).toHaveTextContent('CBSE (cbse-25)');
  expect(screen.getByTestId('student-filter-board')).not.toHaveTextContent('CBSE (cbse-26)');
});

it('does not fetch an unscoped list without a global academic year', async () => {
  mocks.currentYearId = '';
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  expect(mocks.optionsQuery).toHaveBeenCalledWith({ academicYearId: '' }, { skip: true });
  expect(mocks.directoryQuery).toHaveBeenCalledWith(
    expect.objectContaining({ academicYearId: '' }),
    { skip: true }
  );
  expect(screen.getByText('Select an academic year from the global academic filter to choose students.')).toBeVisible();
});
