import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderAcademicPermission as renderDialog } from './academic-permission.test.support';

const renderAcademicPermission = () => ({ ...renderDialog(), user: userEvent.setup() });

describe('academic permission states', () => {
  it('explains when no academic years are available', async () => {
    mswServer.use(http.get('*/api/app/academic-year', () => HttpResponse.json({ items: [] })));
    renderAcademicPermission();
    expect(await screen.findByText(/No academic years are available/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('keeps the selector visible while access controls load', async () => {
    mswServer.use(
      http.get('*/api/app/user-scope/user-scope-hierarchy', async () => {
        await delay(200);
        return HttpResponse.json({ accessibleHierarchy: [] });
      })
    );
    renderAcademicPermission();
    expect(
      await screen.findByRole('progressbar', { name: 'Loading academic access controls' })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Academic year' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await screen.findByRole('checkbox', { name: 'Access to CBSE' });
  });

  it('blocks saving after a hierarchy failure and recovers with retry', async () => {
    mswServer.use(
      http.get('*/api/app/user-scope/user-scope-hierarchy', () =>
        HttpResponse.json({}, { status: 503 })
      )
    );
    const { user } = renderAcademicPermission();
    expect(
      await screen.findByText(/Academic access controls could not be loaded/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    mswServer.use(
      http.get('*/api/app/user-scope/user-scope-hierarchy', () =>
        HttpResponse.json({ accessibleHierarchy: [] })
      )
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('checkbox', { name: 'Access to CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('locks year, close, cancel and checkboxes while saving and retains changes after failure', async () => {
    mswServer.use(
      http.post('*/api/app/user-scope/bulk-assign', async () => {
        await delay(250);
        return HttpResponse.json({}, { status: 503 });
      })
    );
    const { user, onClose } = renderAcademicPermission();
    await user.click(await screen.findByRole('checkbox', { name: 'Access to CBSE' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled());
    expect(screen.getByRole('combobox', { name: 'Academic year' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Access to CBSE' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Access to CBSE' })).toBeChecked();
  });

  it('requires confirmation before cancelling unsaved access changes', async () => {
    const { user, onClose } = renderAcademicPermission();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(await screen.findByRole('checkbox', { name: 'Access to CBSE' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
