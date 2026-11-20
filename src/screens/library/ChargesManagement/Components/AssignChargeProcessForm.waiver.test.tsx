import React from 'react';
import userEvent from '@testing-library/user-event';
import { hasGrantedPermission } from 'src/utils/permissions';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { waiverScenario, waiverPermissions } from './AssignChargeProcessForm.waiver.fixture';
import { source, permissions, mountChargeCashier } from './AssignChargeProcessForm.finance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-waiver-operator-auth' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
beforeEach(clearCachedAuthSession);
afterEach(cleanup);

function ownOperator(action: keyof typeof waiverPermissions) {
  const rendered = mountChargeCashier([permissions.source, waiverPermissions[action]]);
  expect(
    hasGrantedPermission(rendered.store.getState().auth.permissions, permissions.collectionView)
  ).toBe(false);
  expect(hasGrantedPermission(rendered.store.getState().auth.permissions, permissions.view)).toBe(
    false
  );
  return rendered;
}
async function confirmIfNeeded(bodies: Record<string, unknown>[], button: RegExp) {
  await waitFor(() => {
    if (!bodies.length) expect(screen.getByRole('button', { name: button })).toBeVisible();
  });
  if (!bodies.length) await userEvent.setup().click(screen.getByRole('button', { name: button }));
}
function sourceCommand(body: Record<string, unknown>, revision: string) {
  expect(body).toMatchObject({ source, revision, idempotencyKey: expect.any(String) });
  expect(body.idempotencyKey).not.toBe('');
  ['memberId', 'studentId', 'paidDate', 'paymentStatus'].forEach((key) =>
    expect(body).not.toHaveProperty(key)
  );
}

it('submits a partial pending waiver with only its actual ApplyWaiver grant and never records cash or a paid Library toggle', async () => {
  const scenario = waiverScenario(0);
  ownOperator('apply');
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Request waiver|Apply waiver/i }));
  await waitFor(() => expect(scenario.queries.length).toBeGreaterThan(0));
  fireEvent.change(await screen.findByRole('textbox', { name: /Waiver amount|Amount to waive/i }), {
    target: { value: '10.10' },
  });
  fireEvent.change(
    await screen.findByRole('textbox', { name: /Waiver reason|Reason for waiver/i }),
    { target: { value: 'Approved school assistance request.' } }
  );
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /^(?:Submit waiver|Request waiver)$/i }));
  await confirmIfNeeded(scenario.bodies, /Confirm waiver|Submit waiver request/i);
  await waitFor(() => expect(scenario.bodies).toHaveLength(1));
  sourceCommand(scenario.bodies[0], scenario.initial.revision);
  expect(scenario.bodies[0]).toMatchObject({
    amount: '10.10',
    reason: 'Approved school assistance request.',
  });
  await screen.findAllByText(/Pending (?:waiver|approval)|Awaiting independent/i);
  expect(scenario.common.collectionBodies).toEqual([]);
  expect(scenario.common.forbidden).toEqual([]);
});

it.each([
  { action: 1 as const, permission: 'approve' as const, verb: 'Approve' },
  { action: 2 as const, permission: 'reject' as const, verb: 'Reject' },
])(
  'performs the own-$verb waiver decision using the actual pending request and fresh revision without collection/settings reads',
  async (spec) => {
    const scenario = waiverScenario(spec.action);
    ownOperator(spec.permission);
    await userEvent.setup().click(
      await screen.findByRole('button', {
        name: /Review waivers|Waivers|Approve waivers|Reject waivers/i,
      })
    );
    await screen.findByText('Requested school assistance.');
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: new RegExp(`^${spec.verb} waiver$`, 'i') }));
    fireEvent.change(
      await screen.findByRole('textbox', { name: /Decision reason|Review reason/i }),
      { target: { value: 'Independently reviewed the recorded school evidence.' } }
    );
    await userEvent.setup().click(
      await screen.findByRole('button', {
        name: new RegExp(`Confirm ${spec.verb}|^${spec.verb}$`, 'i'),
      })
    );
    await waitFor(() => expect(scenario.bodies).toHaveLength(1));
    sourceCommand(scenario.bodies[0], scenario.initial.revision);
    expect(scenario.bodies[0]).toMatchObject({
      waiverRequestId: scenario.initial.requests.items[0].requestId,
      reason: 'Independently reviewed the recorded school evidence.',
    });
    expect(scenario.bodies[0]).not.toHaveProperty('waiverApplicationId');
    expect(scenario.common.collectionBodies).toEqual([]);
    expect(scenario.common.forbidden).toEqual([]);
  }
);

it('keeps a maker pending request visible and follows the server independent-review restriction without sending a waiver decision', async () => {
  const scenario = waiverScenario(1, true);
  ownOperator('approve');
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Review waivers|Waivers|Approve waivers/i }));
  await screen.findByText('Requested school assistance.');
  await screen.findByText(/different authorized person.*independent review/i);
  expect(screen.getByRole('button', { name: /^Approve waiver$/i })).toBeDisabled();
  expect(scenario.bodies).toEqual([]);
  expect(scenario.common.collectionBodies).toEqual([]);
});

it('reverses only the explicitly requested portion of an actual waiver application and retains the original waiver evidence', async () => {
  const scenario = waiverScenario(3);
  ownOperator('reverse');
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Reverse waiver|Waiver reversals/i }));
  await screen.findByText('Requested school assistance.');
  fireEvent.change(
    await screen.findByRole('textbox', { name: /Reversal amount|Amount to reverse/i }),
    { target: { value: '2.05' } }
  );
  fireEvent.change(
    await screen.findByRole('textbox', { name: /Reversal reason|Reason for reversal/i }),
    { target: { value: 'Corrected part of the original assistance award.' } }
  );
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Review reversal|Reverse waiver/i }));
  await confirmIfNeeded(scenario.bodies, /Confirm reversal|Record reversal/i);
  await waitFor(() => expect(scenario.bodies).toHaveLength(1));
  sourceCommand(scenario.bodies[0], scenario.initial.revision);
  expect(scenario.bodies[0]).toMatchObject({
    waiverApplicationId: scenario.initial.requests.items[0].applicationId,
    amount: '2.05',
    reason: 'Corrected part of the original assistance award.',
  });
  expect(scenario.bodies[0]).not.toHaveProperty('waiverRequestId');
  expect(scenario.common.collectionBodies).toEqual([]);
  expect(scenario.common.forbidden).toEqual([]);
});
