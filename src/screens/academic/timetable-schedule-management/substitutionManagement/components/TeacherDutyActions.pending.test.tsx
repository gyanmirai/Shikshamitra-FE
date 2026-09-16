import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { renderDutyActions } from './duty-action-test-fixture';
import { deferred, acceptUrl, acceptedDuty, prepareDutyNetwork } from './duty-action-test-data';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareDutyNetwork);

describe('My Duties pending accept interaction', () => {
  it('locks and spins only the selected row, blocks repeated clicks and keyboard submission', async () => {
    const gate = deferred();
    const requests: unknown[] = [];
    mswServer.use(
      http.post(acceptUrl, async ({ request }) => {
        requests.push(await request.json());
        await gate.promise;
        return HttpResponse.json(acceptedDuty);
      })
    );
    const { getController } = renderDutyActions();
    const selectedRow = within(await screen.findByRole('region', { name: 'duty-one' }));
    const otherRow = within(screen.getByRole('region', { name: 'duty-two' }));
    fireEvent.click(selectedRow.getByRole('button', { name: 'Accept' }));
    const dialog = within(await screen.findByRole('dialog'));
    expect(requests).toHaveLength(0);
    fireEvent.click(dialog.getByRole('button', { name: 'Accept Duty' }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(selectedRow.getByRole('button', { name: 'Accept', hidden: true })).toBeDisabled();
    expect(selectedRow.getByRole('button', { name: 'Change', hidden: true })).toBeDisabled();
    expect(selectedRow.getByRole('button', { name: 'Reject', hidden: true })).toBeDisabled();
    expect(selectedRow.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    expect(otherRow.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
    expect(dialog.getByRole('button', { name: 'Accept Duty' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(dialog.getByRole('textbox')).toBeDisabled();
    fireEvent.click(dialog.getByRole('button', { name: 'Accept Duty' }));
    fireEvent.keyDown(dialog.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
    act(() => {
      getController().close();
      getController().open('duty-two', 'reject');
    });
    expect(getController().payload).toEqual({ id: 'duty-one', action: 'accept' });
    expect(requests).toEqual([{}]);
    gate.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('guards two submissions in the same React turn before disabled state can render', async () => {
    const gate = deferred();
    let requests = 0;
    mswServer.use(
      http.post(acceptUrl, async () => {
        requests += 1;
        await gate.promise;
        return HttpResponse.json(acceptedDuty);
      })
    );
    const { getController } = renderDutyActions();
    fireEvent.click(
      within(await screen.findByRole('region', { name: 'duty-one' })).getByRole('button', {
        name: 'Accept',
      })
    );
    act(() => {
      getController().submit();
      getController().submit();
    });
    await waitFor(() => expect(requests).toBe(1));
    gate.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requests).toBe(1);
  });

  it('cancels an unsubmitted confirmation without calling the API', async () => {
    const submit = vi.fn(() => HttpResponse.json(acceptedDuty));
    mswServer.use(http.post(acceptUrl, submit));
    renderDutyActions();
    const row = within(await screen.findByRole('region', { name: 'duty-one' }));
    fireEvent.click(row.getByRole('button', { name: 'Accept' }));
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(submit).not.toHaveBeenCalled();
    expect(row.getByRole('button', { name: 'Accept' })).toBeEnabled();
  });

  it.each([false, true])(
    'blocks duplicate My Duties actions during a board acknowledgement (dialog open: %s)',
    async (dialogOpen) => {
      const gate = deferred();
      let requests = 0;
      mswServer.use(
        http.post(acceptUrl, async () => {
          requests += 1;
          await gate.promise;
          return HttpResponse.json(acceptedDuty);
        })
      );
      const { getController, getBoardAction } = renderDutyActions();
      const row = within(await screen.findByRole('region', { name: 'duty-one' }));
      if (dialogOpen) fireEvent.click(row.getByRole('button', { name: 'Accept' }));
      act(() => {
        getBoardAction()({ id: 'duty-one' });
      });
      await waitFor(() => expect(requests).toBe(1));
      expect(row.getByRole('button', { name: 'Accept', hidden: true })).toBeDisabled();
      expect(row.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
      await act(async () => {
        getController().open('duty-one', 'accept');
        await getController().submit();
        getController().close();
      });
      if (dialogOpen) {
        const dialog = within(screen.getByRole('dialog'));
        expect(dialog.getByRole('button', { name: 'Accept Duty' })).toBeDisabled();
        fireEvent.keyDown(dialog.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
      } else {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
      expect(requests).toBe(1);
      gate.resolve();
      await waitFor(() => expect(getController().isSubmitting).toBe(false));
      expect(requests).toBe(1);
    }
  );
});
