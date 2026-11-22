import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { shikshaMitraToast } from 'src/components/toast';

import { suggestCloneName } from '../admission-cycle-model';
import { useAdmissionCloseGuard } from '../use-admission-close-guard';
import { cycleConfigurationPayload } from './cycle-configuration-payload';
import { getCycleNameError } from './cycle-name-error';
import {
  getCycleDateError,
  isAdmissionCycleDate,
  getAdmissionCycleToday,
} from './cycle-date-limits';

import type {
  CycleConfigurationMode,
  AdmissionCycleConfigurationProps,
} from '../admission-cycle-configuration-dialog';

export function useCycleConfiguration({
  mode,
  cycle,
  busy,
  onClose,
  onConfirm,
}: Pick<AdmissionCycleConfigurationProps, 'mode' | 'cycle' | 'busy' | 'onClose' | 'onConfirm'>) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [description, setDescription] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [dismissedNotice, setDismissedNotice] = useState<CycleConfigurationMode | null>(null);

  useEffect(() => {
    if (!cycle || !mode) return;
    setName(mode === 'clone' ? suggestCloneName(cycle) : cycle.name);
    setNameError(undefined);
    setDescription(cycle.description ?? '');
    setAcademicYearId(cycle.academicYearId);
    setStartDate(cycle.startDate.slice(0, 10));
    setEndDate(cycle.endDate.slice(0, 10));
    setReason('');
    setPublishAt(cycle.scheduledPublishAt?.slice(0, 16) ?? '');
    setCloseAt(cycle.scheduledCloseAt?.slice(0, 16) ?? '');
    setDismissedNotice(null);
  }, [cycle, mode]);

  const dirty = Boolean(
    cycle &&
    mode &&
    (name !== (mode === 'clone' ? suggestCloneName(cycle) : cycle.name) ||
      description !== (cycle.description ?? '') ||
      academicYearId !== cycle.academicYearId ||
      startDate !== cycle.startDate.slice(0, 10) ||
      endDate !== cycle.endDate.slice(0, 10) ||
      reason ||
      publishAt !== (cycle.scheduledPublishAt?.slice(0, 16) ?? '') ||
      closeAt !== (cycle.scheduledCloseAt?.slice(0, 16) ?? ''))
  );
  const guard = useAdmissionCloseGuard(dirty, busy, Boolean(mode && cycle));
  const requestClose = () => guard.requestNavigation(onClose);

  const minimumDate = mode === 'window' ? getAdmissionCycleToday() : undefined;
  const dateError = (value: string, existing?: string) =>
    value ? getCycleDateError(value, minimumDate ?? '', existing) : undefined;
  const startDateError = dateError(startDate, cycle?.startDate);
  const endDateError =
    dateError(endDate, cycle?.endDate) ??
    (isAdmissionCycleDate(startDate) && isAdmissionCycleDate(endDate) && endDate < startDate
      ? 'Applications close date must be on or after the open date.'
      : undefined);
  const datesInvalid = !startDate || !endDate || Boolean(startDateError || endDateError);
  const scheduleInvalid =
    (!publishAt && !closeAt) ||
    Boolean(publishAt && !dayjs(publishAt).isAfter(dayjs())) ||
    Boolean(closeAt && !dayjs(closeAt).isAfter(dayjs())) ||
    Boolean(publishAt && closeAt && !dayjs(closeAt).isAfter(dayjs(publishAt)));
  const disabled =
    busy ||
    (mode === 'clone' && (!name.trim() || nameError || !academicYearId || datesInvalid)) ||
    (mode === 'window' && (datesInvalid || !reason.trim())) ||
    (mode === 'schedule' && scheduleInvalid);

  const submit = async () => {
    if (!mode || !cycle || disabled) return;
    try {
      await onConfirm(
        cycleConfigurationPayload(mode, cycle, {
          name,
          description,
          academicYearId,
          startDate,
          endDate,
          reason,
          publishAt,
          closeAt,
        })
      );
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      const duplicateName = mode === 'clone' ? getCycleNameError(problem.errorCode) : undefined;
      if (duplicateName) setNameError(duplicateName);
      else
        shikshaMitraToast.error({
          message: problem.detail || 'Unable to save the admission cycle.',
        });
    }
  };
  return {
    name,
    setName: (value: string) => {
      setNameError(undefined);
      setName(value);
    },
    nameError,
    description,
    setDescription,
    academicYearId,
    setAcademicYearId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    publishAt,
    setPublishAt,
    closeAt,
    setCloseAt,
    dismissedNotice,
    setDismissedNotice,
    guard,
    requestClose,
    minimumDate,
    startDateError,
    endDateError,
    scheduleInvalid,
    disabled: Boolean(disabled),
    submit,
  };
}
export type CycleConfigurationState = ReturnType<typeof useCycleConfiguration>;
