import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import AssignmentWorkflow from './AssignmentWorkflow';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  commit: vi.fn(),
  bulkPreview: vi.fn(),
  bulkCommit: vi.fn(),
  details: vi.fn(),
  update: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, onChange, value, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('./AssignmentStudentInputs', () => ({
  default: ({ request, onChange }: any) => (
    <>
      <button
        type="button"
        onClick={() => onChange({ ...request, selectedOptionalFeeHeadIds: ['transport'] })}
      >
        Include transport for {request.studentId}
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            ...request,
            servicePeriods: [
              {
                feeHeadId: 'tuition',
                source: 'ManualOverride',
                startDate: '2026-08-01',
                endDate: '2027-05-14',
                reason: 'Shared dates',
              },
            ],
            feeHeadDetails: [{ feeHeadId: 'tuition', amount: 1000 }],
            variableFeeHeads: [{ feeHeadId: 'transport', amount: 500 }],
          })
        }
      >
        Set common fees and dates
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            ...request,
            servicePeriods: [
              {
                feeHeadId: 'tuition',
                source: 'ManualOverride',
                startDate: '2026-06-14',
                endDate: '2027-05-14',
                reason: 'Approved',
              },
            ],
          })
        }
      >
        Use out-of-year dates
      </button>
    </>
  ),
}));
vi.mock('./AssignmentReview', () => ({
  default: ({ data, committed, onEdit }: any) => (
    <div>
      {onEdit && (
        <button type="button" onClick={() => onEdit(1)}>
          Edit preview
        </button>
      )}
      {committed ? 'Committed' : 'Preview'} amount {data.proratedTotal}
    </div>
  ),
}));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  assignmentPolicyFamilies: ['concession', 'refund', 'collection', 'proration'],
  selectableAssignmentPolicyFamilies: ['refund', 'collection'],
  useAssignmentPolicyOptionsQuery: () => ({
    data: [
      {
        family: 'collection',
        policyId: 'collection-policy',
        versionId: 'collection-version',
        name: 'Student collection',
        version: 1,
      },
      {
        family: 'refund',
        policyId: 'refund-policy',
        versionId: 'refund-version',
        name: 'Student refund',
        version: 1,
      },
    ],
  }),
  useAssignmentUpdatePoliciesMutation: () => [mocks.update, {}],
  assignmentError: () => 'Preview again',
  assignmentErrorCode: () => '',
  useAssignmentCandidatesQuery: () => ({
    data: [
      {
        id: 'structure',
        name: 'Annual fees',
        revisionNumber: 1,
        heads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', isOptional: false }],
        policies: [
          {
            family: 'collection',
            policyId: 'default-policy',
            versionId: 'default-version',
            name: 'School collection',
            version: 2,
          },
        ],
      },
    ],
  }),
  useAssignmentDetailsQuery: () => mocks.details(),
  useAssignmentPreviewMutation: () => [mocks.preview, {}],
  useAssignmentCommitMutation: () => [mocks.commit, {}],
  useAssignmentBulkPreviewMutation: () => [mocks.bulkPreview, {}],
  useAssignmentBulkCommitMutation: () => [mocks.bulkCommit, {}],
}));
const result = (id = 'one', amount = 12000) => ({
  studentId: id,
  currency: 'INR',
  previewToken: `token-${id}`,
  proratedTotal: amount,
});
function mount(
  students = [{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false }],
  canOverride = false
) {
  const store = configureStore({
    reducer: (
      state = {
        globalState: {
          currentYear: { id: 'year', startDate: '2026-06-15', endDate: '2027-05-14' },
        },
        auth: {
          permissions: ['View', 'Add', ...(canOverride ? ['OverridePolicies'] : [])].map(
            (name) => ({ name: `Finance.Fees.StructureAssign.${name}`, isGranted: true })
          ),
        },
      }
    ) => state,
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AssignmentWorkflow students={students} academicYearId="year" onClose={vi.fn()} />
      </ThemeProvider>
    </Provider>
  );
}
async function chooseStructure() {
  fireEvent.change(screen.getByRole('combobox', { name: 'Fee structure' }), {
    target: { value: 'structure' },
  });
  await screen.findByText('Policies');
  const editPolicies = screen.getByRole('button', { name: 'Edit policies' });
  if (!editPolicies.hasAttribute('disabled')) fireEvent.click(editPolicies);
}
async function selectStructure() {
  await chooseStructure();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('button', { name: 'Preview assignments' });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.details.mockReturnValue({});
  mocks.preview.mockImplementation(() => ({ unwrap: async () => result() }));
  mocks.commit.mockImplementation(() => ({
    unwrap: async () => ({ assignmentId: 'assignment', outcome: 'Assigned', assignment: result() }),
  }));
});
describe('assignment review and commit boundaries', () => {
  it('requires a new preview when its server expiry has passed before confirmation', async () => {
    mocks.preview.mockImplementation(() => ({
      unwrap: async () => ({
        ...result(),
        previewExpiresAt: new Date(Date.now() - 1000).toISOString(),
      }),
    }));
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('This preview has expired. Preview again before assigning fees.');
    expect(screen.getByRole('button', { name: 'Assign fees (1)' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Review and refresh' }));
    expect(await screen.findByRole('button', { name: 'Preview assignments' })).toBeEnabled();
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it('shows truthful batch progress and prevents dismissing or submitting again', async () => {
    let finish!: (value: any) => void;
    mocks.bulkPreview.mockImplementation(({ items }) => ({
      unwrap: async () => ({
        results: items.map((item: any) => ({
          studentId: item.studentId,
          preview: result(item.studentId),
        })),
      }),
    }));
    mocks.bulkCommit.mockImplementation(() => ({
      unwrap: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    }));
    mount([
      { studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false },
      { studentId: 'two', studentName: 'Meera', isFeeStructureAssigned: false },
    ]);
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Assign fees (2)' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Assigning 2 students…');
    expect(screen.getByRole('progressbar', { name: 'Assigning 2 students…' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Assign fees (2)' }));
    expect(mocks.bulkCommit).toHaveBeenCalledTimes(1);
    finish({
      successCount: 1,
      alreadyAssignedCount: 0,
      skippedCount: 0,
      failedCount: 1,
      results: [
        {
          studentId: 'one',
          outcome: 'Assigned',
          result: { assignmentId: 'a', outcome: 'Assigned', assignment: result() },
        },
        { studentId: 'two', outcome: 'Failed', errorMessage: 'Preview expired or changed' },
      ],
    });
    await screen.findByText('1 assigned · 1 need attention.');
    expect(
      screen.queryByRole('progressbar', { name: 'Assigning 2 students…' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select Meera' }));
    expect(await screen.findByText('Preview expired or changed')).toBeVisible();
    expect(screen.queryByText('Committed amount 12000')).not.toBeInTheDocument();
  }, 15000);

  it('retrieves the saved result with the same token after a lost response and expiry', async () => {
    const reviewedAt = Date.now();
    mocks.preview.mockImplementation(() => ({
      unwrap: async () => ({
        ...result(),
        previewExpiresAt: new Date(reviewedAt + 20 * 60_000).toISOString(),
      }),
    }));
    mocks.commit
      .mockImplementationOnce(() => ({
        unwrap: async () => {
          throw new Error('Confirmation response was not received');
        },
      }))
      .mockImplementationOnce(() => ({
        unwrap: async () => ({
          assignmentId: 'saved',
          outcome: 'AlreadyAssigned',
          assignment: result(),
        }),
      }));
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Assign fees (1)' }));
    await screen.findByText(
      'Assignment status could not be confirmed. Retry this review to safely retrieve any saved assignments.'
    );
    expect(screen.queryByText('Committed amount 12000')).not.toBeInTheDocument();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(reviewedAt + 21 * 60_000);
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Assign fees (1)' }));
      await screen.findByText('Committed amount 12000');
      expect(mocks.commit.mock.calls[1][0]).toEqual(mocks.commit.mock.calls[0][0]);
      expect(screen.getByText('Already assigned')).toBeVisible();
      expect(
        screen.queryByText(/Assignment status could not be confirmed/)
      ).not.toBeInTheDocument();
    } finally {
      clock.mockRestore();
    }
  });

  it('uses exactly three steps and a single open student form', async () => {
    mount();
    expect(screen.getAllByRole('button', { name: /^Step [0-9]:/ })).toHaveLength(3);
    await selectStructure();
    expect(screen.queryByRole('button', { name: 'Aarav' })).not.toBeInTheDocument();
    expect(screen.queryByText('Policies')).not.toBeInTheDocument();
    expect(screen.queryByText('Select fee structure')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fees & dates' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Include transport for one' })).toBeVisible();
  });
  it('puts policies in step one and blocks advancing without an override reason', async () => {
    mount(undefined, true);
    await chooseStructure();
    expect(screen.queryByText('Select fee structure')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Include transport for one' })
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('policy override reason');
    expect(screen.getByRole('combobox', { name: 'Collection policy' })).toHaveValue(
      'collection-version'
    );
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('shows names only during bulk setup and preserves the common form while searching', async () => {
    mount(
      [
        { studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false },
        { studentId: 'two', studentName: 'Meera', isFeeStructureAssigned: false },
      ],
      true
    );
    await chooseStructure();
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Policy override reason/ }), {
      target: { value: 'Approved for all selected students' },
    });
    const list = screen.getByRole('list', { name: 'Selected students' });
    expect(within(list).getByText('Aarav')).toBeVisible();
    expect(within(list).getByText('Meera')).toBeVisible();
    expect(within(list).queryByRole('button')).not.toBeInTheDocument();
    expect(within(list).queryByText('Configure')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search selected students' }), {
      target: { value: 'Aarav' },
    });
    expect(within(list).queryByText('Meera')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Collection policy' })).toHaveValue(
      'collection-version'
    );
    expect(screen.getByRole('textbox', { name: /Policy override reason/ })).toHaveValue(
      'Approved for all selected students'
    );
  });
  it('blocks an out-of-year service period before preview', async () => {
    mount();
    fireEvent.change(screen.getByRole('combobox', { name: 'Fee structure' }), {
      target: { value: 'structure' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Use out-of-year dates' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('within the selected academic year');
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Preview assignments' })).toBeInTheDocument();
  });
  it('saves edited policies with the assignment concurrency stamp and reason', async () => {
    const refetch = vi.fn();
    mocks.details.mockReturnValue({
      data: {
        assignment: {
          ...result(),
          academicYearId: 'year',
          policies: [
            {
              family: 'collection',
              versionId: 'default-version',
              name: 'School collection',
              version: 2,
            },
          ],
        },
        warnings: [],
        concurrencyStamp: 'saved-stamp',
      },
      refetch,
    });
    mocks.update.mockReturnValue({ unwrap: async () => ({}) });
    mount([{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: true }], true);
    fireEvent.click(screen.getByRole('button', { name: 'Edit assigned policies' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    expect(screen.getByRole('button', { name: 'Save policies' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: /Policy change reason/ }), {
      target: { value: 'Approved grace policy' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save policies' }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'one',
          academicYearId: 'year',
          concurrencyStamp: 'saved-stamp',
          reason: 'Approved grace policy',
          policies: expect.arrayContaining([
            { family: 'collection', versionId: 'collection-version' },
          ]),
        })
      )
    );
    expect(mocks.update.mock.calls[0][0].policies).toHaveLength(3);
    expect(mocks.update.mock.calls[0][0].policies).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ family: 'proration' })])
    );
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: 'Save policies' })).not.toBeInTheDocument();
  });
  it('preserves policy edits when the server rejects a save', async () => {
    mocks.details.mockReturnValue({
      data: {
        assignment: {
          ...result(),
          academicYearId: 'year',
          policies: [
            {
              family: 'collection',
              versionId: 'default-version',
              name: 'School collection',
              version: 2,
            },
          ],
        },
        warnings: [],
        concurrencyStamp: 'saved-stamp',
      },
    });
    mocks.update.mockReturnValue({
      unwrap: async () => {
        throw new Error('conflict');
      },
    });
    mount([{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: true }], true);
    fireEvent.click(screen.getByRole('button', { name: 'Edit assigned policies' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Policy change reason/ }), {
      target: { value: 'Approved grace policy' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save policies' }));
    await screen.findByText(/Reopen the assignment/);
    expect(screen.getByRole('combobox', { name: 'Collection policy' })).toHaveValue(
      'collection-version'
    );
    expect(screen.getByRole('textbox', { name: /Policy change reason/ })).toHaveValue(
      'Approved grace policy'
    );
  });
  it('keeps assigned policies read-only without policy override access', () => {
    mocks.details.mockReturnValue({ data: { assignment: result(), warnings: [] } });
    mount([{ studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: true }]);
    expect(
      screen.queryByRole('button', { name: 'Edit assigned policies' })
    ).not.toBeInTheDocument();
  });
  it('shows defaults and locks policy selectors without override access', async () => {
    mount();
    await chooseStructure();
    expect(screen.getByText('School collection · v2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit policies' })).toBeDisabled();
    expect(screen.queryByRole('combobox', { name: 'Collection policy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Proration policy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Concession policy' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Policy override access information' })
    ).not.toBeInTheDocument();
  });
  it('applies common policies, resets, fees and dates to every bulk preview and commit request', async () => {
    mocks.bulkPreview.mockImplementation(({ items }) => ({
      unwrap: async () => ({
        results: items.map((item: any) => ({
          studentId: item.studentId,
          preview: result(item.studentId),
        })),
      }),
    }));
    mocks.bulkCommit.mockImplementation(({ items }) => ({
      unwrap: async () => ({
        results: items.map((item: any) => ({
          studentId: item.studentId,
          outcome: 'Assigned',
          result: {
            assignmentId: item.studentId,
            outcome: 'Assigned',
            assignment: result(item.studentId),
          },
        })),
      }),
    }));
    mount(
      [
        { studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false },
        { studentId: 'two', studentName: 'Meera', isFeeStructureAssigned: false },
      ],
      true
    );
    await chooseStructure();
    const refundSelectors = screen.getAllByRole('combobox', { name: 'Refund policy' });
    const collectionSelectors = screen.getAllByRole('combobox', { name: 'Collection policy' });
    fireEvent.change(refundSelectors[0], { target: { value: 'refund-version' } });
    fireEvent.change(collectionSelectors[0], { target: { value: 'collection-version' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset refund' }));
    expect(refundSelectors[0]).toHaveValue('');
    fireEvent.change(screen.getByRole('textbox', { name: /Policy override reason/ }), {
      target: { value: 'Approved bulk exception' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Include transport for one' }));
    fireEvent.click(screen.getByRole('button', { name: 'Set common fees and dates' }));
    expect(
      within(screen.getByRole('list', { name: 'Selected students' })).queryByRole('button')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit policies' }));
    expect(screen.getByRole('textbox', { name: /Policy override reason/ })).toHaveValue(
      'Approved bulk exception'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await waitFor(() => expect(mocks.bulkPreview).toHaveBeenCalledTimes(1));
    const requests = mocks.bulkPreview.mock.calls[0][0].items;
    expect(requests.find((item: any) => item.studentId === 'one')).toEqual(
      expect.objectContaining({
        policies: [{ family: 'collection', versionId: 'collection-version' }],
        policyOverrideReason: 'Approved bulk exception',
        selectedOptionalFeeHeadIds: ['transport'],
        feeHeadDetails: [{ feeHeadId: 'tuition', amount: 1000 }],
        variableFeeHeads: [{ feeHeadId: 'transport', amount: 500 }],
        servicePeriods: [
          {
            feeHeadId: 'tuition',
            source: 'ManualOverride',
            startDate: '2026-08-01',
            endDate: '2027-05-14',
            reason: 'Shared dates',
          },
        ],
      })
    );
    expect(requests[1]).toEqual({ ...requests[0], studentId: 'two' });
    fireEvent.click(await screen.findByRole('button', { name: 'Assign fees (2)' }));
    await waitFor(() => expect(mocks.bulkCommit).toHaveBeenCalledTimes(1));
    expect(mocks.bulkCommit.mock.calls[0][0].items).toEqual(
      requests.map((request: any) => ({ ...request, previewToken: `token-${request.studentId}` }))
    );
  }, 30000);
  it('requires a policy reason and submits the student override through preview and commit', async () => {
    mount(undefined, true);
    await chooseStructure();
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Aarav: Enter a policy override reason.');
    expect(mocks.preview).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: /Policy override reason/ }), {
      target: { value: 'Approved student exception' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    expect(mocks.preview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        policies: [{ family: 'collection', versionId: 'collection-version' }],
        policyOverrideReason: 'Approved student exception',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Assign fees (1)' }));
    await screen.findByText('Committed amount 12000');
    expect(mocks.commit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        policies: [{ family: 'collection', versionId: 'collection-version' }],
        policyOverrideReason: 'Approved student exception',
        previewToken: 'token-one',
      })
    );
  });
  it('keeps the final step read-only and returns to the editable inputs with Back', async () => {
    mount();
    await chooseStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign fees (1)' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Include transport for one' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('button', { name: 'Include transport for one' })).toBeEnabled();
    expect(screen.queryByText('Preview amount 12000')).not.toBeInTheDocument();
  });

  it('invalidates a successful preview when optional heads change', async () => {
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    expect(screen.getByRole('button', { name: 'Assign fees (1)' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Include transport for one' }));
    expect(screen.queryByRole('button', { name: /Assign fees/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Preview amount 12000')).not.toBeInTheDocument();
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('blocks back navigation and duplicate previews while calculating', async () => {
    let resolve!: (value: any) => void;
    mocks.preview.mockReturnValue({
      unwrap: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Preview assignments' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Step 2: Fees & dates' })).toBeDisabled();
    resolve(result());
    await screen.findByText('Preview amount 12000');
    expect(mocks.preview).toHaveBeenCalledTimes(1);
  });
  it('returns directly to completed setup steps and requires a fresh preview', async () => {
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    fireEvent.click(screen.getByRole('button', { name: 'Step 2: Fees & dates' }));
    expect(screen.getByRole('button', { name: 'Include transport for one' })).toBeInTheDocument();
    expect(screen.queryByText('Preview amount 12000')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step 3: Review & assign' })).toBeDisabled();
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    expect(mocks.preview).toHaveBeenCalledTimes(2);
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('submits the reviewed token and retains canonical completion', async () => {
    mount();
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByText('Preview amount 12000');
    fireEvent.click(screen.getByRole('button', { name: 'Assign fees (1)' }));
    await screen.findByText('Committed amount 12000');
    expect(mocks.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'one',
        academicYearId: 'year',
        previewToken: 'token-one',
        selectedOptionalFeeHeadIds: [],
      })
    );
    expect(screen.queryByRole('button', { name: 'Preview assignments' })).not.toBeInTheDocument();
  });
  it('retries only failed students after a partially successful bulk commit', async () => {
    mocks.bulkPreview.mockImplementation(({ items }) => ({
      unwrap: async () => ({
        results: items.map((i: any) => ({ studentId: i.studentId, preview: result(i.studentId) })),
      }),
    }));
    mocks.bulkCommit.mockReturnValue({
      unwrap: async () => ({
        successCount: 1,
        failedCount: 1,
        skippedCount: 0,
        alreadyAssignedCount: 0,
        results: [
          {
            studentId: 'one',
            outcome: 'Assigned',
            result: { assignmentId: 'a', assignment: result() },
          },
          { studentId: 'two', outcome: 'Failed', errorMessage: 'Preview again' },
        ],
      }),
    });
    mount([
      { studentId: 'one', studentName: 'Aarav', isFeeStructureAssigned: false },
      { studentId: 'two', studentName: 'Meera', isFeeStructureAssigned: false },
    ]);
    await selectStructure();
    fireEvent.click(screen.getByRole('button', { name: 'Preview assignments' }));
    await screen.findByRole('button', { name: 'Assign fees (2)' });
    fireEvent.click(screen.getByRole('button', { name: 'Assign fees (2)' }));
    await screen.findByText('Committed amount 12000');
    fireEvent.click(screen.getByRole('button', { name: 'Review remaining students' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Include transport for two' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview assignments' }));
    await waitFor(() =>
      expect(mocks.bulkPreview).toHaveBeenLastCalledWith({
        items: [
          expect.objectContaining({ studentId: 'two', selectedOptionalFeeHeadIds: ['transport'] }),
        ],
      })
    );
    expect(screen.getByRole('button', { name: 'Select Meera' })).toHaveTextContent(
      'Ready to assign'
    );
    expect(screen.queryByText('Failed')).not.toBeInTheDocument();
  });
  it('requires a structure before advancing or requesting a preview', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Preview assignments' })).not.toBeInTheDocument();
    expect(mocks.preview).not.toHaveBeenCalled();
  });

  it('confirms before restoring student-specific policy defaults and clears the override only after confirmation', async () => {
    mount(undefined, true);
    fireEvent.change(screen.getByRole('combobox', { name: 'Fee structure' }), {
      target: { value: 'structure' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Edit policies' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Collection policy' }), {
      target: { value: 'collection-version' },
    });
    const select = screen.getByRole('combobox', { name: 'Collection policy' });
    fireEvent.click(screen.getByRole('button', { name: 'Restore Defaults' }));
    expect(select).toHaveValue('collection-version');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    expect(select).toHaveValue('collection-version');
    fireEvent.click(screen.getByRole('button', { name: 'Restore Defaults' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Restore Defaults' })
    );
    expect(select).toHaveValue('default-version');
    expect(screen.queryByRole('textbox', { name: /Policy override reason/ })).toBeNull();
  });
});
