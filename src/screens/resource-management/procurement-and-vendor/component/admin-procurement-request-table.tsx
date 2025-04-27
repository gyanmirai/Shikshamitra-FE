import type { LabelColor } from 'src/components/label/types';

import React from 'react';
import dayjs from 'dayjs';

import { MenuItem, MenuList } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import procurementRequestData from 'src/json/ResourceManagement/procurementRequest/procurementRequestData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AdminProcurementRequestTable = () => (
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
      { id: 'quantity', label: 'Quantity', minWidth: 100, filterType: 'number' },
      { id: 'requestedBy', label: 'Requested By', minWidth: 100 },
      {
        id: 'date',
        label: 'Date',
        minWidth: 80,
        filterType: 'date',
        render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
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
                  <MenuItem>
                    <Iconify icon={GlobalIcons.approvedIcon} />
                    Approved
                  </MenuItem>
                  <MenuItem>
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
    data={procurementRequestData}
  />
);

export default AdminProcurementRequestTable;
