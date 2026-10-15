'use client';

import type { RootState } from 'src/redux/store';
import type { PaymentTermListItem } from 'src/redux/finance/paymentTerm';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  useGetPaymentTermsQuery,
  usePublishVersionMutation,
  useLazyGetPaymentTermsQuery,
  useDeletePaymentTermMutation,
  useClonePaymentTermsMutation,
  useArchivePaymentTermMutation,
  useRestorePaymentTermMutation,
  useLazyGetPaymentTermByIdQuery,
} from 'src/redux/finance/paymentTerm';

import PaymentTermForm from './Components/PaymentTermForm';
import PaymentTermTable from './Components/PaymentTermTable';
import PaymentTermDetailsDrawer from './Components/PaymentTermDetailsDrawer';

import type { IPaymentTerm } from './type';
import type { IBoard } from './hooks/usePaymentTermForm';

type PaymentTermArchiveView = 'current' | 'archived';
type PaymentTermDetailsTab = 'details' | 'versions';

interface PaymentTermTableQuery {
  page: number;
  pageSize: number;
  search: string;
}

interface PaymentTermDetailsTarget {
  id: string;
  tab: PaymentTermDetailsTab;
}

const mapListItemToPaymentTerm = (item: PaymentTermListItem): IPaymentTerm => ({
  id: item.id,
  paymentTermName: item.name,
  paymentTermCode: item.code,
  boardId: item.boardId,
  description: '',
  status: item.status,
  academicYearId: item.academicYearId,
  totalInstallments: item.installmentCount,
  installments: [],
  invoiceCreationEnabled: true,
  isDefaultTerm: item.isDefault,
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'OnInstallmentStartDate',
  demandOffsetDays: null,
  initialDemandStatus: 'Draft',
  currentVersionNumber: item.currentVersionNumber,
  currentVersionStatus: item.hasDraft
    ? 'Draft'
    : item.hasPublishedVersion
      ? 'Published'
      : undefined,
  hasDraft: item.hasDraft,
  isUsedInDownstream: item.referencedStructureCount > 0,
  canDirectEdit: item.canDirectEdit,
});

