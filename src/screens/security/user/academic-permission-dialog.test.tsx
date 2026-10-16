import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import {
  years,
  chooseYear,
  savedPayloads,
  requestedYears,
  renderAcademicPermission as renderDialog,
} from './academic-permission.test.support';

const renderAcademicPermission = (yearId?: string) => ({
  ...renderDialog(yearId),
  user: userEvent.setup(),
});

describe('academic permission year selection', () => {
  it('defaults to the global year and loads that year’s hierarchy', async () => {
    renderAcademicPermission('year-2');
    expect(
      await screen.findByRole('checkbox', { name: 'Access to State Board' })
    ).not.toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Academic year' })).toHaveTextContent('2026-2027');
    expect(screen.getByRole('heading', { name: 'Academic Permission' })).toBeInTheDocument();
    expect(requestedYears).toEqual(['year-2']);
    expect(screen.queryByRole('checkbox', { name: 'Access to CBSE' })).not.toBeInTheDocument();
  });

  it('allows selecting a year when the global year is empty', async () => {
    const { user } = renderAcademicPermission('');
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Academic year' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(requestedYears).toEqual([]);
    await chooseYear(user, years[0].name);
    expect(await screen.findByRole('checkbox', { name: 'Access to CBSE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('loads and saves the locally selected year without changing global context', async () => {
    const { user, store, onClose } = renderAcademicPermission();
    await screen.findByRole('checkbox', { name: 'Access to CBSE' });
    await chooseYear(user, years[1].name);
    await user.click(await screen.findByRole('checkbox', { name: 'Access to State Board' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(savedPayloads).toEqual([
      {
        academicYearId: 'year-2',
        userIds: ['user-1'],
        scopes: [{ educationBoardId: 'board-2' }],
        clearExisting: false,
      },
    ]);
    expect(store.getState().globalState.currentYear).toEqual(years[0]);
  });

  it('protects unsaved changes and clears the previous year’s selection after a confirmed switch', async () => {
    const { user } = renderAcademicPermission();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(await screen.findByRole('checkbox', { name: 'Access to CBSE' }));
    await chooseYear(user, years[1].name);
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('combobox', { name: 'Academic year' })).toHaveTextContent(
      years[0].name
    );
    expect(screen.getByRole('checkbox', { name: 'Access to CBSE' })).toBeChecked();
    confirm.mockReturnValue(true);
    await chooseYear(user, years[1].name);
    expect(
      await screen.findByRole('checkbox', { name: 'Access to State Board' })
    ).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Access to CBSE' })).not.toBeInTheDocument();
  });

  it('shows a recoverable year loading error and keeps saving disabled', async () => {
    mswServer.use(
      http.get('*/api/app/academic-year', () => HttpResponse.json({}, { status: 503 }))
    );
    const { user } = renderAcademicPermission();
    expect(
      await screen.findByText('Academic years could not be loaded. Try again.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    mswServer.use(http.get('*/api/app/academic-year', () => HttpResponse.json({ items: years })));
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('checkbox', { name: 'Access to CBSE' })).toBeInTheDocument();
  });
});
