import type { ReactNode } from 'react';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { screen, within, waitFor, fireEvent, render as testingRender } from '@testing-library/react';

import StudentICardBuilder from './student-icard-builder';
import { createStudentICardTemplate } from './student-icard-design';
import { StudentCardPreview } from './components/student-card-preview';
import StudentICardTemplateEditor from './student-icard-template-editor';

const store = configureStore({
  reducer: {
    auth: () => ({ permissions: [], permissionsInitialized: true }),
    confirmPopup: () => ({ isChanges: false }),
  },
});
const render = (ui: ReactNode) => testingRender(ui, {
  wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
});

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  preview: vi.fn(),
  export: vi.fn(),
  issue: vi.fn(),
  download: vi.fn(),
  photo: vi.fn(),
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
vi.mock('src/components/identity-card-designer/photo-editor/card-photo-action', () => ({
  CardPhotoAction: ({ record, onPhotoEdit }: {
    record?: { id: string; load: () => Promise<{ recordId: string; sourceHash: string; imageData: string }> };
    onPhotoEdit: (edit: { recordId: string; sourceHash: string; imageData: string }) => void;
  }) => record ? <button type="button" onClick={async () => {
    const source = await record.load();
    onPhotoEdit({ ...source, imageData: 'data:image/png;base64,BBBB' });
  }}>Apply test photo</button> : null,
}));
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
  useLazyGetRecordIdPhotoQuery: () => [(id: string) => ({ unwrap: () => mocks.photo(id) })],
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
const renderTemplateEditor = (initialTemplate: IdCardTemplate | null = null) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentICardTemplateEditor
        initialTemplate={initialTemplate}
        canEdit
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onBusyChange={vi.fn()}
        onDirtyChange={vi.fn()}
      />
    </ThemeProvider>
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

it('switches both Classic Identity previews and saves the selected orientation', async () => {
  mocks.save.mockImplementationOnce((body) => ({ unwrap: async () => body }));
  renderDirectory({ initialStudents: undefined, initialTemplate: null });
  expect(await screen.findByRole('button', { name: /Classic Identity/ })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Testing I card' },
  });

  const horizontal = screen.getByRole('button', { name: 'Horizontal' });
  const vertical = screen.getByRole('button', { name: 'Vertical' });
  expect(horizontal).toHaveAttribute('aria-pressed', 'true');
  expect(vertical).toBeEnabled();
  fireEvent.click(vertical);
  expect(vertical).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: 'Front identity card preview' })).toHaveAttribute(
    'viewBox',
    '0 0 270 428'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('img', { name: 'Back identity card preview' })).toHaveAttribute(
    'viewBox',
    '0 0 270 428'
  );
  fireEvent.click(horizontal);
  expect(horizontal).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: 'Back identity card preview' })).toHaveAttribute(
    'viewBox',
    '0 0 428 270'
  );

  fireEvent.click(vertical);
  nextStep();
  fireEvent.change(await screen.findByRole('textbox', { name: /^School name/ }), {
    target: { value: 'Test School' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  const saved = mocks.save.mock.calls[0][0];
  expect(saved).toMatchObject({
    name: 'Testing I card',
    presetKey: 'classic-identity',
    orientation: 'Vertical',
  });
  expect(JSON.parse(saved.layoutJson)).toMatchObject({
    orientation: 'Vertical',
    widthMm: 53.98,
    heightMm: 85.6,
  });
});

it('measures the legacy preview when switching from Classic Identity', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 210,
  } as DOMRect);
  renderDirectory({ initialStudents: undefined, initialTemplate: null });
  expect(screen.getByRole('img', { name: 'Front identity card preview' })).toBeVisible();

  const photoFirst = screen.getByRole('button', { name: /Photo First/ });
  fireEvent.click(photoFirst);
  expect(photoFirst).toHaveAttribute('aria-pressed', 'true');
  const preview = screen.getByRole('img', { name: 'I-Card composition preview' });
  expect(preview.firstElementChild).toHaveStyle({
    transform: 'scale(0.5)',
    borderColor: '#BE123C',
  });

  fireEvent.click(screen.getByRole('button', { name: /Classic Identity/ }));
  fireEvent.click(screen.getByRole('button', { name: /Vertical Badge/ }));
  expect(screen.getByRole('img', { name: 'I-Card composition preview' })).toHaveStyle({
    aspectRatio: '260 / 420',
  });
});

