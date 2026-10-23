import type { LabelColor } from 'src/components/label/types';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import bookingRequestData from 'src/json/ResourceManagement/booking/bookingData.json';
import {
  ResourceBookingStatusType,
  ResourceBookingStatusTypeColor,
  ResourceBookingStatusTypeOptions,
} from 'src/enums/resource-booking-status';

const TeacherResourceTable = () => (
  // const bookResourceDialog = useBoolean();
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

      {
        id: 'date',
        label: 'Date',
        minWidth: 80,
        filterType: 'date' as const,
        render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
      },

      {
        id: 'time',
        label: 'Time',
        filterType: 'string' as const,
        minWidth: 80,
        isFilter: true,
        isSort: false,
        render: (value) => (value ? dayjs(value).format('hh:mm A') : '-'),
      },
      {
        label: 'Status',
        id: 'status',
        minWidth: '100px',
        filterType: 'enum' as const,
        enumOptions: ResourceBookingStatusTypeOptions,
        render(value, row) {
          const color = ResourceBookingStatusTypeColor[
            value as ResourceBookingStatusType
          ] as LabelColor;

          return <Label color={color}>{ResourceBookingStatusType[value]}</Label>;
        },
      },

      //   {
      //     id: 'action',
      //     label: 'Actions',
      //     align: 'left',
      //     minWidth: 100,
      //     sticky: true,
      //     isFilter: false,
      //     isSort: false,
      //     render(value, row) {
      //       return (
      //         <ThreeDotsActions
      //           placement="right-top"
      //           // showViewIcon
      //           showThreeDots
      //           handleViewClick={() => {}}
      //           actions={() => (
      //             <MenuList>
      //               <MenuItem>
      //                 <Iconify icon={GlobalIcons.approvedIcon} />
      //                 Approved
      //               </MenuItem>
      //               <MenuItem>
      //                 <Iconify icon={GlobalIcons.cancel} />
      //                 Reject
      //               </MenuItem>
      //             </MenuList>
      //           )}
      //         />
      //       );
      //     },
      //   },
    ]}
    data={bookingRequestData}
  />
);
export default TeacherResourceTable;
