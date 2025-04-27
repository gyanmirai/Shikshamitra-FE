import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import procurementRequestData from 'src/json/ResourceManagement/procurementRequest/procurementRequestData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AssignToPurchaseDialog from './assign-to-purchase-dialog';
import AddProcurementRequestDialog from './add-procurement-request-dialog';

import type { IProcurementAndVendorFromValues } from '../procurement-and-vendor-interface';

const AdminProcurementRequestTable = () => {
  const [selectedRow, setSelectedRow] = useState<IProcurementAndVendorFromValues>();
  const [isEdit, setIsEdit] = useState(false);
  const viewProcurementRequest = useBoolean();
  const assignedToPurchase = useBoolean();
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
                  showViewIcon
                  showThreeDots
                  handleViewClick={() => {
                    setSelectedRow(row as IProcurementAndVendorFromValues);

                    viewProcurementRequest.onTrue();
                  }}
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
                      <MenuItem onClick={assignedToPurchase.onTrue}>
                        <Iconify icon={GlobalIcons.assigned} />
                        Assign
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
      {viewProcurementRequest.value && (
        <CustomDialog
          maxWidth="md"
          open={viewProcurementRequest.value}
          handleClose={viewProcurementRequest.onFalse}
          title="Review Request For John Doe"
        >
          <AddProcurementRequestDialog
            fromTeacher={false}
            data={{} as IProcurementAndVendorFromValues}
            isEdit={false}
          />
        </CustomDialog>
      )}

      {assignedToPurchase.value && (
        <CustomDialog
          maxWidth="md"
          open={assignedToPurchase.value}
          handleClose={assignedToPurchase.onFalse}
          title="Assigned To Purchase"
        >
          <AssignToPurchaseDialog />
        </CustomDialog>
      )}
    </>
  );
};

export default AdminProcurementRequestTable;
