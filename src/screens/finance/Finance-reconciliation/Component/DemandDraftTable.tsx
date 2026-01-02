import type { LabelColor } from 'src/components/label';

import * as Yup from 'yup';
import { Box } from '@mui/system';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';
import { Button, MenuList, TextField, IconButton, Typography, DialogActions } from '@mui/material';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

const DemandDraftTable = ({
  queryParams,
}: {
  queryParams?: { month: string; year: string; paymentMethod: string };
}) => {
  const [isClearCheck, setIsClearCheck] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const isDialog = useBoolean(false);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  return (
    <>
      <CustomizableTable
        isLoading={isLoading}
        noDataText={<>No Demand Draft Data Available </>}
        tableId="demand-draft-table"
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            minWidth: '150px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNumber})
              </Typography>
            ),
          },
          {
            id: 'board',
            label: 'Board/Medium',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}-{row.medium}
              </Typography>
            ),
          },
          {
            id: 'ddNumber',
            label: 'DD Number',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'bankName',
            label: 'Bank Name',
            minWidth: '130px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'amount',
            label: 'Amount',
            minWidth: '80px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          {
            id: 'receivedDDDate',
            label: 'DD Date',
            minWidth: '100px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          {
            id: 'class',
            label: 'Class',
            minWidth: '80px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'}-{row.division}
              </Typography>
            ),
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'number',
          },
          {
            id: 'remarks',
            label: 'Remarks',
            minWidth: '200px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'status',
            sticky: true,
            label: 'Status',
            minWidth: '100px',
            align: 'left',
            isFilter: true,
            filterType: 'enum',
            enumOptions: PaymentMethodsStatusOptions,
            render(value, row) {
              const color = PamentMethodsStatusColor[
                value as PaymentMethodsStatusType
              ] as LabelColor;
              return <Label color={color}>{PaymentMethodsStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'left',
            render(value, row: any) {
              return (
                <MenuList>
                  <Box sx={{ display: 'flex' }}>
                    {row.status !== PaymentMethodsStatusType.Approved && (
                      <IconButton
                        onClick={() => {
                          setIsClearCheck(false);
                          setSelectedEntry({ ...row, type: 'approve' });
                          isDialog.onTrue();
                        }}
                        sx={{
                          width: 36,
                          height: 36,
                          p: 0,
                        }}
                      >
                        <Iconify icon="mdi:check-decagram" sx={{ color: 'success.main' }} />
                      </IconButton>
                    )}

                    {row.status !== PaymentMethodsStatusType.Rejected && (
                      <IconButton
                        onClick={() => {
                          setIsClearCheck(true);
                          setSelectedEntry({ ...row, type: 'reject' });
                          isDialog.onTrue();
                        }}
                        sx={{
                          width: 36,
                          height: 36,
                          p: 0,
                        }}
                      >
                        <Iconify icon="mdi:close-circle" sx={{ color: 'error.main' }} />
                      </IconButton>
                    )}
                  </Box>
                </MenuList>
              );
            },
          },
        ]}
        data={data || []}
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
    </>
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
  const { values, handleChange, errors, touched, handleSubmit } = useFormik({
    initialValues: {
      rejectionReason: '',
    },
    validationSchema: Yup.object({
      rejectionReason:
        editData.type === 'reject' ? Yup.string().required('Remarks is required') : Yup.string(),
    }),
    onSubmit: async (formikValues) => {
      try {
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <>
      <DialogScrollContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={editData.type === 'reject' ? 'Remarks *' : 'Remarks'}
          onChange={handleChange}
          name="rejectionReason"
          value={values.rejectionReason}
          error={touched.rejectionReason && !!errors.rejectionReason}
          helperText={touched.rejectionReason && errors.rejectionReason}
          sx={{ mb: 2 }}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            handleClose(null, false);
          }}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={false}
          onClick={(e: any) => handleSubmit(e)}
          size="small"
          startIcon={
            <Iconify
              icon={editData.type === 'reject' ? GlobalIcons.reject : GlobalIcons.approvedIcon}
            />
          }
        >
          {editData.type === 'reject' ? 'Reject' : 'Approve'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
