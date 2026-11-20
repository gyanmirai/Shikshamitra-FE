import type { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';
import type {
  FinanceExternalCollection,
  FinanceExternalReceivable,
} from 'src/redux/library/charges-management/finance-external.types';

import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { financeSourceFromAssessment } from 'src/redux/library/charges-management/finance-source-reference';
import { useGetFinanceExternalReceivableQuery } from 'src/redux/library/charges-management/finance-external-api';

import { useLibraryFinanceAccess } from './useLibraryFinanceAccess';
import { useOpenedFinanceAssessment } from './useOpenedFinanceAssessment';

import type { ICollectChargesProps } from '../type';

const sections = ['post', 'bind', 'approve', 'collect', 'corrections'] as const;
type Section = (typeof sections)[number];
export type FinanceCorrectionAction = FinanceWaiverAction | 'refund' | null;
const emptyFlags = () => ({
  post: false,
  bind: false,
  approve: false,
  collect: false,
  corrections: false,
});

export function useFinanceCashier({ open, charge, onBusyChange }: ICollectChargesProps) {
  const access = useLibraryFinanceAccess();
  const opened = useOpenedFinanceAssessment(open.value, String(charge?.id || ''), access.source);
  const { assessment } = opened;
  const source = useMemo(
    () => (assessment ? financeSourceFromAssessment(assessment) : null),
    [assessment]
  );
  const [receivable, setReceivable] = useState<FinanceExternalReceivable>();
  const [result, setResult] = useState<FinanceExternalCollection | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(emptyFlags);
  const [dirty, setDirty] = useState(emptyFlags);
  const [correctionAction, setCorrectionAction] = useState<FinanceCorrectionAction>(null);
  const dispatch = useDispatch();
  const posted = Boolean(assessment?.financeSourceLinkId || receivable?.financeChargeId);
  const query = useGetFinanceExternalReceivableQuery(
    source && posted && access.view ? source : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const changed = useCallback((value: FinanceExternalReceivable) => setReceivable(value), []);
  const callbacks = useMemo(
    () =>
      Object.fromEntries(
        sections.map((section) => [
          section,
          {
            onBusyChange: (value: boolean) =>
              setBusy((previous) =>
                previous[section] === value ? previous : { ...previous, [section]: value }
              ),
            onDirtyChange: (value: boolean) =>
              setDirty((previous) =>
                previous[section] === value ? previous : { ...previous, [section]: value }
              ),
          },
        ])
      ) as Record<
        Section,
        { onBusyChange: (value: boolean) => void; onDirtyChange: (value: boolean) => void }
      >,
    []
  );
  const locked = Object.values(busy).some(Boolean);
  const contextNavigation = useUnsavedNavigation(Object.values(dirty).some(Boolean), {
    guardContextChanges: true,
    blockNavigation: locked,
  });
  useEffect(() => {
    if (query.currentData && !query.isFetching && !query.isError) changed(query.currentData);
  }, [query.currentData, query.isFetching, query.isError, changed]);
  useEffect(() => {
    onBusyChange?.(locked);
    return () => onBusyChange?.(false);
  }, [locked, onBusyChange]);
  useEffect(() => {
    dispatch(setIsChanges(Object.values(dirty).some(Boolean)));
    return () => {
      dispatch(setIsChanges(false));
    };
  }, [dirty, dispatch]);
  const blocked = (section: Section) =>
    opened.query.isError || sections.some((other) => other !== section && busy[other]);
  const correctionNavigationLocked = locked || Object.values(dirty).some(Boolean);
  const selectCorrection = (next: FinanceCorrectionAction) => {
    if (correctionNavigationLocked || opened.query.isError) return;
    setCorrectionAction(next);
  };
  return {
    access,
    opened,
    assessment,
    source,
    receivable,
    result,
    setResult,
    preview,
    setPreview,
    posted,
    query,
    changed,
    callbacks,
    locked,
    blocked,
    correctionAction,
    correctionNavigationLocked,
    selectCorrection,
    contextConfirmation: contextNavigation.confirmation,
  };
}
