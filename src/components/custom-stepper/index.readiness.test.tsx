import * as Yup from 'yup';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { CustomStepperWithFormik } from '.';

const viewport = vi.hoisted(() => ({ small: false }));
vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => viewport.small }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const props = {
  steps: ['Review', 'Confirm'],
  activeStep: 1,
  initialValues: {},
  validationSchema: Yup.object({}),
  handleBack: vi.fn(),
  handleNext: vi.fn(),
  showSaveButton: false,
  renderItem: () => <input aria-label="Draft" />,
};
const content = (changes = {}) => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CustomStepperWithFormik {...props} {...changes} />
  </ThemeProvider>
);
beforeEach(() => {
  vi.clearAllMocks();
  viewport.small = false;
});

it('keeps horizontal as the default and adapts opt-in vertical mode at the shared large-screen boundary', () => {
  const mounted = render(content());
  expect(mounted.container.querySelector('.MuiStepper-horizontal')).toBeTruthy();
  mounted.rerender(content({ viewMode: 'vertical' }));
  expect(mounted.container.querySelector('.MuiStepper-vertical')).toBeTruthy();
  viewport.small = true;
  mounted.rerender(content({ viewMode: 'vertical' }));
  expect(mounted.container.querySelector('.MuiStepper-horizontal')).toBeTruthy();
});

it.each([{ disableSubmit: true }, { saveAndNextButtonProps: { disabled: true } }])(
  'blocks native form submission when the final action is disabled: %s',
  async (changes) => {
    render(content(changes));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.submit(screen.getByLabelText('Draft').closest('form')!);
    await waitFor(() => expect(props.handleNext).not.toHaveBeenCalled());
  }
);

it('announces correction-needed steps without presenting them as completed', () => {
  render(content({ errors: [true, false], completedSteps: [] }));
  expect(screen.getByRole('button', { name: 'Step 1: Review' })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  expect(screen.getByLabelText('Needs attention')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Step 2: Confirm' })).toHaveAttribute(
    'aria-current',
    'step'
  );
});
