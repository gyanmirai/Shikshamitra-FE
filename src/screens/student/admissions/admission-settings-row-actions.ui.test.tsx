import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { FormRowActions } from './form-list/form-row-actions';
import { WorkflowRowActions } from './workflow-list/workflow-row-actions';
import { AdmissionOfferingRowActions } from './admission-offering-row-actions';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-popover', async () => {
  const React = await import('react');
  return {
    usePopover: () => {
      const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
      return {
        anchorEl,
        open: Boolean(anchorEl),
        onOpen: (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
        onClose: () => setAnchorEl(null),
      };
    },
    CustomPopover: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div role="menu">{children}</div> : null,
  };
});

describe('Admissions settings row actions', () => {
  it('keeps offering view, edit, and delete direct while secondary actions use overflow', async () => {
    const user = userEvent.setup();
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onToggleActive: vi.fn(),
      onDelete: vi.fn(),
    };
    const row = {
      id: 'offering-1',
      code: 'ADM-G6',
      isActive: true,
      canDelete: true,
      canEditIdentity: true,
    } as AdmissionOfferingListItem;

    render(
      <AdmissionOfferingRowActions
        row={row}
        canEdit
        canClone
        canActivate
        canDeactivate
        canDelete
        {...handlers}
      />
    );

    await user.click(screen.getByRole('button', { name: 'View ADM-G6' }));
    await user.click(screen.getByRole('button', { name: 'Edit ADM-G6' }));
    await user.click(screen.getByRole('button', { name: 'Delete ADM-G6' }));
    expect(handlers.onView).toHaveBeenCalledWith(row);
    expect(handlers.onEdit).toHaveBeenCalledWith(row);
    expect(handlers.onDelete).toHaveBeenCalledWith(row);

    await user.click(screen.getByRole('button', { name: 'Actions for ADM-G6' }));
    expect(screen.getByRole('menuitem', { name: 'Clone' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toBeVisible();
  });

  it('opens offering setup instead of sending an invalid activation command', async () => {
    const user = userEvent.setup();
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onToggleActive: vi.fn(),
      onDelete: vi.fn(),
    };
    const row = {
      id: 'offering-incomplete',
      code: 'ADM-G7',
      isActive: false,
      canActivate: false,
      configurationStatus: 0,
      canDelete: true,
      canEditIdentity: true,
    } as AdmissionOfferingListItem;

    render(
      <AdmissionOfferingRowActions
        row={row}
        canEdit
        canClone={false}
        canActivate
        canDeactivate
        canDelete
        {...handlers}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions for ADM-G7' }));
    expect(screen.queryByRole('menuitem', { name: 'Activate' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Complete setup to activate' }));

    expect(handlers.onEdit).toHaveBeenCalledWith(row);
    expect(handlers.onToggleActive).not.toHaveBeenCalled();
  });

  it('allows activation when the configuration status is ready', async () => {
    const user = userEvent.setup();
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onToggleActive: vi.fn(),
      onDelete: vi.fn(),
    };
    const row = {
      id: 'offering-ready',
      code: 'ADM-G8',
      isActive: false,
      canActivate: false,
      configurationStatus: 1,
      canDelete: true,
      canEditIdentity: true,
    } as AdmissionOfferingListItem;

    render(
      <AdmissionOfferingRowActions
        row={row}
        canEdit
        canClone={false}
        canActivate
        canDeactivate
        canDelete
        {...handlers}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions for ADM-G8' }));
    await user.click(screen.getByRole('menuitem', { name: 'Activate' }));

    expect(handlers.onToggleActive).toHaveBeenCalledWith(row);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it('keeps form edit and delete out of the overflow menu', async () => {
    const user = userEvent.setup();
    const handlers = {
      onPreview: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onValidate: vi.fn(),
      onRequestApproval: vi.fn(),
      onApprove: vi.fn(),
      onReject: vi.fn(),
      onPublish: vi.fn(),
      onHistory: vi.fn(),
      onCreateVersion: vi.fn(),
      onArchive: vi.fn(),
      onDelete: vi.fn(),
    };
    const form = {
      id: 'form-1',
      name: 'Fresh admission',
      status: 0,
      approvalStatus: 0,
    } as AdmissionForm;

    render(
      <FormRowActions
        form={form}
        canManage
        canPublish
        canDelete
        canOverrideMakerChecker={false}
        {...handlers}
      />
    );

    expect(screen.getByRole('button', { name: 'Preview Fresh admission' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Edit Fresh admission' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete Fresh admission' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'More actions for Fresh admission' }));
    expect(screen.getByRole('menuitem', { name: 'Clone as draft' })).toBeVisible();
    expect(screen.queryByRole('menuitem', { name: 'Edit draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete draft' })).not.toBeInTheDocument();
  });

  it('offers distinct workflow preview and edit actions for a draft', () => {
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onCreateVersion: vi.fn(),
      onUsage: vi.fn(),
      onArchive: vi.fn(),
      onDelete: vi.fn(),
    };
    const workflow = {
      id: 'workflow-1',
      name: 'Fresh admission journey',
      status: 0,
    } as AdmissionWorkflow;

    render(
      <WorkflowRowActions
        workflow={workflow}
        canEdit
        canDelete
        canClone
        canCreateVersion
        canArchive
        canViewUsage
        {...handlers}
      />
    );

    expect(screen.getByRole('button', { name: 'Preview Fresh admission journey' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Edit Fresh admission journey' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete Fresh admission journey' })).toBeEnabled();
  });
});
