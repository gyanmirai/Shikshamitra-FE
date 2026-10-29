import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { HrSetupEditorContext } from 'src/screens/hr/setup/hr-setup-editor-context';

import EarningComponent, { EarningComponentForm } from './earning-component';
import DeductionComponent, { DeductionComponentForm } from './deduction-component';

const mocks = vi.hoisted(() => ({
  addEarning: vi.fn(),
  updateEarning: vi.fn(),
  addDeduction: vi.fn(),
  updateDeduction: vi.fn(),
  preview: vi.fn(),
  remove: vi.fn(),
  refetch: vi.fn(),
  earningOptions: vi.fn(),
  deductionOptions: vi.fn(),
  retryOptions: vi.fn(),
  earningOptionItems: [] as any[],
  deductionOptionItems: [] as any[],
  optionsError: false,
  earning: {
    id: 'earning-1',
    earningComponentName: 'Existing earning',
    earningType: 'FIXED',
    calculationType: 'AMOUNT',
    amount: 100,
    visibleInPayslip: true,
  },
  deduction: {
    id: 'deduction-1',
    deductionComponentName: 'Existing deduction',
    deductionType: 'FIXED',
    calculationType: 'AMOUNT',
    amount: 100,
    visibleInPayslip: true,
  },
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action: ReactNode }) => <header>{action}</header>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>
          {columns.find((column: any) => column.id === 'action')?.render(null, row)}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/screens/hr/hooks/use-hr-table-query', () => ({
  useHrTableQuery: (_options: unknown, result: any) => ({ ...result, tableProps: {} }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, params, options }: any) =>
    currentQueryAndMutation(params, options),
}));
vi.mock('src/screens/hr/payroll/setting/earning-esi-treatment-dialog', () => ({
  EarningEsiTreatmentDialog: () => null,
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
vi.mock('src/redux/hr/employee-payroll-api', () => {
  const mutation = (request: any) => [request, { isLoading: false }];
  const query = (row: any) => ({
    data: { items: [row], totalCount: 1 },
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  });
  const previewQuery = () => ({
    data: { previewHash: 'preview-hash' },
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  const optionsQuery = (kind: 'earning' | 'deduction', args: unknown, options: any) => {
    const request = kind === 'earning' ? mocks.earningOptions : mocks.deductionOptions;
    request(args, options);
    const items = kind === 'earning' ? mocks.earningOptionItems : mocks.deductionOptionItems;
    return {
      currentData:
        options?.skip || mocks.optionsError ? undefined : { items, totalCount: items.length },
      isError: !options?.skip && mocks.optionsError,
      isFetching: false,
      refetch: mocks.retryOptions,
    };
  };
  return {
    useGetEarningComponentsQuery: () => query(mocks.earning),
    useGetDeductionComponentsQuery: () => query(mocks.deduction),
    useGetEarningComponentOptionsQuery: (args: unknown, options: any) =>
      optionsQuery('earning', args, options),
    useGetDeductionComponentOptionsQuery: (args: unknown, options: any) =>
      optionsQuery('deduction', args, options),
    useAddEarningComponentMutation: () => mutation(mocks.addEarning),
    useUpdateEarningComponentMutation: () => mutation(mocks.updateEarning),
    useAddDeductionComponentMutation: () => mutation(mocks.addDeduction),
    useUpdateDeductionComponentMutation: () => mutation(mocks.updateDeduction),
    useDeleteEarningComponentMutation: () => mutation(mocks.remove),
    useDeleteDeductionComponentMutation: () => mutation(mocks.remove),
    usePreviewEarningComponentUpdateImpactMutation: () => mutation(mocks.preview),
    usePreviewDeductionComponentUpdateImpactMutation: () => mutation(mocks.preview),
    usePreviewEarningComponentDeleteImpactQuery: previewQuery,
    usePreviewDeductionComponentDeleteImpactQuery: previewQuery,
  };
});

const theme = createTheme(defaultSettings);
function renderEditor(ui: ReactNode, actions = ['View', 'Add', 'Delete']) {
  const permissions = ['EarningComponents', 'DeductionComponents'].flatMap((feature) =>
    actions.map((action) => ({
      name: `HR.PayrollManagement.Settings.${feature}.${action}`,
      isGranted: true,
    }))
  );
  const store = configureStore({
    reducer: {
      auth: () => ({ permissions }),
      globalState: () => ({ currentYear: { id: 'year' } }),
      confirmPopup,
    },
  });
  const wrap = (children: ReactNode) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
  const view = render(wrap(ui));
  return { ...view, rerender: (next: ReactNode) => view.rerender(wrap(next)) };
}

const cases = [
  {
    kind: 'earning',
    Screen: EarningComponent,
    Form: EarningComponentForm,
    row: mocks.earning,
    add: mocks.addEarning,
    update: mocks.updateEarning,
  },
  {
    kind: 'deduction',
    Screen: DeductionComponent,
    Form: DeductionComponentForm,
    row: mocks.deduction,
    add: mocks.addDeduction,
    update: mocks.updateDeduction,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.optionsError = false;
  mocks.earningOptionItems = [mocks.earning];
  mocks.deductionOptionItems = [mocks.deduction];
  [
    mocks.addEarning,
    mocks.addDeduction,
    mocks.updateEarning,
    mocks.updateDeduction,
    mocks.remove,
  ].forEach((request) => request.mockReturnValue({ unwrap: async () => ({ id: 'saved' }) }));
  mocks.preview.mockReturnValue({
    unwrap: async () => ({
      previewHash: 'preview-hash',
      effectiveMonth: '2026-10',
      syncedEmployeeCount: 1,
    }),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(cases)('$kind component sessions', ({ kind, Screen, Form, row, add, update }) => {
  async function createNew(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: `Add ${kind}` }));
    const name = screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') });
    expect(name).toHaveValue('');
    await user.click(name);
    await user.paste(`New ${kind}`);
    await user.click(screen.getByRole('combobox', { name: 'Calculation Type *' }));
    await user.click(screen.getByRole('option', { name: 'Amount Based' }));
    await user.type(screen.getByRole('textbox', { name: 'Amount *' }), '500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(add).toHaveBeenCalledOnce());
    expect(add.mock.calls[0][0].body).toMatchObject({
      [`${kind}ComponentName`]: `New ${kind}`,
      amount: 500,
    });
  }

  it('opens a blank create session after a successful edit', async () => {
    const user = userEvent.setup();
    renderEditor(<Screen />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Update' }));
    const preview = await screen.findByRole('dialog', { name: 'Payroll Impact Preview' });
    expect(preview).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save synced only' }));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    await createNew(user);
    expect(update).toHaveBeenCalledOnce();
  });

  it('locks close, fields and a second session while create is pending', async () => {
    const user = userEvent.setup();
    let finishSave: (value: unknown) => void = () => {};
    add.mockReturnValueOnce({
      unwrap: () =>
        new Promise((resolve) => {
          finishSave = resolve;
        }),
    });
    renderEditor(<Screen />);
    await user.click(screen.getByRole('button', { name: `Add ${kind}` }));
    const name = screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') });
    await user.type(name, 'Pending component');
    await user.click(screen.getByRole('combobox', { name: 'Calculation Type *' }));
    await user.click(screen.getByRole('option', { name: 'Amount Based' }));
    await user.type(screen.getByRole('textbox', { name: 'Amount *' }), '500');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(add).toHaveBeenCalledOnce());
    expect(name).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: `Add ${kind}`, hidden: true })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(name).toHaveValue('Pending component');
    await act(async () => finishSave({ id: 'saved' }));
    await user.click(screen.getByRole('button', { name: `Add ${kind}` }));
    expect(screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') })).toHaveValue('');
    expect(add).toHaveBeenCalledOnce();
  });

  it('loads complete percentage options only when needed and searches later component rows', async () => {
    const user = userEvent.setup();
    const later = Array.from({ length: 205 }, (_, index) => ({
      id: `${kind}-base-${index}`,
      [`${kind}ComponentName`]: index === 204 ? 'Later calculation base' : `Base ${index}`,
    }));
    if (kind === 'earning') mocks.earningOptionItems = later;
    else mocks.deductionOptionItems = later;
    renderEditor(<Form editData={null} handleClose={vi.fn()} />);
    expect(mocks.earningOptions.mock.calls.at(-1)?.[1].skip).toBe(true);
    if (kind === 'deduction') expect(mocks.deductionOptions.mock.calls.at(-1)?.[1].skip).toBe(true);
    await user.type(
      screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') }),
      `Percentage ${kind}`
    );
    await user.click(screen.getByRole('combobox', { name: 'Calculation Type *' }));
    await user.click(screen.getByRole('option', { name: 'Percentage Based' }));
    expect(mocks.earningOptions.mock.calls.at(-1)?.[1].skip).toBe(false);
    const basis = screen.getByRole('combobox', { name: 'Calculation base *' });
    await user.type(basis, 'Later calculation base');
    expect(screen.queryByRole('option', { name: 'Base 0' })).toBeNull();
    await user.click(screen.getByRole('option', { name: 'Later calculation base' }));
    await user.type(screen.getByRole('spinbutton', { name: /^Percentage/ }), '10');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(add).toHaveBeenCalledOnce());
    expect(add.mock.calls[0][0].body).toMatchObject({
      calculationBase: 'COMPONENT',
      [`selected${kind === 'earning' ? 'Earning' : 'Deduction'}ComponentId`]: `${kind}-base-204`,
      percentage: 10,
    });
  });

  it('retains the saved calculation base and entered values after an option read fails, then retries', async () => {
    const user = userEvent.setup();
    mocks.optionsError = true;
    const editData = {
      ...row,
      calculationType: 'PERCENTAGE',
      percentage: 10,
      [`selected${kind === 'earning' ? 'Earning' : 'Deduction'}ComponentId`]: 'saved-base',
      customComponent: {
        componentName: 'Saved calculation base',
        componentOf: 'EARNING_COMPONENT',
      },
    };
    const ui = <Form editData={editData} handleClose={vi.fn()} />;
    const view = renderEditor(ui);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load');
    expect(screen.getByRole('combobox', { name: 'Calculation base *' })).toHaveValue(
      'Saved calculation base'
    );
    const name = screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') });
    await user.clear(name);
    await user.type(name, 'Retained after read failure');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.retryOptions).toHaveBeenCalled();
    mocks.optionsError = false;
    mocks.earningOptionItems = [
      { id: 'saved-base', earningComponentName: 'Saved calculation base' },
    ];
    view.rerender(<Form editData={editData} handleClose={vi.fn()} />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(name).toHaveValue('Retained after read failure');
    expect(screen.getByRole('combobox', { name: 'Calculation base *' })).toHaveValue(
      'Saved calculation base'
    );
  });

  it('keeps an edit when cancellation is declined and clears identity after discard', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    vi.stubGlobal('confirm', confirm);
    renderEditor(<Screen />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const name = screen.getByRole('textbox', { name: new RegExp(`^${kind} Name`, 'i') });
    await user.clear(name);
    await user.paste('Retained edit');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(name).toHaveValue('Retained edit');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await createNew(user);
    expect(update).not.toHaveBeenCalled();
  });

  it('shows the update confirmation as a modal within embedded setup and saves once', async () => {
    const user = userEvent.setup();
    const register = vi.fn();
    const saved = vi.fn();
    renderEditor(
      <HrSetupEditorContext.Provider value={register}>
        <Form editData={row} handleClose={saved} />
      </HrSetupEditorContext.Provider>
    );
    await waitFor(() => expect(register.mock.calls.at(-1)?.[0].save).toBeTypeOf('function'));
    await register.mock.calls.at(-1)?.[0].save();
    expect(await screen.findByRole('dialog', { name: 'Payroll Impact Preview' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save synced only' }));
    await waitFor(() => expect(saved).toHaveBeenCalledWith(null, true));
    expect(update).toHaveBeenCalledOnce();
    expect(add).not.toHaveBeenCalled();
  });

  it.each([
    { actions: ['View'], manage: false, remove: false },
    { actions: ['View', 'Add'], manage: true, remove: false },
    { actions: ['View', 'Delete'], manage: false, remove: true },
  ])('uses backend action grants: $actions', ({ actions, manage, remove }) => {
    renderEditor(<Screen />, actions);
    expect(Boolean(screen.queryByRole('button', { name: `Add ${kind}` }))).toBe(manage);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit' }))).toBe(manage);
    expect(Boolean(screen.queryByRole('button', { name: 'Delete' }))).toBe(remove);
    expect(add).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
