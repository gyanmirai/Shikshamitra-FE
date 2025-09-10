import type { LabelColor } from 'src/components/label/types';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button, MenuItem, MenuList } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import bookingRequestData from 'src/json/ResourceManagement/booking/bookingData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

const AdminResourceTable = () => {
  const approveDialog = useBoolean();
  const rejectDialog = useBoolean();
  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Resource Name, Requested By...',
          label: 'Search by Resource Name, Requested By...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText="No Booking Request Found"
        tableId="admin-resource-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name', minWidth: 100 },
          { id: 'purpose', label: 'Purpose', minWidth: 300 },
          { id: 'requestedBy', label: 'Requested By', minWidth: 100 },
          {
            id: 'date',
            label: 'Date',
            minWidth: 80,
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
          },

          {
            id: 'time',
            label: 'Time',
            minWidth: 80,
            render: (value) => (value ? dayjs(value).format('hh:mm A') : '-'),
          },
          {
            label: 'Status',
            id: 'status',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: ResourceBookingStatusTypeOptions,
            render(value, row) {
              const color = ResourceBookingStatusTypeColor[
                value as ResourceBookingStatusType
              ] as LabelColor;

              return <Label color={color}>{ResourceBookingStatusType[value]}</Label>;
            },
          },

          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  // showViewIcon
                  showThreeDots
                  handleViewClick={() => {}}
                  actions={() => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          approveDialog.onTrue();
                        }}
                      >
                        <Iconify icon={GlobalIcons.approvedIcon} />
                        Approved
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          rejectDialog.onTrue();
                        }}
                      >
                        <Iconify icon={GlobalIcons.cancel} />
                        Reject
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={bookingRequestData}
      />

      {approveDialog.value && (
        <ConfirmDialog
          open={approveDialog.value}
          onClose={() => {
            approveDialog.onFalse();
          }}
          title="Approve"
          content="Are you sure want to Approve?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Confirm
            </Button>
          }
        />
      )}

      {rejectDialog.value && (
        <ConfirmDialog
          open={rejectDialog.value}
          onClose={() => {
            rejectDialog.onFalse();
          }}
          title="Reject"
          content="Are you sure want to Reject?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Confirm
            </Button>
          }
        />
      )}
    </>
  );
};

export default AdminResourceTable;
