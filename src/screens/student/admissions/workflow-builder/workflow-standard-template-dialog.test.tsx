import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { WorkflowStandardTemplateDialog } from './components/workflow-standard-template-dialog';

// Exercise the actual controls without external icon fetches during Happy DOM teardown.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const inquiryForm = { id: 'inquiry-form', name: 'Parent inquiry', version: 2 };
const registrationForm = { id: 'registration-form', name: 'Student registration', version: 3 };
const fetchInquiryForms = vi.fn(async () => ({ data: [inquiryForm], hasMore: false }));
const fetchRegistrationForms = vi.fn(async () => ({ data: [registrationForm], hasMore: false }));

function renderDrawer(initialForms = false) {
  const props = {
    open: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
    onOpenFormBuilder: vi.fn(),
    fetchInquiryForms,
    fetchRegistrationForms,
    ...(initialForms && {
      initialInquiryFormDefinitionId: inquiryForm.id,
      initialInquiryForm: inquiryForm,
      initialRegistrationFormDefinitionId: registrationForm.id,
      initialRegistrationForm: registrationForm,
    }),
  };
  const store = configureStore({ reducer: { confirmPopup } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <WorkflowStandardTemplateDialog {...props} />
      </ThemeProvider>
    </Provider>
  );
  return props;
}

async function selectForm(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('manual workflow template drawer', () => {
  it('offers only Standard when replacing a journey and preserves the optional inquiry form', async () => {
    const user = userEvent.setup();
    const props = renderDrawer(true);
    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /Standard admission/ })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /Post-Inquiry Admission/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Preview Selected Journey' }));
    expect(screen.queryByText('Inquiry Submitted')).toBeNull();
    expect(screen.getByText('1. Entrance assessment')).toBeVisible();
    expect(screen.getByText('5. Admission finalization')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Replace Journey' }));
    expect(props.onApply).toHaveBeenCalledWith('standard', 'registration-form', 'inquiry-form');
  });

  it('keeps guidance in the header tooltip and previews the selected journey', async () => {
    const user = userEvent.setup();
    renderDrawer(true);

    expect(screen.queryByText(/Select the closest process/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Registration is attached to the Form stage/)
    ).not.toBeInTheDocument();
    await user.hover(screen.getByRole('button', { name: 'Workflow Template Information' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Replace This Draft’s Journey and Select the Published Forms It Uses.'
    );
    await user.unhover(screen.getByRole('button', { name: 'Workflow Template Information' }));
    await user.click(screen.getByRole('button', { name: 'Preview Selected Journey' }));
    expect(screen.getByText('1. Entrance assessment')).toBeVisible();
    expect(screen.getByText('2. Admission form')).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('shows the forms already attached to the workflow', async () => {
    renderDrawer(true);

    expect(screen.getByRole('combobox', { name: 'Published Inquiry Form (Optional)' })).toHaveValue(
      'Parent inquiry · v2'
    );
    expect(screen.getByRole('combobox', { name: 'Published Registration Form *' })).toHaveValue(
      'Student registration · v3'
    );
  });

  it('applies the selected template and both published forms to the draft', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    expect(document.querySelector('.MuiDrawer-paperAnchorRight')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Standard admission/ }));
    await selectForm(user, 'Published Inquiry Form (Optional)', 'Parent inquiry · v2');
    await selectForm(user, 'Published Registration Form *', 'Student registration · v3');
    await user.click(screen.getByRole('button', { name: 'Replace Journey' }));

    await waitFor(() =>
      expect(props.onApply).toHaveBeenCalledWith('standard', 'registration-form', 'inquiry-form')
    );
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('requires a registration form and guards unsaved selections', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Replace Journey' }));
    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(props.onApply).not.toHaveBeenCalled();

    await selectForm(user, 'Published Inquiry Form (Optional)', 'Parent inquiry · v2');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Discard Template Selections?')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Discard Selections' }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('dismisses the warning without bypassing registration form validation', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    expect(screen.getByRole('button', { name: 'Workflow Template Information' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Dismiss template replacement warning' }));
    expect(
      screen.queryByText(/This replaces the current stages and routes/)
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Replace Journey' }));
    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(props.onApply).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });
});
