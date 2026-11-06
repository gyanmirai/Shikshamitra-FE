import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { suggestCloneName } from '../admission-cycle-model';
import { useAdmissionCloseGuard } from '../use-admission-close-guard';
import { cycleConfigurationPayload } from './cycle-configuration-payload';

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

  const datesInvalid = !startDate || !endDate || !dayjs(endDate).isAfter(dayjs(startDate), 'day');
  const scheduleInvalid =
    (!publishAt && !closeAt) ||
    Boolean(publishAt && !dayjs(publishAt).isAfter(dayjs())) ||
    Boolean(closeAt && !dayjs(closeAt).isAfter(dayjs())) ||
    Boolean(publishAt && closeAt && !dayjs(closeAt).isAfter(dayjs(publishAt)));
  const disabled =
    busy ||
    (mode === 'clone' && (!name.trim() || !academicYearId || datesInvalid)) ||
    (mode === 'window' && (datesInvalid || !reason.trim())) ||
    (mode === 'schedule' && scheduleInvalid);

  const submit = async () => {
    if (mode && cycle)
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
  };
  return {
    name,
    setName,
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
    datesInvalid,
    scheduleInvalid,
    disabled,
    submit,
  };
}
export type CycleConfigurationState = ReturnType<typeof useCycleConfiguration>;
