import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import { renderWithProviders as render } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import { BulkAdmissionOfferingDialog } from './bulk-admission-offering-dialog';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  create: vi.fn(),
  clearPreview: vi.fn(),
  loadCycles: vi.fn(),
  cyclesQuery: { isError: false },
  classLookup: vi.fn(),
  configuredByCycle: {} as Record<string, { standardId: string; stageId: string }[]>,
  configuredByScope: {} as Record<string, { standardId: string; stageId: string }[]>,
  classQueryState: { isFetching: false, isError: false },
  standards: [{ id: 'class-1', name: 'Class 1', educationMediumStageId: 'primary' }],
  previewErrors: [] as { code: string; message: string }[],
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useLazyGetAdmissionCyclesQuery: () => [mocks.loadCycles, mocks.cyclesQuery],
}));
vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({ data: [] }),
}));
vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({ currentData: mocks.standards, isSuccess: true }),
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingClassIdentitiesQuery: (
    scope: { admissionCycleId: string; track: number },
    options: { skip: boolean }
  ) => {
    mocks.classLookup(scope, options);
    return {
      currentData:
        options.skip || mocks.classQueryState.isFetching || mocks.classQueryState.isError
          ? undefined
          : (mocks.configuredByScope[`${scope.admissionCycleId}:${scope.track}`] ??
            (scope.track === 0 ? (mocks.configuredByCycle[scope.admissionCycleId] ?? []) : [])),
      isSuccess:
        !options.skip && !mocks.classQueryState.isFetching && !mocks.classQueryState.isError,
      ...mocks.classQueryState,
    };
  },
}));
vi.mock('./use-bulk-admission-offering', () => ({
  useBulkAdmissionOffering: () => ({
    previewOfferings: mocks.preview,
    createOfferings: mocks.create,
    clearPreview: mocks.clearPreview,
    hierarchy: [],
    previewStandards: [{ id: 'class-1', name: 'Class 1' }],
    canSaveInactive: false,
    fetchWorkflows: async () => ({
      data: [{ id: 'workflow-1', name: 'School workflow', version: 1 }],
      hasMore: false,
    }),
    fetchInquiryForms: async () => ({
      data: [{ id: 'form-1', name: 'School inquiry', version: 2 }],
      hasMore: false,
    }),
    preview: {
      canCommit: false,
      items: [
        {
          standardId: 'class-1',
          code: 'ADM-CLASS-1',
          canSaveInactive: false,
          errors: mocks.previewErrors,
        },
      ],
    },
  }),
}));
vi.mock('./bulk-admission-hierarchy-fields', () => ({
  BulkAdmissionHierarchyFields: ({
    change,
    formik,
    configuredClassIds,
  }: {
    change: (updates: Partial<BulkOfferingValues>) => void;
    formik: { values: BulkOfferingValues };
    configuredClassIds: string[];
  }) => (
    <>
      <button
        type="button"
        onClick={() => {
          change({ boardId: 'board-1', mediumId: 'medium-1', standardIds: ['class-1'] });
        }}
      >
        Select Class 1
      </button>
      <output data-testid="chosen-classes">{JSON.stringify(formik.values.standardIds)}</output>
      <output data-testid="configured-classes">{JSON.stringify(configuredClassIds)}</output>
    </>
  ),
}));

