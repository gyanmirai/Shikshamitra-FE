import { Formik } from 'formik';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

describe('FormBuilderDetailFields', () => {
  it('keeps empty labels inside their fields until focus and omits the duplicate grid setting', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Formik initialValues={getBlankAdmissionFormInitialValues(0)} onSubmit={() => undefined}>
          {(formik) => <FormBuilderDetailFields formik={formik} />}
        </Formik>
      </ThemeProvider>
    );

    const nameLabel = screen.getByText('Form name *', { selector: 'label' });
    const descriptionLabel = screen.getByText('Description (optional)', { selector: 'label' });

    expect(nameLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(descriptionLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(screen.queryByRole('combobox', { name: /Fields per row/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Form purpose/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('textbox', { name: 'Form name *' }));
    expect(nameLabel).toHaveClass('MuiInputLabel-shrink');

    await user.click(screen.getByRole('textbox', { name: 'Description (optional)' }));
    expect(nameLabel).not.toHaveClass('MuiInputLabel-shrink');
    expect(descriptionLabel).toHaveClass('MuiInputLabel-shrink');
  });
});
