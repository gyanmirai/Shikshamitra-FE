import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

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
  it('keeps workflow actions beside the current version state', () => {
    render(
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
    );

    const controls = screen.getByRole('region', { name: 'Workflow version controls' });
    expect(within(controls).getByText('PRIMARY_ADMISSION · Version 3')).toBeInTheDocument();
    expect(within(controls).getByText('Unsaved changes')).toBeInTheDocument();
    const lifecycleActions = within(controls).getByRole('group', {
      name: 'Workflow lifecycle actions',
    });
    expect(within(lifecycleActions).getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(within(lifecycleActions).getByRole('button', { name: 'Publish' })).toBeEnabled();

    const builderTools = within(controls).getByRole('toolbar', {
      name: 'Workflow builder tools',
    });
    expect(within(builderTools).getByRole('button', { name: 'Preview' })).toBeEnabled();
    expect(within(builderTools).getByRole('button', { name: 'Validate' })).toBeEnabled();
  });

  it('explains why an editable draft is locked by permissions', () => {
    render(
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
    );

    expect(
      screen.getByText(/Workflow Add permission is required to add stages/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
  });
});
