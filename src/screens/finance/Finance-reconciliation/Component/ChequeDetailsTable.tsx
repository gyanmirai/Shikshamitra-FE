import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { useGetChequeDetailsQuery } from 'src/redux/finance/reconciliation';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

import { ApproveRejectForm } from './DemandDraftTable';

const ChequeDetailsForm = () => {
  const [isClearCheck, setIsClearCheck] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const isDialog = useBoolean(false);

  // Fetch discrepancy data using the custom hook pattern
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChequeDetailsQuery,
  });

  return (
    <Box>
      <Box>
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Cheque Data Found </>}
          tableId="cheque-details-table"
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
              id: 'chequeNo',
              label: 'Cheque No.',
              minWidth: '120px',
              align: 'left',
              isFilter: true,
              filterType: 'number',
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
              id: 'receivedChequeDate',
              label: 'Cheque Date',
              minWidth: '200px',
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
                  <ThreeDotsActions
                    placement="right-top"
                    actions={({ popover }: any) => (
                      <MenuList>
                        {row.status !== PaymentMethodsStatusType.Approved && (
                          <MenuItem
                            onClick={() => {
                              setIsClearCheck(false);
                              setSelectedEntry({ ...row, type: 'approve' });
                              isDialog.onTrue();
                              popover.onClose();
                            }}
                          >
                            <Iconify
                              icon="mdi:check-decagram"
                              sx={{ color: 'success.main', mr: 1 }}
                            />
                            <Typography fontWeight={500} color="success.main">
                              Approve
                            </Typography>
                          </MenuItem>
                        )}
                        {row.status !== PaymentMethodsStatusType.Rejected && (
                          <MenuItem
                            onClick={() => {
                              setIsClearCheck(true);
                              setSelectedEntry({ ...row, type: 'reject' });
                              isDialog.onTrue();
                              popover.onClose();
                            }}
                          >
                            <Iconify icon="mdi:close-circle" sx={{ color: 'error.main', mr: 1 }} />
                            <Typography fontWeight={500} color="error.main">
                              Reject
                            </Typography>
                          </MenuItem>
                        )}
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={data || []}
        />
        <CustomDialog
          open={isDialog.value}
          handleClose={isDialog.onFalse}
          maxWidth="sm"
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {isClearCheck ? 'Reject Cheque Entry' : 'Approve Cheque Entry'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={
                  isClearCheck
                    ? 'Remarks are required to reject the cheque entry.'
                    : 'Review the cheque entry and click Approve. Add remarks if you wish to include any additional info.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ApproveRejectForm handleClose={isDialog.onFalse} editData={selectedEntry} />
        </CustomDialog>
      </Box>
    </Box>
  );
};

export default ChequeDetailsForm;
