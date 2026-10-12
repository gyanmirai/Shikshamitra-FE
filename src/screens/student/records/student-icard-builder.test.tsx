import { ThemeProvider } from '@mui/material/styles';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  tableProps: {} as any,
  savedDirectoryInput: {} as any,
  otherTemplates: [] as any[],
  directoryItems: [] as any[],
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
      { id: 'class-10', name: 'Class 10', parentId: 'medium-1' },
      { id: 'class-2', name: 'Class 1', parentId: 'medium-2' },
    ],
    divisions: [
      { id: 'division-1', name: 'A', parentId: 'class-1' },
      { id: 'division-10', name: 'B', parentId: 'class-10' },
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
vi.mock('src/components/custom-stepper', () => ({
  CustomStepperWithFormik: ({ activeStep, steps, renderItem, onCancel, handleBack, handleNext, onSave }: any) => <div>
    <nav aria-label="Student I-Card creation steps">{steps.join(' · ')}</nav>
    {renderItem({ activeStep })}
    <button type="button" onClick={activeStep === 0 ? onCancel : handleBack}>{activeStep === 0 ? 'Cancel' : 'Back'}</button>
    <button type="button" onClick={() => onSave(false, {}, {}, () => {})}>Save</button>
    <button type="button" onClick={() => handleNext(activeStep === steps.length - 1, {}, {}, () => {})}>{activeStep === steps.length - 1 ? 'Done' : 'Next'}</button>
  </div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, onChange, disabled }: any) => <div aria-label={`${label} choices`} aria-disabled={disabled}>
    {options.map((option: any) => <button key={option.id} type="button"
      disabled={disabled} onClick={() => onChange([option.id])}>{option.name} ({option.id})</button>)}
    {label === 'Class' && options.length > 1 && <button type="button" disabled={disabled}
      onClick={() => onChange([options[0].id, options[1].id])}>Select multiple classes</button>}
  </div>,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: (props: any) => {
  mocks.tableProps = props;
  return <div aria-label="Student selection table">
    <button type="button" onClick={() => props.onServerPagination(2, props.rowsPerPage)}>Table next page</button>
    <button type="button" onClick={() => props.onServerPagination(1, 50)}>Table 50 rows</button>
    <button type="button" onClick={() => props.onServerSearch('Asha')}>Table search</button>
    <button type="button" onClick={() => props.onServerSort('grNumber', [{ column: 'grNumber', direction: 'desc' }])}>Table sort</button>
  </div>;
} }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (input: any) => {
    mocks.optionsInput = input;
    return { currentData: mocks.options, isFetching: false };
  },
  useGetStudentRecordsDirectoryQuery: (input: any) => {
    if (input.studentIds?.length) {
      mocks.savedDirectoryInput = input;
      return { currentData: { items: [{ studentId: 'student-1', firstName: 'Asha', grNumber: 'GR-1', standardName: 'Class 1', divisionName: 'A', hasPhoto: false }], totalCount: 1 }, isFetching: false };
    }
    mocks.directoryInput = input;
    return { currentData: { items: mocks.directoryItems, totalCount: mocks.directoryItems.length }, isFetching: false };
  },
}));

beforeEach(() => {
  mocks.yearId = 'year-1';
  mocks.tableProps = {};
  mocks.savedDirectoryInput = {};
  mocks.otherTemplates = [];
  mocks.directoryItems = [];
  mocks.save.mockReset();
  mocks.toast.mockReset();
});

it('uses the shared table toolbar and footer for server search, sorting and pagination', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  expect(mocks.tableProps).toMatchObject({
    tableTitle: 'Students', serverSidePagination: true, serverSideSearch: true,
    serverSideSort: true, page: 0, rowsPerPage: 25,
  });
  expect(mocks.tableProps.isSearch).not.toBe(false);
  expect(mocks.tableProps.isFilter).not.toBe(false);
  expect(mocks.tableProps.isPagination).not.toBe(false);
  expect(mocks.tableProps.isShowedDense).not.toBe(false);

  fireEvent.click(screen.getByRole('button', { name: 'Table next page' }));
  expect(mocks.directoryInput).toMatchObject({ skipCount: 25, maxResultCount: 25 });

  fireEvent.click(screen.getByRole('button', { name: 'Table 50 rows' }));
  expect(mocks.directoryInput).toMatchObject({ skipCount: 0, maxResultCount: 50 });

  fireEvent.click(screen.getByRole('button', { name: 'Table search' }));
  expect(mocks.directoryInput).toMatchObject({ skipCount: 0, search: 'Asha' });

  fireEvent.click(screen.getByRole('button', { name: 'Table sort' }));
  expect(mocks.directoryInput).toMatchObject({ sorting: 'grnumber desc', skipCount: 0 });
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

it('includes every division and disables the division filter when multiple classes are selected', async () => {
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  fireEvent.click(screen.getByRole('button', { name: 'Class 1 (class-1)' }));
  fireEvent.click(screen.getByRole('button', { name: 'A (division-1)' }));
  expect(mocks.directoryInput.divisionIds).toEqual(['division-1']);

  fireEvent.click(screen.getByRole('button', { name: 'Select multiple classes' }));
  expect(screen.getByLabelText('Division choices')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText('All divisions are included when multiple classes are selected.')).toBeVisible();
  expect(mocks.directoryInput).toMatchObject({ standardIds: ['class-1', 'class-10'], divisionIds: [] });
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
  useGetRecordIdTemplatesQuery: () => ({ currentData: mocks.otherTemplates, isError: false, refetch: vi.fn() }),
  useSaveRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  useCreateRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
  useUpdateRecordIdTemplateMutation: () => [mocks.save, { isLoading: false }],
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

it('allows Next and Save with a blank school name', async () => {
  mocks.save.mockReturnValue({ unwrap: async () => ({ ...mocks.template, id: 'template-1', name: 'Class 1 template', schoolName: '' }) });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder initialTemplate={null} onClose={vi.fn()} /></ThemeProvider>);

  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Class 1 template' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();
  expect(screen.queryByText('Enter a school name.')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ schoolName: '' })));
});

