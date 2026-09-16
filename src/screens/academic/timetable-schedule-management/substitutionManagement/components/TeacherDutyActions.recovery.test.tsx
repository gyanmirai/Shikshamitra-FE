import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { substitutionManagementApi } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { renderDutyActions } from './duty-action-test-fixture';
import {
  deferred,
  boardUrl,
  dutiesUrl,
  acceptUrl,
  dutyQuery,
  waitingDuty,
  pagedDuties,
  acceptedDuty,
  prepareDutyNetwork,
} from './duty-action-test-data';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareDutyNetwork);

describe('My Duties mutation recovery and cache consistency', () => {
  it('replaces stale waiting rows in both caches before slow refresh and retains success if refresh fails', async () => {
    const gate = deferred();
    let refreshRequests = 0;
    const counts = new Map<string, number>();
    mswServer.use(
      ...[boardUrl, dutiesUrl].map((url) =>
        http.get(url, async () => {
          const count = (counts.get(url) ?? 0) + 1;
          counts.set(url, count);
          if (count === 1) return HttpResponse.json(pagedDuties());
          refreshRequests += 1;
          await gate.promise;
          return HttpResponse.json({ detail: 'Refresh temporarily unavailable' }, { status: 503 });
        })
      ),
      http.post(acceptUrl, () => HttpResponse.json(acceptedDuty))
    );
    const { store } = renderDutyActions();
    const row = within(await screen.findByRole('region', { name: 'duty-one' }));
    await waitFor(() => expect(counts.get(boardUrl)).toBe(1));
    fireEvent.click(row.getByRole('button', { name: 'Accept' }));
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Accept Duty' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(refreshRequests).toBe(2));
    expect(row.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    const { getSubstitutions, getMySubstitutionDuties } = substitutionManagementApi.endpoints;
    [getSubstitutions, getMySubstitutionDuties].forEach((endpoint) => {
      expect(endpoint.select(dutyQuery)(store.getState()).data?.items[0]).toEqual(acceptedDuty);
    });
    gate.resolve();
    await waitFor(() =>
      expect(getMySubstitutionDuties.select(dutyQuery)(store.getState()).isError).toBe(true)
    );
    expect(row.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
  });

  it('unlocks after failure, preserves the note, and allows a single successful retry', async () => {
    const requests: unknown[] = [];
    mswServer.use(
      http.post(acceptUrl, async ({ request }) => {
        requests.push(await request.json());
        return requests.length === 1
          ? HttpResponse.json({ detail: 'Unable to confirm now' }, { status: 503 })
          : HttpResponse.json(acceptedDuty);
      })
    );
    const { getController } = renderDutyActions();
    const row = within(await screen.findByRole('region', { name: 'duty-one' }));
    fireEvent.click(row.getByRole('button', { name: 'Accept' }));
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.change(dialog.getByRole('textbox'), {
      target: { value: ' I can cover this lesson ' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Accept Duty' }));
    await waitFor(() => expect(requests).toHaveLength(1));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Accept Duty' })).toBeEnabled());
    expect(dialog.getByRole('textbox')).toHaveValue(' I can cover this lesson ');
    expect(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(getController().pendingAction).toBeNull();
    fireEvent.click(dialog.getByRole('button', { name: 'Accept Duty' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requests).toEqual([
      { reason: 'I can cover this lesson' },
      { reason: 'I can cover this lesson' },
    ]);
  });

  it.each([
    ['reject', 'Reject', 'Reject Duty', 'reject-duty', 4],
    ['change', 'Change', 'Request Change', 'request-change', 5],
  ] as const)(
    'validates a reason and guards keyboard submission for %s',
    async (action, rowLabel, submitLabel, path, acknowledgementStatus) => {
      const requests: unknown[] = [];
      mswServer.use(
        http.post(`${boardUrl}/duty-one/${path}`, async ({ request }) => {
          requests.push(await request.json());
          return HttpResponse.json({ ...waitingDuty, acknowledgementStatus });
        })
      );
      const { getController } = renderDutyActions();
      fireEvent.click(
        within(await screen.findByRole('region', { name: 'duty-one' })).getByRole('button', {
          name: rowLabel,
        })
      );
      const dialog = within(await screen.findByRole('dialog'));
      expect(dialog.getByRole('button', { name: submitLabel })).toBeDisabled();
      fireEvent.change(dialog.getByRole('textbox'), { target: { value: 'ab' } });
      await act(async () => {
        await getController().submit();
      });
      expect(requests).toHaveLength(0);
      fireEvent.change(dialog.getByRole('textbox'), { target: { value: ' Need cover ' } });
      fireEvent.keyDown(dialog.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(requests).toEqual([{ reason: 'Need cover' }]);
    }
  );
});
