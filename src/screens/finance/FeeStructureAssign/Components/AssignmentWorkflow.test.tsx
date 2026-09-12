import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AssignmentWorkflow from './AssignmentWorkflow';

const mocks = vi.hoisted(() => ({ preview: vi.fn(), commit: vi.fn(), bulkPreview: vi.fn(), bulkCommit: vi.fn(), details: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({ default: ({ label, options, onChange, value, disabled }: any) => <select aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}><option value="">Select</option>{options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> }));
vi.mock('./AssignmentStudentInputs', () => ({ default: ({ request, onChange }: any) => <button type="button" onClick={() => onChange({ ...request, selectedOptionalFeeHeadIds: ['transport'] })}>Include transport for {request.studentId}</button> }));
vi.mock('./AssignmentReview', () => ({ default: ({ data, committed }: any) => <p>{committed ? 'Committed' : 'Preview'} amount {data.proratedTotal}</p> }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  assignmentError: () => 'Preview again',
  useAssignmentCandidatesQuery: () => ({ data: [{ id: 'structure', name: 'Annual fees', revisionNumber: 1, heads: [] }] }),
  useAssignmentDetailsQuery: () => mocks.details(),
  useAssignmentPreviewMutation: () => [mocks.preview, {}],
  useAssignmentCommitMutation: () => [mocks.commit, {}],
  useAssignmentBulkPreviewMutation: () => [mocks.bulkPreview, {}],
  useAssignmentBulkCommitMutation: () => [mocks.bulkCommit, {}],
}));
const result = (id = 'one', amount = 12000) => ({ studentId: id, previewToken: `token-${id}`, proratedTotal: amount });
function mount(students = [{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false }]) {
  const store = configureStore({ reducer: (state = { auth: { permissions: ['View', 'Add'].map((name) => ({ name: `Finance.Fees.StructureAssign.${name}`, isGranted: true })) } }) => state });
  return render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}><AssignmentWorkflow students={students} academicYearId="year" onClose={vi.fn()} /></ThemeProvider></Provider>);
}
async function selectStructure() {
  fireEvent.change(screen.getByRole('combobox', { name: 'Published fee structure revision' }), { target: { value: 'structure' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('button', { name: 'Preview assignments' });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.details.mockReturnValue({});
  mocks.preview.mockImplementation(() => ({ unwrap: async () => result() }));
  mocks.commit.mockImplementation(() => ({ unwrap: async () => ({ assignmentId: 'assignment', outcome: 'Assigned', assignment: result() }) }));
});
describe('assignment review and commit boundaries', () => {
  it('invalidates a successful preview when optional heads change', async () => {
    mount(); await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    expect(screen.getByRole('button', { name: 'Confirm assignment (1)' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Include transport for one' }));
    expect(screen.queryByRole('button', { name: /Confirm assignment/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Preview amount 12000')).not.toBeInTheDocument();
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('blocks back navigation and duplicate previews while calculating', async () => {
    let resolve!: (value: any) => void;
    mocks.preview.mockReturnValue({ unwrap: () => new Promise((done) => { resolve = done; }) });
    mount(); await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Preview assignments' })).toBeDisabled();
    resolve(result());
    await screen.findByText('Preview amount 12000');
    expect(mocks.preview).toHaveBeenCalledTimes(1);
  });
  it('submits the reviewed token and retains canonical completion', async () => {
    mount(); await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment (1)' }));
    await screen.findByText('Committed amount 12000');
    expect(mocks.commit).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'one', academicYearId: 'year', previewToken: 'token-one', selectedOptionalFeeHeadIds: [] }));
    expect(screen.queryByRole('button', { name: 'Preview assignments' })).not.toBeInTheDocument();
  });
  it('retries only failed students after a partially successful bulk commit', async () => {
    mocks.bulkPreview.mockImplementation(({ items }) => ({ unwrap: async () => ({ results: items.map((i: any) => ({ studentId: i.studentId, preview: result(i.studentId) })) }) }));
    mocks.bulkCommit.mockReturnValue({ unwrap: async () => ({ successCount: 1, failedCount: 1, skippedCount: 0, alreadyAssignedCount: 0, results: [
      { studentId: 'one', outcome: 'Assigned', result: { assignmentId: 'a', assignment: result() } }, { studentId: 'two', outcome: 'Failed', errorMessage: 'Preview again' },
    ] }) });
    mount([{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false }, { studentId: 'two', studentName: 'Meera', isFeeStructureAssigned: false }]);
    await selectStructure(); fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByRole('button', { name: 'Confirm assignment (2)' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment (2)' }));
    await screen.findByText('Committed amount 12000');
    fireEvent.click(screen.getByRole('button', { name: 'Review remaining students' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await waitFor(() => expect(mocks.bulkPreview).toHaveBeenLastCalledWith({ items: [expect.objectContaining({ studentId: 'two' })] }));
  });
  it('requires a structure before advancing or requesting a preview', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Preview assignments' })).not.toBeInTheDocument();
    expect(mocks.preview).not.toHaveBeenCalled();
  });
});
