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
import { runEnrollmentNavigation } from './enrollment-route-transition';
import {
  isSafeApplicantReturnPath,
  createApplicantReturnContext,
  parseApplicantReturnContext,
  applicantReturnStoragePrefix,
  applicantRestoreStoragePrefix,
} from './applicant-return-context';

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
  applicantReturnHref: string;
  getApplicantHref: (leadId: string, tab?: EnrollmentApplicantTab) => string;
  openApplicant: (
    leadId: string,
    tab?: EnrollmentApplicantTab,
    workItem?: AdmissionCrmMyWorkItemDto
  ) => void;
  closeApplicant: () => void;
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

const getEnrollmentScrollRoot = () => {
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>('[data-enrollment-scroll-root="true"]')
  );
  const candidates = roots.flatMap((root) => [
    ...Array.from(root.querySelectorAll<HTMLElement>('.simplebar-content-wrapper')),
    root,
  ]);
  return candidates.find(
    (root) =>
      root.getClientRects().length > 0 &&
      (root.scrollHeight > root.clientHeight || root.scrollWidth > root.clientWidth)
  );
};

const storeApplicantReturnContext = (returnTo: string, focusLeadId: string) => {
  try {
    const key = createSessionToken();
    const scrollRoot = getEnrollmentScrollRoot();
    const context = createApplicantReturnContext({
      expiresAt: Date.now() + applicantWorkExpiryMs,
      returnTo,
      scrollTop: scrollRoot?.scrollTop ?? window.scrollY,
      scrollLeft: scrollRoot?.scrollLeft ?? window.scrollX,
      focusLeadId,
    });
    window.sessionStorage.setItem(`${applicantReturnStoragePrefix}${key}`, JSON.stringify(context));
    return key;
  } catch {
    return undefined;
  }
};

const readApplicantReturnContext = (keyOrPath?: string, consume = false) => {
  if (!keyOrPath) return undefined;
  if (isSafeApplicantReturnPath(keyOrPath)) {
    return createApplicantReturnContext({
      expiresAt: Date.now() + applicantWorkExpiryMs,
      returnTo: keyOrPath,
      scrollTop: 0,
      scrollLeft: 0,
      focusLeadId: '',
    });
  }

  try {
    const storageKey = `${applicantReturnStoragePrefix}${keyOrPath}`;
    const context = parseApplicantReturnContext(window.sessionStorage.getItem(storageKey));
    if (consume) window.sessionStorage.removeItem(storageKey);
    return context;
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
  const fallbackApplicantReturnHref = useMemo(() => {
    const fallbackParams = new URLSearchParams();
    if (state.cycle) fallbackParams.set('cycle', state.cycle);
    if (state.board) fallbackParams.set('board', state.board);
    if (state.medium) fallbackParams.set('medium', state.medium);
    const query = fallbackParams.toString();
    return `${studentPaths.enrollment.pipeline}${query ? `?${query}` : ''}`;
  }, [state.board, state.cycle, state.medium]);
  const applicantReturnHref =
    readApplicantReturnContext(state.returnTo)?.returnTo || fallbackApplicantReturnHref;

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

  useEffect(() => {
    if (workspace === 'applicant') return undefined;
    const restoreKey = `${applicantRestoreStoragePrefix}${sessionIdentity}`;
    const context = parseApplicantReturnContext(sessionStorage.getItem(restoreKey));
    if (!context) {
      sessionStorage.removeItem(restoreKey);
      return undefined;
    }
    const expectedPath = new URL(context.returnTo, window.location.origin).pathname;
    if (expectedPath !== pathname) {
      sessionStorage.removeItem(restoreKey);
      return undefined;
    }

    let observer: MutationObserver | undefined;
    let fallbackTimer = 0;
    const restore = (allowFallback = false) => {
      const readinessMarker = document.querySelector<HTMLElement>(
        '[data-enrollment-restore-ready]'
      );
      const focusTarget = Array.from(
        document.querySelectorAll<HTMLElement>('[data-applicant-link-id]')
      ).find((element) => element.dataset.applicantLinkId === context.focusLeadId);
      if (
        !allowFallback &&
        ((readinessMarker && readinessMarker.dataset.enrollmentRestoreReady !== 'true') ||
          (!readinessMarker && !focusTarget))
      ) {
        return false;
      }

      const scrollRoot = getEnrollmentScrollRoot();
      if (scrollRoot) {
        scrollRoot.scrollTo({
          top: context.scrollTop,
          left: context.scrollLeft,
          behavior: 'auto',
        });
      } else {
        window.scrollTo({ top: context.scrollTop, left: context.scrollLeft, behavior: 'auto' });
      }
      (focusTarget || document.getElementById('student-enrollment-content'))?.focus({
        preventScroll: true,
      });
      sessionStorage.removeItem(restoreKey);
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
      return true;
    };

    const firstFrame = window.requestAnimationFrame(() => {
      if (restore()) return;
      observer = new MutationObserver(() => restore());
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['data-enrollment-restore-ready'],
      });
      fallbackTimer = window.setTimeout(() => restore(true), 5_000);
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname, sessionIdentity, workspace]);

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
    (leadId: string, tab: EnrollmentApplicantTab = 'inquiry') => {
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
      tab: EnrollmentApplicantTab = 'inquiry',
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
      const returnKey = storeApplicantReturnContext(returnTo, leadId);
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
      runEnrollmentNavigation('nav-forward', () =>
        router.push(`${applicantPath}?${applicantParams.toString()}`, {
          scroll: false,
        })
      );
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
    const returnContext = readApplicantReturnContext(state.returnTo, true);
    const returnTo = returnContext?.returnTo;
    if (
      returnTo?.startsWith('/student/enrollment/') &&
      !returnTo.startsWith('/student/enrollment/applicants/')
    ) {
      if (returnContext) {
        sessionStorage.setItem(
          `${applicantRestoreStoragePrefix}${sessionIdentity}`,
          JSON.stringify(returnContext)
        );
      }
      pendingNavigationPathRef.current = new URL(returnTo, window.location.origin).pathname;
      runEnrollmentNavigation('nav-back', () => router.replace(returnTo, { scroll: false }));
      return;
    }

    const fallbackParams = new URLSearchParams();
    if (state.cycle) fallbackParams.set('cycle', state.cycle);
    if (state.board) fallbackParams.set('board', state.board);
    if (state.medium) fallbackParams.set('medium', state.medium);
    const query = fallbackParams.toString();
    const pipelinePath = studentPaths.enrollment.pipeline;
    pendingNavigationPathRef.current = pipelinePath;
    runEnrollmentNavigation('nav-back', () =>
      router.replace(`${pipelinePath}${query ? `?${query}` : ''}`, {
        scroll: false,
      })
    );
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
      applicantReturnHref,
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
      applicantReturnHref,
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
