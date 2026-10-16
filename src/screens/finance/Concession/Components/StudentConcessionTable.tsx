'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IParams } from 'src/components/customizabaleTable/types';
import type { ConcessionApplication } from 'src/redux/finance/ConcessionManagement/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Alert,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useFinanceAcademicFilters,
  type UseFinanceAcademicFiltersResult,
} from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  concessionManagementApi,
  useGetConcessionApplicationsQuery,
  useCancelConcessionRequestMutation,
  useApproveConcessionRequestMutation,
  usePreviewConcessionApprovalMutation,
  useGetConcessionApprovalContextQuery,
  useDeleteConcessionApplicationMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import { canDecideConcession } from '../concessionDecisionEligibility';
import {
  toConcessionTableRow,
  concessionStatusLabel,
  concessionStatusOptions,
} from './concessionTablePresentation';

import type { IStudentInfo } from '../type';

interface ICombinedProps {
  onRequestConcession?: (student: IStudentInfo) => void;
  onReject: (data: IStudentInfo) => void;
  onAddConcession: () => void;
  onViewConcession?: (student: IStudentInfo) => void;
  onEditConcession?: (student: IStudentInfo) => void;
  onViewAllConcession?: (student: IStudentInfo) => void;
}

interface StudentConcessionTableProps extends ICombinedProps {
  academicFilters?: UseFinanceAcademicFiltersResult;
}

