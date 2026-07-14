'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useContext, useCallback, createContext } from 'react';

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
  currentUserId?: string;
  state: EnrollmentWorkspaceState;
  updateState: (patch: EnrollmentWorkspaceStatePatch, mode?: 'push' | 'replace') => void;
  openApplicant: (leadId: string) => void;
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
  const { currentYear } = useSelector((root: RootState) => root.globalState);
  const { permissions, user } = useSelector((root: RootState) => root.auth);
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
    const cycle = current.get('cycle') || (currentYear?.id as string | undefined);

    sessionStorage.removeItem(legacyKey);
    if (!cycle && !Object.keys(legacy).length) return;

    const next = { ...defaults, ...legacy, ...state, cycle, page: state.page || 1 };
    const canonical = serializeEnrollmentWorkspaceState(next as EnrollmentWorkspaceState);
    if (!areSearchParamsEquivalent(canonical, current)) {
      navigate(next as EnrollmentWorkspaceState, 'replace');
    }
  }, [currentYear?.id, defaults, navigate, searchParams, state, workspace]);

  const value = useMemo<EnrollmentWorkspaceContextValue>(
    () => ({
      workspace,
      persona,
      academicYearId: state.cycle || (currentYear?.id as string | undefined),
      currentUserId: user?.sub || user?.id,
      state,
      updateState,
      openApplicant: (leadId) => updateState({ applicant: leadId }, 'push'),
      closeApplicant: () => updateState({ applicant: undefined }, 'replace'),
    }),
    [currentYear?.id, persona, state, updateState, user?.id, user?.sub, workspace]
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
