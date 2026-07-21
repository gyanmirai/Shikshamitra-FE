'use client';

import type { RootState } from 'src/redux/store';

import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Alert,
  Stack,
  Button,
  Dialog,
  Drawer,
  Select,
  MenuItem,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  useGetPaymentTermsQuery,
  type PaymentTermListItem,
  useLazyGetPaymentTermsQuery,
  useDeletePaymentTermMutation,
  useClonePaymentTermsMutation,
} from 'src/redux/finance/paymentTerm';

import PaymentTermForm from './Components/PaymentTermForm';
import PaymentTermTable from './Components/PaymentTermTable';

import type { IPaymentTerm } from './type';

// ---------------------------------------------------------------------------
// Map list API item → table/form row shape
// ---------------------------------------------------------------------------
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
  isDefaultTerm: item.isDefault,
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'Immediately',
  demandOffsetDays: null,
  initialDemandStatus: 'Draft',
  currentVersionNumber: item.currentVersionNumber,
  isUsedInDownstream: item.referencedStructureCount > 0,
  canDirectEdit: item.canDirectEdit,
});

// ---------------------------------------------------------------------------
// PaymentTerm screen — orchestrates table, drawer, delete dialog, clone dialog
// ---------------------------------------------------------------------------
const PaymentTerm = () => {
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<IPaymentTerm | null>(null);

  const addPaymentTermDrawer = useBoolean();
  const deletePaymentTermDialog = useBoolean();
  const cloneDialog = useBoolean();

  const [cloneSourceYearId, setCloneSourceYearId] = useState('');

  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const targetAcademicYearId = currentYear?.id ?? '';

  // ── API ────────────────────────────────────────────────────────────────────
  const {
    data: paymentTerms,
    isLoading: isPaymentTermLoading,
    isFetching: isPaymentTermFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentTermsQuery,
    params: { academicYearId: targetAcademicYearId, pageSize: 100 },
  });

  const [fetchSourceTerms] = useLazyGetPaymentTermsQuery();

  const [deletePaymentTerm, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletePaymentTermMutation,
  });

  const [clonePaymentTerms, { isLoading: isCloning }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useClonePaymentTermsMutation,
  });

  // ── Drawer close ──────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handleClose is passed as onClose prop to PaymentTermForm inside the Drawer.
   * A stable reference prevents PaymentTermForm from re-rendering when unrelated
   * state in this parent (e.g. cloneSourceYearId) changes.
   */
  const handleClose = useCallback(
    (_e?: React.SyntheticEvent | null, isSubmit?: boolean) => {
      addPaymentTermDrawer.onFalse();
      setSelectedPaymentTerm(null);
      if (isSubmit) {
        refetch();
      }
    },
    [addPaymentTermDrawer, refetch]
  );

  // ── Clone submit ───────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handleCloneSubmit is passed as onClick to the Clone Now button inside the
   * Dialog. Stable reference avoids re-creating the handler on each render.
   */
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

      const paymentTermIds = (sourceList.items ?? []).map((t) => t.id);
      if (paymentTermIds.length === 0) {
        shikshaMitraToast.error({ message: 'No payment terms found in the source year.' });
        return;
      }

      await clonePaymentTerms({
        sourceAcademicYearId: cloneSourceYearId,
        targetAcademicYearId,
        paymentTermIds,
      });
      shikshaMitraToast.success({ message: 'Payment terms cloned successfully.' });
      cloneDialog.onFalse();
      setCloneSourceYearId('');
      refetch();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to clone payment terms.' });
    }
  }, [
    cloneDialog,
    clonePaymentTerms,
    cloneSourceYearId,
    fetchSourceTerms,
    refetch,
    targetAcademicYearId,
  ]);

  // ── Delete confirm ────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handleDeleteConfirm is passed as onClick prop into ConfirmDialog's action
   * button. Lifting it out of JSX into useCallback prevents the action element
   * from being recreated on every render of this parent component.
   */
  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deletePaymentTerm(selectedPaymentTerm?.id);
      shikshaMitraToast.success({
        message: `Payment term "${selectedPaymentTerm?.paymentTermName}" deleted successfully.`,
      });
      refetch();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to delete payment term.' });
    }
    deletePaymentTermDialog.onFalse();
    setSelectedPaymentTerm(null);
  }, [deletePaymentTerm, deletePaymentTermDialog, refetch, selectedPaymentTerm]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const tableData: IPaymentTerm[] = useMemo(() => {
    const items = paymentTerms?.items ?? (Array.isArray(paymentTerms) ? paymentTerms : []);
    return items.map((item: PaymentTermListItem | IPaymentTerm) =>
      'name' in item && !('paymentTermName' in item)
        ? mapListItemToPaymentTerm(item as PaymentTermListItem)
        : (item as IPaymentTerm)
    );
  }, [paymentTerms]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Payment Terms"
        description="Configure academic-year-based installment schedules, automatic due dates, reminder dates, and grace days."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Payment Terms' },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={cloneDialog.onTrue}
              size="small"
              startIcon={<Iconify icon="mdi:content-copy" />}
              variant="outlined"
            >
              Clone Previous Year
            </Button>
            <Button
              onClick={() => {
                setSelectedPaymentTerm(null);
                addPaymentTermDrawer.onTrue();
              }}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '24px' }}
            >
              Payment Term
            </Button>
          </Stack>
        }
      />

      {/* Main Table */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PaymentTermTable
          data={tableData}
          loading={isPaymentTermLoading || isPaymentTermFetching}
          addPaymentTerm={addPaymentTermDrawer}
          setEditData={setSelectedPaymentTerm}
          onEdit={(data) => {
            setSelectedPaymentTerm(data);
            addPaymentTermDrawer.onTrue();
          }}
          onDelete={(data) => {
            setSelectedPaymentTerm(data);
            deletePaymentTermDialog.onTrue();
          }}
        />
      </Box>

      {/* Add / Edit Drawer */}
      <Drawer
        anchor="right"
        open={addPaymentTermDrawer.value}
        onClose={() => handleClose(null, false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' },
        }}
      >
        <PaymentTermForm
          open={addPaymentTermDrawer.value}
          onClose={handleClose}
          editData={selectedPaymentTerm}
        />
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deletePaymentTermDialog.value}
        icon="warning"
        onClose={() => {
          deletePaymentTermDialog.onFalse();
          setTimeout(() => setSelectedPaymentTerm(null), 200);
        }}
        title="Delete Payment Term"
        content={
          <>
            Are you sure you want to delete payment term{' '}
            <strong>{selectedPaymentTerm?.paymentTermName}</strong>?
            {selectedPaymentTerm?.isUsedInDownstream && (
              <Box mt={1} color="error.main" fontSize="12px">
                This payment term is currently assigned to fee structures and cannot be deleted.
              </Box>
            )}
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting || Boolean(selectedPaymentTerm?.isUsedInDownstream)}
            onClick={handleDeleteConfirm}
          >
            Yes, Delete
          </Button>
        }
      />

      {/* Clone Previous Academic Year */}
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
                onChange={(e) => setCloneSourceYearId(e.target.value)}
              >
                {academicYears
                  ?.filter((y: { id: string; name: string }) => y.id !== targetAcademicYearId)
                  ?.map((y: { id: string; name: string }) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" variant="outlined" onClick={cloneDialog.onFalse}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={isCloning || !cloneSourceYearId}
            onClick={handleCloneSubmit}
          >
            Clone Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentTerm;
