import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import procurementRequestData from 'src/json/ResourceManagement/procurementRequest/procurementRequestData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

import { Label } from 'src/components/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddProcurementRequestDialog from './add-procurement-request-dialog';

import type { IProcurementAndVendorFromValues } from '../procurement-and-vendor-interface';

const TeacherProcurementRequestTable = () => {
  const viewProcurementRequest = useBoolean();

  const [selectedRow, setSelectedRow] = useState<IProcurementAndVendorFromValues>();
  const [isEdit, setIsEdit] = useState(false);
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

          { id: 'resourceCategory', label: 'Resource Category', minWidth: 100 },
          { id: 'quantity', label: 'Quantity', minWidth: 100, filterType: 'number' },
          {
            id: 'date',
            label: 'Expected Delivery Date',
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
                  showEditIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    setSelectedRow(row as IProcurementAndVendorFromValues);
                    viewProcurementRequest.onTrue();
                    setIsEdit(false);
                  }}
                  handleEditClick={() => {
                    setSelectedRow(row as IProcurementAndVendorFromValues);
                    viewProcurementRequest.onTrue();
                    setIsEdit(true);
                  }}
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
          title="Procurement Request"
        >
          <AddProcurementRequestDialog
            data={{} as IProcurementAndVendorFromValues}
            isEdit={false}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default TeacherProcurementRequestTable;
