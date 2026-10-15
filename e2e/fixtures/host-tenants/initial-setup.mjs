import { randomUUID } from 'node:crypto';
import { createSetupAcademics } from './setup-academics.mjs';

// Synthetic persistence for browser checks. Real authorization/domain behavior is covered by API tests.
export function createInitialSetupFixture(profile, options = {}) {
  const state = {
    isCompleted: options.setupCompleted === true, canManageSetup: options.canSetup !== false,
    currentStep: options.setupStep ?? 0, furthestStep: options.setupStep ?? 0, schoolCode: 'SCHOOL_01', concurrencyStamp: randomUUID(),
    academicYearId: null, divisionId: null, completedAt: null, createdUsers: [], pendingSteps: [],
    draft: { profile: { ...profile }, yearName: '', existingYearId: null, startDate: null, endDate: null, boardType: null, medium: '', stage: '', className: '', ageLowerLimit: null, divisionName: '', strength: null, roomNumber: '' },
  };
  const years = [];
  const academics = createSetupAcademics();
  const confirmed = {};
  const projection = (step) => JSON.stringify(step === 1 ? state.draft.profile : step === 2 ? [state.draft.yearName, state.draft.startDate, state.draft.endDate, state.draft.existingYearId] : [state.draft.boardType, state.draft.medium, state.draft.stage, state.draft.className, state.draft.ageLowerLimit, state.draft.divisionName, state.draft.strength, state.draft.roomNumber]);
  const current = () => {
    state.pendingSteps = [1, 2, 3].filter((step) => step < state.furthestStep && confirmed[step] !== projection(step));
    return state;
  };
  async function handle(url, method, body, send) {
    if (academics.handle(url, method, body, send)) return true;
    if (url.pathname === '/fixture/setup-snapshot') { send(200, current()); return true; }
    if (url.pathname === '/fixture/setup-conflict') { state.concurrencyStamp = randomUUID(); state.draft.profile.city = 'Changed by another administrator'; send(200, {}); return true; }
    if (url.pathname === '/api/app/academic-year') { send(200, { items: years, totalCount: years.length }); return true; }
    if (url.pathname === '/api/identity/roles/all') { send(200, { items: [{ id: randomUUID(), name: 'Teacher' }, { id: randomUUID(), name: 'Clerk' }] }); return true; }
    if (!url.pathname.startsWith('/api/institute-setup/initial')) return false;
    if (method === 'GET') { send(200, current()); return true; }
    if (!state.canManageSetup) { send(403, { title: 'Permission denied' }); return true; }
    const action = url.pathname.split('/').at(-1);
    if (action === 'users' && state.createdUsers.some((user) => user.requestId === body.requestId)) { send(200, current()); return true; }
    if (body.concurrencyStamp !== state.concurrencyStamp) { send(409, { title: 'Conflict' }); return true; }
    if (action === 'users') {
      const duplicate = state.createdUsers.find(user => user.userName.toLowerCase() === body.userName.toLowerCase() || user.email.toLowerCase() === body.email.toLowerCase());
      if (duplicate) { send(400, { errorCode: duplicate.userName.toLowerCase() === body.userName.toLowerCase() ? 'Volo.Abp.Identity:DuplicateUserName' : 'Volo.Abp.Identity:DuplicateEmail', detail: 'One or more business rules were violated.' }); return true; }
    }
    if (options.delay) await new Promise((resolve) => setTimeout(resolve, options.delay));
    if (action === 'draft') { state.draft = structuredClone(body.draft); state.currentStep = body.currentStep; }
    if (action === 'advance') { state.furthestStep = Math.max(state.furthestStep, body.step + 1); state.currentStep = body.step + 1; }
    if (action === 'profile') { state.draft.profile = { ...state.draft.profile, ...Object.fromEntries(Object.keys(profile).map((key) => [key, body[key] ?? ''])) }; confirmed[1] = projection(1); state.currentStep = 2; state.furthestStep = Math.max(state.furthestStep, 2); }
    if (action === 'academic-year') {
      const id = body.createNew ? randomUUID() : body.existingYearId ?? state.academicYearId ?? randomUUID();
      if (state.academicYearId && state.academicYearId !== id) { state.divisionId = null; state.furthestStep = Math.min(state.furthestStep, 3); }
      state.academicYearId = id; state.draft = { ...state.draft, yearName: body.name, startDate: body.startDate, endDate: body.endDate, existingYearId: id };
      const index = years.findIndex((year) => year.id === id); const record = { id, name: body.name, startDate: body.startDate, endDate: body.endDate };
      if (index >= 0) years[index] = record; else years.push(record);
      confirmed[2] = projection(2); state.currentStep = 3; state.furthestStep = Math.max(state.furthestStep, 3);
    }
    if (action === 'structure') { state.draft = structuredClone(body.draft); state.divisionId ??= randomUUID(); academics.addBranch(state.academicYearId, state.draft, state.divisionId); confirmed[3] = projection(3); state.currentStep = 4; state.furthestStep = Math.max(state.furthestStep, 4); }
    if (action === 'users') state.createdUsers.push({ id: randomUUID(), requestId: body.requestId, userName: body.userName, email: body.email });
    if (action === 'complete') {
      if (current().pendingSteps.length || !state.divisionId || state.furthestStep < 5) { send(400, { errorCode: 'ShikshaMitra:InitialSetup:UnconfirmedChanges' }); return true; }
      state.isCompleted = true; state.currentStep = state.furthestStep = 6; state.completedAt = new Date().toISOString();
    }
    state.concurrencyStamp = randomUUID(); send(200, current()); return true;
  }
  return { state, handle };
}
