'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useRef, useMemo, useEffect, useContext, useCallback, createContext } from 'react';

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
  state: EnrollmentWorkspaceState;
  updateState: (patch: EnrollmentWorkspaceStatePatch, mode?: 'push' | 'replace') => void;
  openApplicant: (leadId: string, tab?: EnrollmentApplicantTab) => void;
  closeApplicant: () => void;
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
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (root: RootState) => root.globalState
  );
  const { permissions, user } = useSelector((root: RootState) => root.auth);
  const applicantOriginRef = useRef<HTMLElement | null>(null);
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

  const navigate = useCallback(
    (nextState: EnrollmentWorkspaceState, mode: 'push' | 'replace' = 'replace') => {
      const query = serializeEnrollmentWorkspaceState(nextState).toString();
      const href = query ? `${pathname}?${query}` : pathname;
      router[mode](href, { scroll: false });
    },
    [pathname, router]
  );

  const updateState = useCallback(
    (patch: EnrollmentWorkspaceStatePatch, mode: 'push' | 'replace' = 'replace') => {
      const next = { ...state } as EnrollmentWorkspaceState;
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
    [navigate, state]
  );

  useEffect(() => {
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
      navigate(next as EnrollmentWorkspaceState, 'replace');
    }
  }, [
    currentBoard?.id,
    currentMedium?.id,
    currentYear?.id,
    defaults,
    navigate,
    searchParams,
    workspace,
  ]);

  const openApplicant = useCallback(
    (leadId: string, tab: EnrollmentApplicantTab = 'overview') => {
      applicantOriginRef.current = document.activeElement as HTMLElement | null;
      updateState({ applicant: leadId, applicantTab: tab }, 'push');
    },
    [updateState]
  );

  const closeApplicant = useCallback(() => {
    updateState({ applicant: undefined, applicantTab: undefined }, 'replace');
    window.setTimeout(() => applicantOriginRef.current?.focus(), 0);
  }, [updateState]);

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
      currentUserId: user?.sub || user?.id,
      state,
      updateState,
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
      openApplicant,
      persona,
      state,
      updateState,
      user?.id,
      user?.sub,
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
