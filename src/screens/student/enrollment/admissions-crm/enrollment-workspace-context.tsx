'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { AdmissionCrmMyWorkItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  useRef,
  useMemo,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useLayoutEffect,
} from 'react';

import {
  getWorkspaceFromPathname,
  areSearchParamsEquivalent,
  getPersonaWorkspaceDefaults,
  parseEnrollmentWorkspaceState,
  migrateLegacyWorkspaceFilters,
  serializeEnrollmentWorkspaceState,
} from './enrollment-workspace-state';

import type {
  EnrollmentPersona,
  EnrollmentWorkspace,
  EnrollmentApplicantTab,
  EnrollmentWorkspaceState,
  EnrollmentWorkspaceStatePatch,
} from './enrollment-workspace-state';

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';

const actionPermissions = {
  add: `${permissionRoot}.Add`,
  scheduleExam: `${permissionRoot}.ScheduleExam`,
  approveOffers: `${permissionRoot}.ApproveOffers`,
  manageConfiguration: `${permissionRoot}.ManageConfiguration`,
};

type EnrollmentWorkspaceContextValue = {
  workspace: EnrollmentWorkspace;
  persona: EnrollmentPersona;
  academicYearId?: string;
  academicYearName?: string;
  academicBoardId?: string;
  academicBoardName?: string;
  academicMediumId?: string;
  academicMediumName?: string;
  currentUserId?: string;
  sessionIdentity: string;
  state: EnrollmentWorkspaceState;
  updateState: (patch: EnrollmentWorkspaceStatePatch, mode?: 'push' | 'replace') => void;
  applicantWorkItem?: ApplicantWorkContextItem;
  getApplicantHref: (leadId: string, tab?: EnrollmentApplicantTab) => string;
  openApplicant: (
    leadId: string,
    tab?: EnrollmentApplicantTab,
    workItem?: AdmissionCrmMyWorkItemDto
  ) => void;
  closeApplicant: () => void;
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const applicantReturnStoragePrefix = 'student-enrollment:applicant-return:';
const legacyApplicantWorkStoragePrefix = 'student-enrollment:applicant-work:';
const applicantWorkStoragePrefix = 'student-enrollment:applicant-work:v2:';
const applicantWorkExpiryMs = 4 * 60 * 60 * 1_000;

export type ApplicantWorkContextItem = Pick<
  AdmissionCrmMyWorkItemDto,
  | 'key'
  | 'leadId'
  | 'title'
  | 'details'
  | 'dueAt'
  | 'urgency'
  | 'priority'
  | 'ownerDisplayName'
  | 'assignedDisplayName'
  | 'recommendedAction'
  | 'recommendedSection'
>;

type StoredApplicantWorkItem = {
  version: 1;
  expiresAt: number;
  item: ApplicantWorkContextItem;
};

const createSessionToken = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const storeApplicantReturnPath = (returnTo: string) => {
  try {
    const key = createSessionToken();
    window.sessionStorage.setItem(`${applicantReturnStoragePrefix}${key}`, returnTo);
    return key;
  } catch {
    return undefined;
  }
};

const consumeApplicantReturnPath = (keyOrPath?: string) => {
  if (!keyOrPath) return undefined;
  if (keyOrPath.startsWith('/student/enrollment/')) return keyOrPath;

  try {
    const storageKey = `${applicantReturnStoragePrefix}${keyOrPath}`;
    const returnTo = window.sessionStorage.getItem(storageKey) || undefined;
    window.sessionStorage.removeItem(storageKey);
    return returnTo;
  } catch {
    return undefined;
  }
};

const getApplicantWorkStorageKey = (identity: string, key: string) =>
  `${applicantWorkStoragePrefix}${encodeURIComponent(identity)}:${key}`;

const toApplicantWorkContextItem = (
  workItem: AdmissionCrmMyWorkItemDto
): ApplicantWorkContextItem => ({
  key: workItem.key,
  leadId: workItem.leadId,
  title: workItem.title,
  details: workItem.details,
  dueAt: workItem.dueAt,
  urgency: workItem.urgency,
  priority: workItem.priority,
  ownerDisplayName: workItem.ownerDisplayName,
  assignedDisplayName: workItem.assignedDisplayName,
  recommendedAction: workItem.recommendedAction,
  recommendedSection: workItem.recommendedSection,
});

const storeApplicantWorkItem = (workItem: AdmissionCrmMyWorkItemDto, identity: string) => {
  try {
    const key = createSessionToken();
    window.sessionStorage.setItem(
      getApplicantWorkStorageKey(identity, key),
      JSON.stringify({
        version: 1,
        expiresAt: Date.now() + applicantWorkExpiryMs,
        item: toApplicantWorkContextItem(workItem),
      } satisfies StoredApplicantWorkItem)
    );
    return key;
  } catch {
    return undefined;
  }
};

const readApplicantWorkItem = (key: string | undefined, identity: string) => {
  if (!key) return undefined;
  try {
    const storageKey = getApplicantWorkStorageKey(identity, key);
    const serialized = window.sessionStorage.getItem(storageKey);
    if (!serialized) return undefined;
    const stored = JSON.parse(serialized) as Partial<StoredApplicantWorkItem>;
    if (
      stored.version !== 1 ||
      typeof stored.expiresAt !== 'number' ||
      stored.expiresAt <= Date.now() ||
      !stored.item
    ) {
      window.sessionStorage.removeItem(storageKey);
      return undefined;
    }
    const workItem = stored.item as Partial<ApplicantWorkContextItem>;
    if (
      typeof workItem.key !== 'string' ||
      typeof workItem.leadId !== 'string' ||
      typeof workItem.title !== 'string' ||
      typeof workItem.recommendedSection !== 'number' ||
      typeof workItem.recommendedAction !== 'number'
    ) {
      return undefined;
    }
    return workItem as ApplicantWorkContextItem;
  } catch {
    return undefined;
  }
};

const removeApplicantWorkItem = (key: string | undefined, identity: string) => {
  if (!key) return;
  try {
    window.sessionStorage.removeItem(getApplicantWorkStorageKey(identity, key));
  } catch {
    // Session storage is an enhancement; navigation must still work when it is unavailable.
  }
};

const EnrollmentWorkspaceContext = createContext<EnrollmentWorkspaceContextValue | null>(null);

const resolvePersona = (permissions: RootState['auth']['permissions']): EnrollmentPersona => {
  if (hasGrantedPermission(permissions, actionPermissions.manageConfiguration)) {
    return 'administrator';
  }
  if (hasGrantedPermission(permissions, actionPermissions.approveOffers)) return 'approver';
  if (hasGrantedPermission(permissions, actionPermissions.scheduleExam)) return 'counselor';
  if (hasGrantedPermission(permissions, actionPermissions.add)) return 'receptionist';
  return 'restricted';
};

export function EnrollmentWorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingNavigationPathRef = useRef<string | null>(null);
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (root: RootState) => root.globalState
  );
  const { permissions, user } = useSelector((root: RootState) => root.auth);
  const currentUserId = user?.sub || user?.id;
  const currentTenantId =
    user?.tenantid ||
    user?.tenantId ||
    user?.profile?.tenantid ||
    user?.profile?.tenantId ||
    'host';
  const sessionIdentity = `${currentTenantId}:${currentUserId || 'anonymous'}`;
  const workspace = getWorkspaceFromPathname(pathname);
  const persona = resolvePersona(permissions);
  const defaults = useMemo(
    () => getPersonaWorkspaceDefaults(workspace, persona),
    [persona, workspace]
  );
  const state = useMemo(
    () => parseEnrollmentWorkspaceState(new URLSearchParams(searchParams.toString()), defaults),
    [defaults, searchParams]
  );
  const applicantWorkItem = useMemo(
    () => readApplicantWorkItem(state.workItem, sessionIdentity),
    [sessionIdentity, state.workItem]
  );

  useEffect(() => {
    try {
      for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = window.sessionStorage.key(index);
        if (
          key?.startsWith(legacyApplicantWorkStoragePrefix) &&
          !key.startsWith(applicantWorkStoragePrefix)
        ) {
          window.sessionStorage.removeItem(key);
        }
      }
    } catch {
      // Legacy cleanup must not block the enrollment workspace.
    }
  }, []);

  useEffect(() => {
    if (pendingNavigationPathRef.current === pathname) {
      pendingNavigationPathRef.current = null;
    }
  }, [pathname]);

  const navigate = useCallback(
    (nextState: EnrollmentWorkspaceState, mode: 'push' | 'replace' = 'replace') => {
      const query = serializeEnrollmentWorkspaceState(nextState).toString();
      const href = query ? `${pathname}?${query}` : pathname;

      // Workspace filters only change the current page's query string.
      // Next.js integrates native History API updates with useSearchParams, and doing this
      // synchronously prevents a delayed filter update from winning over a menu navigation.
      if (mode === 'push') {
        window.history.pushState(null, '', href);
      } else {
        window.history.replaceState(null, '', href);
      }
    },
    [pathname]
  );

  const updateState = useCallback(
    (patch: EnrollmentWorkspaceStatePatch, mode: 'push' | 'replace' = 'replace') => {
      const currentState =
        typeof window === 'undefined'
          ? state
          : parseEnrollmentWorkspaceState(new URLSearchParams(window.location.search), defaults);
      const next = { ...currentState } as EnrollmentWorkspaceState;
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete (next as Record<string, unknown>)[key];
        } else {
          (next as Record<string, unknown>)[key] = value;
        }
      });
      next.page = Number(next.page) > 0 ? Number(next.page) : 1;
      navigate(next, mode);
    },
    [defaults, navigate, state]
  );

  useIsomorphicLayoutEffect(() => {
    const current = new URLSearchParams(searchParams.toString());
    const legacyKey = `student-enrollment:${workspace}:filters`;
    const hasWorkspaceState = Array.from(current.keys()).some((key) => key !== 'cycle');
    const legacy = !hasWorkspaceState
      ? migrateLegacyWorkspaceFilters(sessionStorage.getItem(legacyKey))
      : {};
    const currentState = parseEnrollmentWorkspaceState(current, defaults);
    const cycle = current.get('cycle') || (currentYear?.id as string | undefined);
    const board = current.get('board') || (currentBoard?.id as string | undefined);
    const medium = current.get('medium') || (currentMedium?.id as string | undefined);

    sessionStorage.removeItem(legacyKey);
    if (!cycle && !Object.keys(legacy).length && current.size === 0) return;

    const next = {
      ...defaults,
      ...legacy,
      ...currentState,
      cycle,
      board,
      medium,
      page: currentState.page || 1,
    };
    const canonical = serializeEnrollmentWorkspaceState(next as EnrollmentWorkspaceState);
    if (!areSearchParamsEquivalent(canonical, current)) {
      if (pendingNavigationPathRef.current && pendingNavigationPathRef.current !== pathname) {
        return;
      }
      if (window.location.pathname !== pathname) return;
      const liveSearchParams = new URLSearchParams(window.location.search);
      if (!areSearchParamsEquivalent(liveSearchParams, current)) return;
      const query = canonical.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      // This is URL normalization, not application navigation.
      // Updating the current history entry synchronously prevents a delayed router.replace
      // from overwriting a newer menu click or applicant-workspace push.
      window.history.replaceState(null, '', href);
    }
  }, [
    currentBoard?.id,
    currentMedium?.id,
    currentYear?.id,
    defaults,
    pathname,
    searchParams,
    workspace,
  ]);

  const getApplicantHref = useCallback(
    (leadId: string, tab: EnrollmentApplicantTab = 'next') => {
      const applicantParams = new URLSearchParams();
      const cycle = state.cycle || (currentYear?.id as string | undefined);
      const board = state.board || (currentBoard?.id as string | undefined);
      const medium = state.medium || (currentMedium?.id as string | undefined);
      if (cycle) applicantParams.set('cycle', cycle);
      if (board) applicantParams.set('board', board);
      if (medium) applicantParams.set('medium', medium);
      applicantParams.set('tab', tab);
      return `${studentPaths.enrollment.applicant(leadId)}?${applicantParams.toString()}`;
    },
    [currentBoard?.id, currentMedium?.id, currentYear?.id, state.board, state.cycle, state.medium]
  );

  const openApplicant = useCallback(
    (
      leadId: string,
      tab: EnrollmentApplicantTab = 'next',
      workItem?: AdmissionCrmMyWorkItemDto
    ) => {
      const sourceParams = new URLSearchParams(searchParams.toString());
      sourceParams.delete('applicant');
      sourceParams.delete('tab');
      sourceParams.delete('activity');
      sourceParams.delete('examAction');
      sourceParams.delete('return');
      sourceParams.delete('applicantReturn');
      sourceParams.delete('workItem');
      const sourceQuery = sourceParams.toString();
      const returnTo = sourceQuery ? `${pathname}?${sourceQuery}` : pathname;
      const returnKey = storeApplicantReturnPath(returnTo);
      const workItemKey = workItem ? storeApplicantWorkItem(workItem, sessionIdentity) : undefined;
      const applicantParams = new URLSearchParams();
      const cycle = state.cycle || (currentYear?.id as string | undefined);
      const board = state.board || (currentBoard?.id as string | undefined);
      const medium = state.medium || (currentMedium?.id as string | undefined);
      if (cycle) applicantParams.set('cycle', cycle);
      if (board) applicantParams.set('board', board);
      if (medium) applicantParams.set('medium', medium);
      applicantParams.set('tab', tab);
      if (returnKey) applicantParams.set('return', returnKey);
      if (workItemKey) applicantParams.set('workItem', workItemKey);
      const applicantPath = studentPaths.enrollment.applicant(leadId);
      pendingNavigationPathRef.current = applicantPath;
      router.push(`${applicantPath}?${applicantParams.toString()}`, {
        scroll: false,
      });
    },
    [
      currentBoard?.id,
      currentMedium?.id,
      currentYear?.id,
      pathname,
      router,
      searchParams,
      sessionIdentity,
      state.board,
      state.cycle,
      state.medium,
    ]
  );

  const closeApplicant = useCallback(() => {
    removeApplicantWorkItem(state.workItem, sessionIdentity);
    const returnTo = consumeApplicantReturnPath(state.returnTo);
    if (
      returnTo?.startsWith('/student/enrollment/') &&
      !returnTo.startsWith('/student/enrollment/applicants/')
    ) {
      pendingNavigationPathRef.current = new URL(returnTo, window.location.origin).pathname;
      router.replace(returnTo, { scroll: false });
      return;
    }

    const fallbackParams = new URLSearchParams();
    if (state.cycle) fallbackParams.set('cycle', state.cycle);
    if (state.board) fallbackParams.set('board', state.board);
    if (state.medium) fallbackParams.set('medium', state.medium);
    const query = fallbackParams.toString();
    const pipelinePath = studentPaths.enrollment.pipeline;
    pendingNavigationPathRef.current = pipelinePath;
    router.replace(`${pipelinePath}${query ? `?${query}` : ''}`, {
      scroll: false,
    });
  }, [
    router,
    sessionIdentity,
    state.board,
    state.cycle,
    state.medium,
    state.returnTo,
    state.workItem,
  ]);

  const value = useMemo<EnrollmentWorkspaceContextValue>(
    () => ({
      workspace,
      persona,
      academicYearId: state.cycle || (currentYear?.id as string | undefined),
      academicYearName: currentYear?.name as string | undefined,
      academicBoardId: state.board || (currentBoard?.id as string | undefined),
      academicBoardName: currentBoard?.name as string | undefined,
      academicMediumId: state.medium || (currentMedium?.id as string | undefined),
      academicMediumName: currentMedium?.name as string | undefined,
      currentUserId,
      sessionIdentity,
      state,
      updateState,
      applicantWorkItem,
      getApplicantHref,
      openApplicant,
      closeApplicant,
    }),
    [
      closeApplicant,
      currentBoard?.id,
      currentBoard?.name,
      currentMedium?.id,
      currentMedium?.name,
      currentYear?.id,
      currentYear?.name,
      currentUserId,
      applicantWorkItem,
      getApplicantHref,
      openApplicant,
      persona,
      sessionIdentity,
      state,
      updateState,
      workspace,
    ]
  );

  return (
    <EnrollmentWorkspaceContext.Provider value={value}>
      {children}
    </EnrollmentWorkspaceContext.Provider>
  );
}

export const useEnrollmentWorkspace = () => {
  const context = useContext(EnrollmentWorkspaceContext);
  if (!context)
    throw new Error('useEnrollmentWorkspace must be used inside EnrollmentWorkspaceProvider.');
  return context;
};
