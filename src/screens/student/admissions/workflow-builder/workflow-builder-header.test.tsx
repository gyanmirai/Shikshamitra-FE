import type { ReactNode } from 'react';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import {
  WorkflowBuilderHeader,
  WorkflowLifecycleActions,
} from './components/workflow-builder-header';

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
const actions = {
  dirty: true,
  readOnly: false,
  canPublish: true,
  canSubmit: false,
  canApprove: false,
  canReject: false,
  canRollback: false,
  saving: false,
  validating: false,
  publishing: false,
  onSave: vi.fn(),
  onPublish: vi.fn(),
  onSubmit: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onRollback: vi.fn(),
};
const store = configureStore({ reducer: { confirmPopup } });
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    </Provider>
  );
}

describe('WorkflowBuilderHeader', () => {
  it('keeps breadcrumbs, progress and journey without the removed tabs and tools', () => {
    const onBack = vi.fn();
    render(
      <WorkflowBuilderHeader
        workflow={workflow}
        afterBreadcrumb={<div>Setup progress</div>}
        onBack={onBack}
      >
        <div>Journey content</div>
      </WorkflowBuilderHeader>,
      { wrapper: Wrapper }
    );
    const workspace = screen.getByRole('region', { name: 'Workflow journey workspace' });
    expect(workspace).toHaveClass('MuiCard-root');
    expect(workspace).toContainElement(screen.getByText('Setup progress'));
    expect(workspace).toContainElement(screen.getByText('Journey content'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Workflow version controls' })
    ).not.toBeInTheDocument();
    ['Template', 'Preview', 'Validate', 'More workflow actions', 'Save draft', 'Publish'].forEach(
      (name) => {
        expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
      }
    );
    expect(within(screen.getByRole('navigation')).getByText('Admission Stage')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('explains why an editable draft is locked by permissions', () => {
    render(
      <WorkflowBuilderHeader workflow={workflow} readOnlyReason="permission" onBack={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(
      screen.getByText(/Workflow Add permission is required to add stages/i)
    ).toBeInTheDocument();
  });
});

describe('WorkflowLifecycleActions', () => {
  it('preserves save and publish callbacks and locks duplicate actions while busy', () => {
    const onSave = vi.fn();
    const onPublish = vi.fn();
    const { rerender } = render(
      <WorkflowLifecycleActions {...actions} onSave={onSave} onPublish={onPublish} />,
      { wrapper: Wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onPublish).toHaveBeenCalledOnce();
    rerender(<WorkflowLifecycleActions {...actions} validating />);
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Publish/ })).toBeDisabled();
  });

  it('keeps save disabled for a clean draft and hides unauthorized actions', () => {
    const { rerender } = render(
      <WorkflowLifecycleActions {...actions} dirty={false} canPublish={false} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    rerender(<WorkflowLifecycleActions {...actions} readOnly canPublish={false} />);
    expect(
      screen.queryByRole('group', { name: 'Workflow lifecycle actions' })
    ).not.toBeInTheDocument();
  });

  it('retains approval actions for a submitted read-only workflow', () => {
    render(
      <WorkflowLifecycleActions {...actions} readOnly canPublish={false} canApprove canReject />,
      { wrapper: Wrapper }
    );
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Request changes' })).toBeEnabled();
  });
});
