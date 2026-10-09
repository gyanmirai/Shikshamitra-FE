import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { WorkflowStandardTemplateDialog } from './components/workflow-standard-template-dialog';

[
  'close',
  'auto-fix',
  'open-in-new',
  'school-outline',
  'lightning-bolt-outline',
  'clipboard-text-outline',
  'email-seal-outline',
  'radiobox-blank',
  'check-circle',
  'eye-outline',
  'alert-outline',
  'information-outline',
  'sitemap-outline',
  'form-select',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

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
  it('keeps guidance in the header tooltip and previews the selected journey', async () => {
    const user = userEvent.setup();
    renderDrawer(true);

    expect(screen.queryByText(/Select the closest process/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Registration is attached to the Form stage/)
    ).not.toBeInTheDocument();
    await user.hover(screen.getByRole('button', { name: 'Workflow template information' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Replace this draft’s journey and select the published forms it uses.'
    );
    await user.unhover(screen.getByRole('button', { name: 'Workflow template information' }));
    await user.click(screen.getByRole('button', { name: 'Preview selected journey' }));
    expect(screen.getByText('1. Application form submitted')).toBeVisible();
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    expect(screen.getByText('2. Entrance assessment completed')).toBeVisible();
  });

  it('shows the forms already attached to the workflow', async () => {
    renderDrawer(true);

    expect(screen.getByRole('combobox', { name: 'Published inquiry form (optional)' })).toHaveValue(
      'Parent inquiry · v2'
    );
    expect(screen.getByRole('combobox', { name: 'Published registration form *' })).toHaveValue(
      'Student registration · v3'
    );
  });

  it('applies the selected template and both published forms to the draft', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    expect(document.querySelector('.MuiDrawer-paperAnchorRight')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    await selectForm(user, 'Published inquiry form (optional)', 'Parent inquiry · v2');
    await selectForm(user, 'Published registration form *', 'Student registration · v3');
    await user.click(screen.getByRole('button', { name: 'Replace journey' }));

    await waitFor(() =>
      expect(props.onApply).toHaveBeenCalledWith('assessment', 'registration-form', 'inquiry-form')
    );
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('requires a registration form and guards unsaved selections', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Replace journey' }));
    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(props.onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Discard template selections?')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Discard selections' }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('dismisses the warning without bypassing registration form validation', async () => {
    const user = userEvent.setup();
    const props = renderDrawer();

    expect(screen.getByRole('button', { name: 'Workflow template information' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Dismiss template replacement warning' }));
    expect(
      screen.queryByText(/This replaces the current stages and routes/)
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Replace journey' }));
    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(props.onApply).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });
});
