import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { beforeEach, expect, it, vi } from 'vitest';

import StudentICardBuilder from './student-icard-builder';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  yearId: 'year-1',
  optionsInput: {} as any,
  directoryInput: {} as any,
  options: {
    academicYears: [{ id: 'year-1', name: '2026-27' }, { id: 'year-2', name: '2027-28' }],
    boards: [
      { id: 'board-1', name: 'CBSE', parentId: 'year-1' },
      { id: 'board-2', name: 'CBSE', parentId: 'year-2' },
    ],
    mediums: [
      { id: 'medium-1', name: 'English', parentId: 'board-1' },
      { id: 'medium-2', name: 'English', parentId: 'board-2' },
    ],
    standards: [
      { id: 'class-1', name: 'Class 1', parentId: 'medium-1' },
      { id: 'class-2', name: 'Class 1', parentId: 'medium-2' },
    ],
    divisions: [
      { id: 'division-1', name: 'A', parentId: 'class-1' },
      { id: 'division-2', name: 'A', parentId: 'class-2' },
    ],
  },
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
  useSelector: (select: any) => select({ globalState: { currentYear: { id: mocks.yearId } } }),
}));
vi.mock('src/components/custom-stepper', () => ({ default: () => <div /> }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, onChange }: any) => <div aria-label={`${label} choices`}>
    {options.map((option: any) => <button key={option.id} type="button"
      onClick={() => onChange([option.id])}>{option.name} ({option.id})</button>)}
  </div>,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div /> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (input: any) => {
    mocks.optionsInput = input;
    return { currentData: mocks.options, isFetching: false };
  },
  useGetStudentRecordsDirectoryQuery: (input: any) => {
    mocks.directoryInput = input;
    return { currentData: { items: [], totalCount: 0 }, isFetching: false };
  },
}));

beforeEach(() => {
  mocks.yearId = 'year-1';
  mocks.save.mockReset();
  mocks.toast.mockReset();
});

const openStudentsStep = async () => {
  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Student card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('Choose students')).toBeVisible();
};

it('loads choices and students for the global academic year and narrows the full hierarchy', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  expect(mocks.optionsInput).toEqual({ academicYearId: 'year-1' });
  expect(mocks.directoryInput.academicYearId).toBe('year-1');
  expect(screen.getByLabelText('Board choices')).toHaveTextContent('board-1');
  expect(screen.getByLabelText('Board choices')).not.toHaveTextContent('board-2');
  expect(screen.getByLabelText('Medium choices')).toHaveTextContent('medium-1');
  expect(screen.getByLabelText('Medium choices')).not.toHaveTextContent('medium-2');
  expect(screen.getByLabelText('Class choices')).not.toHaveTextContent('class-2');
  expect(screen.getByLabelText('Division choices')).not.toHaveTextContent('division-2');

  fireEvent.click(screen.getByRole('button', { name: 'CBSE (board-1)' }));
  fireEvent.click(screen.getByRole('button', { name: 'English (medium-1)' }));
  fireEvent.click(screen.getByRole('button', { name: 'Class 1 (class-1)' }));
  fireEvent.click(screen.getByRole('button', { name: 'A (division-1)' }));
  expect(mocks.directoryInput).toMatchObject({
    academicYearId: 'year-1', boardIds: ['board-1'], mediumIds: ['medium-1'],
    standardIds: ['class-1'], divisionIds: ['division-1'],
  });
});

it('clears academic selections when the global year changes', async () => {
  const { rerender } = render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();
  fireEvent.click(screen.getByRole('button', { name: 'CBSE (board-1)' }));

  mocks.yearId = 'year-2';
  rerender(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  await waitFor(() => expect(mocks.directoryInput).toMatchObject({
    academicYearId: 'year-2', boardIds: [], mediumIds: [], standardIds: [], divisionIds: [],
  }));
  expect(mocks.optionsInput).toEqual({ academicYearId: 'year-2' });
  expect(screen.getByLabelText('Board choices')).toHaveTextContent('board-2');
  expect(screen.getByLabelText('Board choices')).not.toHaveTextContent('board-1');
});
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