describe('Bulk offering step navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cyclesQuery.isError = false;
    mocks.previewErrors = [];
    mocks.configuredByCycle = {};
    mocks.configuredByScope = {};
    mocks.classQueryState = { isFetching: false, isError: false };
  });
  it('allows RTE for a General-configured class, scopes the check by type and retains RTE after Preview/Back', async () => {
    const user = userEvent.setup();
    const cycle = {
      id: 'cycle-1',
      name: 'School admission',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    mocks.configuredByCycle[cycle.id] = [{ standardId: 'class-1', stageId: 'primary' }];
    mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ items: [cycle], totalCount: 1 }) });
    mocks.preview.mockResolvedValue({ canCommit: false });
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={vi.fn()} />
      </ThemeProvider>
    );
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: /School admission/ }));
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    await waitFor(() =>
      expect(screen.getByTestId('configured-classes')).toHaveTextContent('["class-1"]')
    );
    await waitFor(() => expect(screen.getByTestId('chosen-classes')).toHaveTextContent('[]'));
    await user.click(screen.getByRole('combobox', { name: /Admission type/ }));
    await user.click(screen.getByRole('option', { name: 'RTE' }));
    expect(screen.queryByRole('combobox', { name: /Starts with/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Inquiry form' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('configured-classes')).toHaveTextContent('[]'));
    expect(mocks.classLookup).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: cycle.id, track: 1 }),
      expect.objectContaining({ skip: false })
    );
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await screen.findByRole('heading', { name: 'Preview offerings' });
    expect(mocks.preview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycle: cycle,
        track: 1,
        entryMode: 1,
        standardIds: ['class-1'],
        inquiryFormDefinitionId: '',
        inquiryIntakeProfileId: '',
      })
    );
    expect(screen.getByText('RTE · Direct registration')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: /Admission type/ })).toHaveTextContent('RTE');
    expect(screen.getByTestId('chosen-classes')).toHaveTextContent('["class-1"]');
    await user.click(screen.getByRole('combobox', { name: /Admission type/ }));
    await user.click(screen.getByRole('option', { name: 'General' }));
    await waitFor(() =>
      expect(screen.getByTestId('configured-classes')).toHaveTextContent('["class-1"]')
    );
    expect(screen.getByTestId('chosen-classes')).toHaveTextContent('[]');
    expect(screen.getByRole('combobox', { name: 'Inquiry form' })).toBeVisible();
    expect(mocks.create).not.toHaveBeenCalled();
  }, 20000);
  it('checks the selected cycle and removes newly configured classes after changing it', async () => {
    const user = userEvent.setup();
    const cycle = {
      id: 'cycle-1',
      name: 'First cycle',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    const second = { ...cycle, id: 'cycle-2', name: 'Second cycle' };
    mocks.configuredByCycle[second.id] = [{ standardId: 'class-1', stageId: 'primary' }];
    mocks.loadCycles.mockReturnValue({
      unwrap: async () => ({ items: [cycle, second], totalCount: 2 }),
    });
    const content = (
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={vi.fn()} />
      </ThemeProvider>
    );
    const view = render(content);
    const selectCycle = async (name: RegExp) => {
      await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
      await user.keyboard('{ArrowDown}');
      await user.click(await screen.findByRole('option', { name }));
    };
    await selectCycle(/First cycle/);
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    expect(screen.getByTestId('chosen-classes')).toHaveTextContent('["class-1"]');
    expect(mocks.classLookup).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycleId: cycle.id,
        boardId: 'board-1',
        mediumId: 'medium-1',
        campusId: null,
        track: 0,
      }),
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    mocks.classQueryState.isFetching = true;
    view.rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={vi.fn()} />
      </ThemeProvider>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Preview offerings' })).toBeDisabled()
    );
    expect(screen.getByTestId('chosen-classes')).toHaveTextContent('["class-1"]');
    mocks.classQueryState.isFetching = false;
    await selectCycle(/Second cycle/);
    await waitFor(() => expect(screen.getByTestId('chosen-classes')).toHaveTextContent('[]'));
    expect(screen.getByTestId('configured-classes')).toHaveTextContent('["class-1"]');
    expect(mocks.classLookup).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: second.id }),
      expect.objectContaining({ skip: false })
    );
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  }, 20000);
  it('retains visible remote-select labels and selected IDs after Preview and Back', async () => {
    const user = userEvent.setup();
    mocks.preview.mockResolvedValue({ canCommit: false });
    const cycle = {
      id: 'cycle-1',
      name: 'General Admission',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ items: [cycle], totalCount: 1 }) });
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={() => undefined} />
      </ThemeProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    expect(await screen.findByText('Admission cycle is required')).toBeVisible();
    expect(mocks.preview).not.toHaveBeenCalled();
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: /General Admission/ }));
    await waitFor(() =>
      expect(screen.queryByText('Admission cycle is required')).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    await user.click(screen.getByRole('combobox', { name: 'Published workflow' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: 'School workflow · v1' }));
    await user.click(screen.getByRole('combobox', { name: 'Inquiry form' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: 'School inquiry · v2' }));

    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await screen.findByRole('heading', { name: 'Preview offerings' });
    expect(screen.queryByRole('combobox', { name: 'Published workflow' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: 'Published workflow' })).toHaveValue(
      'School workflow · v1'
    );
    expect(screen.getByRole('combobox', { name: 'Inquiry form' })).toHaveValue(
      'School inquiry · v2'
    );
    expect(
      screen.queryByRole('combobox', { name: 'Intake & assignment setup (optional)' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(2));
    expect(mocks.preview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycle: expect.objectContaining({ id: cycle.id }),
        standardIds: ['class-1'],
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: 'form-1',
      })
    );
    expect(mocks.create).not.toHaveBeenCalled();
  }, 20000);
  it('lets the user choose another open cycle, clears old preview and preserves configuration on Back', async () => {
    const user = userEvent.setup();
    const cycle = {
      id: 'cycle-1',
      name: 'First cycle',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    const second = { ...cycle, id: 'cycle-2', name: 'Second cycle', startDate: '2026-10-10' };
    const third = { ...cycle, id: 'cycle-3', name: 'Third cycle' };
    mocks.loadCycles.mockReturnValue({
      unwrap: async () => ({
        items: [
          cycle,
          second,
          third,
          { ...cycle, id: 'draft', name: 'Draft cycle', status: 0 },
          { ...cycle, id: 'ended', name: 'Ended cycle', windowStatus: 2 },
          { ...cycle, id: 'other-year', name: 'Other year', academicYearId: 'year-2' },
        ],
        totalCount: 6,
      }),
    });
    mocks.preview.mockResolvedValue({ canCommit: false });
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={() => undefined} />
      </ThemeProvider>
    );
    const selectCycle = async (name: RegExp) => {
      await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
      await user.keyboard('{ArrowDown}');
      await user.click(await screen.findByRole('option', { name }));
    };
    await selectCycle(/Second cycle/);
    expect(mocks.loadCycles).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        status: 1,
        windowStatus: 1,
        maxResultCount: 25,
        skipCount: 0,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    await user.click(screen.getByRole('combobox', { name: 'Published workflow' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: 'School workflow · v1' }));
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await screen.findByRole('heading', { name: 'Preview offerings' });
    expect(mocks.preview).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycle: second })
    );
    expect(screen.getByRole('heading', { name: 'Second cycle' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{Escape}');
    await user.click(
      within(
        screen
          .getByRole('combobox', { name: 'Admission cycle *' })
          .closest('.MuiAutocomplete-root')! as HTMLElement
      ).getByRole('button', { name: 'Clear' })
    );
    expect(screen.queryByRole('combobox', { name: 'Published workflow' })).not.toBeInTheDocument();
    await selectCycle(/Third cycle/);
    expect(mocks.clearPreview).toHaveBeenCalled();
    expect(screen.getByRole('combobox', { name: 'Published workflow' })).toHaveValue(
      'School workflow · v1'
    );
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('option', { name: /First cycle/ });
    await waitFor(() =>
      expect(mocks.loadCycles).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: undefined })
      )
    );
    expect(
      screen.queryByRole('option', { name: /Draft cycle|Ended cycle|Other year/ })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(2));
    expect(mocks.preview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycle: third,
        standardIds: ['class-1'],
        workflowDefinitionId: 'workflow-1',
        useCycleDates: true,
        openDate: null,
        closeDate: null,
      })
    );
    expect(mocks.create).not.toHaveBeenCalled();
  }, 20000);
  it('shows an actionable loading error and reloads cycle options on Retry', async () => {
    const user = userEvent.setup();
    const cycle = {
      id: 'cycle-1',
      name: 'General Admission',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    mocks.cyclesQuery.isError = true;
    mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ items: [], totalCount: 0 }) });
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={() => undefined} />
      </ThemeProvider>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Admission cycles could not be loaded.');
    await waitFor(() => expect(mocks.loadCycles).toHaveBeenCalled());
    mocks.loadCycles.mockClear();
    mocks.cyclesQuery.isError = false;
    mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ items: [cycle], totalCount: 1 }) });
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(mocks.loadCycles).toHaveBeenCalled());
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('option', { name: /General Admission/ })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('returns server inquiry checks to the field when editing the preview without blocking inactive preparation', async () => {
    const user = userEvent.setup();
    const cycle = {
      id: 'cycle-1',
      name: 'General Admission',
      academicYearId: 'year-1',
      academicYearName: '2026-2027',
      status: 1,
      windowStatus: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    } as AdmissionCycle;
    mocks.loadCycles.mockReturnValue({ unwrap: async () => ({ items: [cycle], totalCount: 1 }) });
    mocks.preview.mockResolvedValue({ canCommit: false });
    mocks.previewErrors = [
      { code: 'InquiryFormMissing', message: 'Published Inquiry Form is required.' },
      { code: 'Duplicate', message: 'An offering already exists for this class.' },
    ];
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BulkAdmissionOfferingDialog open cycle={cycle} onClose={vi.fn()} />
      </ThemeProvider>
    );
    await user.click(screen.getByRole('combobox', { name: 'Admission cycle *' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: /General Admission/ }));
    await user.click(screen.getByRole('button', { name: 'Select Class 1' }));
    await user.click(screen.getByRole('button', { name: 'Preview offerings' }));
    await screen.findByRole('heading', { name: 'Preview offerings' });
    expect(screen.getByRole('button', { name: 'Create 1 offering' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Edit selection' }));
    const inquiry = screen.getByRole('combobox', { name: 'Inquiry form' });
    expect(
      within(inquiry.closest('.MuiFormControl-root')! as HTMLElement).getByText(
        'Before activation: Published Inquiry Form is required.'
      )
    ).toBeVisible();
    expect(inquiry).not.toBeRequired();
    expect(mocks.create).not.toHaveBeenCalled();
  }, 20000);
});
