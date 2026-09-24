import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { WorkflowBuilderHeader } from './components/workflow-builder-header';

const workflow: AdmissionWorkflow = {
  id: 'workflow-1',
  name: 'Primary admission',
  code: 'PRIMARY_ADMISSION',
  version: 3,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp-1',
  creationTime: '2026-09-16T00:00:00Z',
  stages: [],
  transitions: [],
};

describe('WorkflowBuilderHeader', () => {
  const store = configureStore({ reducer: { confirmPopup } });

  it('keeps workflow navigation and actions compact without version-state chips', () => {
    const onBack = vi.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <WorkflowBuilderHeader
            workflow={workflow}
            dirty
            readOnly={false}
            canValidate
            canPublish
            canSubmit={false}
            canApprove={false}
            canReject={false}
            canRollback={false}
            canViewUsage
            saving={false}
            validating={false}
            publishing={false}
            onBack={onBack}
            canUndo
            canRedo={false}
            onSave={vi.fn()}
            onValidate={vi.fn()}
            onPublish={vi.fn()}
            onSubmit={vi.fn()}
            onApprove={vi.fn()}
            onReject={vi.fn()}
            onRollback={vi.fn()}
            onOpenPanel={vi.fn()}
            onApplyTemplate={vi.fn()}
            onUndo={vi.fn()}
            onRedo={vi.fn()}
          />
        </ThemeProvider>
      </Provider>
    );

    const controls = screen.getByRole('region', { name: 'Workflow version controls' });
    expect(screen.getAllByText('Admission Process')).not.toHaveLength(0);
    expect(within(controls).queryByText('Draft')).not.toBeInTheDocument();
    expect(within(controls).queryByText('Version 3')).not.toBeInTheDocument();
    expect(within(controls).queryByText('Unsaved')).not.toBeInTheDocument();
    const lifecycleActions = screen.getByRole('group', {
      name: 'Workflow lifecycle actions',
    });
    expect(within(lifecycleActions).getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(within(lifecycleActions).getByRole('button', { name: 'Publish' })).toBeEnabled();

    const builderTools = within(controls).getByRole('toolbar', {
      name: 'Workflow builder tools',
    });
    expect(within(builderTools).getByRole('button', { name: 'Preview' })).toBeEnabled();
    expect(within(builderTools).getByText('Validate')).toBeInTheDocument();
    expect(within(builderTools).getByText('Actions', { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Configure' })).toHaveAttribute('href', '#');
    const breadcrumbs = screen.getByRole('navigation');
    expect(within(breadcrumbs).getByText('Admission Process')).toBeInTheDocument();
    expect(within(breadcrumbs).queryByText('Version 3')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('explains why an editable draft is locked by permissions', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <WorkflowBuilderHeader
            workflow={workflow}
            dirty={false}
            readOnly
            readOnlyReason="permission"
            canValidate={false}
            canPublish={false}
            canSubmit={false}
            canApprove={false}
            canReject={false}
            canRollback={false}
            canViewUsage
            saving={false}
            validating={false}
            publishing={false}
            onBack={vi.fn()}
            canUndo={false}
            canRedo={false}
            onSave={vi.fn()}
            onValidate={vi.fn()}
            onPublish={vi.fn()}
            onSubmit={vi.fn()}
            onApprove={vi.fn()}
            onReject={vi.fn()}
            onRollback={vi.fn()}
            onOpenPanel={vi.fn()}
            onApplyTemplate={vi.fn()}
            onUndo={vi.fn()}
            onRedo={vi.fn()}
          />
        </ThemeProvider>
      </Provider>
    );

    expect(
      screen.getByText(/Workflow Add permission is required to add stages/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
  });
});
