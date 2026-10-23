import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import data from 'src/json/security/staff-request-data.json';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  CommonRequestStatusType,
  CommonRequestStatusTypeColor,
  CommonRequestStatusTypeOptions,
} from 'src/enums/common-request-statusType';

import ReviewStaffGatePassRequestDialog from './review-staff-gate-pass-request-dialog';

import type { IReviewStaffGatePassRequestFormValues } from '../review-gate-pass-staff-interfcae';

const ReviewGatePassRequestStaffTable = () => {
  // State to store the selected row data for viewing/editing gate pass request details
  const [selectedRow, setSelectedRow] = useState<IReviewStaffGatePassRequestFormValues | null>(
    null
  );
  // Boolean state to control the visibility of review details dialog
  const reviewDetailsViewDialog = useBoolean();
  // State to store the current status of the gate pass request
  const [status, setStatus] = useState('');
  return (
    <Box>
      <Box display="flex" alignItems="center" flexDirection="row" gap={1} py="20px">
        <Grid size={{ xs: 12, md: 3 }}>
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

        <Grid size={{ xs: 12, md: 3 }}>
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
            filterType: 'date' as const,
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
          },
          {
            id: 'leaveTime',
            label: 'leave Time',
            filterType: 'string' as const,

            isFilter: true,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          { id: 'reasonForLeave', label: 'Reason for leave' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum' as const,
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
