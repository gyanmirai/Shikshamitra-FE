import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import useLockedElectiveCorrection from './useLockedElectiveCorrection';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

const context = { academicMediumId: 'medium', classId: 'class', divisionId: 'division', electiveGroupId: 'group' };
const review = { reviewToken: 'reviewed-state', expiresAt: '2099-01-01T00:00:00Z', studentName: 'Student',
  previousSubject: 'Music', selectedSubject: 'Art', previousPreference: 'Music', preferredSubject: 'Music',
  impacts: [{ area: 'Exam marks', recordId: 'mark', severity: 'warning', description: 'Published marks remain on Music.' }] };

describe('locked elective correction review', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });
  afterEach(() => clearCachedAuthSession());

  function setup() {
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
    const onSaved = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
    return { ...renderHook(() => useLockedElectiveCorrection(context, 'student', 'music', onSaved), { wrapper }), onSaved, store };
  }

  it('sends no correction before review and confirms only the reviewed payload', async () => {
    const confirmed: unknown[] = [];
    mswServer.use(
      http.post('*/corrections/preview', () => HttpResponse.json(review)),
      http.post('*/corrections/confirm', async ({ request }) => { confirmed.push(await request.json()); return new HttpResponse(null, { status: 204 }); })
    );
    const fixture = setup();
    await act(() => fixture.result.current.confirmChanges());
    expect(confirmed).toHaveLength(0);
    await act(async () => { await fixture.result.current.form.setFieldValue('selectedSubjectId', 'art'); });
    await act(async () => { await fixture.result.current.form.submitForm(); });
    expect(fixture.result.current.review?.impacts[0].description).toContain('Published marks');
    expect(confirmed).toHaveLength(0);
    await act(() => fixture.result.current.confirmChanges());
    expect(confirmed).toEqual([{ ...context, studentId: 'student', selectedSubjectId: 'art', preferredSubjectId: null, reason: '', reviewToken: 'reviewed-state' }]);
    expect(fixture.onSaved).toHaveBeenCalledOnce();
    fixture.store.dispatch(api.util.resetApiState());
  });

  it('requires another review after a stale confirmation and preserves the draft', async () => {
    mswServer.use(
      http.post('*/corrections/preview', () => HttpResponse.json(review)),
      http.post('*/corrections/confirm', () => HttpResponse.json({ error: { message: 'Affected records changed. Review again.' } }, { status: 409 }))
    );
    const fixture = setup();
    await act(async () => { await fixture.result.current.form.setFieldValue('selectedSubjectId', 'art'); });
    await act(async () => { await fixture.result.current.form.submitForm(); });
    await act(() => fixture.result.current.confirmChanges());
    await waitFor(() => expect(fixture.result.current.review).toBeUndefined());
    expect(fixture.result.current.form.values.selectedSubjectId).toBe('art');
    expect(fixture.result.current.error).toContain('Affected records changed');
    expect(fixture.onSaved).not.toHaveBeenCalled();
    fixture.store.dispatch(api.util.resetApiState());
  });
});
