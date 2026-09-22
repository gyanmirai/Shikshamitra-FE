import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

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
].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

describe('workflow creation dialog', () => {
  it('generates a code and keeps the standard journey as the recommended start', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const store = configureStore({ reducer: { confirmPopup } });
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionWorkflowDialog
            open
            saving={false}
            showStarterJourney
            autoGenerateCode
            onClose={vi.fn()}
            onSave={onSave}
          />
        </ThemeProvider>
      </Provider>
    );

    await user.type(screen.getByRole('textbox', { name: 'Workflow name *' }), 'Grade 1 Admission');
    expect(screen.getByRole('textbox', { name: 'Workflow code *' })).toHaveValue(
      'GRADE_1_ADMISSION'
    );
    expect(screen.getByRole('radio', { name: /Standard admission/ })).toBeChecked();
    expect(
      screen.queryByText(
        'Create the draft, choose a starting point, then review every stage before publishing.'
      )
    ).not.toBeInTheDocument();

    await user.hover(screen.getByRole('button', { name: 'About creating a workflow' }));
    expect(
      await screen.findByRole('tooltip', {
        name: 'Create the draft, choose a starting point, then review every stage before publishing.',
      })
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Create draft' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Grade 1 Admission',
      code: 'GRADE_1_ADMISSION',
      starterJourney: 'standard',
    });
  });

  it('allows staff to start with an assessment-based predefined journey', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const store = configureStore({ reducer: { confirmPopup } });
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionWorkflowDialog
            open
            saving={false}
            showStarterJourney
            autoGenerateCode
            onClose={vi.fn()}
            onSave={onSave}
          />
        </ThemeProvider>
      </Provider>
    );

    await user.type(screen.getByRole('textbox', { name: 'Workflow name *' }), 'Entrance Intake');
    await user.click(screen.getByRole('radio', { name: /Assessment-based admission/ }));
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Entrance Intake',
      code: 'ENTRANCE_INTAKE',
      starterJourney: 'assessment',
    });
  });

  it('allows staff to start with a blank workflow', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const store = configureStore({ reducer: { confirmPopup } });
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionWorkflowDialog
            open
            saving={false}
            showStarterJourney
            autoGenerateCode
            onClose={vi.fn()}
            onSave={onSave}
          />
        </ThemeProvider>
      </Provider>
    );

    await user.type(screen.getByRole('textbox', { name: 'Workflow name *' }), 'Custom Admission');
    await user.click(screen.getByRole('radio', { name: /Blank workflow/ }));
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Custom Admission',
      code: 'CUSTOM_ADMISSION',
      starterJourney: 'empty',
    });
  });
});
