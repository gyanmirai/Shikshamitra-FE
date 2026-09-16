import type { FormikProps } from 'formik';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';

const mocks = vi.hoisted(() => ({
  revisions: [] as any[],
  readiness: { canActivate: false, blockerCodes: [] as string[] },
  activate: vi.fn(),
  refetchReadiness: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/redux/PF/PFApi', () => ({
  useGetPFQuery: () => ({ data: { items: [] }, isError: false }),
}));
vi.mock('src/redux/hr/employeeApi', () => ({
  useUpdateEmployeeStatusMutation: () => [mocks.activate, { isLoading: false }],
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetActiveSalaryTemplatesQuery: () => ({
    data: {
      items: [
        {
          id: 'template-default',
          name: 'School Default',
          isDefault: true,
          editableVersion: {
            id: 'version-default',
            versionNumber: 1,
            defaultSalaryBasis: 'EMPLOYER_COST',
            defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST',
            defaultPfApplicable: false,
            defaultPfRuleId: null,
            rules: [],
          },
        },
        {
          id: 'template-saved',
          name: 'Saved Template',
          isDefault: false,
          editableVersion: {
            id: 'version-saved',
            versionNumber: 4,
            defaultSalaryBasis: 'GROSS',
            defaultProtectionPolicy: 'PROTECT_GROSS',
            defaultPfApplicable: false,
            defaultPfRuleId: null,
            rules: [],
          },
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCalculateSalaryTemplateMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  useGetCompensationRevisionsQuery: () => ({
    data: { items: mocks.revisions },
    isLoading: false,
    isError: false,
  }),
  useSaveEmployeeCompensationMutation: () => [vi.fn(), { isLoading: false }],
  useGetEmployeeActivationReadinessQuery: () => ({
    data: mocks.readiness,
    refetch: mocks.refetchReadiness,
  }),
}));

const theme = createTheme(defaultSettings);
const formik = {
  values: { quotedMonthlyAmount: null },
  setFieldValue: vi.fn(),
} as unknown as FormikProps<any>;

const renderBuilder = (props: Partial<React.ComponentProps<typeof SalaryStructureBuilder>> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SalaryStructureBuilder
        formik={formik}
        employeeId="employee-1"
        dateOfJoining="2026-11-18"
        {...props}
      />
    </ThemeProvider>
  );

describe('SalaryStructureBuilder initialization and activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.revisions = [];
    mocks.readiness = { canActivate: false, blockerCodes: [] };
    mocks.activate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.refetchReadiness.mockResolvedValue({});
  });

  it('preselects the school default template and joining month for a new salary setup', async () => {
    renderBuilder();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Salary template' })).toHaveTextContent(
        'School Default'
      );
      expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11');
    });
  });

  it('reopens the saved immutable revision and offers activation as a separate action', async () => {
    const user = userEvent.setup();
    mocks.revisions = [
      {
        id: 'revision-7',
        revisionNumber: 7,
        status: 'EFFECTIVE',
        effectiveMonth: '2026-10-01T00:00:00.000Z',
        sourceSalaryTemplateId: 'template-saved',
        sourceSalaryTemplateVersion: 4,
        salaryBasis: 'GROSS',
        protectionPolicy: 'PROTECT_GROSS',
        quotedMonthlyAmount: 55_000,
        pfRuleId: null,
        overrides: [],
        customizationReason: null,
        isCustomized: false,
        isCurrent: true,
        isScheduled: false,
        netSalary: 54_800,
      },
    ];
    mocks.readiness = { canActivate: true, blockerCodes: [] };

    renderBuilder();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Salary template' })).toHaveTextContent(
        'Saved Template'
      );
      expect(screen.getByLabelText('Effective month')).toHaveValue('2026-10');
      expect(screen.getByLabelText('Monthly amount')).toHaveValue(55_000);
    });

    await user.click(screen.getByRole('button', { name: 'Activate employee' }));

    expect(mocks.activate).toHaveBeenCalledWith({
      id: 'employee-1',
      body: {
        employeeStatusType: 0,
        remarks: 'Activated after payroll setup',
        effectiveDate: null,
      },
    });
  });
});
