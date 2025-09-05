import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Button, MenuItem, MenuList } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import procurementRequestData from 'src/json/ResourceManagement/procurementRequest/procurementRequestData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

import AssignToPurchaseDialog from './assign-to-purchase-dialog';
import AddProcurementRequestDialog from './add-procurement-request-dialog';

import type { IProcurementAndVendorFromValues } from '../procurement-and-vendor-interface';

const AdminProcurementRequestTable = () => {
  // State to store the selected procurement request row data
  const [selectedRow, setSelectedRow] = useState<IProcurementAndVendorFromValues | null>(null);
  // State to track if the procurement request is in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // Boolean state to control the visibility of view procurement request dialog
  const viewProcurementRequest = useBoolean();
  // Boolean state to control the visibility of assign to purchase dialog
  const assignedToPurchase = useBoolean();
  // Boolean state to control the visibility of approve dialog
  const approveDialog = useBoolean();
  // Boolean state to control the visibility of reject dialog
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
        noDataText="No Procurement Request Found"
        tableId="admin-resource-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'quantity', label: 'Quantity', filterType: 'number' },
          { id: 'requestedBy', label: 'Requested By' },
          {
            id: 'date',
            label: 'Date',
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
          },
          {
            label: 'Status',
            id: 'status',
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
            minWidth: 70,
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
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          approveDialog.onTrue();
                          popover.onClose();
                          setSelectedRow(row as IProcurementAndVendorFromValues);
                        }}
                      >
                        <Iconify icon={GlobalIcons.approvedIcon} />
                        Approve
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          rejectDialog.onTrue();
                          popover.onClose();
                          setSelectedRow(row as IProcurementAndVendorFromValues);
                        }}
                      >
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

      <ConfirmDialog
        open={approveDialog.value}
        onClose={() => {
          setSelectedRow(null);
          approveDialog.onFalse();
        }}
        title="Approve"
        content="Are you sure want to Approve this Resource ?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Confirm
          </Button>
        }
      />

      <ConfirmDialog
        open={rejectDialog.value}
        onClose={() => {
          setSelectedRow(null);
          rejectDialog.onFalse();
        }}
        title="Approve"
        content="Are you sure want to Reject this Resource ?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Confirm
          </Button>
        }
      />

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
