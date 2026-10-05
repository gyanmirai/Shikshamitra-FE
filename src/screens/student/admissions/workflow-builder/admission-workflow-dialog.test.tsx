import { createRef } from 'react';
import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { type WorkflowDetails, AdmissionWorkflowDialog } from '../admission-workflow-dialog';
import { getAdmissionWorkflowTemplate } from '../workflow-template';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

addIcon('ic:round-arrow-forward', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
addIcon('eva:checkmark-fill', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });

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
  'arrow-left',
  'sitemap-outline',
  'radiobox-blank',
  'check-circle',
  'content-save-outline',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const registrationForm = { id: 'registration-form', name: 'Student registration', version: 3 };
const fetchRegistrationForms = vi.fn(async () => ({ data: [registrationForm], hasMore: false }));

function renderCreate({
  onSave = vi.fn().mockResolvedValue(undefined),
  onClose = vi.fn(),
  saving = false,
}: {
  onSave?: ReturnType<typeof vi.fn>;
  onClose?: () => void;
  saving?: boolean;
} = {}) {
  const store = configureStore({ reducer: { confirmPopup } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionWorkflowDialog
          open
          saving={saving}
          showStarterJourney
          closeOnSave={false}
          fetchRegistrationForms={fetchRegistrationForms}
          onClose={onClose}
          onSave={onSave as (value: WorkflowDetails) => Promise<void>}
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

describe('workflow creation first step', () => {
  it('guards closing the in-page form when details are unsaved', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderCreate({ onClose });
    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Unsaved admission' },
    });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Discard workflow details?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Discard details' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('keeps details and template choices together before the journey builder', async () => {
    const user = userEvent.setup();
    renderCreate();

    expect(screen.getByRole('button', { name: 'Step 1: Workflow details' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByRole('button', { name: 'Step 2: Build journey' })).toBeDisabled();
    const workspace = screen.getByRole('region', { name: 'Create workflow' });
    expect(workspace).toHaveClass('MuiCard-root');
    expect(workspace).toContainElement(screen.getByRole('button', { name: 'Continue' }));
    expect(workspace).toContainElement(
      screen.getByRole('button', { name: 'Step 1: Workflow details' })
    );
    expect(screen.queryByRole('dialog', { name: /Create workflow/ })).toBeNull();

    const firstTemplate = screen.getByRole('radio', { name: /Standard admission/ });
    const name = screen.getByRole('textbox', { name: 'Workflow name *' });
    expect(firstTemplate.compareDocumentPosition(name)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByText('Choose a workflow template')).toBeNull();
    expect(firstTemplate.closest('.MuiCard-root')).not.toHaveTextContent('4 stages');
    expect(screen.queryByRole('radio', { name: /Selective admission with offer/ })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /Inquiry form/ })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Journey preview' })).toBeInTheDocument();
    expect(
      screen
        .getByRole('heading', { name: 'Workflow details' })
        .compareDocumentPosition(screen.getByRole('heading', { name: 'Journey preview' }))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    expect(screen.getByText('Entrance assessment completed')).toBeInTheDocument();
  });

  it('keeps the chosen template and registration form without an inquiry default', async () => {
    const user = userEvent.setup();
    const onSave = renderCreate();

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Grade 1 Admission' },
    });
    expect(screen.queryByRole('textbox', { name: 'Workflow code *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    await selectForm(user, 'Registration form *', 'Student registration · v3');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Grade 1 Admission',
      code: '',
      starterJourney: 'assessment',
      defaultInquiryFormDefinitionId: null,
      registrationFormDefinitionId: 'registration-form',
    });
  }, 15000);

  it('blocks Continue until the workflow name and published registration form are supplied', async () => {
    const user = userEvent.setup();
    const onSave = renderCreate();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Workflow name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Fresh Admission' },
    });
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Select a published registration form')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Step 1: Workflow details' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  });

  it('allows a blank workflow without a registration form', async () => {
    const user = userEvent.setup();
    const onSave = renderCreate();

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Custom Admission' },
    });
    await user.click(screen.getByRole('radio', { name: /Blank workflow/ }));
    expect(screen.queryByRole('combobox', { name: 'Registration form *' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      starterJourney: 'empty',
      registrationFormDefinitionId: null,
    });
  });

  it('keeps entered details available for retry when draft creation fails', async () => {
    const user = userEvent.setup();
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unable to create draft'))
      .mockResolvedValueOnce(undefined);
    renderCreate({ onSave });

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Retry admission' },
    });
    await user.click(screen.getByRole('radio', { name: /Blank workflow/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('textbox', { name: 'Workflow name *' })).toHaveValue('Retry admission');
    expect(screen.getByRole('radio', { name: /Blank workflow/ })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Step 1: Workflow details' })).toHaveAttribute(
      'aria-current',
      'step'
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  });

  it('prevents a second Continue while the draft is being created', async () => {
    const user = userEvent.setup();
    let resolveSave: () => void = () => undefined;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );
    renderCreate({ onSave });

    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'One draft only' },
    });
    await user.click(screen.getByRole('radio', { name: /Blank workflow/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Step 1: Workflow details' })).toBeDisabled();
    expect(onSave).toHaveBeenCalledOnce();

    await act(async () => resolveSave());
  });
});

