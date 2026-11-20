import type { ReactNode } from 'react';

import React from 'react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { setPermissions } from 'src/redux/auth/authSlice';
import { hasGrantedPermission } from 'src/utils/permissions';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, fireEvent } from '@testing-library/react';

import LibraryChargesManagement from '../index';
import {
  chargeActionRow,
  chargeActionRoot,
  chargeActionYear,
  chargeActionStore,
  renderChargeActions,
  mountChargeActionTable,
  chargeActionPermission as permission,
} from './ChargeActions.permissions.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-test-session-token' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('src/components/form-slider', () => ({
  FormSlider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
// Replace shared table presentation only. Owning columns and real shared
// ThreeDotsActions callbacks, menu/popover and permission decisions stay real.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    columns,
    data,
  }: {
    columns: {
      id: string;
      label: string;
      render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
    }[];
    data: Record<string, unknown>[];
  }) => (
    <table aria-label="Charge action register">
      <tbody>
        {data.map((row) => (
          <tr key={String(row.id)}>
            <td>{String(row.memberName)}</td>
            {columns
              .filter((column) => column.id === 'actions')
              .map((column) => (
                <td key={column.id}>{column.render?.(row[column.id], row)}</td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

beforeEach(clearCachedAuthSession);

async function expectUnavailable(name: RegExp, callback?: unknown) {
  const button = screen.queryByRole('button', { name });
  if (button) {
    expect(button).toBeDisabled();
    fireEvent.click(button);
  }
  if (callback) expect(callback).not.toHaveBeenCalled();
}

it('keeps Add unavailable to a view-only reader and opens the real owning editor after the exact Add grant', async () => {
  const writes: string[] = [];
  mswServer.use(
    http.get(`${chargeActionRoot}/library/charges`, () =>
      HttpResponse.json({
        items: [{ ...chargeActionRow, amount: 100.75, role: 1, paymentStatus: 0 }],
        totalCount: 1,
      })
    ),
    http.get(`${chargeActionRoot}/library/charges/editor/categories`, ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe(chargeActionYear);
      return HttpResponse.json({ items: [], totalCount: 0 });
    }),
    http.get(`${chargeActionRoot}/library/charges/editor/members`, () =>
      HttpResponse.json({ items: [], totalCount: 0 })
    ),
    http.post(`${chargeActionRoot}/library/charges`, () => {
      writes.push('post');
      return HttpResponse.json({});
    }),
    http.put(`${chargeActionRoot}/library/charges/:id`, () => {
      writes.push('put');
      return HttpResponse.json({});
    }),
    http.delete(`${chargeActionRoot}/library/charges/:id`, () => {
      writes.push('delete');
      return new HttpResponse(null, { status: 204 });
    })
  );
  const store = chargeActionStore([permission.view, permission.financeView]);
  renderChargeActions(store, <LibraryChargesManagement />);
  expect(hasGrantedPermission(store.getState().auth.permissions, permission.add)).toBe(false);

  await expectUnavailable(/^Assign charge$/i);
  expect(screen.queryByRole('dialog', { name: /^Assign charges$/i })).not.toBeInTheDocument();
  expect(writes).toEqual([]);

  act(() =>
    store.dispatch(
      setPermissions(
        [permission.view, permission.add, permission.financeView].map((name) => ({
          name,
          isGranted: true,
        }))
      )
    )
  );
  const add = screen.getByRole('button', { name: /^Assign charge$/i });
  expect(add).toBeEnabled();
  await userEvent.click(add);
  expect(await screen.findByRole('dialog', { name: /^Assign charges$/i })).toBeInTheDocument();
  expect(writes).toEqual([]);
});

it('keeps write icons unavailable to a view-only reader while preserving details and permitted Finance review', async () => {
  const { callbacks, store } = mountChargeActionTable([permission.view, permission.financeView]);
  await userEvent.click(screen.getByRole('tab', { name: /^Pending/i }));
  const table = screen.getByRole('table', { name: 'Charge action register' });
  expect(within(table).getByText('Maya José')).toBeInTheDocument();
  expect(hasGrantedPermission(store.getState().auth.permissions, permission.update)).toBe(false);
  expect(hasGrantedPermission(store.getState().auth.permissions, permission.delete)).toBe(false);

  await expectUnavailable(/^Edit$/i, callbacks.onEditCharge);
  await expectUnavailable(/^Delete$/i, callbacks.onDeleteCharge);
  await userEvent.click(within(table).getByRole('button', { name: /^View$/i }));
  expect(callbacks.onViewCharges).toHaveBeenCalledExactlyOnceWith(chargeActionRow);
  await userEvent.click(within(table).getByRole('button', { name: /^More actions$/i }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /^Finance$/i }));
  expect(callbacks.onCollectCharges).toHaveBeenCalledExactlyOnceWith(chargeActionRow);
  expect(callbacks.onEditCharge).not.toHaveBeenCalled();
  expect(callbacks.onDeleteCharge).not.toHaveBeenCalled();
});

it('rechecks paired View and each exact row action when current Redux grants change', async () => {
  const { callbacks, store } = mountChargeActionTable([permission.update, permission.delete]);
  await userEvent.click(screen.getByRole('tab', { name: /^Pending/i }));
  await expectUnavailable(/^Edit$/i, callbacks.onEditCharge);
  await expectUnavailable(/^Delete$/i, callbacks.onDeleteCharge);

  act(() =>
    store.dispatch(
      setPermissions(
        [permission.view, permission.update].map((name) => ({ name, isGranted: true }))
      )
    )
  );
  await userEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
  expect(callbacks.onEditCharge).toHaveBeenCalledExactlyOnceWith(chargeActionRow);
  await expectUnavailable(/^Delete$/i, callbacks.onDeleteCharge);

  act(() =>
    store.dispatch(
      setPermissions(
        [permission.view, permission.delete].map((name) => ({ name, isGranted: true }))
      )
    )
  );
  await expectUnavailable(/^Edit$/i);
  await userEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
  expect(callbacks.onDeleteCharge).toHaveBeenCalledExactlyOnceWith(chargeActionRow);
  expect(callbacks.onEditCharge).toHaveBeenCalledTimes(1);
});
