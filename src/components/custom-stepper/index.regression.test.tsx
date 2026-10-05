import * as Yup from 'yup';
import { useState } from 'react';
import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { TextField, Typography } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { CustomStepperWithFormik } from '.';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const schema = Yup.object({ name: Yup.string().required('Student name is required') });

it('blocks invalid progress and preserves entered values through Back and final submission', async () => {
  const submitted = vi.fn();
  const user = userEvent.setup();
  function Workspace() {
    const [step, setStep] = useState(0);
    return (
      <CustomStepperWithFormik
        steps={['Details', 'Review']}
        activeStep={step}
        initialValues={{ name: '' }}
        validationSchema={schema}
        showSaveButton={false}
        isStepClickable={(index) => index <= step}
        handleBack={() => setStep(0)}
        handleNext={(isLast, values) => {
          if (isLast) submitted(values);
          else setStep(1);
        }}
        renderItem={({ formik, activeStep }) =>
          activeStep === 0 ? (
            <TextField
              label="Student name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && String(formik.errors.name || '')}
            />
          ) : (
            <Typography>Review student: {formik.values.name}</Typography>
          )
        }
      />
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Workspace />
    </ThemeProvider>
  );
  await user.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(await screen.findByText('Student name is required')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveFocus();
  expect(submitted).not.toHaveBeenCalled();
  await user.type(screen.getByRole('textbox', { name: 'Student name' }), 'Asha');
  await user.click(screen.getByRole('button', { name: 'Save & Next' }));
  expect(await screen.findByText('Review student: Asha')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Asha');
  await user.click(screen.getByRole('button', { name: 'Save & Next' }));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(submitted).toHaveBeenCalledExactlyOnceWith({ name: 'Asha' }));
});

it('locks navigation and blocks duplicate actions while saving', async () => {
  const saved = vi.fn();
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CustomStepperWithFormik
        steps={['Details', 'Review']}
        activeStep={0}
        initialValues={{ name: 'Asha' }}
        validationSchema={schema}
        onCancel={vi.fn()}
        handleBack={vi.fn()}
        handleNext={(_isLast, values, _formik, setLoading) => {
          saved(values);
          setLoading(true);
        }}
        renderItem={() => <Typography>Student details</Typography>}
      />
    </ThemeProvider>
  );
  const next = screen.getByRole('button', { name: 'Save & Next' });
  await user.click(next);
  await waitFor(() => expect(next).toBeDisabled());
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Step 1: Details' })).toBeDisabled();
  fireEvent.click(next);
  expect(saved).toHaveBeenCalledExactlyOnceWith({ name: 'Asha' });
});
