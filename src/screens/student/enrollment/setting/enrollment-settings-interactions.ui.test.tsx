import type { AnchorHTMLAttributes } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EnrollmentSettingsTaskNav } from './enrollment-settings-page';
import { EnrollmentSettingsEditorDrawer } from './enrollment-settings-editor-drawer';

const mocks = vi.hoisted(() => ({
  updateState: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/student/enrollment/settings/pipeline',
}));

vi.mock('src/routes/components', async () => {
  const { forwardRef } = await import('react');

  return {
    RouterLink: forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
      ({ children, ...props }, ref) => (
        <a ref={ref} {...props}>
          {children}
        </a>
      )
    ),
  };
});

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('../admissions-crm/enrollment-workspace-context', () => ({
  useEnrollmentWorkspace: () => ({
    state: { cycle: 'cycle-1', page: 4 },
    updateState: mocks.updateState,
  }),
}));

describe('Enrollment settings interactions', () => {
  it('makes peer tasks linkable and updates URL-backed state for a primary click', () => {
    render(
      <EnrollmentSettingsTaskNav
        label="Pipeline settings tasks"
        value="sources"
        options={[
          { value: 'sources', label: 'Inquiry Sources' },
          { value: 'routing', label: 'Ownership' },
        ]}
      />
    );

    const activeLink = screen.getByRole('link', { name: 'Inquiry Sources' });
    const ownershipLink = screen.getByRole('link', { name: 'Ownership' });

    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(ownershipLink).toHaveAttribute(
      'href',
      '/student/enrollment/settings/pipeline?cycle=cycle-1&panel=routing'
    );

    fireEvent.click(ownershipLink);

    expect(mocks.updateState).toHaveBeenCalledWith({ settingsPanel: 'routing', page: 1 }, 'push');
  });

  it('provides a full-height guided editor with step and close controls', () => {
    const onClose = vi.fn();
    const onStepChange = vi.fn();

    render(
      <EnrollmentSettingsEditorDrawer
        open
        title="Add entrance exam policy"
        description="Configure the policy in a guided sequence."
        steps={[
          { value: 0, label: 'Applicability' },
          { value: 1, label: 'Assessment Process' },
          { value: 2, label: 'Scheduling & Assignment' },
        ]}
        activeStep={0}
        onStepChange={onStepChange}
        onClose={onClose}
        actions={<button type="button">Continue</button>}
      >
        <p>Drawer content</p>
      </EnrollmentSettingsEditorDrawer>
    );

    expect(screen.getByRole('heading', { name: 'Add entrance exam policy' })).toBeVisible();
    expect(screen.getByText('Drawer content')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Applicability' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByRole('button', { name: 'Scheduling & Assignment' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Assessment Process' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close Add entrance exam policy' }));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