it('updates the live preview name and Classic Identity orientation from Template Details', () => {
  renderDirectory({ initialStudents: undefined, initialTemplate: null });
  const settings = within(screen.getByRole('region', { name: 'Template Details' }));
  const preview = within(screen.getByRole('region', { name: 'Live Preview' }));
  fireEvent.change(settings.getByRole('textbox', { name: /Template name/ }), {
    target: { value: 'Student cards 2026' },
  });
  expect(preview.getByText('Student cards 2026')).toBeVisible();

  fireEvent.click(settings.getByRole('button', { name: 'Vertical' }));
  expect(settings.getByRole('button', { name: 'Vertical' })).toHaveAttribute('aria-pressed', 'true');
  expect(preview.getByRole('img', { name: 'Front identity card preview' })).toHaveAttribute(
    'viewBox',
    '0 0 270 428'
  );
});

it('puts the template name and orientation before the base templates', () => {
  renderTemplateEditor();
  const details = screen.getByRole('region', { name: 'Template Details' });
  const presets = screen.getByRole('region', { name: 'Choose a Base Template' });
  expect(details.compareDocumentPosition(presets)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(within(details).getByRole('textbox', { name: /Template name/ })).toBeRequired();
  expect(within(details).getByRole('group', { name: 'Card orientation' })).toBeVisible();
  expect(within(presets).getAllByRole('button', { pressed: true })).toHaveLength(1);
  expect(within(presets).getByRole('button', { name: /Classic Identity/ })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('displays saved physical dimensions and follows presets and orientation in the template preview', () => {
  const configured = createStudentICardTemplate();
  const layout = JSON.parse(configured.layoutJson!);
  renderTemplateEditor({
    ...configured,
    name: 'Custom student card',
    layoutJson: JSON.stringify({ ...layout, widthMm: 84.75, heightMm: 55.25 }),
  });
  const preview = within(screen.getByRole('region', { name: 'Template Preview' }));
  expect(preview.getByText('84.75 × 55.25 mm')).toBeVisible();
  expect(preview.getByText('Landscape')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Vertical' }));
  expect(preview.getByText('55.25 × 84.75 mm')).toBeVisible();
  expect(preview.getByText('Portrait')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: /Formal Student/ }));
  expect(preview.getByText('85.6 × 54 mm')).toBeVisible();
  expect(preview.getByText('Landscape')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: /Vertical Badge/ }));
  expect(preview.getByText('54 × 85.6 mm')).toBeVisible();
  expect(preview.getByText('Portrait')).toBeVisible();
});

it('shows both sides of each preset and previews orientation while a blank name blocks Next and Save', () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 210,
  } as DOMRect);
  renderDirectory({ initialStudents: undefined, initialTemplate: null });
  nextStep();
  expect(screen.getByText('Template name is required.')).toBeVisible();

  const presets = [
    ['Formal Student', '#1D4ED8', '420 / 260', '428 270'],
    ['Modern Student', '#0F766E', '420 / 260', '428 270'],
    ['Vertical Badge', '#7C3AED', '260 / 420', '270 428'],
    ['Visitor Style', '#B45309', '420 / 260', '428 270'],
    ['Minimal', '#334155', '420 / 260', '428 270'],
    ['Photo First', '#BE123C', '420 / 260', '428 270'],
  ];
  presets.forEach(([label, accent, aspectRatio, dimensions]) => {
    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
    const front = screen.getByRole('img', { name: 'I-Card composition preview' });
    expect(front).toHaveStyle({ aspectRatio });
    expect(front.firstElementChild).toHaveStyle({ borderColor: accent });
    expect(front).toHaveTextContent(/student name/i);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    const back = screen.getByRole('img', { name: 'Back identity card preview' });
    expect(back).toHaveAttribute('viewBox', `0 0 ${dimensions}`);
    expect(back).toHaveTextContent('Please return this card to the school if found.');
    fireEvent.click(screen.getByRole('button', { name: 'Front' }));
  });

  fireEvent.click(screen.getByRole('button', { name: 'Vertical' }));
  expect(screen.getByRole('img', { name: 'I-Card composition preview' })).toHaveStyle({
    aspectRatio: '260 / 420',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Template name is required.')).toBeVisible();
  expect(screen.getByRole('img', { name: 'I-Card composition preview' })).toBeVisible();
  expect(mocks.save).not.toHaveBeenCalled();
});

