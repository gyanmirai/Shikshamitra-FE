'use client';

import type { FinanceSetupScope, FinanceSetupState } from 'src/redux/finance/setup/types';

import { useRef, useState, useEffect } from 'react';
import { financePaths } from 'src/constants/finance-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSaveFinanceSetupProgressMutation } from 'src/redux/finance/setup/api';

import { getFinanceSetupPosition } from './finance-setup-model';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export function useFinanceSetupProgress(scope: FinanceSetupScope, response?: FinanceSetupState) {
  const router = useRouter();
  const params = useSearchParams();
  const [save, mutation] = useSaveFinanceSetupProgressMutation();
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [destination, setDestination] = useState<FinanceSetupPosition | null>(null);
  const saving = useRef(false);
  const mounted = useRef(false);
  const resumed = useRef<FinanceSetupPosition | null>(null);
  const state = response?.academicYearId === scope.academicYearId ? response : undefined;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (state && !resumed.current) {
    resumed.current = getFinanceSetupPosition(state.currentStageKey, state.currentSettingKey);
  }
  const useUrl = !params.has('guideYear') || params.get('guideYear') === scope.academicYearId;
  const position = getFinanceSetupPosition(
    (useUrl ? params.get('stage') : null) ?? resumed.current?.stage ?? 'accounts',
    useUrl && params.has('stage') ? params.get('setting') : (resumed.current?.setting ?? null),
    state?.settings.filter((item) => item.canView).map((item) => item.key)
  );
  // The server preserves hidden deferrals; revoked View grants must not block later saves.
  const deferred =
    state?.deferredSettingKeys.filter((key) =>
      state.settings.some((item) => item.key === key && item.canView)
    ) ?? [];

  useEffect(() => {
    if (
      destination &&
      params.get('stage') === destination.stage &&
      params.get('setting') === destination.setting
    )
      setDestination(null);
  }, [destination, params]);

  function hrefFor(target: FinanceSetupPosition) {
    const next = new URLSearchParams(params.toString());
    next.set('guideYear', scope.academicYearId);
    next.set('stage', target.stage);
    if (target.setting) next.set('setting', target.setting);
    else next.delete('setting');
    return `${financePaths.setup}?${next}`;
  }

  async function persist(
    target = position,
    keys = deferred,
    finishReview = false,
    exitTo?: string
  ) {
    if (!state || saving.current || destination || conflict) return false;
    saving.current = true;
    setPending(true);
    setMessage('');
    setFailed(false);
    try {
      await save({
        scope,
        progress: {
          concurrencyStamp: state.concurrencyStamp,
          currentStageKey: target.stage,
          currentSettingKey: target.setting,
          deferredSettingKeys: keys.filter((key) =>
            state.settings.some((item) => item.key === key && item.canView)
          ),
          finishReview,
        },
      }).unwrap();
      if (!mounted.current) return false;
      setMessage(finishReview ? 'Finance setup review saved.' : 'Guide progress saved.');
      if (exitTo) router.push(exitTo);
      else {
        if (target.stage !== position.stage || target.setting !== position.setting)
          setDestination(target);
        const navigate = target.stage !== position.stage || target.setting !== position.setting;
        router[navigate ? 'push' : 'replace'](hrefFor(target), { scroll: false });
      }
      return true;
    } catch (error) {
      if (!mounted.current) return false;
      const stale =
        typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
      setConflict(stale);
      setFailed(true);
      setMessage(
        stale
          ? 'This guide was updated elsewhere. Reload the saved progress before continuing.'
          : 'Progress could not be saved. Your current step is still here. Try again.'
      );
      return false;
    } finally {
      saving.current = false;
      if (mounted.current) setPending(false);
    }
  }

  function restore(saved: FinanceSetupState) {
    if (!mounted.current || saved.academicYearId !== scope.academicYearId) return;
    const target = getFinanceSetupPosition(
      saved.currentStageKey,
      saved.currentSettingKey,
      saved.settings.filter((item) => item.canView).map((item) => item.key)
    );
    resumed.current = target;
    setMessage('');
    setConflict(false);
    setFailed(false);
    router.replace(hrefFor(target), { scroll: false });
  }

  return {
    position,
    deferred,
    persist,
    restore,
    hrefFor,
    message,
    conflict,
    failed,
    saving: pending || mutation.isLoading || Boolean(destination),
  };
}
