import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { getOfferingInitialValues } from './admission-offering-model';

vi.mock('./admission-offering-edit-drawer', () => ({
  AdmissionOfferingEditDrawer: () => <div>Edit offering stepper drawer</div>,
}));
vi.mock('./use-admission-offering-form', () => ({
  useAdmissionOfferingForm: () => ({
    formik: {
      values: getOfferingInitialValues(),
      resetForm: vi.fn(),
      setValues: vi.fn(),
      dirty: false,
    },
    clearReadiness: vi.fn(),
    submitWithActiveState: vi.fn(),
    hierarchy: [],
    standards: [],
    queryFailed: false,
    hierarchyEmpty: false,
    validating: false,
  }),
}));
vi.mock('./admission-offering-hierarchy-fields', () => ({
  AdmissionOfferingHierarchyFields: () => <div>Offering class configuration</div>,
}));
vi.mock('./admission-offering-configuration-fields', () => ({
  AdmissionOfferingConfigurationFields: () => <div>Offering workflow configuration</div>,
}));

const cycle = {
  id: 'cycle-1',
  name: 'Admissions 2027-28',
  code: 'ADM-2728',
  academicYearId: 'year-1',
  academicYearName: '2027-28',
  startDate: '2027-10-01T00:00:00Z',
  endDate: '2028-03-31T00:00:00Z',
  status: 1,
} as AdmissionCycle;

describe('Admission Offering dialog routing', () => {
  it.each(['create', 'clone'] as const)('has no custom-date controls in %s mode', (mode) => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionOfferingDialog
          open
          mode={mode}
          cycle={cycle}
          cycles={[cycle]}
          saving={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Offering class configuration')).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Admission window' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: 'Use Admission Cycle dates' })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications open/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Applications close/)).not.toBeInTheDocument();
    expect(screen.getByText(/Cycle window:/)).toBeVisible();
  });
  it('uses the edit shell while details are still loading instead of the create form', () => {
    render(
      <AdmissionOfferingDialog
        open
        mode="edit"
        cycle={cycle}
        cycles={[cycle]}
        offering={null}
        loadingDetail
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByText('Edit offering stepper drawer')).toBeVisible();
  });
  it('uses the stepped edit drawer for an existing offering', () => {
    render(
      <AdmissionOfferingDialog
        open
        mode="edit"
        cycle={cycle}
        cycles={[cycle]}
        offering={{ id: 'offering-1' } as AdmissionOffering}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('Edit offering stepper drawer')).toBeVisible();
  });
});
