'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { LoadingButton } from 'src/components/loading-button';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { collectionPaymentDetails } from '../collectionPaymentDetails';
import { allocatePayment, selectedChargesInOrder } from './paymentAllocationUtils';

import type { IFeeCharge, IStudentFee, FeeCollectionFormValues } from '../../Components/type';

export type { AllocatedRow, AllocatedFeeRow, AllocatedChargeRow } from './paymentAllocationUtils';

export interface FeeCollectionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  formValues: FeeCollectionFormValues;
  student: IStudentFee | null;
  chargesData: IFeeCharge[];
  feeHeadMap: Record<string, string>;
  preserveAllocationOrder?: boolean;
  academicYear?: string;
  feeStructureName?: string;
  bankAccounts?: { id: string; name: string }[];
}

const FeeCollectionPreviewDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  formValues,
  student,
  chargesData,
  feeHeadMap,
  academicYear,
  feeStructureName,
  bankAccounts,
}: FeeCollectionPreviewDialogProps) => {
  const paidAmount = useMemo(() => {
    const amount = Number(String(formValues.payment.amount || 0).replace(/[₹,\s]/g, ''));
    return Number.isNaN(amount) ? 0 : amount;
  }, [formValues.payment.amount]);

  const { allocatedRows, unallocatedAmount } = useMemo(
    () =>
      allocatePayment(
        formValues.selectedItems,
        selectedChargesInOrder(chargesData, formValues.charges),
        feeHeadMap,
        paidAmount
      ),
    [formValues.selectedItems, formValues.charges, chargesData, feeHeadMap, paidAmount]
  );
  // Retain collection order, including unfunded selections and additional charges.
  const rows = allocatedRows.map((row) => ({
    ...row,
    id: `${row.type}:${row.key}`,
    name: row.type === 'fee' ? row.feeHeadName : row.chargeName,
    context:
      row.type === 'fee'
        ? [row.installmentLabel, row.period].filter(Boolean).join(' · ')
        : row.sourceType === 'LateFee'
          ? 'Late fee'
          : 'Additional charge',
  }));
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Fee head',
      rowHeader: true,
      minWidth: 180,
      render: (value: string, row: IData) => (
        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.context}
          </Typography>
        </Box>
      ),
    },
    ...(['originalAmount', 'paidAmount', 'remainingAmount'] as const).map((id, index) => ({
      id,
      label: ['Original', 'To collect', 'Balance after'][index],
      align: 'right' as const,
      minWidth: 100,
      render: (value: number) => formatNumber(value, 'INR'),
      cellSx: { fontVariantNumeric: 'tabular-nums' },
    })),
  ].map((column) => ({ ...column, isSort: false, isFilter: false }));
  const periods = [...new Set(formValues.selectedItems.map((item) => item.period).filter(Boolean))];
  const periodLabel =
    periods.length === 1
      ? dayjs(`${periods[0]}-01`).format('MMMM YYYY')
      : periods.length > 1
        ? `${periods.length} months`
        : 'Selected Charges';
  const details = Object.entries(
    collectionPaymentDetails(formValues.payment.paymentMethod, formValues.payment.details ?? {})
  ).filter(([, value]) => Boolean(value));
  const formatDetail = (key: string, value: unknown) => {
    if (key === 'bankAccount') return bankAccounts?.find((bank) => bank.id === value)?.name || '—';
    if (dayjs.isDayjs(value)) return value.format('DD/MM/YYYY');
    if (
      typeof value === 'string' &&
      (/^\d{4}-\d{2}-\d{2}/.test(value) || key.toLowerCase().includes('date'))
    ) {
      const date = dayjs(value);
      if (date.isValid()) return date.format('DD/MM/YYYY');
    }
    return String(value);
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      disableClose={loading}
      guardUnsavedChanges={false}
      maxWidth="md"
      hasForm={false}
      title="Review Payment"
      titleInfo="Review the student, payment evidence, and allocation before continuing to confirm collection."
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <Typography variant="subtitle1">
              {student?.name || formValues.studentName || 'Student'}
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Admission {student?.grNumber || student?.rollNumber || '—'}
              </Typography>
              {student?.className && (
                <Typography variant="body2" color="text.secondary">
                  {[student.className, student.division ? `Div ${student.division}` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              )}
              {academicYear && (
                <Typography variant="body2" color="text.secondary">
                  AY {academicYear}
                </Typography>
              )}
              {feeStructureName && (
                <Typography variant="body2" color="text.secondary">
                  {feeStructureName}
                </Typography>
              )}
            </Stack>
          </Box>
          <FormSectionCard
            title={periodLabel}
            icon={GlobalIcons.receiptIcon}
            iconSize={16}
            iconContainerSize={28}
            descriptionTooltip="Amounts allocated to selected fee installments and charges in collection order. Balance after shows the amount still due after this allocation."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            sx={{ pt: { xs: 1, sm: 1 }, boxShadow: 'none' }}
            action={
              <Box sx={{ textAlign: 'right', overflowWrap: 'anywhere' }}>
                <Typography variant="body2" color="text.secondary">
                  To collect
                </Typography>
                <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumber(paidAmount, 'INR')}
                </Typography>
              </Box>
            }
          >
            <CustomizableTable
              tableId="collection-payment-review-compact"
              tableTitle="Payment allocation"
              variant="embedded"
              columns={columns}
              data={rows}
              showToolbar={false}
              isPagination={false}
              isSearch={false}
              isFilter={false}
              isShowedDense={false}
              tableContainerProps={{ sx: { height: 'auto' } }}
            />
          </FormSectionCard>
          {(details.length > 0 || formValues.remarks) && (
            <DetailSection
              title="Payment Details"
              icon={GlobalIcons.documentIcon}
              helpText="Payment evidence and remarks entered for this collection."
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {details.map(([key, value]) => (
                  <DetailField
                    key={key}
                    label={key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (letter) => letter.toUpperCase())}
                    value={formatDetail(key, value)}
                  />
                ))}
                {formValues.remarks && (
                  <DetailField label="Remarks" value={formValues.remarks} fullWidth />
                )}
              </Box>
            </DetailSection>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
        {unallocatedAmount > 0 && (
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ mr: 'auto', width: { xs: '100%', sm: 'auto' } }}
          >
            {formatNumber(unallocatedAmount, 'INR')} unallocated
          </Typography>
        )}
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          disabled={loading}
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          type="button"
          variant="contained"
          color="inherit"
          loading={loading}
          disabled={loading}
          loadingPosition="start"
          onClick={() => {
            if (!loading) onConfirm();
          }}
          startIcon={<Iconify icon={GlobalIcons.receiptIcon} width={18} />}
          size="small"
        >
          Collect {formatNumber(paidAmount, 'INR')}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default FeeCollectionPreviewDialog;
