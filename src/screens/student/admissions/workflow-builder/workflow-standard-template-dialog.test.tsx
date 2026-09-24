import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

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

import { ADMISSION_WORKFLOW_TEMPLATES } from '../workflow-template';
import { WorkflowStandardTemplateDialog } from './components/workflow-standard-template-dialog';

[
  'close',
  'auto-fix',
  'open-in-new',
  'refresh',
  'school-outline',
  'lightning-bolt-outline',
  'clipboard-text-outline',
  'email-seal-outline',
  'radiobox-blank',
  'check-circle',
  'eye-outline',
  'alert-outline',
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const form = (status: AdmissionForm['status']): AdmissionForm => ({
  id: status === 1 ? 'published-form' : 'draft-form',
  name: status === 1 ? 'Published registration' : 'New registration',
  code: status === 1 ? 'PUBLISHED_REGISTRATION' : 'NEW_REGISTRATION',
  version: 1,
  status,
  layoutType: 0,
  sectionCount: 1,
  sections: [],
  concurrencyStamp: 'stamp-1',
});

function renderDialog(
  forms: AdmissionForm[],
  overrides: Partial<React.ComponentProps<typeof WorkflowStandardTemplateDialog>> = {}
) {
  const store = configureStore({ reducer: { confirmPopup } });
  const props = {
    open: true,
    forms,
    loading: false,
    loadError: false,
    onClose: vi.fn(),
    onApply: vi.fn(),
    onRetry: vi.fn(),
    onOpenFormBuilder: vi.fn(),
    ...overrides,
  };

  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <WorkflowStandardTemplateDialog {...props} />
      </ThemeProvider>
    </Provider>
  );

  return props;
}

describe('WorkflowStandardTemplateDialog', () => {
  it('shows a draft form and explains that it must be published', async () => {
    const user = userEvent.setup();
    const props = renderDialog([form(0)]);

    expect(
      screen.getByText(/1 draft form is available, but must be published/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace journey' })).toBeDisabled();

    await user.click(screen.getByLabelText('Published application form *'));
    const option = await screen.findByRole('option', {
      name: /New registration · Version 1 · Draft/i,
    });
    expect(option).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Open Admission Forms' }));
    expect(props.onOpenFormBuilder).toHaveBeenCalledOnce();
  });

  it('selects a published form and applies the recommended standard journey', async () => {
    const user = userEvent.setup();
    const props = renderDialog([form(0), form(1)]);

    const selector = screen.getByLabelText('Published application form *');
    expect(selector).toHaveTextContent('Published registration · Version 1 · Published');

    expect(screen.getByRole('radio', { name: /Standard admission/ })).toBeChecked();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Preview', { selector: 'button' })).toBeInTheDocument();
    const standard = ADMISSION_WORKFLOW_TEMPLATES.find((template) => template.id === 'standard')!;
    expect(screen.getAllByText(`${standard.stages.length} stages`)).not.toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Replace journey' }));

    await waitFor(() => expect(props.onApply).toHaveBeenCalledWith('standard', 'published-form'));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('previews and applies a different school-ready journey', async () => {
    const user = userEvent.setup();
    const props = renderDialog([form(1)]);

    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));

    expect(screen.getByLabelText('Assessment-based admission stages')).toBeInTheDocument();
    const assessment = ADMISSION_WORKFLOW_TEMPLATES.find(
      (template) => template.id === 'assessment'
    )!;
    expect(screen.getAllByText(`${assessment.stages.length} stages`)).not.toHaveLength(0);
    expect(screen.getByText('Entrance assessment completed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Replace journey' }));
    await waitFor(() => expect(props.onApply).toHaveBeenCalledWith('assessment', 'published-form'));
  });

  it('offers retry when registration forms cannot be loaded', async () => {
    const user = userEvent.setup();
    const props = renderDialog([], { loadError: true });

    expect(screen.getByText(/Application forms could not be loaded/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace journey' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(props.onRetry).toHaveBeenCalledOnce();
  });
});
