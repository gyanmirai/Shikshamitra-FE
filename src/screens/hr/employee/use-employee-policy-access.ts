import type { RootState } from 'src/redux/store';

import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthSessionCacheRevision } from 'src/redux/session-cache';
import { useLazyGetPermissionsQuery } from 'src/redux/permission/permissionApi';
import { setPermissions, extractGrantedPermissions } from 'src/redux/auth/authSlice';

import { useEmployeeDefaultPolicies } from './use-employee-default-policies';
import {
  getStaffPolicySubmitDenial,
  getMissingStaffPolicyPermissions,
} from './employee-policy-access';

import type { StaffPolicyRequirement } from './employee-policy-access';

export function useEmployeePolicyAccess(academicYearId: string | undefined, enabled: boolean) {
  const dispatch = useDispatch();
  const { permissions, user, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const [readPermissions] = useLazyGetPermissionsQuery();
  const [submissionDenial, setSubmissionDenial] = useState<StaffPolicyRequirement[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const accountRef = useRef(user?.sub);
  const mounted = useRef(false);
  accountRef.current = user?.sub;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setSubmissionDenial(null);
    setRefreshError('');
    setChecking(false);
  }, [user?.sub]);
  const missing = enabled ? getMissingStaffPolicyPermissions(permissions) : [];
  const defaults = useEmployeeDefaultPolicies(
    academicYearId,
    enabled && permissionsInitialized !== false && missing.length === 0
  );
  const requirements = [
    ...new Map(
      [...missing, ...defaults.denied, ...(submissionDenial ?? [])].map((requirement) => [
        requirement.name,
        requirement,
      ])
    ).values(),
  ];
  const blocked = enabled && (requirements.length > 0 || submissionDenial !== null);

  const checkAccess = async () => {
    if (checking) return;
    const accountId = user?.sub;
    const sessionRevision = getAuthSessionCacheRevision();
    const isCurrentAccount = () =>
      mounted.current &&
      accountRef.current === accountId &&
      getAuthSessionCacheRevision() === sessionRevision;
    setChecking(true);
    setRefreshError('');
    try {
      if (!accountId) throw new Error('Missing account');
      const catalogue = await readPermissions(
        { providerName: 'U', providerKey: accountId },
        false
      ).unwrap();
      if (!isCurrentAccount()) return;
      if (!Array.isArray(catalogue?.groups)) throw new Error('Invalid permissions');
      const latestPermissions = extractGrantedPermissions(catalogue.groups);
      dispatch(setPermissions(latestPermissions));
      if (getMissingStaffPolicyPermissions(latestPermissions).length === 0) {
        setSubmissionDenial(null);
        await defaults.retry();
      }
    } catch {
      if (isCurrentAccount()) setRefreshError('Access could not be checked. Please try again.');
    } finally {
      if (mounted.current && accountRef.current === accountId) setChecking(false);
    }
  };

  const handleSubmitError = (error: unknown) => {
    const denial = getStaffPolicySubmitDenial(error);
    if (denial === null) return false;
    setSubmissionDenial(denial);
    return true;
  };

  return {
    defaults,
    blocked,
    requirements,
    checking,
    refreshError,
    checkAccess,
    handleSubmitError,
  };
}
