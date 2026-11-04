import type {
  ParentRegistrationValue,
  ParentRegistrationWriteInput,
  PublicParentRegistrationContext,
} from 'src/redux/student/admissions/admission-parent-registration-types';

export class ParentRegistrationError extends Error {
  constructor(
    message: string,
    public status: number,
    public conflict = false,
    public fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ParentRegistrationError';
  }
}

export function readRegistrationToken(fragment: string) {
  return fragment.startsWith('#') ? new URLSearchParams(fragment.slice(1)).get('token') || '' : '';
}

/** This capability transport deliberately has no dependency on the authenticated base API. */
export function createParentRegistrationTransport(token: string) {
  const base = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/admission-registration`;
  const request = async (path: string, init: RequestInit = {}, binary = false) => {
    const headers = new Headers(init.headers);
    headers.set('X-Admission-Registration-Token', token);
    if (init.body && !(init.body instanceof FormData))
      headers.set('Content-Type', 'application/json');
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = body?.error ?? body;
      const code = detail?.errorCode ?? detail?.code;
      const conflict = response.status === 409 || code === 'Admissions.ParentRegistration.Conflict';
      const unavailable = code === 'Admissions.ParentRegistration.Unavailable';
      throw new ParentRegistrationError(
        unavailable
          ? 'This link is unavailable or has expired. Ask the school for a new registration link.'
          : detail?.data?.Reason ||
              detail?.detail ||
              detail?.message ||
              'Unable to complete this request. Try again.',
        response.status,
        conflict,
        detail?.data?.FieldErrors ?? {}
      );
    }
    return binary ? response.blob() : response.json();
  };
  return {
    context: (signal?: AbortSignal): Promise<PublicParentRegistrationContext> =>
      request('', { signal }),
    save: (
      input: ParentRegistrationWriteInput & { values: ParentRegistrationValue[] }
    ): Promise<PublicParentRegistrationContext> =>
      request('/draft', { method: 'PUT', body: JSON.stringify(input) }),
    handIn: (input: ParentRegistrationWriteInput): Promise<PublicParentRegistrationContext> =>
      request('/hand-in', { method: 'POST', body: JSON.stringify(input) }),
    upload: (
      stageId: string,
      code: string,
      file: File,
      snapshotToken: string,
      idempotencyKey: string
    ): Promise<PublicParentRegistrationContext> => {
      const body = new FormData();
      body.append('file', file);
      body.append('snapshotToken', snapshotToken);
      body.append('idempotencyKey', idempotencyKey);
      return request(`/documents/${encodeURIComponent(stageId)}/${encodeURIComponent(code)}`, {
        method: 'POST',
        body,
      });
    },
    file: (evidenceId: string): Promise<Blob> =>
      request(`/files/${encodeURIComponent(evidenceId)}`, {}, true),
  };
}

export type ParentRegistrationTransport = ReturnType<typeof createParentRegistrationTransport>;
