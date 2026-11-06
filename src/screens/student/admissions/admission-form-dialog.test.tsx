import type { ReactNode } from 'react';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionFormDialog } from './admission-form-dialog';

const dispatch = vi.hoisted(() => vi.fn());
vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
// Keep the real dialog, details, Formik and stepper; isolate field-library API reads.
vi.mock('./form-dialog/form-builder-sections', () => ({
  FormBuilderSections: ({ footer }: { footer?: ReactNode }) => (
    <>
      <h2>Build fields</h2>
      {footer}
    </>
  ),
}));
vi.mock('./form-dialog/components/form-builder-review', () => ({
  FormBuilderReview: () => <h2>Review draft</h2>,
}));

it('keeps the form draft on Keep editing and discards only after an explicit styled decision', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFormDialog
        open
        saving={false}
        onClose={onClose}
        onSave={vi.fn()}
        onPublishNow={vi.fn()}
      />
    </ThemeProvider>
  );
  await user.type(screen.getByRole('textbox', { name: 'Form Name *' }), 'Unsaved registration');
  await user.click(screen.getByRole('button', { name: 'close' }));
  expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: 'Form Name *' })).toHaveValue('Unsaved registration');
  await user.click(screen.getByRole('button', { name: 'close' }));
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it.each([
  { purpose: 0 as const, type: 'Inquiry', starter: 'Use Inquiry Form: Inquiry Form' },
  { purpose: 1 as const, type: 'Registration', starter: 'Use Recommended: Registration Form' },
])(
  'validates and preserves the $type draft when navigating back and saving',
  async ({ purpose, type, starter }) => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onPublishNow = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionFormDialog
          open
          initialPurpose={purpose}
          saving={false}
          onClose={vi.fn()}
          onSave={onSave}
          onPublishNow={onPublishNow}
        />
      </ThemeProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('combobox', { name: /Form Type/i })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Build fields' })).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: starter }));
    const name = (screen.getByRole('textbox', { name: 'Form Name *' }) as HTMLInputElement).value;
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Build fields' });
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await screen.findByRole('combobox', { name: /Form Type/i });
    expect(screen.getByRole('textbox', { name: 'Form Name *' })).toHaveValue(name);
    expect(screen.getByRole('heading', { name: new RegExp(`Create ${type} Form`) })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Build fields' });
    await user.click(screen.getByRole('button', { name: 'Save Draft' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name, purpose }))
    );
    expect(onPublishNow).not.toHaveBeenCalled();
  }
);

it.each([
  { purpose: 0 as const, type: 'Inquiry', starter: 'Use Inquiry Form: Inquiry Form' },
  { purpose: 1 as const, type: 'Registration', starter: 'Use Recommended: Registration Form' },
])(
  'keeps the selected $type type and heading through all steps and submission',
  async ({ purpose, type, starter }) => {
    const user = userEvent.setup();
    const onPublishNow = vi.fn().mockResolvedValue(undefined);
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionFormDialog
          open
          initialPurpose={purpose === 0 ? 1 : 0}
          saving={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
          onPublishNow={onPublishNow}
        />
      </ThemeProvider>
    );
    await user.click(screen.getByRole('combobox', { name: /Form Type/i }));
    await user.click(screen.getByRole('option', { name: type }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: new RegExp(`Create ${type} Form`) })).toBeVisible()
    );
    await user.click(screen.getByRole('button', { name: starter }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Build fields' });
    expect(screen.getByRole('heading', { name: new RegExp(`Create ${type} Form`) })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Review draft' });
    expect(screen.getByRole('heading', { name: new RegExp(`Create ${type} Form`) })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Publish Now' }));
    await waitFor(() =>
      expect(onPublishNow).toHaveBeenCalledWith(expect.objectContaining({ purpose }))
    );
  }
);