const PaymentTerm = () => {
  const [archiveView, setArchiveView] = useState<PaymentTermArchiveView>('current');
  const [tableQuery, setTableQuery] = useState<PaymentTermTableQuery>({
    page: 1,
    pageSize: 10,
    search: '',
  });
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<IPaymentTerm | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<PaymentTermDetailsTarget | null>(null);
  const [publishTarget, setPublishTarget] = useState<PaymentTermListItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<PaymentTermListItem | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [cloneSourceYearId, setCloneSourceYearId] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');

  const addPaymentTermDrawer = useBoolean();
  const deletePaymentTermDialog = useBoolean();
  const cloneDialog = useBoolean();

  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const { data: boardData, isLoading: boardsLoading } = useGetBoardsQuery('');
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const paymentTermPermissions = financePermissions.fees.settings.paymentTermActions;
  const canView = hasGrantedPermission(permissions, paymentTermPermissions.view);
  const canCreate = hasGrantedPermission(permissions, paymentTermPermissions.create);
  const canEdit = hasGrantedPermission(permissions, paymentTermPermissions.edit);
  const canPublish = hasGrantedPermission(permissions, paymentTermPermissions.publish);
  const canArchive = hasGrantedPermission(permissions, paymentTermPermissions.archive);
  const canRestore = hasGrantedPermission(permissions, paymentTermPermissions.restore);
  const canClone = hasGrantedPermission(permissions, paymentTermPermissions.clone);
  const canDelete = hasGrantedPermission(permissions, paymentTermPermissions.delete);
  const targetAcademicYearId = currentYear?.id ?? '';
  const isArchived = archiveView === 'archived';
  const boards = useMemo<IBoard[]>(() => {
    if (!boardData?.items || !targetAcademicYearId) return [];
    return boardData.items.filter((board: IBoard) => board.academicYearId === targetAcademicYearId);
  }, [boardData?.items, targetAcademicYearId]);

  useEffect(() => {
    if (boards.some((board) => board.id === selectedBoardId)) return;
    setSelectedBoardId(boards[0]?.id ?? '');
    setTableQuery((current) => ({ ...current, page: 1 }));
  }, [boards, selectedBoardId]);

  const paymentTermPage = useGetPaymentTermsQuery(
    {
      academicYearId: targetAcademicYearId,
      boardId: selectedBoardId,
      status: isArchived ? 'Archived' : 'Active',
      includeArchived: isArchived,
      search: tableQuery.search || undefined,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
    },
    { skip: !targetAcademicYearId || !selectedBoardId || !canView }
  );
  const archivedSummary = useGetPaymentTermsQuery(
    {
      academicYearId: targetAcademicYearId,
      boardId: selectedBoardId,
      status: 'Archived',
      includeArchived: true,
      page: 1,
      pageSize: 1,
    },
    { skip: !targetAcademicYearId || !selectedBoardId || !canView }
  );

  const [fetchSourceTerms] = useLazyGetPaymentTermsQuery();
  const [fetchPaymentTermById] = useLazyGetPaymentTermByIdQuery();
  const [deletePaymentTerm, deleteState] = useDeletePaymentTermMutation();
  const [clonePaymentTerms, cloneState] = useClonePaymentTermsMutation();
  const [publishVersion, publishState] = usePublishVersionMutation();
  const [archivePaymentTerm, archiveState] = useArchivePaymentTermMutation();
  const [restorePaymentTerm, restoreState] = useRestorePaymentTermMutation();

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | null, isSubmit?: boolean) => {
      addPaymentTermDrawer.onFalse();
      setSelectedPaymentTerm(null);
      if (isSubmit) paymentTermPage.refetch();
    },
    [addPaymentTermDrawer, paymentTermPage]
  );

  const handleCloneSubmit = useCallback(async () => {
    if (!cloneSourceYearId) {
      shikshaMitraToast.error({ message: 'Please select a source academic year.' });
      return;
    }

    try {
      const sourceList = await fetchSourceTerms({
        academicYearId: cloneSourceYearId,
        pageSize: 1000,
        includeArchived: false,
      }).unwrap();
      const paymentTermIds = sourceList.items.map((term) => term.id);

      if (paymentTermIds.length === 0) {
        shikshaMitraToast.error({ message: 'No payment terms found in the source year.' });
        return;
      }

      await clonePaymentTerms({
        sourceAcademicYearId: cloneSourceYearId,
        targetAcademicYearId,
        paymentTermIds,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Payment terms cloned successfully.' });
      cloneDialog.onFalse();
      setCloneSourceYearId('');
    } catch {
      shikshaMitraToast.error({ message: 'Failed to clone payment terms.' });
    }
  }, [cloneDialog, clonePaymentTerms, cloneSourceYearId, fetchSourceTerms, targetAcademicYearId]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedPaymentTerm?.id) return;

    try {
      await deletePaymentTerm(selectedPaymentTerm.id).unwrap();
      shikshaMitraToast.success({
        message: `Payment term "${selectedPaymentTerm.paymentTermName}" deleted successfully.`,
      });
      deletePaymentTermDialog.onFalse();
      setSelectedPaymentTerm(null);
    } catch {
      shikshaMitraToast.error({ message: 'Failed to delete payment term.' });
    }
  }, [deletePaymentTerm, deletePaymentTermDialog, selectedPaymentTerm]);

  const handlePublishConfirm = useCallback(async () => {
    if (!publishTarget) return;

    try {
      const detail = await fetchPaymentTermById(publishTarget.id).unwrap();
      const draftVersion = detail.versions.find(
        (version) =>
          version.status === 'Draft' && version.versionNumber === publishTarget.currentVersionNumber
      );

      if (!draftVersion) {
        shikshaMitraToast.error({ message: 'The draft version is no longer available.' });
        setPublishTarget(null);
        return;
      }

      await publishVersion({
        paymentTermId: publishTarget.id,
        versionId: draftVersion.id,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Version ${draftVersion.versionNumber} of "${publishTarget.name}" published successfully.`,
      });
      setPublishTarget(null);
    } catch {
      shikshaMitraToast.error({ message: 'Failed to publish the payment term version.' });
    }
  }, [fetchPaymentTermById, publishTarget, publishVersion]);

  const handleArchiveConfirm = useCallback(async () => {
    const reason = archiveReason.trim();
    if (!archiveTarget || !reason) return;

    try {
      await archivePaymentTerm({
        paymentTermId: archiveTarget.id,
        body: { reason },
      }).unwrap();
      shikshaMitraToast.success({
        message: `Payment term "${archiveTarget.name}" archived successfully.`,
      });
      setArchiveTarget(null);
      setArchiveReason('');
    } catch {
      shikshaMitraToast.error({ message: 'Failed to archive the payment term.' });
    }
  }, [archivePaymentTerm, archiveReason, archiveTarget]);

  const handleRestore = useCallback(
    async (term: PaymentTermListItem) => {
      try {
        await restorePaymentTerm(term.id).unwrap();
        shikshaMitraToast.success({
          message: `Payment term "${term.name}" restored successfully.`,
        });
      } catch {
        shikshaMitraToast.error({ message: 'Failed to restore the payment term.' });
      }
    },
    [restorePaymentTerm]
  );

  const actionLoading =
    deleteState.isLoading ||
    publishState.isLoading ||
    archiveState.isLoading ||
    restoreState.isLoading;

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Payment Terms"
        description="Configure board-period installment schedules, billing dates, and versioned Draft/Active terms."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Payment Terms' },
        ]}
      />

      <Card sx={{ p: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
          >
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 300 } }}>
              <InputLabel id="payment-term-board-filter-label">Education Board</InputLabel>
              <Select
                labelId="payment-term-board-filter-label"
                label="Education Board"
                value={selectedBoardId}
                disabled={boardsLoading || boards.length === 0}
                onChange={(event) => {
                  setSelectedBoardId(event.target.value);
                  setTableQuery((current) => ({ ...current, page: 1 }));
                }}
              >
                {boards.map((board) => (
                  <MenuItem key={board.id} value={board.id}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={!isArchived ? 'contained' : 'outlined'}
                onClick={() => {
                  setTableQuery((current) => ({ ...current, page: 1 }));
                  setArchiveView('current');
                }}
              >
                Current
              </Button>
              <Button
                size="small"
                variant={isArchived ? 'contained' : 'outlined'}
                onClick={() => {
                  setTableQuery((current) => ({ ...current, page: 1 }));
                  setArchiveView('archived');
                }}
              >
                Archived ({archivedSummary.data?.totalCount ?? 0})
              </Button>
            </Stack>
          </Stack>

          {!isArchived ? (
            <Stack direction="row" spacing={1}>
              {canClone ? (
                <Button
                  onClick={cloneDialog.onTrue}
                  size="small"
                  startIcon={<Iconify icon="mdi:content-copy" />}
                  variant="outlined"
                >
                  Clone Previous Year
                </Button>
              ) : null}
              {canCreate ? (
                <Button
                  onClick={() => {
                    setSelectedPaymentTerm(null);
                    addPaymentTermDrawer.onTrue();
                  }}
                  size="small"
                  startIcon={<Add />}
                  variant="contained"
                >
                  New Payment Term
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Card>

      {paymentTermPage.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => paymentTermPage.refetch()}>
              Retry
            </Button>
          }
        >
          Unable to load payment terms.
        </Alert>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PaymentTermTable
          data={paymentTermPage.data?.items ?? []}
          totalCount={paymentTermPage.data?.totalCount ?? 0}
          loading={paymentTermPage.isLoading || paymentTermPage.isFetching}
          page={tableQuery.page}
          rowsPerPage={tableQuery.pageSize}
          searchTerm={tableQuery.search}
          archived={isArchived}
          onPaginationChange={(page, pageSize) =>
            setTableQuery((current) => ({ ...current, page, pageSize }))
          }
          onSearchChange={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
          onView={(term) => setDetailsTarget({ id: term.id, tab: 'details' })}
          onVersionHistory={(term) => setDetailsTarget({ id: term.id, tab: 'versions' })}
          onEdit={(term) => {
            setSelectedPaymentTerm(mapListItemToPaymentTerm(term));
            addPaymentTermDrawer.onTrue();
          }}
          onDelete={(term) => {
            setSelectedPaymentTerm(mapListItemToPaymentTerm(term));
            deletePaymentTermDialog.onTrue();
          }}
          onPublish={setPublishTarget}
          onArchive={(term) => {
            setArchiveTarget(term);
            setArchiveReason('');
          }}
          onRestore={handleRestore}
          canView={canView}
          canEdit={canEdit}
          canPublish={canPublish}
          canArchive={canArchive}
          canRestore={canRestore}
          canDelete={canDelete}
          actionLoading={actionLoading}
        />
      </Box>

      <PaymentTermForm
        open={addPaymentTermDrawer.value}
        onClose={handleClose}
        editData={selectedPaymentTerm}
      />

      <PaymentTermDetailsDrawer
        open={Boolean(detailsTarget)}
        paymentTermId={detailsTarget?.id ?? null}
        initialTab={detailsTarget?.tab ?? 'details'}
        onClose={() => setDetailsTarget(null)}
      />

      <ConfirmDialog
        open={deletePaymentTermDialog.value}
        icon="warning"
        onClose={() => {
          deletePaymentTermDialog.onFalse();
          setSelectedPaymentTerm(null);
        }}
        title="Delete Payment Term"
        content={
          <>
            Delete payment term <strong>{selectedPaymentTerm?.paymentTermName}</strong>? Only an
            unused first draft can be deleted.
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={deleteState.isLoading}
            onClick={handleDeleteConfirm}
          >
            Delete
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={Boolean(publishTarget)}
        icon="warning"
        onClose={() => setPublishTarget(null)}
        title="Activate Payment Term"
        content={
          <>
            Activate <strong>{publishTarget?.name}</strong> using version{' '}
            <strong>v{publishTarget?.currentVersionNumber}</strong>? Once active, this schedule is
            available for fee structures.
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            variant="contained"
            size="small"
            loading={publishState.isLoading}
            onClick={handlePublishConfirm}
          >
            Activate
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        icon="warning"
        onClose={() => {
          setArchiveTarget(null);
          setArchiveReason('');
        }}
        title="Archive Payment Term"
        content={
          <Stack spacing={2}>
            <Box>
              Archive <strong>{archiveTarget?.name}</strong>? It will no longer be available for new
              fee structures.
            </Box>
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              minRows={2}
              label="Archive reason"
              value={archiveReason}
              inputProps={{ maxLength: 500 }}
              onChange={(event) => setArchiveReason(event.target.value)}
            />
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:archive-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={archiveState.isLoading}
            disabled={!archiveReason.trim()}
            onClick={handleArchiveConfirm}
          >
            Archive
          </LoadingButton>
        }
      />

      <Dialog open={cloneDialog.value} onClose={cloneDialog.onFalse} maxWidth="xs" fullWidth>
        <DialogTitle>Clone Previous Year Payment Terms</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Cloning will copy all payment terms and their installments from the selected source
              year into the current target year ({currentYear?.name ?? 'Current Year'}).
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Source Academic Year</InputLabel>
              <Select
                label="Source Academic Year"
                value={cloneSourceYearId}
                onChange={(event) => setCloneSourceYearId(event.target.value)}
              >
                {academicYears
                  ?.filter((year: { id: string; name: string }) => year.id !== targetAcademicYearId)
                  ?.map((year: { id: string; name: string }) => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={cloneDialog.onFalse}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={cloneState.isLoading}
            startIcon={<Iconify icon="mdi:content-copy" />}
            disabled={!cloneSourceYearId}
            onClick={handleCloneSubmit}
          >
            Clone Now
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentTerm;
