import { Formik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { getOfferingInitialValues } from './admission-offering-model';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({ data: undefined }),
}));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({ data: [], isError: false }),
}));

const fetchDefinitions = async () => ({ data: [], hasMore: false });

function show({
  showCode = true,
  twoColumnLayout = false,
  entryMode = 0,
}: {
  showCode?: boolean;
  twoColumnLayout?: boolean;
  entryMode?: 0 | 1 | 2;
} = {}) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Formik
        initialValues={{
          ...getOfferingInitialValues(),
          name: 'Class 1 General',
          code: 'ADM-CLASS-1',
          entryMode,
        }}
        onSubmit={vi.fn()}
      >
        {(formik) => (
          <AdmissionOfferingConfigurationFields
            compact
            hideConfigurationWarning
            formik={formik}
            showCode={showCode}
            twoColumnLayout={twoColumnLayout}
            fetchWorkflows={fetchDefinitions}
            fetchInquiryForms={fetchDefinitions}
          />
        )}
      </Formik>
    </ThemeProvider>
  );
}

describe('Offering configuration field layout', () => {
  it('retains the existing code field and layout by default for create and clone', () => {
    show();
    const code = screen.getByRole('textbox', { name: 'Offering code *' });
    expect(code).toHaveValue('ADM-CLASS-1');
    expect(code.closest('.MuiGrid-root')).toHaveClass('MuiGrid-grid-sm-5');
    expect(
      screen.getByRole('textbox', { name: 'Offering name *' }).closest('.MuiGrid-root')
    ).toHaveClass('MuiGrid-grid-sm-7');
  });

  it('uses equal two-column cells for retained edit fields without rendering the code', () => {
    show({ showCode: false, twoColumnLayout: true });
    expect(screen.queryByRole('textbox', { name: 'Offering code *' })).not.toBeInTheDocument();
    expect(screen.queryByText('ADM-CLASS-1')).not.toBeInTheDocument();
    const fields = [
      screen.getByRole('textbox', { name: 'Offering name *' }),
      screen.getByRole('combobox', { name: 'Published workflow' }),
      screen.getByRole('combobox', { name: 'Published inquiry form' }),
    ];
    fields.forEach((field) => {
      expect(field.closest('.MuiGrid-root')).toHaveClass('MuiGrid-grid-xs-12', 'MuiGrid-grid-sm-6');
    });
  });

  it('preserves the direct-registration rule without adding an unused inquiry field', () => {
    show({ showCode: false, twoColumnLayout: true, entryMode: 1 });
    expect(
      screen.queryByRole('combobox', { name: 'Published inquiry form' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Intake & assignment setup (optional)' })
    ).not.toBeInTheDocument();
  });
});
