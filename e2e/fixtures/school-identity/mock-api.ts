import type { IdentityChoices, IdentityContext, IdentityProfile, IdentityAsset } from 'src/screens/setting/school-identity/types';
const base = '/api/institute-setup/school-identity';
const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII='), c => c.charCodeAt(0));
export const fixtureState = { conflict: false, failUpload: false };
const inherit = (): IdentityChoices => ({ logo: { mode: 0 }, banner: { mode: 0 }, signature: { mode: 0 } });
const key = (context: IdentityContext) => `${context.boardId ?? ''}:${context.mediumId ?? ''}`;
const profiles = new Map<string, IdentityProfile>();
const assets = new Map<string, { metadata: IdentityAsset; bytes: Blob }>();
const revisions = new Map<string, unknown[]>();
const restricted = new URLSearchParams(window.location.search).has('signatureRestricted');
const readOnly = new URLSearchParams(window.location.search).has('readOnly');
let failRead = new URLSearchParams(window.location.search).has('failReadOnce');
let failImage = new URLSearchParams(window.location.search).has('failImageOnce');
let failOptions = new URLSearchParams(window.location.search).has('failOptionsOnce');
let failHistory = new URLSearchParams(window.location.search).has('failHistoryOnce');
const years = [{ id: 'year-26', name: '2026-2027' }, { id: 'year-25', name: '2025-2026' }];
const boards = years.flatMap(year => ['GSEB', 'CBSE'].map((name, index) => ({
  id: `${year.id}-${name}`, name, boardType: index + 1, academicYearId: year.id,
  educationMediums: [{ id: `${year.id}-${name}-gu`, name: 'Gujarati' }, { id: `${year.id}-${name}-en`, name: 'English' }],
})));
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
function read(context: IdentityContext): IdentityProfile {
  const stored = profiles.get(key(context));
  const profile: IdentityProfile = structuredClone(stored ?? { ...context, concurrencyStamp: '', choices: inherit(), canAccessSignature: true, canManage: true, effective: {} });
  for (const kind of ['logo', 'banner', 'signature'] as const) {
    let selection = profile.choices[kind]!;
    let source = context.mediumId ? 'Medium override' : context.boardId ? 'Board override' : 'School default';
    if (selection.mode === 0 && context.mediumId) { selection = profiles.get(key({ boardId: context.boardId }))?.choices[kind] ?? { mode: 0 }; source = 'Board override'; }
    if (selection.mode === 0) { selection = profiles.get(':')?.choices[kind] ?? { mode: 0 }; source = 'School default'; }
    profile.effective[kind] = { selection, source, asset: selection.assetId ? assets.get(selection.assetId)?.metadata : null };
  }
  if (restricted) { profile.choices.signature = null; delete profile.effective.signature; profile.canAccessSignature = false; }
  if (readOnly) profile.canManage = false;
  return profile;
}
function save(context: IdentityContext, choices: IdentityChoices) {
  const profile = { ...context, id: crypto.randomUUID(), concurrencyStamp: crypto.randomUUID(), choices, canAccessSignature: true, canManage: true, effective: {} };
  profiles.set(key(context), profile);
  const history = revisions.get(key(context)) ?? [];
  history.unshift({ id: crypto.randomUUID(), creationTime: new Date().toISOString(), creatorName: 'Synthetic Administrator', reason: 'Configuration updated', choices });
  revisions.set(key(context), history);
  return read(context);
}
export function installFixture() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url, window.location.origin);
    if (!url.pathname.startsWith('/api/')) return nativeFetch(input, init);
    const context = { boardId: url.searchParams.get('boardId') ?? undefined, mediumId: url.searchParams.get('mediumId') ?? undefined };
    if (url.pathname === '/api/app/academic-year') {
      if (failOptions) { failOptions = false; return json({}, 500); }
      return json({ items: new URLSearchParams(window.location.search).has('noYears') ? [] : years });
    }
    if (url.pathname === '/api/app/education-board') return json({ items: new URLSearchParams(window.location.search).has('noBoards') ? [] : boards });
    if (url.pathname === base && request.method === 'GET') {
      if (failRead) { failRead = false; return json({}, 500); }
      return json(read(context));
    }
    if (url.pathname === `${base}/history`) {
      if (failHistory) { failHistory = false; return json({}, 500); }
      const history = revisions.get(key(context)) ?? [];
      if (new URLSearchParams(window.location.search).has('longHistory') && history.length) {
        return json(Array.from({ length: 12 }, (_, index) => ({
          ...history[0] as object, id: `synthetic-revision-${index}`,
          creationTime: new Date(Date.UTC(2026, 9, 14, 12, index)).toISOString(),
          creatorName: index === 11 ? 'Synthetic administrator with a deliberately long account name for responsive validation' : 'Synthetic Administrator',
        })));
      }
      return json(history);
    }
    if (url.pathname === `${base}/assets` && request.method === 'POST') {
      if (fixtureState.failUpload) { fixtureState.failUpload = false; return json({ error: { message: 'Synthetic upload failure' } }, 400); }
      const form = await request.formData(); const file = form.get('file') as File;
      const metadata = { id: crypto.randomUUID(), kind: Number(form.get('kind')), fileName: file.name, contentType: file.type, size: file.size, width: 1, height: 1 };
      assets.set(metadata.id, { metadata, bytes: file }); return json(metadata);
    }
    if (url.pathname.startsWith(`${base}/assets/`)) {
      if (failImage) { failImage = false; return json({}, 500); }
      const asset = assets.get(url.pathname.split('/').at(-1)!);
      return asset ? new Response(asset.bytes, { headers: { 'Content-Type': asset.metadata.contentType } }) : json({}, 404);
    }
    if (url.pathname === base && request.method === 'PUT') {
      if (readOnly) return json({}, 403);
      const body = await request.json();
      if (fixtureState.conflict) { fixtureState.conflict = false; return json({}, 409); }
      const choices = { ...body.choices, signature: body.choices.signature ?? profiles.get(key(body))?.choices.signature };
      return json(save(body, choices));
    }
    if (url.pathname === `${base}/copy`) {
      const body = await request.json();
      const choices = profiles.get(key({ boardId: body.sourceBoardId, mediumId: body.sourceMediumId }))?.choices ?? inherit();
      return json(save({ boardId: body.targetBoardId, mediumId: body.targetMediumId }, structuredClone(choices)));
    }
    if (url.pathname === `${base}/preview`) return nativeFetch('/fixture-preview.pdf');
    return json({ error: { message: 'Unsupported synthetic endpoint' } }, 404);
  };
  // Honest 1px placeholders exercise warnings and object URLs without inventing school branding.
  const defaults = inherit();
  for (const kind of ['logo', 'banner', 'signature'] as const) {
    const id = `synthetic-${kind}`;
    assets.set(id, { metadata: { id, kind: ['logo', 'banner', 'signature'].indexOf(kind), fileName: 'synthetic-placeholder.png', contentType: 'image/png', size: png.length, width: 1, height: 1 }, bytes: new Blob([png], { type: 'image/png' }) });
    defaults[kind] = { mode: 1, assetId: id, ...(kind === 'signature' ? { principalName: 'Synthetic Principal', designation: 'Principal' } : {}) };
  }
  save({}, defaults);
  if (new URLSearchParams(window.location.search).has('empty')) save({}, inherit());
  save({ boardId: 'year-25-GSEB' }, { ...inherit(), banner: { mode: 2 } });
}