const StudentConcessionTable: React.FC<StudentConcessionTableProps> = ({
  onReject,
  onAddConcession,
  onRequestConcession,
  onViewConcession,
  onEditConcession,
  onViewAllConcession,
  academicFilters,
}) => {
  const localFilters = useFinanceAcademicFilters();
  const filters = academicFilters || localFilters;
  const {
    boards,
    mediums,
    selectedBoard,
    selectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard,
    setSelectedMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  } = filters;
  const tabs = useTabs('pending');
  const scopeKey = JSON.stringify([filterPayload, tabs.value]);
  const [tableQuery, setTableQuery] = useState<{
    page: number;
    rowsPerPage: number;
    search: string;
    filters: IParams['filters'];
    sorts: IParams['sorts'];
    scopeKey: string;
  }>({ page: 0, rowsPerPage: 10, search: '', filters: [], sorts: [], scopeKey });
  const page = tableQuery.scopeKey === scopeKey ? tableQuery.page : 0;
  useEffect(() => {
    setTableQuery((previous) =>
      previous.scopeKey === scopeKey ? previous : { ...previous, page: 0, scopeKey }
    );
  }, [scopeKey]);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const actions = financePermissions.fees.concessionActions;
  const canApprove = hasGrantedPermission(permissions, actions.approve);
  const canReject = hasGrantedPermission(permissions, actions.reject);
  const canAdd = hasGrantedPermission(permissions, actions.add);
  const canEdit = hasGrantedPermission(permissions, actions.edit);
  const canDelete = hasGrantedPermission(permissions, actions.delete);
  const canCancel = hasGrantedPermission(permissions, actions.cancel);
  const [selectedConcession, setSelectedConcession] = useState<ConcessionApplication | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<ConcessionApplication | null>(null);
  const [approvalPreview, setApprovalPreview] = useState<{
    total: number;
    requestConcurrencyStamp: string;
    previewFingerprint: string;
  } | null>(null);
  const approvalCommandKey = useRef('');
  const approvalContext = useGetConcessionApprovalContextQuery(approvalRequest?.id ?? '', {
    skip: !approvalRequest?.id,
  });
  const [previewApproval, { isLoading: isPreviewingApproval }] =
    usePreviewConcessionApprovalMutation();
  const [approveRequest, { isLoading: isApproving }] = useApproveConcessionRequestMutation();
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const cancelCommandKey = useRef('');
  const deleteCommandKey = useRef('');
  const removeConcessionDialog = useBoolean();
  const cancelConcessionDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();
  const [deleteConcessionRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionApplicationMutation,
  });
  const [cancelConcessionRequest, { isLoading: isCancelling }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelConcessionRequestMutation,
  });

  const closeApproval = () => {
    if (isApproving) return;
    setApprovalRequest(null);
    setApprovalPreview(null);
    approvalCommandKey.current = '';
  };

  const reviewApproval = async () => {
    if (!approvalRequest || !approvalContext.data) return;
    if (
      !canDecideConcession(
        currentUserId,
        approvalRequest.requesterId,
        approvalRequest.submittedById
      )
    ) {
      closeApproval();
      return;
    }
    try {
      const preview = await previewApproval({
        concessionRequestId: approvalRequest.id,
        body: {
          requestConcurrencyStamp: approvalContext.data.requestConcurrencyStamp,
          previewFingerprint: approvalContext.data.previewFingerprint,
        },
      }).unwrap();
      setApprovalPreview({
        total: preview.totalApprovedAmount,
        requestConcurrencyStamp: preview.requestConcurrencyStamp,
        previewFingerprint: preview.previewFingerprint,
      });
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
      setApprovalPreview(null);
    }
  };

  const confirmApproval = async () => {
    if (!approvalRequest || !approvalPreview) return;
    if (
      !canDecideConcession(
        currentUserId,
        approvalRequest.requesterId,
        approvalRequest.submittedById
      )
    ) {
      closeApproval();
      return;
    }
    try {
      await approveRequest({
        studentConcessionTypeRequestId: approvalRequest.id,
        body: {
          requestConcurrencyStamp: approvalPreview.requestConcurrencyStamp,
          previewFingerprint: approvalPreview.previewFingerprint,
          idempotencyKey: (approvalCommandKey.current ||= window.crypto.randomUUID()),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Concession request approved successfully' });
      closeApproval();
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
      setApprovalPreview(null);
      approvalContext.refetch();
    }
  };

  const closeCancelDialog = () => {
    cancelConcessionDialog.onFalse();
    setSelectedConcession(null);
    setCancelReason('');
    setCancelReasonError('');
    cancelCommandKey.current = '';
  };

  const handleCancelRequest = async () => {
    const reason = cancelReason.trim();
    if (reason.length < 10) {
      setCancelReasonError('Reason must be at least 10 characters');
      return;
    }
    if (!selectedConcession) return;
    cancelCommandKey.current ||= window.crypto.randomUUID();
    try {
      await cancelConcessionRequest({
        studentConcessionTypeRequestId: selectedConcession.id,
        reason,
        requestConcurrencyStamp: selectedConcession.concurrencyStamp,
        idempotencyKey: cancelCommandKey.current,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Concession request cancelled successfully' });
      closeCancelDialog();
    } catch (error) {
      shikshaMitraToast.error({
        message: 'Unable to cancel the concession request. Refresh and try again.',
      });
    }
  };

  const {
    data: allConcessionData,
    isLoading: isLoadingConcessionData,
    isFetching: isFetchingConcessionData,
    isError: concessionError,
    refetch: refetchConcessions,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionApplicationsQuery,
    params: {
      academicYearId: filterPayload?.academicYearId,
      boardId: filterPayload?.boardId,
      educationMediumId: filterPayload?.educationMediumId,
      standardId:
        filterPayload?.standardId === 'All Classes' ? undefined : filterPayload?.standardId,
      divisionId:
        filterPayload?.divisionId === 'All Divisions' ? undefined : filterPayload?.divisionId,
      tab: tabs.value,
      page: page + 1,
      pageSize: tableQuery.rowsPerPage,
      search: tableQuery.search || undefined,
      filters: serializeFinanceTableFilters(tableQuery.filters),
      sortBy: tableQuery.sorts[0]?.column,
      sortOrder: tableQuery.sorts[0]?.direction,
    },
    options: {
      skip: !isReady,
    },
  });

  const tableData = useMemo(
    () => (allConcessionData?.items || []).map(toConcessionTableRow),
    [allConcessionData?.items]
  );

  const concessionCounts = useMemo(
    () => ({
      pending: (allConcessionData?.pendingCount ?? 0) + (allConcessionData?.draftCount ?? 0),
      approved:
        (allConcessionData?.approvedCount ?? 0) +
        (allConcessionData?.partiallyReversedCount ?? 0) +
        (allConcessionData?.reversedCount ?? 0),
      rejected: (allConcessionData?.rejectedCount ?? 0) + (allConcessionData?.cancelledCount ?? 0),
    }),
    [allConcessionData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: 'pending',
        count: concessionCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: 'approved',
        count: concessionCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: 'rejected',
        count: concessionCounts.rejected,
        color: 'error',
      },
    ],
    [concessionCounts]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FinanceAcademicContextFilter
            boards={boards}
            mediums={mediums}
            selectedBoard={selectedBoard}
            selectedMedium={selectedMedium}
            onBoardChange={setSelectedBoard}
            onMediumChange={setSelectedMedium}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
          <FinanceClassDivisionFilter
            classOptions={classOptions}
            divisionOptions={divisionOptions}
            selectedStandardId={selectedStandardId}
            selectedDivisionId={selectedDivisionId}
            isDivisionDisabled={isDivisionDisabled}
            onClassChange={setSelectedStandardId}
            onDivisionChange={setSelectedDivisionId}
            classesLoading={classesLoading}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
        </Box>
      </Card>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tabs
            value={tabs.value}
            onChange={(event, value) => {
              tabs.onChange(event, value);
              setTableQuery((previous) => ({
                ...previous,
                page: 0,
                filters: previous.filters.filter((filter) => filter.column !== 'status'),
              }));
            }}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
              px: 1
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={String(tab.value)}
                value={tab.value}
                sx={{ fontSize: '12px' }}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}
                    <Label color={tab.color as LabelColor}>{tab.count}</Label>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
      </Card>
      <CustomizableTable
        tableId="student-concession-table"
        tableTitle="Concessions"
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        isLoading={isLoadingConcessionData || isFetchingConcessionData}
        serverSidePagination
        maxServerRowsPerPage={100}
        serverSideSearch
        serverSideFilter
        serverSideSort
        serverSideSortMode="single"
        page={page}
        rowsPerPage={tableQuery.rowsPerPage}
        filters={tableQuery.filters}
        sorts={tableQuery.sorts}
        totalCount={allConcessionData?.totalCount ?? 0}
        onServerPagination={(nextPage, rowsPerPage) =>
          setTableQuery((previous) => ({ ...previous, page: nextPage - 1, rowsPerPage, scopeKey }))
        }
        onServerSearch={(search) => setTableQuery((previous) => ({ ...previous, page: 0, search }))}
        onServerFilter={(columnFilters) =>
          setTableQuery((previous) => ({ ...previous, page: 0, filters: columnFilters }))
        }
        onServerSort={(_column, sorts) =>
          setTableQuery((previous) => ({ ...previous, page: 0, sorts }))
        }
        errorContent={
          concessionError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => refetchConcessions()}>Retry</Button>}
            >
              Could not load concessions. Try again or clear the filters.
            </Alert>
          ) : undefined
        }
        columns={[
          {
            id: 'studentIdentity',
            label: 'Student (GR No.)',
            filterType: 'string',
            isFilter: true,
            align: 'left',
            sticky: true,
            stickyPosition: 'left',
            minWidth: 200,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            width: 140,
            minWidth: 140,
            maxWidth: 120,
            filterType: 'string',
            isFilter: true,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value ?? '-'}
              </Typography>
            ),
          },
          {
            id: 'classDivision',
            label: 'Class/Division',
            filterType: 'string',
            isFilter: true,
            align: 'left',
            minWidth: 150,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'concessionTypeName',
            label: 'Concession Type',
            filterType: 'string',
            isFilter: true,
            align: 'left',
            width: 160,
            minWidth: 140,
            maxWidth: 200,
          },
          {
            id: 'concessionAmount',
            label: 'Amount',
            filterType: 'number',
            isFilter: true,
            width: 130,
            minWidth: 110,
            maxWidth: 160,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value == null ? '-' : formatNumber(value, 'INR')}
              </Typography>
            ),
          },
          {
            id: 'createdAt',
            label: 'Requested On',
            filterType: 'date',
            isFilter: true,
            align: 'left',
            width: 180,
            minWidth: 180,
            maxWidth: 160,
            render: (value) =>
              value ? (
                <Typography variant="caption" fontSize="13px">
                  {dayjs(value).format('DD-MM-YYYY')}
                </Typography>
              ) : (
                '-'
              ),
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: concessionStatusOptions(String(tabs.value)),
            isFilter: true,
            isSort: false,
            sticky: true,
            stickyPosition: 'right',
            minWidth: 140,
            width: 140,
            render: (value) => (
              <Label color={ConcessionStatusTypeColors[value as ConcessionStatusType]}>
                {concessionStatusLabel(value)}
              </Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            width: 150,
            minWidth: 140,
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right',
            render: (value, row) => {
              const isDraft = row.status === ConcessionStatusType.Draft;
              const isPending = row.status === ConcessionStatusType.Pending;
              const isOwnRequest = Boolean(
                currentUserId &&
                (currentUserId.toLowerCase() === row.requesterId?.toLowerCase() ||
                  currentUserId.toLowerCase() === row.submittedById?.toLowerCase())
              );
              const canDecide = canDecideConcession(
                currentUserId,
                row.requesterId,
                row.submittedById
              );
              const decisionTooltip =
                !currentUserId || !row.requesterId
                  ? 'Decision identity is unavailable'
                  : 'You cannot approve or reject your own request';
              const serverAllows = (action: string) =>
                !row.availableActions?.length || row.availableActions.includes(action);
              const canCancelRow =
                canCancel &&
                serverAllows('cancel') &&
                (row.status === ConcessionStatusType.Draft ||
                  row.status === ConcessionStatusType.Pending);
              const canReplaceRow =
                canAdd &&
                serverAllows('create-replacement') &&
                (row.status === ConcessionStatusType.Rejected ||
                  row.status === ConcessionStatusType.Cancelled);
              return (
                <AdaptiveThreeDotsActions
                  placement="right-top"
                  moreLabel={`More actions for ${row.studentIdentity}`}
                  sx={{ justifyContent: 'flex-end' }}
                  actions={[
                    {
                      id: 'view',
                      label: `View ${row.studentIdentity}`,
                      icon: GlobalIcons.eye,
                      onClick: () => onViewConcession?.(row as IStudentInfo),
                    },
                    ...(isPending &&
                      canApprove &&
                      (row.availableActions?.includes('approve') || isOwnRequest)
                      ? [
                        {
                          id: 'approve',
                          label: `Approve ${row.studentIdentity}`,
                          icon: 'solar:check-circle-bold',
                          color: 'success.main',
                          disabled: !canDecide,
                          tooltip: !canDecide ? decisionTooltip : undefined,
                          onClick: () => {
                            setApprovalPreview(null);
                            setApprovalRequest(row as ConcessionApplication);
                          },
                        },
                      ]
                      : []),
                    ...(isPending &&
                      canReject &&
                      (row.availableActions?.includes('reject') || isOwnRequest)
                      ? [
                        {
                          id: 'reject',
                          label: `Reject ${row.studentIdentity}`,
                          icon: 'solar:close-circle-bold',
                          color: 'error.main',
                          disabled: !canDecide,
                          tooltip: !canDecide ? decisionTooltip : undefined,
                          onClick: () => onReject(row as IStudentInfo),
                        },
                      ]
                      : []),
                    ...(isDraft && canEdit && serverAllows('edit')
                      ? [
                        {
                          id: 'edit',
                          label: `Edit ${row.studentIdentity}`,
                          icon: GlobalIcons.edit,
                          onClick: () => onEditConcession?.(row as IStudentInfo),
                        },
                      ]
                      : []),
                    ...(isDraft && canDelete && serverAllows('delete')
                      ? [
                        {
                          id: 'delete',
                          label: `Delete ${row.studentIdentity}`,
                          icon: GlobalIcons.delete,
                          color: 'error.main',
                          onClick: () => {
                            setSelectedConcession(row as ConcessionApplication);
                            deleteCommandKey.current = window.crypto.randomUUID();
                            removeConcessionDialog.onTrue();
                          },
                        },
                      ]
                      : []),
                    ...(canCancelRow
                      ? [
                        {
                          id: 'cancel',
                          label: `Cancel request for ${row.studentIdentity}`,
                          icon: 'solar:close-circle-bold',
                          onClick: () => {
                            setSelectedConcession(row as ConcessionApplication);
                            cancelConcessionDialog.onTrue();
                          },
                        },
                      ]
                      : []),
                    ...(canReplaceRow
                      ? [
                        {
                          id: 'replace',
                          label: `Create replacement for ${row.studentIdentity}`,
                          icon: 'solar:copy-bold',
                          onClick: () =>
                            onRequestConcession?.({
                              ...(row as unknown as IStudentInfo),
                              id: undefined,
                              concessionRequestId: undefined,
                              studentConcessionTypeRequestId: undefined,
                              sourceRequestId: row.id,
                            }),
                        },
                      ]
                      : []),
                  ]}
                />
              );
            },
          },
        ]}
        data={tableData}
        noDataText={
          <>
            No concessions in this tab{' '}
            {canAdd && (
              <Button size="small" onClick={onAddConcession}>
                Request Concession
              </Button>
            )}
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(approvalRequest)}
        onClose={closeApproval}
        title="Approve concession request?"
        content={
          <Box>
            <Typography variant="body2">
              {approvalRequest?.studentName} · {approvalRequest?.concessionTypeName}
            </Typography>
            {approvalContext.isFetching ? (
              <Typography variant="body2">Checking current concession impact…</Typography>
            ) : approvalContext.isError ? (
              <Typography variant="body2" color="error.main">
                Unable to load the current impact. Close this dialog and try again.
              </Typography>
            ) : approvalPreview === null ? (
              <Typography variant="body2">
                Review the current fee impact before approving this request.
              </Typography>
            ) : (
              <Typography variant="body2">
                Approve {formatNumber(approvalPreview.total, 'INR')} in concessions? This updates
                the student’s fees.
              </Typography>
            )}
          </Box>
        }
        action={
          <LoadingButton
            startIcon={
              <Iconify
                icon={
                  approvalPreview === null
                    ? 'mdi:clipboard-text-search-outline'
                    : 'mdi:check-circle-outline'
                }
              />
            }
            variant="contained"
            color="success"
            size="small"
            loading={isPreviewingApproval || isApproving}
            disabled={
              !approvalContext.data || approvalContext.isFetching || approvalContext.isError
            }
            onClick={approvalPreview === null ? reviewApproval : confirmApproval}
          >
            {approvalPreview === null ? 'Review impact' : 'Confirm approve'}
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={removeConcessionDialog.value}
        onClose={() => {
          setSelectedConcession(null);
          removeConcessionDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete concession for{' '}
            <strong>&quot;{selectedConcession?.studentName}&quot;?</strong>
          </>
        }
        action={
          <Button
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              removeConcessionDialog.onFalse();
              if (selectedConcession) {
                confirmWithUndo({
                  item: selectedConcession,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                    dispatchFn(
                      concessionManagementApi.util.updateQueryData(
                        'getConcessionApplications',
                        {
                          boardId: selectedBoard,
                          educationMediumId: selectedMedium,
                        },
                        (draft) => {
                          const index = draft?.items?.findIndex(
                            (item: any) => item.id === selectedConcession.id
                          );
                          if (index !== -1) {
                            setDeleteIndex(index);
                            draft.items.splice(index, 1);
                          }
                        }
                      )
                    );
                    setSelectedConcession(null);
                  },
                  onUndoRestore: () => { },
                  onCommit: () => {
                    if (!deleteCommandKey.current) {
                      deleteCommandKey.current = window.crypto.randomUUID();
                    }

                    return deleteConcessionRequest({
                      concessionRequestId: selectedConcession.id,
                      requestConcurrencyStamp: selectedConcession.concurrencyStamp,
                      idempotencyKey: deleteCommandKey.current,
                    });
                  },
                });
              }
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomDialog
        open={cancelConcessionDialog.value}
        handleClose={closeCancelDialog}
        title="Cancel concession request"
        maxWidth="xs"
      >
        <DialogScrollContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation reason *"
            value={cancelReason}
            error={Boolean(cancelReasonError)}
            helperText={cancelReasonError || 'Enter 10 to 2000 characters.'}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            onChange={(event) => {
              setCancelReason(event.target.value);
              if (event.target.value.trim().length >= 10) setCancelReasonError('');
            }}
          />
        </DialogScrollContent>
        <DialogActions>
          <Button
            startIcon={<Iconify icon="mdi:close" />}
            variant="outlined"
            color="inherit"
            size="small"
            onClick={closeCancelDialog}
          >
            Close
          </Button>
          <LoadingButton
            startIcon={<Iconify icon="mdi:cancel" />}
            loading={isCancelling}
            variant="contained"
            color="error"
            size="small"
            onClick={handleCancelRequest}
          >
            Cancel request
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default StudentConcessionTable;
