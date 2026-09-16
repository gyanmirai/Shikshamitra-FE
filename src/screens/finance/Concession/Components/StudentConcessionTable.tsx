'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { ConcessionApplication } from 'src/redux/finance/ConcessionManagement/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import React, { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Button,
  MenuItem,
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
  useDeleteConcessionApplicationMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IStudentInfo } from '../type';

interface ICombinedProps {
  onRequestConcession?: (student: IStudentInfo) => void;
  onApprove: (data: IStudentInfo) => void;
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
  onApprove,
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
  const tabs = useTabs(ConcessionStatusType.Pending);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions = financePermissions.fees.concessionActions;
  const canAdd = hasGrantedPermission(permissions, actions.add);
  const canEdit = hasGrantedPermission(permissions, actions.edit);
  const canDelete = hasGrantedPermission(permissions, actions.delete);
  const canCancel = hasGrantedPermission(permissions, actions.cancel);
  const [selectedConcession, setSelectedConcession] = useState<ConcessionApplication | null>(null);
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
    },
    options: {
      skip: !isReady,
    },
  });

  const allItems = useMemo(() => allConcessionData?.items || [], [allConcessionData]);

  // Filter items by tab
  const filteredItems = useMemo(
    () => allItems.filter((item: any) => item.status === tabs.value),
    [allItems, tabs.value]
  );

  const concessionCounts = useMemo(
    () => ({
      pending: allConcessionData?.pendingCount ?? 0,
      draft: allConcessionData?.draftCount ?? 0,
      approved: allConcessionData?.approvedCount ?? 0,
      rejected: allConcessionData?.rejectedCount ?? 0,
      cancelled: allConcessionData?.cancelledCount ?? 0,
      partiallyReversed: allConcessionData?.partiallyReversedCount ?? 0,
      reversed: allConcessionData?.reversedCount ?? 0,
    }),
    [allConcessionData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Draft',
        value: ConcessionStatusType.Draft,
        count: concessionCounts.draft,
        color: 'default',
      },
      {
        label: 'Pending',
        value: ConcessionStatusType.Pending,
        count: concessionCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ConcessionStatusType.Approved,
        count: concessionCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ConcessionStatusType.Rejected,
        count: concessionCounts.rejected,
        color: 'error',
      },
      {
        label: 'Cancelled',
        value: ConcessionStatusType.Cancelled,
        count: concessionCounts.cancelled,
        color: 'error',
      },
      {
        label: 'Partially reversed',
        value: ConcessionStatusType.PartiallyReversed,
        count: concessionCounts.partiallyReversed,
        color: 'warning',
      },
      {
        label: 'Reversed',
        value: ConcessionStatusType.Reversed,
        count: concessionCounts.reversed,
        color: 'default',
      },
    ],
    [concessionCounts]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
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
        isLoading={isLoadingConcessionData || isFetchingConcessionData}
        columns={[
          {
            id: 'studentName',
            label: 'Name(Gr No.)',
            align: 'left',
            sticky: true,
            width: 150,
            minWidth: 100,
            maxWidth: 150,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.grNumber && `(${row.grNumber})`}
              </Typography>
            ),
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            width: 96,
            minWidth: 80,
            maxWidth: 120,
            filterType: 'number',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'standardName',
            label: 'Class/Div',
            align: 'left',
            width: 110,
            minWidth: 90,
            maxWidth: 140,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.divisionName && `(${row.divisionName})`}
              </Typography>
            ),
          },
          {
            id: 'concessionTypeName',
            label: 'Concession Type',
            align: 'left',
            width: 160,
            minWidth: 140,
            maxWidth: 200,
          },
          {
            id: 'concessionAmount',
            label: 'Amount',
            width: 130,
            minWidth: 110,
            maxWidth: 160,
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {formatNumber(value || 0, 'INR')}
              </Typography>
            ),
          },
          {
            id: 'createdAt',
            label: 'Requested On',
            align: 'left',
            width: 140,
            minWidth: 120,
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
            id: 'actions',
            label: 'Action',
            align: 'left',
            width: 80,
            minWidth: 64,
            isSort: false,
            isFilter: false,
            sticky: true,
            render: (value, row) => {
              const isDraft = row.status === ConcessionStatusType.Draft;
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
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showEditIcon={isDraft && canEdit && serverAllows('edit')}
                  showDeleteIcon={isDraft && canDelete && serverAllows('delete')}
                  handleDeleteClick={
                    isDraft && canDelete && serverAllows('delete')
                      ? () => {
                          setSelectedConcession(row as ConcessionApplication);
                          deleteCommandKey.current = window.crypto.randomUUID();
                          removeConcessionDialog.onTrue();
                        }
                      : undefined
                  }
                  showThreeDots={canCancelRow || canReplaceRow}
                  actions={({ popover }) => (
                    <>
                      {canCancelRow && (
                        <MenuItem
                          onClick={() => {
                            popover.onClose();
                            setSelectedConcession(row as ConcessionApplication);
                            cancelConcessionDialog.onTrue();
                          }}
                        >
                          <Iconify icon="solar:close-circle-bold" sx={{ mr: 1 }} />
                          Cancel request
                        </MenuItem>
                      )}
                      {canReplaceRow && (
                        <MenuItem
                          onClick={() => {
                            popover.onClose();
                            onRequestConcession?.({
                              ...(row as unknown as IStudentInfo),
                              id: undefined,
                              concessionRequestId: undefined,
                              studentConcessionTypeRequestId: undefined,
                              sourceRequestId: row.id,
                            });
                          }}
                        >
                          <Iconify icon="solar:copy-bold" sx={{ mr: 1 }} />
                          Create replacement
                        </MenuItem>
                      )}
                    </>
                  )}
                  handleEditClick={
                    isDraft && canEdit && serverAllows('edit')
                      ? () => onEditConcession?.(row as IStudentInfo)
                      : undefined
                  }
                  handleViewClick={() => onViewConcession?.(row as IStudentInfo)}
                />
              );
            },
          },
        ]}
        data={filteredItems}
        noDataText={
          <>
            No Concessions Found{' '}
            {canAdd && (
              <Box
                component="span"
                onClick={onAddConcession}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': { cursor: 'pointer', textDecoration: 'underline' },
                }}
              >
                Add Concession
              </Box>
            )}
          </>
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
                  onUndoRestore: () => {},
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
          <Button variant="outlined" color="inherit" size="small" onClick={closeCancelDialog}>
            Close
          </Button>
          <LoadingButton
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
