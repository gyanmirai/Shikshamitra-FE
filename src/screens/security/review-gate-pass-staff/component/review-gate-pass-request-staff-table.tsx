import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/security/staff-request-data.json';
import {
  CommonRequestStatusType,
  CommonRequestStatusTypeColor,
  CommonRequestStatusTypeOptions,
} from 'src/enums/common-request-statusType';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ReviewStaffGatePassRequestDialog from './review-staff-gate-pass-request-dialog';

import type { IReviewStaffGatePassRequestFormValues } from '../review-gate-pass-staff-interfcae';

const ReviewGatePassRequestStaffTable = () => {
  const [selectedRow, setSelectedRow] = useState<IReviewStaffGatePassRequestFormValues | null>(
    null
  );
  const reviewDetailsViewDialog = useBoolean();
  const [status, setStatus] = useState('');
  return (
    <Box>
      <Box display="flex" alignItems="center" flexDirection="row" gap={2} py="20px">
        <Grid item xs={12} md={3}>
          <DatePicker
            label="Start Date"
            format="DD-MM-YYYY"
            onChange={(value) => {
              // Filter table data based on start date
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DatePicker
            label="End Date"
            format="DD-MM-YYYY"
            onChange={(value) => {
              // Filter table data based on end date
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Grid>
      </Box>
      <CustomizableTable
        tableId="gate-pass-request-table-review-staff"
        searchFieldProps={{
          placeholder: 'Search by  Name...',
          label: 'Search by  Name...',
        }}
        noDataText={<>No Request Found </>}
        columns={[
          { id: 'name', label: 'Name' },
          {
            id: 'leaveDate',
            label: 'leave Date',
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
          },
          {
            id: 'leaveTime',
            label: 'leave Time',

            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          { id: 'reasonForLeave', label: 'Reason for leave' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: CommonRequestStatusTypeOptions,
            minWidth: '130px',
            align: 'left',
            render(value, row) {
              const color = CommonRequestStatusTypeColor[
                value as CommonRequestStatusType
              ] as LabelColor;

              const val = CommonRequestStatusType[value];
              return <Label color={color}>{val}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 80,
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    setStatus(CommonRequestStatusType[row.status]);
                    setSelectedRow(row as IReviewStaffGatePassRequestFormValues);
                    reviewDetailsViewDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />

      {reviewDetailsViewDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Review Gate Pass Request"
          handleClose={() => {
            reviewDetailsViewDialog.onFalse();
          }}
          open={reviewDetailsViewDialog.value}
        >
          <ReviewStaffGatePassRequestDialog
            status={status}
            data={selectedRow}
            onClose={() => {
              reviewDetailsViewDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ReviewGatePassRequestStaffTable;
