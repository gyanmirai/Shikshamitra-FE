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
  it('keeps offering edit, delete and clone direct while deactivation uses overflow', async () => {
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

    expect(screen.queryByRole('button', { name: 'View ADM-G6' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handlers.onView).not.toHaveBeenCalled();
    expect(handlers.onEdit).toHaveBeenCalledWith(row);
    expect(handlers.onDelete).toHaveBeenCalledWith(row);
    await user.click(screen.getByRole('button', { name: 'Clone' }));
    expect(handlers.onClone).toHaveBeenCalledWith(row);

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.queryByRole('menuitem', { name: 'Clone' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    expect(handlers.onToggleActive).toHaveBeenCalledWith(row);
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

    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Complete setup.*activate/ }));

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

    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Activate' }));

    expect(handlers.onToggleActive).toHaveBeenCalledWith(row);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it('keeps draft edit, publish and delete direct with secondary actions in overflow', async () => {
    const user = userEvent.setup();
    const handlers = {
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onValidate: vi.fn(),
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
    } as AdmissionForm;

    render(<FormRowActions form={form} canManage canPublish canDelete {...handlers} />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handlers.onDelete).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Clone as draft' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'History & versions' })).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: /approve|request changes/i })
    ).not.toBeInTheDocument();
  });

  it('keeps workflow draft edit and delete available without a redundant preview icon', () => {
    const handlers = {
      onView: vi.fn(),
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onCreateVersion: vi.fn(),
      onUsage: vi.fn(),
      onArchive: vi.fn(),
      onReopen: vi.fn(),
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
        canReopen
        canViewUsage
        {...handlers}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Preview Fresh admission journey' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Fresh admission journey' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete Fresh admission journey' })).toBeEnabled();
  });

  it.each([0, 3, 1, 2, 4, 5, 6, 7])(
    'workflow Edit follows builder eligibility for status %s',
    async (status) => {
      const onEdit = vi.fn();
      const props = {
        workflow: { id: 'edit-workflow', name: 'Edit eligibility', status } as AdmissionWorkflow,
        canEdit: true,
        canDelete: false,
        canClone: false,
        canCreateVersion: false,
        canArchive: false,
        canViewUsage: false,
        canReopen: false,
        onEdit,
        onReopen: vi.fn(),
        onClone: vi.fn(),
        onCreateVersion: vi.fn(),
        onUsage: vi.fn(),
        onArchive: vi.fn(),
        onDelete: vi.fn(),
      };
      const { rerender } = render(<WorkflowRowActions {...props} />);
      const edit = screen.getByRole('button', { name: 'Edit Edit eligibility' });
      if ([0, 3].includes(status)) {
        expect(edit).toBeEnabled();
        await userEvent.setup().click(edit);
        expect(onEdit).toHaveBeenCalledOnce();
      } else expect(edit).toBeDisabled();
      rerender(<WorkflowRowActions {...props} canEdit={false} />);
      expect(
        screen.queryByRole('button', { name: 'Edit Edit eligibility' })
      ).not.toBeInTheDocument();
    }
  );

  it('offers Re-open only for an archived workflow with publication authority', async () => {
    const onReopen = vi.fn();
    const props = {
      workflow: {
        id: 'archived-workflow',
        name: 'Archived journey',
        status: 2,
      } as AdmissionWorkflow,
      canEdit: false,
      canDelete: false,
      canClone: false,
      canCreateVersion: false,
      canArchive: false,
      canViewUsage: false,
      canReopen: true,
      onReopen,
      onEdit: vi.fn(),
      onClone: vi.fn(),
      onCreateVersion: vi.fn(),
      onUsage: vi.fn(),
      onArchive: vi.fn(),
      onDelete: vi.fn(),
    };
    const { rerender } = render(<WorkflowRowActions {...props} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Re-open' }));
    expect(onReopen).toHaveBeenCalledOnce();
    expect(props.onClone).not.toHaveBeenCalled();
    rerender(<WorkflowRowActions {...props} canReopen={false} />);
    expect(screen.queryByRole('button', { name: 'Re-open' })).not.toBeInTheDocument();
    rerender(<WorkflowRowActions {...props} workflow={{ ...props.workflow, status: 1 }} />);
    expect(screen.queryByRole('button', { name: 'Re-open' })).not.toBeInTheDocument();
  });
});
