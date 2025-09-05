import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import procurementRequestData from 'src/json/ResourceManagement/procurementRequest/procurementRequestData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

import AddProcurementRequestDialog from './add-procurement-request-dialog';

import type {
  IProcurementTeacherTableProps,
  IProcurementAndVendorFromValues,
} from '../procurement-and-vendor-interface';

const TeacherProcurementRequestTable: React.FC<IProcurementTeacherTableProps> = ({ onClick }) => {
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
        noDataText="No Procurement Request Found"
        tableId="admin-resource-table"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },

          { id: 'resourceCategory', label: 'Resource Category' },
          { id: 'quantity', label: 'Quantity', filterType: 'number' },
          {
            id: 'date',
            label: 'Expected Delivery Date',

            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
          },

          {
            label: 'Status',
            id: 'status',
            minWidth: 100,
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
            minWidth: 10,
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
                    onClick(row as IProcurementAndVendorFromValues, 'view');
                    // viewProcurementRequest.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedRow(row as IProcurementAndVendorFromValues);
                    onClick(row as IProcurementAndVendorFromValues, 'edit');
                    // viewProcurementRequest.onTrue();
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
