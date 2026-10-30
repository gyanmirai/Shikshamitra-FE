import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionOfferingEditDrawer } from './admission-offering-edit-drawer';

const mocks = vi.hoisted(() => ({
  validate: vi.fn(),
  save: vi.fn(),
  retry: vi.fn(),
  errorToast: vi.fn(),
  valid: true,
  queryFailed: false,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.errorToast, dismiss: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('./use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: () => undefined }));
vi.mock('./use-admission-campus-options', () => ({
  useAdmissionCampusOptions: () => async () => ({ data: [], hasMore: false }),
}));
vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    data: [{ id: 'class-1', name: 'Class 1', educationMediumStageId: 'stage-1' }],
    isFetching: false,
    isError: false,
  }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({ data: { id: 'form-1', name: 'School inquiry', version: 1 } }),
}));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({ data: [], isError: false }),
}));
vi.mock('./use-admission-offering-editor', () => ({
  useAdmissionOfferingEditor: () => ({
    hierarchy: [
      {
        id: 'stage-1',
        boardId: 'board-1',
        boardName: 'CBSE',
        mediumId: 'medium-1',
        mediumName: 'English',
        label: 'Primary',
      },
    ],
    queryFailed: mocks.queryFailed,
    hierarchyEmpty: false,
    hierarchyLoading: false,
    validating: false,
    retryHierarchy: mocks.retry,
    clearReadiness: () => undefined,
    validateForReview: mocks.validate,
    save: mocks.save,
    readiness: {
      isValid: mocks.valid,
      errors: mocks.valid ? [] : [{ code: 'Incomplete', message: 'Select a published workflow' }],
    },
    fetchWorkflows: async () => ({
      data: [
        { id: 'workflow-1', name: 'School workflow', version: 1 },
        { id: 'workflow-2', name: 'Another workflow', version: 1 },
      ],
      hasMore: false,
    }),
    fetchInquiryForms: async () => ({
      data: [{ id: 'form-1', name: 'School inquiry', version: 1 }],
      hasMore: false,
    }),
  }),
}));
const cycle = {
  id: 'cycle-1',
  name: 'General Admission',
  code: 'INTERNAL-CYCLE-CODE',
  academicYearId: 'year-1',
  academicYearName: '2026-2027',
  status: 1,
  startDate: '2026-10-01',
  endDate: '2026-10-31',
} as AdmissionCycle;
const offering = {
  id: 'offering-1',
  name: 'Class 1 General',
  code: 'ADM-CLASS-1',
  boardId: 'board-1',
  mediumId: 'medium-1',
  stageId: 'stage-1',
  standardId: 'class-1',
  track: 0,
  entryMode: 0,
  applicationCount: 5,
  canEditIdentity: false,
  isActive: true,
  useCycleDates: true,
  workflowDefinitionId: 'workflow-1',
  workflowName: 'School workflow',
  workflowVersion: 1,
  inquiryFormDefinitionId: 'form-1',
  inquiryFormName: 'School inquiry',
  inquiryFormVersion: 1,
} as AdmissionOffering;
const props = { open: true, cycle, offering, saving: false, onClose: vi.fn(), onSave: vi.fn() };
function show(overrides: Partial<React.ComponentProps<typeof AdmissionOfferingEditDrawer>> = {}) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionOfferingEditDrawer {...props} {...overrides} />
    </ThemeProvider>
  );
}
describe('Offering edit drawer experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.valid = true;
    mocks.queryFailed = false;
    mocks.validate.mockResolvedValue({ isValid: true, errors: [] });
    mocks.save.mockResolvedValue(true);
  });
  it('opens a locked loading shell, then announces the detail failure through the standard toast', async () => {
    const retry = vi.fn();
    const view = show({ offering: null, loadingDetail: true });
    expect(screen.getByRole('status', { name: 'Loading admission offering' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close admission offering' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    view.rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionOfferingEditDrawer
          {...props}
          offering={null}
          loadingDetail={false}
          detailError="Unable to load offering"
          onRetryDetail={retry}
        />
      </ThemeProvider>
    );
    await waitFor(() =>
      expect(mocks.errorToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unable to load offering' })
      )
    );
    expect(screen.queryByText('Unable to load offering')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Offering name *' })).not.toBeInTheDocument();
    expect(retry).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Close admission offering' })).toBeEnabled();
  });
  it('merges class and configuration, shows cycle below two steps and preserves choices after Preview/Back', async () => {
    const user = userEvent.setup();
    show();
    expect(screen.getByRole('region', { name: 'Admission offering editor' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Class and academic scope information' })
    ).toBeVisible();
    expect(screen.queryByText('INTERNAL-CYCLE-CODE')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Select a campus when this intake is campus-specific.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board *' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('textbox', { name: 'Offering name *' })).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Offering code *' })).not.toBeInTheDocument();
    expect(screen.queryByText(offering.code)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Campus (optional)' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Use Admission Cycle dates' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Admission window' })).not.toBeInTheDocument();
    const configureStep = screen.getByRole('button', { name: 'Step 1: Configure' });
    const cycleHeading = screen.getByRole('heading', { name: cycle.name });
    expect(configureStep.compareDocumentPosition(cycleHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getByRole('button', { name: 'Step 2: Preview' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Step 3:/ })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' }).querySelector('.MuiButton-endIcon')
    ).not.toBeNull();
    expect(screen.queryByText(/Academic identity is locked/)).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Board *' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Configure offering information' })).toBeVisible();
    expect(screen.queryByText(/A clear name shown/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Application form comes from the workflow’s Form stage.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Published workflow' }));
    await user.keyboard('{ArrowDown}');
    await user.click(await screen.findByRole('option', { name: 'Another workflow · v1' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { name: 'Preview offering' })).toBeVisible();
    expect(screen.queryByText(offering.code)).not.toBeInTheDocument();
    expect(screen.getByText('Class 1', { selector: 'p' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Published workflow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('combobox', { name: 'Published workflow' })).toHaveValue(
      'Another workflow · v1'
    );
    expect(screen.getByRole('textbox', { name: 'Offering name *' })).toHaveValue(offering.name);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
  }, 20000);
  it('keeps field errors and blocks invalid advancement despite compact helper text', async () => {
    const user = userEvent.setup();
    show();
    await user.clear(screen.getByRole('textbox', { name: 'Offering name *' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Offering name is required')).toBeVisible();
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('keeps blocking readiness errors visible and prevents saving an active offering', async () => {
    mocks.valid = false;
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Preview offering' });
    expect(screen.getByText('Configuration incomplete')).toBeVisible();
    expect(screen.getByText('Select a published workflow')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('uses cycle dates while preserving hidden code, campus and activation state through Preview and Save', async () => {
    const user = userEvent.setup();
    show({
      offering: {
        ...offering,
        campusId: 'campus-1',
        useCycleDates: false,
        openDate: '2026-10-05T00:00:00Z',
        closeDate: '2026-10-20T00:00:00Z',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Preview offering' });
    expect(mocks.validate).toHaveBeenCalledWith(
      expect.objectContaining({
        code: offering.code,
        campusId: 'campus-1',
        useCycleDates: true,
        isActive: true,
        openDate: null,
        closeDate: null,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        code: offering.code,
        campusId: 'campus-1',
        useCycleDates: true,
        openDate: null,
        closeDate: null,
        isActive: true,
      })
    );
  });
  it('retains inactive preparation when server readiness is incomplete', async () => {
    mocks.valid = false;
    show({ offering: { ...offering, isActive: false } });
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Preview offering' });
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });
  it('announces option-load errors through the standard toast while blocking Continue', async () => {
    mocks.queryFailed = true;
    show();
    await waitFor(() =>
      expect(mocks.errorToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Some academic options could not be loaded. Retry before saving.',
        })
      )
    );
    expect(
      screen.queryByText('Some academic options could not be loaded', { exact: false })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('does not advance or save when the server validation request fails', async () => {
    mocks.validate.mockResolvedValue(null);
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(mocks.validate).toHaveBeenCalledOnce());
    expect(screen.getByRole('textbox', { name: 'Offering name *' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Preview offering' })).not.toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
