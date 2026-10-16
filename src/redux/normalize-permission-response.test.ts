import { Blob } from 'node:buffer';
import { it, expect } from 'vitest';

import { normalizePermissionResponse } from './normalize-permission-response';

it('decodes specific errors inside wrapped report downloads', async () => {
  const body = { detail: 'This report is outside your assigned classes.', errorCode: 'UserScope:AccessDenied', data: { reason: 'kept' } };
  const error = await normalizePermissionResponse({ status: 403, data: { blob: new Blob([JSON.stringify(body)]), fileName: 'not-a-report.pdf', bytes: 'encoded-error' } }, 'downloadAcademicReport');
  expect(error).toEqual({ status: 403, data: body });
});

it('retains a short plain-text scope explanation', async () => {
  const error = await normalizePermissionResponse({ status: 'PARSING_ERROR', originalStatus: 403, data: 'This document is outside your assigned classes.', error: 'Invalid JSON' }, 'downloadAcademicReport');
  expect(error).toEqual({ status: 403, data: { detail: 'This document is outside your assigned classes.' } });
});

it('bounds failed download decoding and keeps technical server text out of feedback', async () => {
  const error = await normalizePermissionResponse({ status: 403, data: new Blob(['<html>Access denied at /api/private</html>'.repeat(3000)]) }, 'downloadAcademicReport');
  expect(error).toMatchObject({ status: 403, data: { detail: expect.stringContaining('cannot download academic reports.') } });
  expect(JSON.stringify(error)).not.toContain('private');
});
