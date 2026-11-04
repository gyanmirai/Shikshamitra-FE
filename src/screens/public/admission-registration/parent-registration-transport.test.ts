import { it, vi, expect, afterEach } from 'vitest';

import {
  readRegistrationToken,
  createParentRegistrationTransport,
} from './parent-registration-transport';

afterEach(() => vi.unstubAllGlobals());

it('reads only a fragment token and sends it in a dedicated header without credentials', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'Invited' })));
  vi.stubGlobal('fetch', fetcher);
  expect(readRegistrationToken('#token=private%2Bvalue')).toBe('private+value');
  expect(readRegistrationToken('?token=wrong')).toBe('');
  await createParentRegistrationTransport('private+value').context();
  const [url, options] = fetcher.mock.calls[0];
  expect(url).toMatch(/\/api\/public\/admission-registration$/);
  expect(url).not.toContain('private');
  expect(options).toMatchObject({
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
  });
  const headers = new Headers(options.headers);
  expect(headers.get('X-Admission-Registration-Token')).toBe('private+value');
  expect(headers.has('Authorization')).toBe(false);
});

it('preserves conflict and field errors without returning a successful context', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'Admissions.ParentRegistration.Conflict',
            message: 'The application changed.',
            data: { FieldErrors: { NAME: 'Review this answer.' } },
          },
        }),
        { status: 409 }
      )
    )
  );
  await expect(
    createParentRegistrationTransport('private').save({
      snapshotToken: 'old',
      idempotencyKey: 'same-retry',
      values: [],
    })
  ).rejects.toMatchObject({
    status: 409,
    conflict: true,
    fieldErrors: { NAME: 'Review this answer.' },
  });
});

it('sends exact multipart fields without a JSON content type and downloads private bytes', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response('{}'))
    .mockResolvedValueOnce(new Response('bytes'));
  vi.stubGlobal('fetch', fetcher);
  const transport = createParentRegistrationTransport('private');
  await transport.upload(
    'stage',
    'CERT',
    new File(['x'], 'certificate.pdf', { type: 'application/pdf' }),
    'snapshot',
    'retry'
  );
  const options = fetcher.mock.calls[0][1];
  expect([...options.body.keys()]).toEqual(['file', 'snapshotToken', 'idempotencyKey']);
  expect(new Headers(options.headers).has('Content-Type')).toBe(false);
  expect(await (await transport.file('evidence')).text()).toBe('bytes');
});

it('preserves canonical problem details, field validation and unavailable capability messages', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errorCode: 'Admissions.ParentRegistration.Incomplete',
            detail: 'Upload the required document before sending to school.',
            data: { FieldErrors: { NAME: 'Review this answer.' } },
          }),
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errorCode: 'Admissions.ParentRegistration.Unavailable',
            detail: 'Internal capability information.',
          }),
          { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
  );
  const transport = createParentRegistrationTransport('private');
  await expect(
    transport.handIn({ snapshotToken: 'snapshot', idempotencyKey: 'retry' })
  ).rejects.toMatchObject({
    message: 'Upload the required document before sending to school.',
    status: 400,
    fieldErrors: { NAME: 'Review this answer.' },
  });
  await expect(transport.context()).rejects.toMatchObject({
    message: 'This link is unavailable or has expired. Ask the school for a new registration link.',
    status: 404,
  });
});
