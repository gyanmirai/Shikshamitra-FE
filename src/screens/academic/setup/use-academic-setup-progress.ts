'use client';

import type { AcademicSetupScope, AcademicSetupState } from 'src/redux/academic-setup/types';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSaveAcademicSetupProgressMutation } from 'src/redux/academic-setup/api';

import { getAcademicSetupPosition } from './academic-setup-model';

import type { AcademicSetupPosition } from './academic-setup-catalog';

export function useAcademicSetupProgress(scope: AcademicSetupScope, state?: AcademicSetupState) {
  const router = useRouter();
  const params = useSearchParams();
  const [save, mutation] = useSaveAcademicSetupProgressMutation();
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [destination, setDestination] = useState<AcademicSetupPosition | null>(null);
  const [draft, setDraft] = useState<{ year: string; keys: string[] } | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const resumed = useRef<AcademicSetupPosition | null>(null);
  if (state && !resumed.current) {
    resumed.current = getAcademicSetupPosition(state.currentStageKey, state.currentSettingKey);
  }
  const position = getAcademicSetupPosition(
    params.get('stage') ?? resumed.current?.stage ?? 'welcome',
    params.has('stage') ? params.get('setting') : resumed.current?.setting ?? null,
    state?.settings.filter((item) => item.canView).map((item) => item.key)
  );
  const deferred = draft?.year === scope.academicYearId ? draft.keys : state?.deferredSettingKeys ?? [];
  const navigating = destination !== null
    && (destination.stage !== position.stage || destination.setting !== position.setting);
  useEffect(() => {
    if (destination && destination.stage === position.stage && destination.setting === position.setting) {
      setDestination(null);
    }
  }, [destination, position.stage, position.setting]);

  async function persist(target = position, keys = deferred, finishReview = false, exitTo?: string) {
    if (!state || mutation.isLoading) return false;
    if (!exitTo && (target.stage !== position.stage || target.setting !== position.setting)) {
      setDestination(target);
    }
    setMessage('');
    setConflict(false);
    setDraft({ year: scope.academicYearId, keys });
    try {
      await save({ scope, progress: {
        concurrencyStamp: state.concurrencyStamp,
        currentStageKey: target.stage, currentSettingKey: target.setting,
        deferredSettingKeys: keys, finishReview,
        academicMediumId: scope.academicMediumId, standardId: scope.standardId,
      } }).unwrap();
      if (!mounted.current) return false;
      setDraft(null);
      setMessage(finishReview ? 'Setup review saved.' : 'Guide progress saved.');
      if (exitTo) router.push(exitTo);
      else {
        const next = new URLSearchParams(params.toString());
        next.set('stage', target.stage);
        if (target.setting) next.set('setting', target.setting); else next.delete('setting');
        if (target.stage !== position.stage || target.setting !== position.setting) {
          next.delete('action');
          next.delete('recordId');
        }
        router.replace(`/academic/setup?${next}`, { scroll: false });
      }
      return true;
    } catch (error) {
      if (!mounted.current) return false;
      setDestination(null);
      const stale = typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
      setConflict(stale);
      setMessage(stale
        ? 'Someone else updated this guide. Reload the saved progress before continuing.'
        : 'Progress could not be saved. Your current selection is still here. Try again.');
      return false;
    }
  }

  const move = (target: AcademicSetupPosition) => persist(target);
  const restore = (saved: AcademicSetupState) => {
    if (!mounted.current) return;
    const restored = getAcademicSetupPosition(saved.currentStageKey, saved.currentSettingKey,
      saved.settings.filter((item) => item.canView).map((item) => item.key));
    resumed.current = restored;
    setDestination(null);
    setDraft(null); setMessage(''); setConflict(false);
    const next = new URLSearchParams(params.toString());
    next.set('stage', restored.stage);
    if (restored.setting) next.set('setting', restored.setting); else next.delete('setting');
    next.delete('action'); next.delete('recordId');
    router.replace(`/academic/setup?${next}`, { scroll: false });
  };
  return { position, deferred, persist, move, navigating, saving: mutation.isLoading, failed: mutation.isError,
    message, conflict, restore };
}
