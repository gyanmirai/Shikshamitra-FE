import type { ComponentProps } from 'react';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { ApplicationRuntimeForm } from './application-runtime-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [vi.fn()],
  useGetAdmissionFormOptionsQuery: () => ({ data: [] }),
}));

it('focuses the editable MUI date section rather than its nonfocusable invalid group', async () => {
  type Props = ComponentProps<typeof ApplicationRuntimeForm>;
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ApplicationRuntimeForm
          application={{ status: 0 } as Props['application']}
          form={
            {
              formVersion: 1,
              status: 0,
              definition: {
                layoutType: 0,
                sections: [
                  {
                    id: 'student',
                    code: 'STUDENT',
                    name: 'Student Details',
                    fields: [
                      {
                        id: 'dob',
                        code: 'DOB',
                        label: 'Date of birth',
                        fieldType: 5,
                        bindingType: 0,
                        bindingKey: 'Applicant.DateOfBirth',
                        required: false,
                        readOnly: false,
                      },
                    ],
                  },
                ],
              },
            } as Props['form']
          }
          values={{ DOB: '' }}
          errors={[]}
          fieldErrors={{ DOB: 'Date of birth is required.' }}
          saving={false}
          submitting={false}
          reopening={false}
          onChange={vi.fn()}
          onBlur={vi.fn()}
          onSave={async () => true}
          onValidateStep={() => true}
          onSubmit={vi.fn()}
          showSaveDraft
          canSubmitForm
          managedFormStage={false}
          canReopen={false}
          onReopen={vi.fn()}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
  await waitFor(() => expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveFocus());
});
