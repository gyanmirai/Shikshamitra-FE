'use client';

import type { RootState, AppDispatch } from 'src/redux/store';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
  AdmissionOfferingWriteInput,
  AdmissionOfferingValidationError,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useRef, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';
import {
  admissionOfferingsApi,
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
  const dispatch = useDispatch<AppDispatch>();
  const [createOffering, createState] = useCreateAdmissionOfferingMutation();
  const [updateOffering, updateState] = useUpdateAdmissionOfferingMutation();
  const [cloneOffering, cloneState] = useCloneAdmissionOfferingMutation();
  const [activateOffering, activateState] = useActivateAdmissionOfferingMutation();
  const [deactivateOffering, deactivateState] = useDeactivateAdmissionOfferingMutation();
  const [deleteOffering, deleteState] = useDeleteAdmissionOfferingMutation();
  const [dialogMode, setDialogMode] = useState<OfferingDialogMode | null>(null);
  const [selected, setSelected] = useState<AdmissionOffering | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const activeDetail = useRef<{
    mode: 'view' | 'edit' | 'clone';
    row: AdmissionOfferingListItem;
  } | null>(null);
  const detailLock = useRef<string | null>(null);
  const detailRequest = useRef(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(initialBulkOpen);
  const [pendingAction, setPendingAction] = useState<PendingOfferingAction>(null);
  const [activationErrors, setActivationErrors] = useState<AdmissionOfferingValidationError[]>([]);
  const commandBusy = useBoolean();
  const commandLock = useRef(false);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const requirementsRead = useRef<{ offeringId: string } | null>(null);
  const permissions = getAdmissionOfferingPermissions(granted);

  // These reads are snapshots. A retained subscription would refetch the deleted Offering.
  const readOffering = (id: string) =>
    dispatch(
      admissionOfferingsApi.endpoints.getAdmissionOffering.initiate(id, {
        subscribe: false,
        forceRefetch: true,
      })
    ).unwrap();

  const stopRequirementsCheck = () => {
    requirementsRead.current = null;
    setCheckingRequirements(false);
  };

  const cancelDetailRequest = () => {
    detailRequest.current += 1;
    detailLock.current = null;
    activeDetail.current = null;
  };

  const openDetailed = async (mode: 'view' | 'edit' | 'clone', row: AdmissionOfferingListItem) => {
    const key = `${mode}:${row.id}`;
    if (detailLock.current === key) return;
    detailLock.current = key;
    activeDetail.current = { mode, row };
    detailRequest.current += 1;
    const request = detailRequest.current;
    setDetailError(null);
    setLoadingDetail(true);
    setSelected(null);
    setDetailsOpen(mode === 'view');
    setDialogMode(mode === 'view' ? null : mode);
    try {
      const detail = await readOffering(row.id);
      if (request !== detailRequest.current) return;
      setSelected(detail);
    } catch (error) {
      if (request !== detailRequest.current) return;
      const message = getAdmissionApiError(error, 'Unable to load the offering.');
      setDetailError(message);
    } finally {
      if (request === detailRequest.current) {
        setLoadingDetail(false);
        detailLock.current = null;
      }
    }
  };

  const save = async (
    values: AdmissionOfferingWriteInput,
    targetCycleId: string,
    finishAfterExit: (finish: () => void) => void = (finish) => finish()
  ) => {
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
      const revealSavedScope =
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
            ).some((field) => (saved[field] ?? null) !== (selected[field] ?? null))));
      finishAfterExit(() => {
        setDialogMode(null);
        setSelected(null);
        if (saved && revealSavedScope) onSavedScopeChange?.(saved);
      });
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
      const detail = await readOffering(pendingAction.row.id);
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
      if (activeDetail.current)
        return openDetailed(activeDetail.current.mode, activeDetail.current.row);
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
    canReviewCycles: hasGrantedPermission(granted, studentPermissions.enrollment.settings.cycles),
    editBlockedOffering: () => {
      if (!pendingAction || commandLock.current || requirementsRead.current || !permissions.edit)
        return undefined;
      const { row } = pendingAction;
      setPendingAction(null);
      setActivationErrors([]);
      return openDetailed('edit', row);
    },
    loadingDetail,
    saving: createState.isLoading || updateState.isLoading || cloneState.isLoading,
    commanding:
      commandBusy.value ||
      activateState.isLoading ||
      deactivateState.isLoading ||
      deleteState.isLoading,
    permissions,
    cancelDetailRequest,
    openCreate: () => {
      detailRequest.current += 1;
      detailLock.current = null;
      activeDetail.current = null;
      setLoadingDetail(false);
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
      cancelDetailRequest();
      setLoadingDetail(false);
      setDetailError(null);
      setDialogMode(null);
      setSelected(null);
    },
    closeDetails: () => {
      cancelDetailRequest();
      setLoadingDetail(false);
      setDetailError(null);
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
            const latest = await readOffering(row.id);
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