it('retains the selected cohort and shows the named element when PDF text does not fit', async () => {
  preparePreviews();
  const detail = "Text in 'Student name' does not fit. Enlarge the element or reduce its font size.";
  mocks.export.mockRejectedValue({ status: 400,
    data: { error: { code: 'ShikshaMitra:IdentityCard:InvalidConfiguration', data: { detail } } } });
  renderDirectory();
  await screen.findByText('2/100 selected');
  nextStep();
  await screen.findByRole('heading', { name: 'Review Cards' });
  nextStep();
  await screen.findByRole('heading', { name: 'A4 Print Preview' });
  fireEvent.click(screen.getByRole('button', { name: 'Export bulk PDF' }));
  expect(await screen.findByText(detail)).toBeVisible();
  expect(mocks.export).toHaveBeenCalledWith(expect.objectContaining({ studentIds: ['student-1', 'student-2'] }));
  expect(mocks.issue).not.toHaveBeenCalled();
});

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
  expect(screen.getAllByRole('img', { name: /I-Card preview for/ })).toHaveLength(1);
  expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
  expect(screen.getByText('2 missing photos')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Previous student' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Next student' }));
  expect(screen.getByRole('img', { name: 'I-Card preview for Neha Patel' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Next student' })).toBeDisabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Student to preview' }), {
    target: { value: 'student-1' },
  });
  expect(screen.getByRole('img', { name: 'I-Card preview for Asha Patel' })).toBeVisible();
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
  expect(screen.getByRole('img', { name: 'I-Card preview for Neha Patel' })).toBeVisible();
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

it('keeps a cardholder photo out of templates and sends it only for the selected export', async () => {
  preparePreviews();
  mocks.photo.mockResolvedValue({ recordId: 'student-1', sourceHash: 'original-hash', imageData: 'data:image/png;base64,AAAA' });
  mocks.export.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
  const onDirtyChange = vi.fn();
  renderDirectory({ initialStudents: [{ ...selectedStudents[0], hasPhoto: true }], onDirtyChange });
  await screen.findByText('1/100 selected');
  nextStep();
  fireEvent.click(await screen.findByRole('button', { name: 'Apply test photo' }));
  await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
  expect(mocks.photo).toHaveBeenCalledWith('student-1');
  nextStep();
  fireEvent.click(await screen.findByRole('button', { name: 'Export bulk PDF' }));
  await waitFor(() => expect(mocks.export).toHaveBeenCalledWith(expect.objectContaining({
    studentIds: ['student-1'],
    photoEdits: [{ recordId: 'student-1', sourceHash: 'original-hash', imageData: 'data:image/png;base64,BBBB' }],
  })));
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
  const board = await screen.findByRole('combobox', { name: 'Board' });
  expect(board).not.toBeDisabled();
  expect(board).toHaveValue('board-1');
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
  const preview = screen.getByRole('img', { name: 'I-Card preview for Asha Patel' });
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

  const name = await screen.findByRole('textbox', { name: /Template name/ });
  expect(name).toHaveValue('');
  expect(name).toBeRequired();
  expect(name).not.toHaveAttribute('aria-invalid', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByText('Template name is required.')).toBeVisible();
  expect(name).toHaveAttribute('aria-invalid', 'true');
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
  expect(await screen.findByRole('textbox', { name: /^School name/ })).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('textbox', { name: /Template name/ })).toHaveValue(
    'QA Student I-Card'
  );
});
