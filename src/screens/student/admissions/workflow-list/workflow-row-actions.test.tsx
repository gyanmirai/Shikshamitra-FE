import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';
import type { ReactElement } from 'react';

import { it, vi, expect } from 'vitest';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings';
import { screen, fireEvent, render as renderUI } from '@testing-library/react';

import { WorkflowRowActions } from './workflow-row-actions';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);
const render = (ui: ReactElement) => renderUI(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const workflow = { id: 'one', name: 'Regular admission', status: 0 } as AdmissionWorkflow;
const props = () => ({
  workflow,
  canPublish: true,
  canEdit: true,
  canDelete: true,
  canClone: true,
  canCreateVersion: true,
  canArchive: true,
  canReopen: true,
  canViewUsage: true,
  onPublish: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onClone: vi.fn(),
  onCreateVersion: vi.fn(),
  onUsage: vi.fn(),
  onArchive: vi.fn(),
  onReopen: vi.fn(),
});

it('keeps Publish visible before overflow and does not trigger the row click', () => {
  const actions = props();
  const rowClick = vi.fn();
  render(
    <div role="button" tabIndex={0} onClick={rowClick} onKeyDown={vi.fn()}>
      <WorkflowRowActions {...actions} />
    </div>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Publish Regular admission' }));
  expect(actions.onPublish).toHaveBeenCalledOnce();
  expect(rowClick).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Edit Regular admission' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clone as draft' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Actions for Regular admission' }));
  expect(screen.getByRole('menuitem', { name: 'Delete Regular admission' })).toBeVisible();
});

it.each([0, 3, 5, 6] as const)('shows Publish for eligible status %s', (status) => {
  render(<WorkflowRowActions {...props()} workflow={{ ...workflow, status }} />);
  expect(screen.getByRole('button', { name: 'Publish Regular admission' })).toBeVisible();
});

it.each([1, 2, 4, 7] as const)('does not offer Publish for status %s', (status) => {
  render(<WorkflowRowActions {...props()} workflow={{ ...workflow, status }} />);
  expect(
    screen.queryByRole('button', { name: 'Publish Regular admission' })
  ).not.toBeInTheDocument();
});

it('does not expose Publish without its existing manage permission', () => {
  render(<WorkflowRowActions {...props()} canPublish={false} />);
  expect(
    screen.queryByRole('button', { name: 'Publish Regular admission' })
  ).not.toBeInTheDocument();
});
