'use client';

import type { StudentSetupScope, StudentSetupState } from 'src/redux/student/setup/types';

import { useRef, useState, useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSaveStudentSetupProgressMutation } from 'src/redux/student/setup/api';

import { getStudentSetupPosition } from './student-setup-model';

import type { StudentSetupPosition } from './student-setup-catalog';

export function useStudentSetupProgress(scope: StudentSetupScope, response?: StudentSetupState) {
  const router = useRouter();
  const params = useSearchParams();
  const [save, mutation] = useSaveStudentSetupProgressMutation();
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [destination, setDestination] = useState<StudentSetupPosition | null>(null);
  const [draft, setDraft] = useState<{ identity: string; keys: string[] } | null>(null);
  const saving = useRef(false);
  const mounted = useRef(false);
  const identity = `${scope.tenantCacheKey}:${scope.academicYearId}:${scope.academicMediumId ?? ''}:${scope.standardId ?? ''}`;
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const state = response?.academicYearId === scope.academicYearId ? response : undefined;
  const resumed = useRef<{ year: string; position: StudentSetupPosition } | null>(null);
  const yearKey = `${scope.tenantCacheKey}:${scope.academicYearId}`;
  if (state && resumed.current?.year !== yearKey) {
    resumed.current = { year: yearKey, position: getStudentSetupPosition(state.currentStageKey, state.currentSettingKey) };
  }
  const allowed = state?.settings.filter((item) => item.canView).map((item) => item.key) ?? [];
  const useUrl = !params.has('guideYear') || params.get('guideYear') === scope.academicYearId;
  const initial = resumed.current?.year === yearKey ? resumed.current.position : null;
  const position = getStudentSetupPosition(
    (useUrl ? params.get('stage') : null) ?? initial?.stage ?? 'welcome',
    useUrl && params.has('stage') ? params.get('setting') : initial?.setting ?? null,
    allowed
  );
  const deferred = (draft?.identity === identity ? draft.keys : state?.deferredSettingKeys ?? [])
    .filter((key) => allowed.includes(key));
  const navigating = destination !== null && (destination.stage !== position.stage || destination.setting !== position.setting);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (destination && !navigating) setDestination(null);
  }, [destination, navigating]);

  const hrefFor = (target: StudentSetupPosition, clearEditor = false) => {
    const next = new URLSearchParams(params.toString());
    next.set('guideYear', scope.academicYearId);
    next.set('stage', target.stage);
    if (target.setting) next.set('setting', target.setting); else next.delete('setting');
    if (clearEditor) { next.delete('action'); next.delete('recordId'); }
    return `${studentPaths.setupGuide}?${next}`;
  };

  async function persist(target = position, keys = deferred, finishReview = false, exitTo?: string) {
    if (!state || saving.current || navigating || conflict) return false;
    const requestIdentity = identity;
    const move = target.stage !== position.stage || target.setting !== position.setting;
    saving.current = true;
    setPending(true); setFailed(false); setMessage('');
    if (move && !exitTo) setDestination(target);
    setDraft({ identity, keys });
    try {
      await save({ scope, progress: {
        concurrencyStamp: state.concurrencyStamp,
        currentStageKey: target.stage, currentSettingKey: target.setting,
        deferredSettingKeys: keys.filter((key) => allowed.includes(key)), finishReview,
        academicMediumId: scope.academicMediumId, standardId: scope.standardId,
      } }).unwrap();
      if (!mounted.current || currentIdentity.current !== requestIdentity) return false;
      setDraft(null); setMessage(finishReview ? 'Setup review saved.' : 'Guide progress saved.');
      if (exitTo) router.push(exitTo);
      else router.replace(hrefFor(target, move), { scroll: false });
      return true;
    } catch (error) {
      if (!mounted.current || currentIdentity.current !== requestIdentity) return false;
      const stale = typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
      setDestination(null); setConflict(stale); setFailed(true);
      setMessage(stale ? 'Someone else updated this guide. Reload the saved progress before continuing.'
        : 'Progress could not be saved. Your current selection is still here. Try again.');
      return false;
    } finally {
      saving.current = false;
      if (mounted.current) setPending(false);
    }
  }

  const restore = (saved: StudentSetupState) => {
    if (!mounted.current || saved.academicYearId !== scope.academicYearId) return;
    const restored = getStudentSetupPosition(saved.currentStageKey, saved.currentSettingKey,
      saved.settings.filter((item) => item.canView).map((item) => item.key));
    resumed.current = { year: yearKey, position: restored };
    setDestination(null); setDraft(null); setMessage(''); setFailed(false); setConflict(false);
    router.replace(hrefFor(restored, true), { scroll: false });
  };
  return { position, deferred, persist, move: (target: StudentSetupPosition) => persist(target),
    navigating, saving: pending || mutation.isLoading, failed, message, conflict, restore };
}