describe('inline workflow details editing', () => {
  function renderEdit(
    onSave = vi.fn().mockResolvedValue(undefined),
    onClose = vi.fn(),
    description: WorkflowDetails['description'] = 'Saved description',
    saving = false
  ) {
    const currentJourney = getAdmissionWorkflowTemplate('assessment', registrationForm.id);
    currentJourney.stages[0].name = 'School-specific registration';
    const closeRequestRef = createRef<() => void>();
    const store = configureStore({ reducer: { confirmPopup } });
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionWorkflowDialog
            open
            inline
            saving={saving}
            currentJourney={currentJourney}
            closeRequestRef={closeRequestRef}
            initialRegistrationForm={registrationForm}
            fetchRegistrationForms={fetchRegistrationForms}
            title="Edit workflow name and description"
            submitLabel="Save & continue"
            initialValues={{
              name: 'Existing admission',
              code: 'EXISTING',
              description,
              registrationFormDefinitionId: registrationForm.id,
            }}
            onClose={onClose}
            onSave={onSave}
          />
        </ThemeProvider>
      </Provider>
    );
    return { onSave, onClose, closeRequestRef };
  }

  it('reuses create layout with templates, form and the actual current journey', async () => {
    const user = userEvent.setup();
    const { onSave, onClose } = renderEdit();
    expect(screen.getByRole('region', { name: 'Edit workflow name and description' })).toHaveClass(
      'MuiCard-root'
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Edit workflow name and description' })
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Workflow information' })).toBeNull();
    expect(screen.queryByText('Step 1 of 2')).toBeNull();
    expect(screen.getByRole('button', { name: 'Close workflow editor' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Step 1: Workflow details' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByRole('button', { name: 'Step 2: Build journey' })).toBeDisabled();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Journey preview' })).toBeInTheDocument();
    expect(screen.getByText('School-specific registration')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Registration form *' })).toHaveValue(
      'Student registration · v3'
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Updated admission' },
    });
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated admission',
        code: 'EXISTING',
        description: 'Saved description',
        starterJourney: undefined,
        registrationFormDefinitionId: registrationForm.id,
      })
    );
  });

  it('requires confirmation before replacing the journey and can keep the current graph', async () => {
    const user = userEvent.setup();
    const { onSave } = renderEdit();
    await user.click(screen.getByRole('radio', { name: /Simple direct admission/ }));
    expect(screen.queryByText('School-specific registration')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    expect(
      await screen.findByRole('dialog', { name: 'Replace current journey?' })
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('dialog', { name: 'Replace current journey?' })).getByRole('button', {
        name: 'Cancel',
      })
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Keep current journey' }));
    expect(screen.getByText('School-specific registration')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ starterJourney: undefined }));
  });

  it('saves an explicitly confirmed replacement, retaining form selection', async () => {
    const user = userEvent.setup();
    const { onSave } = renderEdit();
    await user.click(screen.getByRole('radio', { name: /Simple direct admission/ }));
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    await user.click(await screen.findByRole('button', { name: 'Replace & save' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        starterJourney: 'simple',
        registrationFormDefinitionId: registrationForm.id,
      })
    );
  });

  it('routes breadcrumb Back through the same dirty-close guard', async () => {
    const user = userEvent.setup();
    const { onClose, closeRequestRef } = renderEdit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Unsaved edit' },
    });
    act(() => closeRequestRef.current?.());
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Discard details' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks edit Back, Close and Save while saving', () => {
    const { onClose, closeRequestRef } = renderEdit(undefined, undefined, 'Saved', true);
    expect(screen.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close workflow editor' })).toBeDisabled();
    act(() => closeRequestRef.current?.());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('retains inline edit values after a save failure', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    const { onClose } = renderEdit(onSave);
    fireEvent.change(screen.getByRole('textbox', { name: 'Workflow name *' }), {
      target: { value: 'Retry details' },
    });
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Workflow name *' })).toHaveValue('Retry details');
  });

  it('treats a persisted null description as an empty optional field', async () => {
    const user = userEvent.setup();
    // Older API records can return null even though this optional client field is typed as string.
    const { onSave } = renderEdit(undefined, undefined, null as unknown as string);
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Save & continue' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.queryByText('description cannot be null')).toBeNull();
  });
});
