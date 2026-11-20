import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';

import { renewalPreview, maintenanceTarget } from './loan-maintenance-data.fixture';
import {
  base,
  enterSchoolDate,
  mountMaintenance,
  serveMaintenance,
  fillManualRenewal,
} from './loan-maintenance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('ignores a delayed preview for earlier dates after a newer preview is reviewed', async () => {
  serveMaintenance();
  let release!: () => void;
  const older = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previews: string[] = [];
  const commands: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/renewal-preview`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      previews.push(body.requestedDueDate as string);
      if (body.requestedDueDate === '2026-12-05') await older;
      return HttpResponse.json({
        ...renewalPreview(body),
        revision: `plan-${body.requestedDueDate}`,
      });
    }),
    http.post(`${base}/${maintenanceTarget.loanId}/renew`, async ({ request }) => {
      commands.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ detail: 'Retain this checked draft.' }, { status: 400 });
    })
  );
  await mountMaintenance('renew');
  await fillManualRenewal();
  await waitFor(() => expect(previews).toContain('2026-12-05'));
  enterSchoolDate('New due date', '2026-12-06');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Renew' })).toBeEnabled());
  await act(async () => {
    release();
    await older;
  });
  expect(screen.getByLabelText('New due date')).toHaveValue('2026-12-06');
  await userEvent.click(screen.getByRole('button', { name: 'Renew' }));
  await screen.findByText('Retain this checked draft.');
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    requestedDueDate: '2026-12-06',
    revision: 'plan-2026-12-06',
  });
});
