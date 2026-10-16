import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import {
  getPermissionOperation,
  isGenericPermissionMessage,
  normalizePermissionDeniedError,
} from 'src/utils/permission-denied';

const MAX_ERROR_BODY_SIZE = 64 * 1024;

export async function normalizePermissionResponse(
  error: FetchBaseQueryError,
  endpoint: string
): Promise<FetchBaseQueryError> {
  if (error.status !== 403 && !(error.status === 'PARSING_ERROR' && error.originalStatus === 403)) {
    return error;
  }

  let { data } = error;
  if (data && typeof data === 'object' && 'blob' in data) data = data.blob;
  if (
    data &&
    typeof data === 'object' &&
    'text' in data &&
    typeof data.text === 'function' &&
    'size' in data &&
    typeof data.size === 'number'
  ) {
    try {
      data = data.size <= MAX_ERROR_BODY_SIZE ? await data.text() : undefined;
    } catch {
      data = undefined;
    }
  }
  if (typeof data === 'string') {
    const body = data;
    try {
      data = body.length <= MAX_ERROR_BODY_SIZE ? JSON.parse(body) : undefined;
    } catch {
      const safeReason =
        body.length <= 1024 &&
        /\b(permission|access|scope|allowed|authorized|authorised|assigned)\b/i.test(body) &&
        !/[<>]|https?:\/\/|\/api\/|\b(?:Exception|StackTrace)\b|[A-Z]:\\/i.test(body);
      data = isGenericPermissionMessage(body) || safeReason ? { detail: body.trim() } : undefined;
    }
  }

  return normalizePermissionDeniedError(
    { status: 403, data },
    { operation: getPermissionOperation(endpoint) }
  ) as FetchBaseQueryError;
}
