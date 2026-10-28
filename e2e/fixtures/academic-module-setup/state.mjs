import { randomUUID } from 'node:crypto';
import { ids, settings } from './data.mjs';

export function createAcademicFixture(options = {}) {
  const state = {
    visited: options.visited === true,
    visitRequests: [],
    settings: {},
    requests: [],
    failNext: options.failNext ?? null,
    saveDelay: options.saveDelay ?? 0,
    progress: {
      academicYearId: ids.year,
      concurrencyStamp: randomUUID(),
      currentStageKey: options.stage ?? 'welcome',
      currentSettingKey: options.setting ?? null,
      deferredSettingKeys: options.deferred ?? [],
      reviewedAt: null,
    },
  };
  const snapshot = () => ({ ...state, settings: { ...state.settings } });
  const projection = () => ({
    ...state.progress,
    settings: settings.map(([key]) => ({
      key,
      canView: true,
      canManage: true,
      configurationState: state.settings[key]?.length ? 'configured' : 'empty',
    })),
  });
  async function handle(url, method, body, send) {
    if (!url.pathname.startsWith('/api/academics/setup')) return false;
    state.requests.push({ method, path: url.pathname });
    if (state.failNext === 'visit-status' && url.pathname.endsWith('/visit-status')) {
      state.failNext = null;
      send(503, { title: 'Synthetic visit status unavailable' });
      return true;
    }
    if (state.failNext === 'visit' && url.pathname.endsWith('/visit')) {
      state.failNext = null;
      send(503, { title: 'Synthetic visit save unavailable' });
      return true;
    }
    if (url.pathname.endsWith('/visit-status')) {
      send(200, {
        hasVisitedConfiguration: state.visited,
        canAccessSetup: true,
        firstVisitedAt: state.visited ? '2026-10-28T00:00:00Z' : null,
      });
      return true;
    }
    if (url.pathname.endsWith('/visit')) {
      const firstVisit = !state.visited;
      state.visited = true;
      state.visitRequests.push({ settingKey: body.settingKey ?? null });
      send(200, {
        firstVisit,
        hasVisitedConfiguration: true,
        firstVisitedAt: '2026-10-28T00:00:00Z',
      });
      return true;
    }
    if (method === 'PUT') {
      if (state.saveDelay) await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (
        body.concurrencyStamp !== state.progress.concurrencyStamp ||
        state.failNext === 'progress'
      ) {
        state.failNext = null;
        send(409, { title: 'Synthetic progress conflict' });
        return true;
      }
      state.progress = {
        ...state.progress,
        currentStageKey: body.currentStageKey,
        currentSettingKey: body.currentSettingKey,
        deferredSettingKeys: body.deferredSettingKeys,
        reviewedAt: body.finishReview ? '2026-10-28T00:00:00Z' : state.progress.reviewedAt,
        concurrencyStamp: randomUUID(),
      };
    }
    send(200, projection());
    return true;
  }
  return { state, snapshot, projection, handle };
}
