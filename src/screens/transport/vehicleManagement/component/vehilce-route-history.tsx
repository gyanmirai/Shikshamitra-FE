import React from 'react';

import { Box } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

interface RouteHistory {
  routeNumber: string;
  startDate: string;
  numberOfStops: number;
  endDate: string;
}

const routeHistories: RouteHistory[] = [
  {
    routeNumber: 'R101',
    startDate: '2024-01-01',
    numberOfStops: 5,
    endDate: '2024-01-01',
  },
  {
    routeNumber: 'R102',
    startDate: '2024-01-05',
    numberOfStops: 3,
    endDate: '2024-01-10',
  },
  {
    routeNumber: 'R103',
    startDate: '2024-01-15',
    numberOfStops: 10,
    endDate: '2024-01-20',
  },
  {
    routeNumber: 'R104',
    startDate: '2024-01-25',
    numberOfStops: 8,
    endDate: '2024-01-30',
  },
  {
    routeNumber: 'R105',
    startDate: '2024-02-01',
    numberOfStops: 4,
    endDate: '2024-02-05',
  },
  {
    routeNumber: 'R106',
    startDate: '2024-02-10',
    numberOfStops: 6,
    endDate: '2024-02-15',
  },
  {
    routeNumber: 'R107',
    startDate: '2024-02-20',
    numberOfStops: 7,
    endDate: '2024-02-25',
  },
  {
    routeNumber: 'R108',
    startDate: '2024-03-01',
    numberOfStops: 2,
    endDate: '2024-03-03',
  },
  {
    routeNumber: 'R109',
    startDate: '2024-03-05',
    numberOfStops: 9,
    endDate: '2024-03-10',
  },
  {
    routeNumber: 'R110',
    startDate: '2024-03-15',
    numberOfStops: 5,
    endDate: '2024-03-20',
  },
];

const columnData = [
  // {id:"vehicleNumber", label:"Vehicle Number"},
  { id: 'routeNumber', label: 'Route Number' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'numberOfStops', label: 'Number Of Stop' },
  { id: 'endDate', label: 'End Date' },

  //   {
  //     id: 'action',
  //     label: 'Action',
  //     render(value:any, row: any) {
  //         return (
  //             <ThreeDotsActions
  //                 actions={({ popover }: any) => (
  //                     <MenuList>
  //                         <MenuItem
  //                             onClick={() => {
  //                                 // setIsEdit(true);
  //                                 // setSelectedEntry(row);

  //                                 // dialog.onTrue();

  //                             }}
  //                         >
  //                             <Iconify icon="solar:pen-bold" />
  //                             Edit
  //                         </MenuItem>
  //                         <MenuItem
  //                             onClick={() => {
  //                                 // handleDelete(row)

  //                             }}
  //                         >
  //                             <Iconify icon="solar:trash-bin-trash-bold" />
  //                             Delete
  //                         </MenuItem>
  //                     </MenuList>
  //                 )}
  //             />
  //         );
  //     },
  // },
];
interface VehicleRouteHistoryProps {
  vehicleData: any;
}
const VehicleRouteHistory: React.FC<VehicleRouteHistoryProps> = ({ vehicleData }) => {
  const data = [];
  return (
    <>
      <CustomizableTable data={routeHistories} columns={columnData} />
      <Box py="20px" display="flex" flexDirection="row" justifyContent="flex-end">
        {/* <Button variant="contained" size="small"> Reassign History</Button> */}
      </Box>
    </>
  );
};

export default VehicleRouteHistory;
