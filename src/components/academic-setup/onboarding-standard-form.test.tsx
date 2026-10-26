import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { OnboardingStandardForm } from './onboarding-standard-form';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createAcademicOrderStore>;

beforeEach(() => {
  store = createAcademicOrderStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () =>
      HttpResponse.json({
        board: 0,
        medium: 0,
        stage: 0,
        standard: 0,
        division: 0,
      })
    )
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('onboarding standard creation', () => {
  it('renders the two required fields and submits raw Default text without a shift mapping', async () => {
    let submitted: unknown;
    mswServer.use(
      http.post('*/api/app/standard', async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ id: 'new-standard' });
      })
    );
    const close = vi.fn();
    renderAcademicOrder(
      <OnboardingStandardForm handleClose={close} organizationId="stage-1" />,
      store
    );
    expect(screen.queryByLabelText(/shift/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Class Name/), { target: { value: 'lkg' } });
    fireEvent.change(screen.getByLabelText(/Limit Of Age/), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(submitted).toEqual({ name: 'lkg', ageLowerLimit: 4, educationMediumStageId: 'stage-1' });
  });

  it('keeps invalid forms open without submitting', async () => {
    let requests = 0;
    mswServer.use(
      http.post('*/api/app/standard', () => {
        requests += 1;
        return HttpResponse.json({ id: 'unexpected' });
      })
    );
    const close = vi.fn();
    renderAcademicOrder(
      <OnboardingStandardForm handleClose={close} organizationId="stage-1" />,
      store
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Class is required')).toBeVisible();
    expect(requests).toBe(0);
    expect(close).not.toHaveBeenCalled();
  });
});
