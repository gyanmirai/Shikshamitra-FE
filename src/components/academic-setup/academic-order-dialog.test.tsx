import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import { AcademicOrderDialog } from './academic-order-dialog';
import {
  renderAcademicOrder,
  academicOrderItems as items,
  displayedAcademicOrder as order,
  createAcademicOrderStore as createStore,
} from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createStore>;
const renderDialog = (kind: 'stage' | 'class' | 'division' = 'class', onClose = vi.fn()) => {
  renderAcademicOrder(
    <AcademicOrderDialog
      parentId="parent-1"
      parentName="Primary"
      kind={kind}
      items={items}
      onClose={onClose}
    />,
    store
  );
  return onClose;
};

beforeEach(() => {
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('academic order dialog', () => {
  it.each([
    ['stage', '/api/education-mediums/parent-1/stages/order'],
    ['class', '/api/education-medium-stages/parent-1/standards/order'],
    ['division', '/api/standards/parent-1/divisions/order'],
  ] as const)(
    'saves the complete %s order to its parent and closes after success',
    async (kind, path) => {
      let body: unknown;
      mswServer.use(
        http.put(`*${path}`, async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        })
      );
      const onClose = renderDialog(kind);
      expect(order()).toEqual(['1UKG', '2Nursery']);
      expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Move UKG up' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
      expect(order()).toEqual(['1Nursery', '2UKG']);
      fireEvent.click(screen.getByRole('button', { name: 'Save order' }));
      await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), { timeout: 10000 });
      expect(body).toEqual({ ids: ['first', 'later'] });
    }
  );

  it('keeps a changed draft on Cancel until the user discards it', () => {
    const onClose = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(order()).toEqual(['1Nursery', '2UKG']);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(items.map((item) => item.id)).toEqual(['later', 'first']);
  });

  it('retains a failed draft and allows retrying it', async () => {
    let attempts = 0;
    mswServer.use(
      http.put('*/api/education-medium-stages/parent-1/standards/order', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ error: { message: 'Please retry.' } }, { status: 500 })
          : new HttpResponse(null, { status: 204 });
      })
    );
    const onClose = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save order' }));
    expect(await screen.findByRole('alert', {}, { timeout: 10000 })).toHaveTextContent(
      'Could not save the order'
    );
    expect(order()).toEqual(['1Nursery', '2UKG']);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save order' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), { timeout: 10000 });
    expect(attempts).toBe(2);
  });

  it('locks moves, Cancel, Close and Escape while saving', async () => {
    let finish: (() => void) | undefined;
    mswServer.use(
      http.put('*/api/education-medium-stages/parent-1/standards/order', async () => {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        return new HttpResponse(null, { status: 204 });
      })
    );
    const onClose = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save order' }));
    await waitFor(() => expect(finish).toBeDefined(), { timeout: 10000 });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Nursery down' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => {
      finish?.();
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), { timeout: 10000 });
  });
});
