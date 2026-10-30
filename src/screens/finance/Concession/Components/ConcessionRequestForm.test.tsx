import React from 'react';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import ConcessionRequestForm from './ConcessionRequestForm';

const state = vi.hoisted(() => ({
  detail: {} as any,
  context: {} as any,
  contextFetching: false,
  contextError: null as any,
  queryError: null as any,
  preview: {} as any,
  previewRequest: vi.fn(),
  update: vi.fn(),
  submit: vi.fn(),
  refetch: vi.fn(),
  close: vi.fn(),
  getClasses: vi.fn(),
  contextArgs: vi.fn(),
  contextRefetch: vi.fn(),
  year: { id: 'year', boards: [] },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { profile: { role: 'accountant' } }, status: 'authenticated' }),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({ globalState: { currentYear: state.year }, auth: { permissions: [] } }),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../../components/FinancePrerequisiteState', () => ({
  default: ({ requirements }: any) => (
    <div>{requirements.map((item: any) => item.key).join(',')}</div>
  ),
}));
vi.mock('src/utils/icons', () => ({ GlobalIcons: {} }));
// Keep this suite focused on the real Formik workflow and API command chain.
// The browser fixture separately mounts all production MUI presentation components.
vi.mock('@mui/material', () => {
  const Container = ({ children, component: Tag = 'div', onSubmit, role, ...props }: any) => (
    <Tag onSubmit={onSubmit} role={role} aria-label={props['aria-label']}>
      {children}
    </Tag>
  );
  const Button = ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
  return {
    Box: Container,
    Grid: Container,
    Paper: Container,
    Stack: Container,
    Typography: Container,
    DialogActions: Container,
    Button,
    Alert: ({ children, action }: any) => (
      <div role="alert">
        {children}
        {action}
      </div>
    ),
    Skeleton: () => null,
    TextField: () => null,
    Autocomplete: () => null,
  };
});
vi.mock('@mui/lab', () => ({
  LoadingButton: ({ children, onClick, disabled, loading }: any) => (
    <button type="button" onClick={onClick} disabled={disabled || loading}>
      {children}
    </button>
  ),
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => <section aria-label={title}>{children}</section>,
}));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));
vi.mock('src/components/form-busy-region', () => ({
  FormBusyRegion: ({ children, busy }: any) => <fieldset disabled={busy}>{children}</fieldset>,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: ({ children }: any) => children,
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/redux/student', () => ({ useGetStudentsByScopeQuery: () => ({ currentData: [] }) }));
vi.mock('src/redux/class/classApi', () => ({
  useLazyGetClassByMediumQuery: () => [state.getClasses, {}],
}));
vi.mock('./ConcessionDocumentList', () => ({ default: () => null }));
vi.mock('./ConcessionPolicyFields', () => ({
  default: ({ typeHelperText, policies, types, policyVersionId, typeId, onPolicyChange }: any) => (
    <>
      <div>
        Selected policy:{' '}
        {
          policies.find((policy: any) => policy.concessionPolicyVersionId === policyVersionId)
            ?.policyName
        }
      </div>
      <div>Selected type: {types.find((type: any) => type.id === typeId)?.name}</div>
      {typeHelperText && <div>{typeHelperText}</div>}
      {policies.length > 1 && (
        <button type="button" onClick={() => onPolicyChange(policies[1])}>
          Switch policy
        </button>
      )}
    </>
  ),
}));
vi.mock('./ConcessionSteps/ValueEntryStep', () => ({ default: () => null }));
vi.mock('./ConcessionRequestWorkspace', () => ({
  default: ({ selectedIds, onToggle, valueFields, policyFields }: any) => (
    <>
      {policyFields}
      <button type="button" onClick={() => onToggle('small')}>
        Selected fees: {selectedIds.join(',')}
      </button>
      {valueFields}
    </>
  ),
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useGetConcessionRequestByIdQuery: () => ({
    data: state.detail ? { data: state.detail } : undefined,
    refetch: state.refetch,
    isError: Boolean(state.queryError),
    error: state.queryError,
  }),
  useUpdateConcessionRequestMutation: () => [state.update, {}],
  useCreateConcessionRequestMutation: () => [vi.fn(), {}],
  useCreateConcessionDraftMutation: () => [vi.fn(), {}],
  useSubmitConcessionRequestMutation: () => [state.submit, {}],
  usePreviewConcessionRequestMutation: () => [state.previewRequest],
  useGetConcessionRequestContextQuery: (params: unknown) => {
    state.contextArgs(params);
    return {
      data: state.context,
      currentData: state.context,
      isFetching: state.contextFetching,
      isError: Boolean(state.contextError),
      error: state.contextError,
      refetch: state.contextRefetch,
    };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.queryError = null;
  state.contextError = null;
  state.contextFetching = false;
  state.detail = {
    id: 'request',
    concessionRequestId: 'request',
    concurrencyStamp: 'opened-stamp',
    boardId: 'board',
    educationMediumId: 'medium',
    standardId: 'class',
    divisionId: 'division',
    studentId: 'student',
    studentName: 'Synthetic student',
    studentFeeStructureId: 'assignment',
    concessionPolicyId: 'policy',
    concessionPolicyVersionId: 'version',
    concessionTypeId: 'type',
    status: 6,
    feeHeadConcessions: [
      { feeHeadId: 'large', basedOn: 1, amount: 0 },
      { feeHeadId: 'small', basedOn: 1, amount: 0 },
    ],
  };
  state.context = {
    studentFeeStructureId: 'assignment',
    concessionPolicies: [
      {
        concessionPolicyId: 'policy',
        concessionPolicyVersionId: 'version',
        valueSource: 'PolicyFixed',
        calculationMethod: 'FixedAmount',
        fixedAmount: 1000,
      },
    ],
    concessionTypes: [{ concessionTypeId: 'type', name: 'Test concession', documents: [] }],
    feeHeads: [
      { feeHeadId: 'large', eligibleOutstanding: 58166 },
      { feeHeadId: 'small', eligibleOutstanding: 717 },
    ],
    eligibleDueFees: [],
  };
  state.preview = {
    totalEligibleBase: 58883,
    totalConcessionAmount: 1000,
    netPayable: 57883,
    previewFingerprint: 'preview',
    feeHeadConcessions: [],
  };
  state.previewRequest.mockImplementation(() => ({ unwrap: async () => state.preview }));
  state.update.mockImplementation(() => ({
    unwrap: async () => ({ data: { concurrencyStamp: 'saved-stamp', status: 6 } }),
  }));
  state.submit.mockImplementation(() => ({ unwrap: async () => ({ data: { status: 0 } }) }));
  state.refetch.mockReturnValue({
    unwrap: async () => ({ data: { ...state.detail, concurrencyStamp: 'latest-stamp' } }),
  });
});

const formProps = {
  open: true,
  student: {
    studentId: 'student',
    studentName: 'Synthetic student',
    concessionTypeId: 'type',
  } as any,
  onClose: state.close,
};
const renderForm = () =>
  render(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);

describe('concession request update concurrency', () => {
  it('keeps selected policy and type visible while policy eligibility reloads, then uses the new response', async () => {
    state.context.concessionPolicies.push({
      ...state.context.concessionPolicies[0],
      concessionPolicyId: 'other-policy',
      concessionPolicyVersionId: 'other-version',
      policyName: 'Alternative policy',
    });
    const view = renderForm();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Switch policy' }));
    const refreshed = { ...state.context };
    state.context = undefined;
    state.contextFetching = true;
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByText('Selected policy: Alternative policy')).toBeVisible();
    expect(screen.getByText('Selected type: Test concession')).toBeVisible();
    expect(
      screen.queryByText('Select the student fee assignment to continue.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();

    state.context = refreshed;
    state.contextFetching = false;
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByText('Selected policy: Alternative policy')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
  });

  it('blocks saving during a background eligibility refresh even when current data is retained', async () => {
    const view = renderForm();
    state.contextFetching = true;
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByText('Selected type: Test concession')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    await act(async () => {
      fireEvent.submit(document.querySelector('form')!);
    });
    expect(state.previewRequest).not.toHaveBeenCalled();
    expect(state.update).not.toHaveBeenCalled();
  });

  it('retains selected labels after an eligibility error while blocking commands', () => {
    state.context.concessionPolicies[0].policyName = 'Original policy';
    const view = renderForm();
    state.context = undefined;
    state.contextError = { data: { detail: 'Eligibility is temporarily unavailable.' } };
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByText('Selected policy: Original policy')).toBeVisible();
    expect(screen.getByText('Selected type: Test concession')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry loading policies' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
  });

  it('does not carry displayed eligibility into another student scope', () => {
    const view = render(<ConcessionRequestForm {...formProps} />);
    state.context = undefined;
    state.contextFetching = true;
    view.rerender(
      <ConcessionRequestForm
        {...formProps}
        student={{ ...formProps.student, studentId: 'another-student' }}
      />
    );
    expect(screen.queryByText('Selected type: Test concession')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  });

  it('shows resolved missing types and policies for a new request without hiding student selection', () => {
    state.context = { ...state.context, concessionTypes: [], concessionPolicies: [] };
    render(<ConcessionRequestForm {...formProps} />);
    expect(screen.getByText('concession-type,concession-policy')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Student Information' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
  });

  it('retains an existing request when currently active setup lists are empty', () => {
    state.context = { ...state.context, concessionTypes: [], concessionPolicies: [] };
    renderForm();
    expect(screen.queryByText('concession-type,concession-policy')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
  });

  it('shows fee assignment setup for the exact missing-assignment error while retaining Cancel', () => {
    state.context = undefined;
    state.contextError = { data: { errorCode: 'Finance:Concession:010029' } };
    renderForm();
    expect(screen.getByText('fee-assignment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
  });
  it('releases a resolved server blocker without losing fee selections or the reviewed stamp', async () => {
    const message = 'Another request is pending for this concession type in this academic year.';
    state.context.concessionTypes[0].benefitBlocker = {
      code: 'Finance:Concession:010010',
      message,
      blockingRequestId: 'other-request',
      blockingStatus: 'Pending',
    };
    const view = renderForm();
    await act(async () => {
      fireEvent.submit(document.querySelector('form')!);
    });
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    state.context = {
      ...state.context,
      concessionTypes: state.context.concessionTypes.map((type: any) => ({
        ...type,
        benefitBlocker: null,
      })),
    };
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    await waitFor(() => expect(screen.queryByText(message)).not.toBeInTheDocument());
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(state.close).toHaveBeenCalledWith(null, true));
    expect(state.update.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'opened-stamp',
      feeHeadConcessions: [{ feeHeadId: 'large' }, { feeHeadId: 'small' }],
    });
  });

  it.each(['Finance:Concession:010010', 'Finance:Concession:010034'])(
    'refreshes eligibility after raced %s rejection without replacing the reviewed request stamp',
    async (code) => {
      state.update.mockReturnValue({
        unwrap: async () => {
          throw Object.assign(new Error('One or more business rules were violated.'), {
            data: { errorCode: code },
          });
        },
      });
      renderForm();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Save draft' }));
      await waitFor(() => expect(state.contextRefetch).toHaveBeenCalledTimes(1));
      expect(state.refetch).not.toHaveBeenCalled();
      expect(state.update.mock.calls[0][0].concurrencyStamp).toBe('opened-stamp');
      expect(state.close).not.toHaveBeenCalled();
    }
  );

  it('does not release a type blocker when policy version or fee assignment changes', async () => {
    const blocker = {
      code: 'Finance:Concession:010034',
      message:
        'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.',
      blockingRequestId: 'approved-200',
      blockingStatus: 'Approved',
    };
    state.context.concessionTypes[0].benefitBlocker = blocker;
    state.context.concessionPolicies.push({
      ...state.context.concessionPolicies[0],
      concessionPolicyId: 'other-policy',
      concessionPolicyVersionId: 'other-version',
    });
    const view = renderForm();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Switch policy' }));
    expect(screen.getByText(blocker.message)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    state.context = { ...state.context, studentFeeStructureId: 'another-assignment' };
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByText(blocker.message)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(state.update).not.toHaveBeenCalled();
  });

  it.each(['Pending', 'Approved', 'PartiallyReversed'])(
    'blocks a new benefit when the selected type has an existing %s benefit',
    async (status) => {
      const message =
        status === 'Pending'
          ? 'A pending concession request already exists for this concession type in this academic year. Review the existing request.'
          : 'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.';
      state.context.concessionTypes[0].benefitBlocker = {
        code: status === 'Pending' ? 'Finance:Concession:010010' : 'Finance:Concession:010034',
        message: status === 'Pending' ? 'Finance:Concession:010010' : 'Finance:Concession:010034',
        blockingRequestId: 'existing-request',
        blockingStatus: status,
      };
      renderForm();
      expect(screen.getByText(message)).toBeVisible();
      expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
      await act(async () => {
        fireEvent.submit(document.querySelector('form')!);
      });
      expect(state.update).not.toHaveBeenCalled();
      expect(state.submit).not.toHaveBeenCalled();
      expect(state.previewRequest).not.toHaveBeenCalled();
    }
  );

  it('passes the edited request ID to eligibility and preview so the server can exclude that request', async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeEnabled()
    );
    expect(state.contextArgs).toHaveBeenLastCalledWith(
      expect.objectContaining({ requestId: 'request' })
    );
    expect(state.previewRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ requestId: 'request' })
    );
  });

  it('keeps an available type usable when another type is blocked', async () => {
    state.context.concessionTypes.push({
      concessionTypeId: 'other-type',
      name: 'Other concession',
      documents: [],
      benefitBlocker: {
        code: 'Finance:Concession:010034',
        message: 'Another type is already approved.',
        blockingRequestId: 'other',
        blockingStatus: 'Approved',
      },
    });
    state.context.concessionTypes[0].benefitBlocker = null;
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(state.close).toHaveBeenCalledWith(null, true));
    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({ concessionTypeId: 'type' })
    );
  });

  it('explains an initial detail-query failure and provides a retry action', async () => {
    state.detail = undefined;
    state.queryError = { data: { detail: 'This concession request could not be found.' } };
    renderForm();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This concession request could not be found.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(state.update).not.toHaveBeenCalled();
  });

  it('does not initialize another request from the preceding query result', async () => {
    const view = renderForm();
    view.rerender(
      <ConcessionRequestForm {...formProps} editData={{ id: 'second-request' } as any} />
    );
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    state.detail = {
      ...state.detail,
      id: 'second-request',
      concessionRequestId: 'second-request',
      concurrencyStamp: 'second-stamp',
      feeHeadConcessions: [{ feeHeadId: 'small', basedOn: 1, amount: 0 }],
    };
    view.rerender(
      <ConcessionRequestForm {...formProps} editData={{ id: 'second-request' } as any} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(state.update).toHaveBeenCalled());
    expect(state.update.mock.calls[0][0]).toMatchObject({
      concessionRequestId: 'second-request',
      concurrencyStamp: 'second-stamp',
      feeHeadConcessions: [{ feeHeadId: 'small' }],
    });
  }, 15000);

  it('updates a valid fixed-policy request with the reviewed stamp and submits the saved stamp', async () => {
    renderForm();
    const submit = screen.getByRole('button', { name: 'Submit for approval' });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    await waitFor(() => expect(state.submit).toHaveBeenCalled());
    expect(state.update.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'opened-stamp',
      feeHeadConcessions: [{ feeHeadId: 'large' }, { feeHeadId: 'small' }],
    });
    expect(state.submit.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'saved-stamp',
      previewFingerprint: 'preview',
    });
    expect(state.refetch).not.toHaveBeenCalled();
    expect(state.close).toHaveBeenCalledWith(null, true);
  });

  it('retains edited fee choices and their original stamp after a background query refresh', async () => {
    const view = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Selected fees: large,small' }));
    expect(screen.getByRole('button', { name: 'Selected fees: large' })).toBeVisible();
    state.detail = {
      ...state.detail,
      concurrencyStamp: 'changed-elsewhere',
      feeHeadConcessions: [{ feeHeadId: 'small', basedOn: 1, amount: 0 }],
    };
    view.rerender(<ConcessionRequestForm {...formProps} editData={{ id: 'request' } as any} />);
    expect(screen.getByRole('button', { name: 'Selected fees: large' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(state.update).toHaveBeenCalled());
    expect(state.update.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'opened-stamp',
      feeHeadConcessions: [{ feeHeadId: 'large' }],
    });
    expect(state.update.mock.calls[0][0].feeHeadConcessions).toHaveLength(1);
    expect(state.refetch).not.toHaveBeenCalled();
  });

  it('keeps a rejected stale update open without submitting or claiming success', async () => {
    state.update.mockImplementation(() => ({
      unwrap: async () => {
        throw Object.assign(new Error('One or more business rules were violated.'), {
          data: {
            errorCode: 'Finance:Concession:030003',
            detail: 'This request changed. Reopen it and review the latest details.',
          },
        });
      },
    }));
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /request changed|request or fee balances changed/i
      )
    );
    expect(state.update.mock.calls[0][0].concurrencyStamp).toBe('opened-stamp');
    expect(state.submit).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('retains a successful update stamp when submission fails and the user retries', async () => {
    const user = userEvent.setup();
    state.submit.mockImplementationOnce(() => ({
      unwrap: async () => {
        throw Object.assign(new Error('One or more business rules were violated.'), {
          data: { errorCode: 'Finance:Concession:010020' },
        });
      },
    }));
    renderForm();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Submit for approval' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('installments or balances changed')
    );
    expect(state.close).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Submit for approval' }));
    await waitFor(() => expect(state.update).toHaveBeenCalledTimes(2));
    expect(state.update.mock.calls[1][0].concurrencyStamp).toBe('saved-stamp');
    await waitFor(() => expect(state.close).toHaveBeenCalledWith(null, true));
  }, 15000);
});