it('retains the entered name when the save response omits it', async () => {
  mocks.save.mockReturnValue({ unwrap: async () => mocks.template });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder onClose={vi.fn()} /></ThemeProvider>);

  fireEvent.change(await screen.findByRole('textbox', { name: /Template name/ }), {
    target: { value: 'QA Student I-Card' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('textbox', { name: 'School name' })).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue('QA Student I-Card');
});

it('restores saved academic choices and students when editing, then saves them again', async () => {
  const template = {
    ...mocks.template, id: 'template-1', name: 'Class 1 card', concurrencyStamp: 'stamp-1',
    selection: { academicYearId: 'year-1', boardIds: ['board-1'], mediumIds: ['medium-1'],
      standardIds: ['class-1'], divisionIds: ['division-1'], studentIds: ['student-1'] },
  };
  mocks.save.mockReturnValue({ unwrap: async () => template });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder initialTemplate={template} onClose={vi.fn()} /></ThemeProvider>);

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(screen.getByText('1/100 students selected')).toBeVisible());
  expect(mocks.savedDirectoryInput).toMatchObject({ academicYearId: 'year-1', studentIds: ['student-1'] });
  expect(mocks.directoryInput).toMatchObject({ boardIds: ['board-1'], mediumIds: ['medium-1'], standardIds: ['class-1'], divisionIds: ['division-1'] });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'template-1', body: expect.objectContaining({ selection: template.selection }) })));
});

it('allows selecting a student assigned to another template and saves the transfer', async () => {
  const student = { studentId: 'student-2', firstName: 'Meera', grNumber: 'GR-2', standardName: 'Class 1', divisionName: 'A', hasPhoto: false };
  mocks.directoryItems = [student];
  mocks.otherTemplates = [{ id: 'template-other', name: 'Existing card', selection: { academicYearId: 'year-1', studentIds: [student.studentId] } }];
  mocks.save.mockReturnValue({ unwrap: async () => ({ ...mocks.template, id: 'template-new', name: 'Student card' }) });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder initialTemplate={null} onClose={vi.fn()} /></ThemeProvider>);
  await openStudentsStep();

  const selectionColumn = mocks.tableProps.columns.find((column: any) => column.id === 'select');
  const checkbox = selectionColumn.render(null, student);
  expect(checkbox.props.disabled).toBe(false);
  expect(mocks.tableProps.columns.find((column: any) => column.id === 'assignedTemplate').render(null, student)).toBe('Existing card');
  expect(selectionColumn.renderColumn().props.disabled).toBe(false);
  act(() => checkbox.props.onChange());
  expect(screen.getByText('Saving will move 1 selected student from their current template to this one.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({
    selection: expect.objectContaining({ academicYearId: 'year-1', studentIds: ['student-2'] }),
  })));
});

it('preserves saved students from another year during a design-only edit', async () => {
  const template = {
    ...mocks.template, id: 'template-1', name: 'Class 1 card', concurrencyStamp: 'stamp-1',
    selection: { academicYearId: 'year-2', boardIds: ['board-2'], mediumIds: ['medium-2'],
      standardIds: ['class-2'], divisionIds: ['division-2'], studentIds: ['student-1'] },
  };
  mocks.save.mockReturnValue({ unwrap: async () => template });
  render(<ThemeProvider theme={createTheme(defaultSettings)}><StudentICardBuilder initialTemplate={template} onClose={vi.fn()} /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ body: expect.objectContaining({ selection: template.selection }) })));
  expect(mocks.savedDirectoryInput).toEqual({});
});
