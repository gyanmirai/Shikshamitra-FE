import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { academicReportApi } from './AcademicReportApi';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { clearCachedAuthSession(); });

it('keeps report bytes binary without generating a second base64 copy', async () => {
  const expected = new Uint8Array([37, 80, 68, 70, 0, 128, 255]);
  mswServer.use(http.get('*/api/app/academic-report/exports/:jobId/download', () =>
    new HttpResponse(expected, { headers: {
      'content-type': 'application/pdf',
      'content-disposition': "attachment; filename*=UTF-8''Class%208%20report.pdf",
    } })));
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  const request = store.dispatch(academicReportApi.endpoints.downloadAcademicReport.initiate({ jobId: 'binary-job' }));
  try {
    const result = await request.unwrap();
    expect(new Uint8Array(await result.blob.arrayBuffer())).toEqual(expected);
    expect(result.fileName).toBe('Class 8 report.pdf');
    expect(result.contentType).toBe('application/pdf');
    expect(result).not.toHaveProperty('bytes');
  } finally {
    request.unsubscribe();
    store.dispatch(api.util.resetApiState());
  }
});
