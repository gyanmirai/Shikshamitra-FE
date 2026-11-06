'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
  AdmissionOfferingWriteInput,
  AdmissionOfferingValidationError,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useLazyGetAdmissionOfferingQuery,
  useCloneAdmissionOfferingMutation,
  useCreateAdmissionOfferingMutation,
  useUpdateAdmissionOfferingMutation,
  useDeleteAdmissionOfferingMutation,
  useActivateAdmissionOfferingMutation,
  useDeactivateAdmissionOfferingMutation,
} from 'src/redux/student/admissions/admission-offerings-api';

import { getAdmissionFormAccess } from './form-access';
import { getAdmissionWorkflowAccess } from './workflow-access';
import { getAdmissionApiError } from './admission-offering-model';
import { readOfferingConfigurationErrors } from './admission-offering-recovery';
import { getAdmissionOfferingPermissions } from './admission-offering-permissions';
import { getOfferingConfigurationAccess } from './admission-offering-configuration-access';

export type OfferingDialogMode = 'create' | 'edit' | 'clone';
export type PendingOfferingAction = {
  type: 'activate' | 'deactivate' | 'delete';
  row: AdmissionOfferingListItem;
} | null;

export function useAdmissionOfferingActions(
  cycle: AdmissionCycle | null,
  initialBulkOpen = false,
  onSavedScopeChange?: (offering: AdmissionOffering) => void
) {
  const granted = useSelector((state: RootState) => state.auth.permissions);
  const [loadOffering, detailState] = useLazyGetAdmissionOfferingQuery();
  const [createOffering, createState] = useCreateAdmissionOfferingMutation();
  const [updateOffering, updateState] = useUpdateAdmissionOfferingMutation();
  const [cloneOffering, cloneState] = useCloneAdmissionOfferingMutation();
  const [activateOffering, activateState] = useActivateAdmissionOfferingMutation();
  const [deactivateOffering, deactivateState] = useDeactivateAdmissionOfferingMutation();
  const [deleteOffering, deleteState] = useDeleteAdmissionOfferingMutation();
  const [dialogMode, setDialogMode] = useState<OfferingDialogMode | null>(null);
  const [selected, setSelected] = useState<AdmissionOffering | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequest = useRef(0);
  const editRow = useRef<AdmissionOfferingListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(initialBulkOpen);
  const [pendingAction, setPendingAction] = useState<PendingOfferingAction>(null);
  const [activationErrors, setActivationErrors] = useState<AdmissionOfferingValidationError[]>([]);
  const commandBusy = useBoolean();
  const commandLock = useRef(false);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const requirementsRead = useRef<{ offeringId: string } | null>(null);
  const permissions = getAdmissionOfferingPermissions(granted);

  const stopRequirementsCheck = () => {
    requirementsRead.current = null;
    setCheckingRequirements(false);
  };

  const openDetailed = async (mode: 'view' | 'edit' | 'clone', row: AdmissionOfferingListItem) => {
    detailRequest.current += 1;
    const request = detailRequest.current;
    setDetailError(null);
    if (mode === 'edit') {
      editRow.current = row;
      setSelected(null);
      setDialogMode('edit');
    }
    try {
      const detail = await loadOffering(row.id).unwrap();
      if (request !== detailRequest.current) return;
      setSelected(detail);
      if (mode === 'view') setDetailsOpen(true);
      else setDialogMode(mode);
    } catch (error) {
      if (request !== detailRequest.current) return;
      const message = getAdmissionApiError(error, 'Unable to load the offering.');
      if (mode === 'edit') {
        setDetailError(message);
        return;
      }
      shikshaMitraToast.error({
        message,
      });
    }
  };

  const save = async (values: AdmissionOfferingWriteInput, targetCycleId: string) => {
    if (!cycle || !dialogMode) return;
    try {
      let saved: AdmissionOffering | undefined;
      if (dialogMode === 'create')
        saved = await createOffering({ admissionCycleId: cycle.id, body: values }).unwrap();
      else if (dialogMode === 'edit' && selected)
        saved = await updateOffering({
          id: selected.id,
          body: { ...values, concurrencyStamp: selected.concurrencyStamp },
        }).unwrap();
      else if (dialogMode === 'clone' && selected)
        saved = await cloneOffering({
          id: selected.id,
          body: {
            admissionCycleId: targetCycleId,
            name: values.name,
            track: values.track,
            entryMode: values.entryMode,
            campusId: values.campusId,
            boardId: values.boardId,
            mediumId: values.mediumId,
            stageId: values.stageId,
            standardId: values.standardId,
            code: values.code,
            isActive: values.isActive,
          },
        }).unwrap();
      shikshaMitraToast.success({
        message:
          dialogMode === 'clone'
            ? 'Offering cloned'
            : selected
              ? 'Offering updated'
              : 'Offering created',
      });
      setDialogMode(null);
      setSelected(null);
      if (
        saved &&
        (dialogMode !== 'edit' ||
          (selected &&
            (
              [
                'admissionCycleId',
                'boardId',
                'mediumId',
                'stageId',
                'standardId',
                'campusId',
              ] as const
            ).some((field) => (saved[field] ?? null) !== (selected[field] ?? null))))
      ) {
        onSavedScopeChange?.(saved);
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: getAdmissionApiError(error, 'Unable to save the offering.'),
      });
      throw error;
    }
  };

  const confirmAction = async () => {
    if (
      !pendingAction ||
      commandLock.current ||
      requirementsRead.current ||
      !permissions[pendingAction.type]
    )
      return;
    commandLock.current = true;
    commandBusy.onTrue();
    try {
      const detail = await loadOffering(pendingAction.row.id).unwrap();
      if (pendingAction.type === 'activate' && detail.configuration?.isValid === false) {
        setActivationErrors(detail.configuration.errors);
        return;
      }
      const input = { id: detail.id, concurrencyStamp: detail.concurrencyStamp };
      if (pendingAction.type === 'activate') await activateOffering(input).unwrap();
      if (pendingAction.type === 'deactivate') await deactivateOffering(input).unwrap();
      if (pendingAction.type === 'delete') await deleteOffering(input).unwrap();
      shikshaMitraToast.success({ message: `Offering ${pendingAction.type}d successfully` });
      setPendingAction(null);
    } catch (error) {
      const errors =
        pendingAction.type === 'activate' ? readOfferingConfigurationErrors(error) : [];
      if (errors.length) setActivationErrors(errors);
      else
        shikshaMitraToast.error({
          message: getAdmissionApiError(error, 'Unable to update the offering.'),
        });
    } finally {
      commandLock.current = false;
      commandBusy.onFalse();
    }
  };
  return {
    selected,
    detailError,
    retryDetail: () => {
      if (editRow.current) return openDetailed('edit', editRow.current);
      return undefined;
    },
    dialogMode,
    detailsOpen,
    bulkOpen,
    pendingAction,
    activationErrors,
    checkingRequirements,
    formAccess: getAdmissionFormAccess(granted),
    workflowAccess: getAdmissionWorkflowAccess(granted),
    editBlockedOffering: () => {
      if (!pendingAction || commandLock.current || requirementsRead.current || !permissions.edit)
        return undefined;
      const { row } = pendingAction;
      setPendingAction(null);
      setActivationErrors([]);
      return openDetailed('edit', row);
    },
    loadingDetail: detailState.isFetching,
    saving: createState.isLoading || updateState.isLoading || cloneState.isLoading,
    commanding:
      commandBusy.value ||
      activateState.isLoading ||
      deactivateState.isLoading ||
      deleteState.isLoading,
    permissions,
    openCreate: () => {
      detailRequest.current += 1;
      setDetailError(null);
      setSelected(null);
      setDialogMode('create');
    },
    openDetailed,
    deactivateFromEditor: () => {
      if (
        !selected ||
        !permissions.deactivate ||
        commandLock.current ||
        !getOfferingConfigurationAccess(selected).canDeactivateToEdit
      )
        return;
      setActivationErrors([]);
      setPendingAction({ type: 'deactivate', row: selected });
    },
    closeDialog: () => {
      detailRequest.current += 1;
      editRow.current = null;
      setDetailError(null);
      setDialogMode(null);
      setSelected(null);
    },
    closeDetails: () => {
      setDetailsOpen(false);
      setSelected(null);
    },
    openBulk: () => setBulkOpen(true),
    closeBulk: () => setBulkOpen(false),
    requestAction: (row: AdmissionOfferingListItem) => {
      if (commandLock.current) return;
      stopRequirementsCheck();
      setActivationErrors([]);
      setPendingAction({ type: row.isActive ? 'deactivate' : 'activate', row });
      if (!row.isActive && !row.canActivate && row.configurationStatus === 0) {
        const request = { offeringId: row.id };
        requirementsRead.current = request;
        setCheckingRequirements(true);
        (async () => {
          try {
            const latest = await loadOffering(row.id).unwrap();
            if (requirementsRead.current !== request) return;
            setActivationErrors(
              latest.configuration?.isValid === false ? latest.configuration.errors : []
            );
          } catch (error) {
            if (requirementsRead.current !== request) return;
            shikshaMitraToast.error({
              message: getAdmissionApiError(error, 'Unable to check offering requirements.'),
            });
          } finally {
            if (requirementsRead.current === request) stopRequirementsCheck();
          }
        })();
      }
    },
    requestDelete: (row: AdmissionOfferingListItem) => {
      if (commandLock.current) return;
      stopRequirementsCheck();
      setPendingAction({ type: 'delete', row });
    },
    cancelAction: () => {
      if (!commandLock.current) {
        stopRequirementsCheck();
        setPendingAction(null);
        setActivationErrors([]);
      }
    },
    confirmAction,
    save,
  };
}
