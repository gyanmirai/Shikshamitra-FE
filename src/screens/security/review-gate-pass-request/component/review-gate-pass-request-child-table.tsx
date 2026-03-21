import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import data from 'src/json/security/review-gate-pass-request-data-teacher.json';
import {
  CommonRequestStatusType,
  CommonRequestStatusTypeColor,
  CommonRequestStatusTypeOptions,
} from 'src/enums/common-request-statusType';

import ReviewRequestDetailView from './review-request-detail-view-dialog';

import type { IReviewEarlyPassRequestFormValues } from '../review-gate-pass-request-interface';

const ReviewGatePassRequestTableChild = () => {
  // State to store the selected row data for viewing details
  const [selectedRow, setSelectedRow] = useState<IReviewEarlyPassRequestFormValues | null>(null);
  // Boolean state to control the visibility of review details dialog
  const reviewDetailsViewDialog = useBoolean();
  // State to store the current status of the request
  const [status, setStatus] = useState('');
  return (
    <Box>
      <Box display="flex" alignItems="center" flexDirection="row" gap={2} py="20px">
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
        tableId="early-gate-pass-request-table-review-child"
        searchFieldProps={{
          placeholder: 'Search by Student Name...',
          label: 'Search by Student Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={<>No Early Request Found </>}
        columns={[
          { id: 'childName', label: 'Child Name' },
          {
            id: 'pickupDate',
            label: 'Pickup Date',
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
          },
          {
            id: 'pickupTime',
            label: 'Pickup Time',

            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
          },
          { id: 'reasonForPickup', label: 'Reason for Pickup' },
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
                    setSelectedRow(row as IReviewEarlyPassRequestFormValues);
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
          <ReviewRequestDetailView
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

export default ReviewGatePassRequestTableChild;
