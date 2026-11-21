import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { nextWaiverContext } from 'src/redux/library/charges-management/finance-next-actions.fixture';

import { source, financeRoot, cashierScenario } from './AssignChargeProcessForm.finance.fixture';

export const waiverPermissions = {
  apply: 'Finance.Fees.FeeCollections.ApplyWaiver',
  approve: 'Finance.Fees.FeeCollections.ApproveWaiver',
  reject: 'Finance.Fees.FeeCollections.RejectWaiver',
  reverse: 'Finance.Fees.FeeCollections.ReverseWaiver',
};

const reads = [
  'waiver-apply-context',
  'waiver-approval-context',
  'waiver-rejection-context',
  'waiver-reversal-context',
];
const writes = ['waivers', 'waivers/approve', 'waivers/reject', 'waivers/reverse'];

export function waiverScenario(action: 0 | 1 | 2 | 3, makerBlocked = false) {
  const common = cashierScenario('collect');
  const queries: Record<string, string>[] = [];
  const bodies: Record<string, unknown>[] = [];
  let changed = false;
  const raw = nextWaiverContext(action);
  const initial = {
    ...raw,
    source,
    receivable: { ...raw.receivable, source },
    canExecute: !makerBlocked && raw.canExecute,
    requests: {
      ...raw.requests,
      items: raw.requests.items.map((row) => ({
        ...row,
        canAct: !makerBlocked && row.canAct,
        issues: makerBlocked
          ? ['A different authorized person must perform the independent review.']
          : row.issues,
      })),
    },
  };
  mswServer.use(
    http.get(`${financeRoot}/operator/${reads[action]}`, ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      if (changed && (action === 1 || action === 2))
        return HttpResponse.json({
          ...initial,
          revision: 'f'.repeat(64),
          canExecute: false,
          requests: { totalCount: 0, items: [] },
        });
      return HttpResponse.json(initial);
    }),
    http.post(`${financeRoot}/${writes[action]}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      bodies.push(body);
      if (makerBlocked)
        return HttpResponse.json({ detail: 'Independent approval is required.' }, { status: 403 });
      changed = true;
      const netWaived = action === 0 || action === 2 ? 0 : action === 1 ? 10.1 : 4;
      return HttpResponse.json({
        requestId: initial.requests.items[0]?.requestId || 'd943dfed-e309-4935-a795-34fe135f312a',
        applicationId:
          action === 0 || action === 2
            ? null
            : initial.requests.items[0]?.applicationId || '7546dbb2-5d5e-435c-b954-b68daffb6503',
        state: action === 0 ? 0 : action === 2 ? 2 : 1,
        requestedAmount: 10.1,
        appliedAmount: action === 0 || action === 2 ? 0 : 10.1,
        reversedAmount: action === 3 ? 6.1 : 0,
        receivable: {
          ...initial.receivable,
          waivedAmount: netWaived,
          financialOutstandingAmount: action === 1 ? 50.4 : action === 3 ? 56.5 : 60.5,
          outstandingAmount: action === 1 ? 50.4 : action === 3 ? 56.5 : 60.5,
        },
      });
    })
  );
  return { common, initial, queries, bodies };
}
