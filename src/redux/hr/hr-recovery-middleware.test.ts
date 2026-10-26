import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { HR_RECOVERY_EVENT } from 'src/screens/hr/recovery/hr-recovery-events';

import { hrRecoveryMiddleware } from './hr-recovery-middleware';

describe('HR mutation recovery observer', () => {
  const auth = { user: { sub: 'synthetic-user', tenantid: 'synthetic-tenant' } };
  const state = { auth };
  let receive = vi.fn((_event: Event) => {});
  let dispatch: (action: any) => unknown;
  const action = (phase: string, requestId = 'one', extra = {}) => ({
    type: `api/executeMutation/${phase}`,
    meta: { requestId, arg: { endpointName: 'saveSynthetic', type: 'mutation' }, ...extra },
    payload:
      phase === 'rejected'
        ? { status: 400, data: { errors: { Amount: ['Enter an amount.'] } } }
        : undefined,
  });
  beforeEach(() => {
    window.history.replaceState(null, '', '/hr/employee');
    state.auth = auth;
    receive = vi.fn((_event: Event) => {});
    window.addEventListener(HR_RECOVERY_EVENT, receive);
    dispatch = hrRecoveryMiddleware({ getState: () => state } as any)((value) => value);
  });
  afterEach(() => window.removeEventListener(HR_RECOVERY_EVENT, receive));

  it('publishes a normalized failure, followed by success cleanup; never request arguments', () => {
    dispatch(action('pending'));
    dispatch(action('rejected'));
    expect(receive).toHaveBeenCalledTimes(1);
    expect((receive.mock.calls[0][0] as CustomEvent).detail.failure.fields[0]).toEqual({
      name: 'Amount',
      message: 'Enter an amount.',
    });
    expect((receive.mock.calls[0][0] as CustomEvent).detail).not.toHaveProperty('payload');
    dispatch(action('pending', 'two'));
    dispatch(action('fulfilled', 'two'));
    expect((receive.mock.calls[1][0] as CustomEvent).detail.failure).toBeUndefined();
  });
  it('ignores stale outcomes after route, tenant or user changes', () => {
    dispatch(action('pending'));
    window.history.replaceState(null, '', '/hr/payroll');
    dispatch(action('rejected'));
    dispatch(action('pending', 'two'));
    state.auth = { user: { sub: 'other-user', tenantid: 'other-tenant' } };
    dispatch(action('rejected', 'two'));
    expect(receive).not.toHaveBeenCalled();
  });
  it('ignores aborted requests and background query failures', () => {
    dispatch(action('pending'));
    dispatch(action('rejected', 'one', { aborted: true }));
    dispatch({ ...action('rejected'), type: 'api/executeQuery/rejected' });
    expect(receive).not.toHaveBeenCalled();
  });
  it('only presents the latest overlapping submission result', () => {
    dispatch(action('pending'));
    dispatch(action('pending', 'two'));
    dispatch(action('rejected'));
    dispatch(action('fulfilled', 'two'));
    expect(receive).toHaveBeenCalledTimes(1);
    expect((receive.mock.calls[0][0] as CustomEvent).detail.failure).toBeUndefined();
  });
  it('does not activate outside HR or without an isolated actor/tenant', () => {
    window.history.replaceState(null, '', '/students');
    dispatch(action('pending'));
    dispatch(action('rejected'));
    expect(receive).not.toHaveBeenCalled();
  });
});
