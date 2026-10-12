import { beforeEach, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import StudentCertificateForm from './student-certificate-form';

const mocks = vi.hoisted(() => ({ preview: vi.fn(), issue: vi.fn(), directory: vi.fn(), generated: vi.fn(), close: vi.fn() }));
const students = [
  { id: 'student-1', studentId: 'student-1', firstName: 'Asha', lastName: 'Patel', grNumber: 'GR-1', standardName: 'Class 1', divisionName: 'A', maskedFields: [] },
  { id: 'student-2', studentId: 'student-2', firstName: 'Ravi', lastName: 'Shah', grNumber: 'GR-2', standardName: 'Class 1', divisionName: 'A', maskedFields: [] },
];
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year-1' } }, auth: { permissions: [] } }) }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children, onSubmit, hasForm }: any) => !open ? null : <section role="dialog" aria-label={title}><h2>{title}</h2>{hasForm === false ? children : <form onSubmit={onSubmit}>{children}</form>}</section>,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/custom-select', () => ({ default: ({ label, options, value, onChange, disabled }: any) => <>
  <label htmlFor={`mock-select-${label.replace(/\s+/g, '-')}`}>{label}</label>
  <select id={`mock-select-${label.replace(/\s+/g, '-')}`} value={value} disabled={disabled}
    onChange={event => onChange(event.target.value)}><option value="" disabled>Select</option>{options.map((option: any) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
</> }));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: ({ label }: any) => <div>{label}</div> }));
vi.mock('src/components/customizabaleTable', () => ({ default: ({ columns, data }: any) => <div>{columns.map((column: any) => <div key={column.id}>{column.label}</div>)}
  {data.map((row: any) => <div key={row.id}>{columns.map((column: any) => <span key={column.id}>{column.render ? column.render(row[column.id], row) : row[column.id]}</span>)}</div>)}</div> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: () => ({ currentData: {
    boards: [{ id: 'board-1', name: 'Board 1', parentId: 'year-1' }, { id: 'board-2', name: 'Board 2', parentId: 'year-1' }],
    mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
    stages: [{ id: 'stage-1', name: 'Primary', parentId: 'medium-1' }],
    standards: [{ id: 'class-1', name: 'Class 1', parentId: 'medium-1', stageId: 'stage-1' }],
    divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
  } }),
  useGetStudentRecordsDirectoryQuery: (input: any) => { mocks.directory(input); return { currentData: { items: students, totalCount: 2 } }; },
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({ useGetStudentRecordTransitionsQuery: () => ({ currentData: { items: [] } }) }));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  usePreviewRecordCertificateMutation: () => [(input: any) => ({ unwrap: () => mocks.preview(input) })],
  useIssueRecordCertificateMutation: () => [(input: any) => ({ unwrap: () => mocks.issue(input) })],
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.preview.mockImplementation(async input => ({ certificateNo: 'Preview', issueDate: input.issueDate,
    student: { studentId: input.studentId, studentName: input.studentId === 'student-1' ? 'Asha Patel' : 'Ravi Shah' },
    template: { renderedHeaderContent: 'Bonafide certificate', renderedFooterContent: 'Principal signature' }, certificateData: { Reason: input.certificateFields.Reason } }));
  mocks.issue.mockResolvedValue({});
});

it('previews selected names in a dialog and retries a partial generation with the same student keys', async () => {
  const user = userEvent.setup();
  render(<StudentCertificateForm certificateType={1} certificateLabel="Bonafide" onClose={mocks.close} onGenerated={mocks.generated} />);
  await user.selectOptions(screen.getByRole('combobox', { name: 'School level' }), 'stage-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Class' }), 'class-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Division' }), 'division-1');
  await user.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  await user.click(screen.getByRole('checkbox', { name: 'Select Ravi Shah' }));
  await user.type(screen.getByRole('textbox', { name: 'Purpose / reason' }), 'Scholarship application');
  await user.click(screen.getByRole('button', { name: 'Preview' }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('dialog', { name: 'Bonafide certificate preview' })).toBeInTheDocument();
  expect(mocks.preview.mock.calls.map(call => call[0].studentId)).toEqual(['student-1', 'student-2']);
  expect(mocks.preview.mock.calls[0][0].issueDate).toMatch(/Z$/);
  mocks.issue.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Temporary failure'));
  await user.click(screen.getByRole('button', { name: 'Generate certificates (2)' }));
  await screen.findByText(/1 of 2 certificates generated/);
  await user.click(screen.getByRole('button', { name: 'Generate certificates (2)' }));
  await waitFor(() => expect(mocks.generated).toHaveBeenCalledOnce());
  expect(mocks.issue.mock.calls[2][0].idempotencyKey).toBe(mocks.issue.mock.calls[0][0].idempotencyKey);
  expect(mocks.issue.mock.calls[3][0].idempotencyKey).toBe(mocks.issue.mock.calls[1][0].idempotencyKey);
});

it('filters through academic stage and clears student selection when hierarchy changes', async () => {
  const user = userEvent.setup();
  render(<StudentCertificateForm certificateType={1} certificateLabel="Bonafide" onClose={mocks.close} onGenerated={mocks.generated} />);
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('board-1');
  expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveValue('medium-1');
  expect(screen.getByRole('combobox', { name: 'Class' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Division' })).toBeDisabled();
  expect(screen.queryByRole('option', { name: /^All$/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Select Asha Patel' })).not.toBeInTheDocument();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Board' }), 'board-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Medium' }), 'medium-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'School level' }), 'stage-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Class' }), 'class-1');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Division' }), 'division-1');
  expect(mocks.directory).toHaveBeenLastCalledWith(expect.objectContaining({ academicYearId: 'year-1', includeActiveStudentList: true,
    boardId: 'board-1', mediumId: 'medium-1', academicMediumStageId: 'stage-1', standardId: 'class-1', divisionId: 'division-1' }));
  await user.click(screen.getByRole('checkbox', { name: 'Select Asha Patel' }));
  await user.selectOptions(screen.getByRole('combobox', { name: 'Board' }), 'board-2');
  expect(screen.queryByRole('checkbox', { name: 'Select Asha Patel' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveValue('');
  expect(screen.getByRole('combobox', { name: 'School level' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Class' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Division' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Preview' })).toBeDisabled();
  expect(mocks.preview).not.toHaveBeenCalled();
});
