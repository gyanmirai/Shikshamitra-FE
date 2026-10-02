import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionWorkflowDialog } from '../admission-workflow-dialog';

[
  'close',
  'plus',
  'information-outline',
  'pencil-outline',
  'school-outline',
  'lightning-bolt-outline',
  'clipboard-text-outline',
  'email-seal-outline',
  'pencil-outline',
  'text-box-plus-outline',
  'format-list-numbered',
  'chevron-down',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const inquiryForm = { id: 'inquiry-form', name: 'Parent inquiry', version: 2 };
const registrationForm = { id: 'registration-form', name: 'Student registration', version: 3 };
const fetchInquiryForms = vi.fn(async () => ({ data: [inquiryForm], hasMore: false }));
const fetchRegistrationForms = vi.fn(async () => ({ data: [registrationForm], hasMore: false }));

function renderDrawer() {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const store = configureStore({ reducer: { confirmPopup } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionWorkflowDialog
          open
          saving={false}
          showStarterJourney
          fetchInquiryForms={fetchInquiryForms}
          fetchRegistrationForms={fetchRegistrationForms}
          onClose={vi.fn()}
          onSave={onSave}
        />
      </ThemeProvider>
    </Provider>
  );
  return onSave;
}

async function selectForm(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('workflow creation drawer', () => {
  it('shows forms before templates and keeps the journey preview collapsed until requested', async () => {
    const user = userEvent.setup();
    renderDrawer();

    const registration = screen.getByRole('combobox', { name: 'Registration form *' });
    const templates = screen.getByText('Choose a workflow template');
    expect(registration.compareDocumentPosition(templates)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByRole('button', { name: /Preview journey/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: /Preview journey/ }));
    expect(screen.getByRole('button', { name: /Preview journey/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Add workflow description' }));
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toBeInTheDocument();
  });

  it('keeps the chosen template and both published forms in the create payload', async () => {
    const user = userEvent.setup();
    const onSave = renderDrawer();

    expect(document.querySelector('.MuiDrawer-paperAnchorRight')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Grade 1 Admission' },
    });
    expect(screen.queryByRole('textbox', { name: 'Workflow code *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    await selectForm(user, 'Inquiry form (optional)', 'Parent inquiry · v2');
    await selectForm(user, 'Registration form *', 'Student registration · v3');
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Grade 1 Admission',
      code: '',
      starterJourney: 'assessment',
      defaultInquiryFormDefinitionId: 'inquiry-form',
      registrationFormDefinitionId: 'registration-form',
    });
  }, 15000);

  it('requires registration form before creating a template workflow', async () => {
    const user = userEvent.setup();
    const onSave = renderDrawer();

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Fresh Admission' },
    });
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('allows a blank workflow without a registration form', async () => {
    const user = userEvent.setup();
    const onSave = renderDrawer();

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Custom Admission' },
    });
    await user.click(screen.getByRole('radio', { name: /Blank workflow/ }));
    expect(screen.queryByRole('combobox', { name: 'Registration form *' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      starterJourney: 'empty',
      registrationFormDefinitionId: null,
    });
  });
});
