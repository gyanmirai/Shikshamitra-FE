'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { LoadingButton } from 'src/components/loading-button';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailField, DetailSection } from 'src/screens/finance/components/detail-view';

import { collectionPaymentDetails } from '../collectionPaymentDetails';
import { paymentMethodsConfig } from '../../Components/paymentConfigMethods';
import {
  allocatePayment,
  selectedChargesInOrder,
  summarizeFundedAllocations,
} from './paymentAllocationUtils';

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
  oneTimeFeeHeadIds?: ReadonlySet<string>;
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
  oneTimeFeeHeadIds,
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
  const rows = summarizeFundedAllocations(allocatedRows, oneTimeFeeHeadIds);
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Fee head',
      rowHeader: true,
      minWidth: 180,
      render: (value: string, row: IData) => (
        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">{value}</Typography>
            {row.oneTime && <Label>One time</Label>}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {row.context ?? row.periods.join(' · ')}
          </Typography>
        </Box>
      ),
    },
    ...(['originalAmount', 'paidAmount'] as const).map((id, index) => ({
      id,
      label: ['Original', 'To collect'][index],
      align: 'right' as const,
      minWidth: 100,
      render: (value: number) => formatNumber(value, 'INR'),
      cellSx: { fontVariantNumeric: 'tabular-nums' },
    })),
  ].map((column) => ({ ...column, isSort: false, isFilter: false }));
  const periods = [...new Set(rows.flatMap((row) => row.periods))];
  const periodLabel =
    periods.length === 1
      ? periods[0]
      : periods.length > 1
        ? `${periods.length} months`
        : 'Selected Charges';
  const { paymentMethod, details: paymentDetails } = formValues.payment;
  const isCash = paymentMethod === 'Cash';
  const details = Object.entries(
    collectionPaymentDetails(paymentMethod, paymentDetails ?? {})
  ).filter(([, value]) => Boolean(value));
  const methodFields = paymentMethodsConfig[paymentMethod as keyof typeof paymentMethodsConfig];
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
      titleInfo="Review the student, payment evidence, and allocation before recording collection."
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
            descriptionTooltip="Each funded fee head appears once. Original shows the amounts for the installments and charges included in this payment."
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
          {(!isCash || details.length > 0 || formValues.remarks) && (
            <DetailSection
              title={isCash ? 'Payment Details' : 'Reference Details'}
              icon={isCash ? GlobalIcons.documentIcon : GlobalIcons.bankAccount}
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
                {!isCash && <DetailField label="Payment method" value={paymentMethod} />}
                {details.map(([key, value]) => (
                  <DetailField
                    key={key}
                    label={
                      key === 'bankAccount'
                        ? 'Receiving School Bank Account'
                        : methodFields?.find((field) => field.name === key)?.label ??
                          key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (letter) => letter.toUpperCase())
                    }
                    value={formatDetail(key, value)}
                  />
                ))}
                {formValues.remarks && (
                  <DetailField label="Remarks" value={formValues.remarks} fullWidth />
                )}
              </Box>
            </DetailSection>
          )}
          {!isCash && (
            <Typography variant="body2" color="text.secondary">
              Finance will verify this payment in Reconciliation before issuing the official receipt.
            </Typography>
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
          {isCash
            ? `Collect ${formatNumber(paidAmount, 'INR')}`
            : 'Record & issue provisional receipt'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default FeeCollectionPreviewDialog;
