import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { StudentSetupState, StudentSetupProgress } from 'src/redux/student/setup/types';

import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';
import { studentSetupSettings } from 'src/screens/student/setup/student-setup-catalog';
import { recordActions, recordOutcomes } from 'src/screens/student/records/records-settings-model';

import { years, boards } from './structure';

const documents = new Map<string, StudentSetupState>();
let visited = false;
let conflictRaised = false;
const flags = () => new URLSearchParams(window.location.search);

function initialState(year: string): StudentSetupState {
  return { academicYearId: year, concurrencyStamp: 'v1', currentStageKey: 'welcome', currentSettingKey: null,
    deferredSettingKeys: [], reviewedAt: null, settings: studentSetupSettings.map((item, index) => ({
      key: item.key, canView: !flags().has('limited') || index < 5, canManage: !flags().has('readonly'),
      configurationState: item.key === 'records-policy' || flags().has('configured') ? 'configured' : 'empty',
      ...(item.key === 'records-policy' ? { configurationSource: 'school-default' as const } : {}),
    })) };
}

const starterPolicy = {
  schemaVersion: 1,
  changes: Object.fromEntries(recordActions.map((action) => [action, { mode: 'Approval', requireReason: true, stages: [{ roleNames: ['admin'] }], condition: null }])),
  provisioning: { mode: 'Summary', allowPlacementEdits: false }, access: { masks: [] },
  guardianAccess: { onApprovedChange: 'SuspendUntilReview' },
  documents: { enabledCertificateTypes: ['Bonafide', 'Character', 'Leaving', 'FirstTrial'], certificateNumberPrefix: 'CERT', idNumberPrefix: 'ID', leavingCertificateStage: 'ApprovedExit' },
  transitions: { outcomeChecks: Object.fromEntries(recordOutcomes.map((outcome) => [outcome, { requireAcademicResult: false, requireFinanceClearance: false, requireLibraryClearance: false, requireTransportClearance: false }])), allowPastDates: false, maxPastDays: 30, allowFutureDates: true, maxFutureDays: 365, rosterRemovalTiming: 'EffectiveDate', allowedReturnRoutes: ['ReuseProfile'], defaultReturnRoute: 'ReuseProfile', annualRenewalMode: 'ShortChecklist', batchExceptionMode: 'ReadyOnly' },
};

type FixtureRequest = string | { url: string; method?: string; body?: unknown; params?: Record<string, unknown> };

// Keep heterogeneous synthetic responses behind the same unknown boundary as the real base query.
const baseQuery: BaseQueryFn<FixtureRequest, unknown, FetchBaseQueryError> = async (args) => {
    const request = typeof args === 'string' ? { url: args } : args;
    await new Promise((resolve) => setTimeout(resolve, 100));
    const {url} = request;
    if (url.endsWith('/student/setup/visit-status')) return { data: { hasVisitedConfiguration: visited, canAccessSetup: !flags().has('denied'), firstVisitedAt: visited ? '2026-11-16T00:00:00Z' : null } };
    if (url.endsWith('/student/setup/visit')) { const firstVisit = !visited; visited = true; return { data: { firstVisit, hasVisitedConfiguration: true, firstVisitedAt: '2026-11-16T00:00:00Z' } }; }
    const year = /\/student\/setup\/([^/?]+)/.exec(url)?.[1];
    if (year) {
      if (flags().has('loadError')) return { error: { status: 500, data: { detail: 'Synthetic configuration error' } } };
      const state = structuredClone(documents.get(year) ?? initialState(year));
      if (request.method === 'PUT') {
        const progress = request.body as StudentSetupProgress;
        if ((flags().has('conflict') && !conflictRaised) || progress.concurrencyStamp !== state.concurrencyStamp) {
          conflictRaised = true; state.concurrencyStamp = 'v2'; documents.set(year, state);
          return { error: { status: 409, data: { detail: 'Synthetic concurrent staff update' } } };
        }
        Object.assign(state, { currentStageKey: progress.currentStageKey, currentSettingKey: progress.currentSettingKey, deferredSettingKeys: progress.deferredSettingKeys, reviewedAt: progress.finishReview ? new Date().toISOString() : state.reviewedAt, concurrencyStamp: `v${Number(state.concurrencyStamp.slice(1)) + 1}` });
      }
      documents.set(year, structuredClone(state));
      const context = request.params ?? (request.body as StudentSetupProgress | undefined);
      state.settings = state.settings.map((item) => ({ ...item,
        configurationState: ['gr-number', 'roll-number'].includes(item.key) && !context?.standardId ? 'context-required' : item.configurationState,
      }));
      return { data: state };
    }
    // Native manager reads use synthetic empty lists; all domain mutation endpoints are rejected.
    if (request.method && request.method !== 'GET') return { error: { status: 400, data: { detail: 'This verification fixture does not save school settings. Your draft is retained.' } } };
    if (url.includes('onboarding') && url.includes('settings')) return { data: [] };
    if (url.includes('/students/records/') && url.includes('settings') && !url.includes('roles')) return { data: { draftPolicy: starterPolicy, effectivePolicy: starterPolicy, publishedVersionNumber: 0, isStarter: true } };
    if (url.includes('user-scope-hierarchy')) return { data: { userId: 'synthetic-user', isAdmin: true, generatedAt: 'fixture-v1', accessibleHierarchy: [] } };
    if (url === '/app/education-board') return { data: { items: boards, totalCount: boards.length } };
    if (url.includes('academic-year')) return { data: { items: years, totalCount: years.length } };
    return { data: { items: [], totalCount: 0, canManage: !flags().has('readonly') } };
};

export const api = createApi({ reducerPath: 'api', tagTypes, baseQuery, endpoints: () => ({}) });

