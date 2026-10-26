import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HRWorkspaceLoading from './hr-workspace-loading';

it('keeps route-loading feedback separate from the owning screen header', () => {
  render(
    <>
      <CustomBreadcrumbs heading="Staff Onboarding" links={[{ name: 'Staff Onboarding' }]} />
      <HRWorkspaceLoading heading="Staff Onboarding" />
    </>
  );
  expect(screen.getAllByRole('navigation')).toHaveLength(1);
  expect(screen.getAllByRole('heading', { name: 'Staff Onboarding' })).toHaveLength(1);
  expect(screen.getByRole('progressbar', { name: 'Loading Staff Onboarding' })).toBeVisible();
  expect(screen.queryByText('HR Workspace')).not.toBeInTheDocument();
});
