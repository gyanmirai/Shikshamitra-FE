import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Box } from '@mui/system';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { fDate, formatStr } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Button, TextField, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';
import {
  useGetReconciliationListQuery,
  useRejectReconciliationMutation,
  useApproveReconciliationMutation,
  useDownloadReconciliationReceiptPdfMutation,
} from 'src/redux/finance/reconciliation';

import ReconciliationReceiptDialog from './ReconciliationReceiptDialog';

const DemandDraftTable = ({
  queryParams,
}: {
  queryParams?: { academicYearId: string; month: number; year: number; paymentMethod: string };
}) => {
  const [isClearCheck, setIsClearCheck] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptFileName, setReceiptFileName] = useState('Receipt.pdf');
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const isDialog = useBoolean(false);

  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canApproveReject = permissions.some(
    (perm: any) => perm.name === financePermissions.accounts.reconciliationAdd && perm.isGranted
  );

  const {
    data: listResponse,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  const [downloadReceiptPdf] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReconciliationReceiptPdfMutation,
    popupConfig: {
      error: true,
      errorMessage: 'Unable to load receipt',
      success: false,
    },
  });

  const data = useMemo(
    () =>
      (listResponse?.items ?? []).map((item: any) => ({
        ...item,
        standardName: item.class,
        divisionName: item.division,
        ddNumber: item.instrumentDetails?.ddNumber,
        bankName: item.instrumentDetails?.issuingBankName || item.instrumentDetails?.branchName,
        ddIssueDate: item.instrumentDetails?.ddDate,
        paymentDate: item.instrumentDetails?.paymentDate ?? item.paymentDate,
      })),
    [listResponse?.items]
  );

  useEffect(() => {
    if (!isLoading && listResponse && (listResponse.items ?? []).length === 0) {
      const monthYear = queryParams
        ? dayjs(`${queryParams.year}-${String(queryParams.month).padStart(2, '0')}-01`).format(
            'MMM-YYYY'
          )
        : '';
      const academicYear = (currentYear as any)?.name ?? '';
      shikshaMitraToast.warning({
        message: `No Demand Draft records found for ${monthYear}${academicYear ? ` (${academicYear})` : ''}. Please change the month or academic year.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, listResponse]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        stickyPosition: 'left',
        id: 'studentName',
        label: 'Name(Gr No.)',

        width: 180,
        minWidth: 150,
        maxWidth: 220,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        sticky: true,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.grNumber && `(${row.grNumber})`}
          </Typography>
        ),
      },
      {
        id: 'board',
        label: 'Board/Medium',
        width: 120,
        minWidth: 100,
        maxWidth: 180,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.medium && `- (${row.medium})`}
          </Typography>
        ),
      },
      {
        id: 'standardName',
        label: 'Class/Div',
        align: 'left',
        width: 150,
        minWidth: 130,
        maxWidth: 180,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.divisionName && `- (${row.divisionName})`}
          </Typography>
        ),
      },
      {
        id: 'ddNumber',
        label: 'DD Number',
        width: 140,
        minWidth: 120,
        maxWidth: 180,
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'bankName',
        label: 'Bank Name',
        width: 150,
        minWidth: 130,
        maxWidth: 190,
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'amount',
        label: 'Amount',
        width: 96,
        minWidth: 80,
        maxWidth: 120,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'ddIssueDate',
        label: 'DD Issue Date',
        width: 190,
        minWidth: 190,
        maxWidth: 210,
        align: 'left',
        isFilter: true,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value && dayjs(value).isValid() ? fDate(value, formatStr.paramCase.date) : '-'}
          </Typography>
        ),
      },
      {
        id: 'paymentDate',
        label: 'Payment Date',
        width: 190,
        minWidth: 190,
        maxWidth: 210,
        align: 'left',
        isFilter: true,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value && dayjs(value).isValid() ? fDate(value, formatStr.paramCase.date) : '-'}
          </Typography>
        ),
      },
      {
        id: 'remarks',
        label: 'Remarks',
        width: 220,
        minWidth: 180,
        maxWidth: 280,
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        stickyPosition: 'right',
        id: 'status',
        sticky: true,
        label: 'Status',
        width: 110,
        minWidth: 100,
        maxWidth: 140,
        align: 'left',
        isFilter: true,
        filterType: 'enum',
        enumOptions: PaymentMethodsStatusOptions,
        render(value, row) {
          const color = PamentMethodsStatusColor[value as PaymentMethodsStatusType] as LabelColor;
          return <Label color={color}>{PaymentMethodsStatusType[value]}</Label>;
        },
      },
      {
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        align: 'left',
        width: 150,
        minWidth: 80,
        maxWidth: 150,
        render(value, row: any) {
          const handleDownloadReceipt = async () => {
            setSelectedReceipt(row);
            setReceiptLoading(true);
            setReceiptBlobUrl(null);
            setReceiptDialogOpen(true);

            try {
              const { blob, fileName } = await downloadReceiptPdf({
                receiptId:
                  row?.status === PaymentMethodsStatusType.Approved
                    ? row?.finalReceiptId
                    : row?.provisionalReceiptId,
              }).unwrap();
              setReceiptFileName(fileName);
              const objectUrl = URL.createObjectURL(blob);
              setReceiptBlobUrl(objectUrl);
            } catch {
              setReceiptBlobUrl(null);
            } finally {
              setReceiptLoading(false);
            }
          };

          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              actions={[
                ...(row.status !== PaymentMethodsStatusType.Approved &&
                row.status !== PaymentMethodsStatusType.Rejected &&
                canApproveReject
                  ? [
                      {
                        id: 'approve',
                        label: 'Approve Demand Draft',
                        icon: 'mdi:check-decagram',
                        color: 'success.main',
                        onClick: () => {
                          setIsClearCheck(false);
                          setSelectedEntry({ ...row, type: 'approve' });
                          isDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                ...(row.status !== PaymentMethodsStatusType.Approved &&
                row.status !== PaymentMethodsStatusType.Rejected &&
                canApproveReject
                  ? [
                      {
                        id: 'reject',
                        label: 'Reject Demand Draft',
                        icon: 'mdi:close-circle',
                        color: 'error.main',
                        onClick: () => {
                          setIsClearCheck(true);
                          setSelectedEntry({ ...row, type: 'reject' });
                          isDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                {
                  id: 'download',
                  label: 'Download Receipt',
                  icon: 'mdi:download',
                  color: 'primary.main',
                  onClick: handleDownloadReceipt,
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canApproveReject, downloadReceiptPdf]
  );

  // Cleanup blob URLs on unmount
  useEffect(
    () => () => {
      if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    },
    [receiptBlobUrl]
  );

  const handleDownloadReceiptFile = () => {
    if (!selectedReceipt || !receiptBlobUrl) return;
    const anchor = document.createElement('a');
    anchor.href = receiptBlobUrl;
    anchor.download = receiptFileName;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenReceiptInNewTab = () => {
    if (!receiptBlobUrl) return;
    window.open(receiptBlobUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReceiptDialogClose = () => {
    setReceiptDialogOpen(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
    setSelectedReceipt(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomizableTable
        isLoading={isLoading || isFetching}
        noDataText={<>No Demand Draft Data Available </>}
        tableId="demand-draft-table"
        columns={columns}
        data={data}
      />
      <CustomDialog
        open={isDialog.value}
        handleClose={isDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isClearCheck ? 'Reject Demand Draft' : 'Approve Demand Draft'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isClearCheck
                  ? 'Remarks are required to reject the demand draft.'
                  : 'Review the demand draft and click Approve. Add remarks if you wish to include any additional info.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ApproveRejectForm handleClose={isDialog.onFalse} editData={selectedEntry} />
      </CustomDialog>

      <ReconciliationReceiptDialog
        open={receiptDialogOpen}
        onClose={handleReceiptDialogClose}
        receiptData={selectedReceipt}
        receiptBlobUrl={receiptBlobUrl}
        isLoading={receiptLoading}
        onDownload={handleDownloadReceiptFile}
        onOpenInNewTab={handleOpenReceiptInNewTab}
      />
    </Box>
  );
};

export default DemandDraftTable;

export const ApproveRejectForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  editData: any;
}) => {
  const [approveReconciliation, { isLoading: isApproving }] = useApproveReconciliationMutation();
  const [rejectReconciliation, { isLoading: isRejecting }] = useRejectReconciliationMutation();

  const { values, handleChange, errors, touched, handleSubmit } = useFormik({
    initialValues: {
      rejectionReason: '',
    },
    validationSchema: Yup.object({
      rejectionReason:
        editData?.type === 'reject' ? Yup.string().required('Remarks is required') : Yup.string(),
    }),
    onSubmit: async (formikValues) => {
      try {
        if (!editData?.id) return;
        if (editData.type === 'reject') {
          await rejectReconciliation({
            id: editData.id,
            body: { remarks: formikValues.rejectionReason },
          }).unwrap();
          shikshaMitraToast.success({ message: 'Reconciliation entry rejected successfully.' });
        } else {
          await approveReconciliation({
            id: editData.id,
            body: { remarks: formikValues.rejectionReason || undefined },
          }).unwrap();
          shikshaMitraToast.success({ message: 'Reconciliation entry approved successfully.' });
        }
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  const isLoading = isApproving || isRejecting;

  return (
    <>
      <DialogScrollContent>
        {editData?.paymentReceiptCount > 1 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This payment has separate fee and charge receipts.{' '}
            {editData.type === 'reject' ? 'Rejecting' : 'Approving'} this payment updates both
            reconciliation entries together.
          </Typography>
        )}
        <TextField
          size="small"
          disabled={isLoading}
          fullWidth
          multiline
          rows={4}
          label={editData?.type === 'reject' ? 'Remarks *' : 'Remarks'}
          onChange={handleChange}
          name="rejectionReason"
          value={values.rejectionReason}
          error={touched.rejectionReason && !!errors.rejectionReason}
          helperText={(touched.rejectionReason && errors.rejectionReason) || undefined}
          sx={{ mb: 2 }}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          disabled={isLoading}
          onClick={() => {
            handleClose(null, false);
          }}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={isLoading}
          onClick={(e: any) => handleSubmit(e)}
          size="small"
          startIcon={
            <Iconify
              icon={editData?.type === 'reject' ? GlobalIcons.reject : GlobalIcons.approvedIcon}
            />
          }
        >
          {editData?.type === 'reject' ? 'Reject' : 'Approve'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
