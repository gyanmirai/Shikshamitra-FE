'use client';

import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransportAddNewVehicleDialog from './component/add-new-vehicle-dialog';
import TransportVehicleDetailView from './component/transport-vehicle-detail-view';

interface Vehicle {
  vehicleNumber: string;
  capacity: number;
  model: string;
  assignedRoutes: string;
  driver: string;
  id: number;
}

const vehiclesOverview: Vehicle[] = [
  {
    vehicleNumber: 'BUS1',
    capacity: 15,
    model: 'Ford Transit',
    assignedRoutes: 'R102',
    driver: 'John Doe',
    id: 1,
  },
  {
    vehicleNumber: 'BUS12',
    capacity: 30,
    model: 'Mercedes Sprinter',
    assignedRoutes: 'R104',
    driver: 'Jane Smith',
    id: 2,
  },
  {
    vehicleNumber: 'BUS3',
    capacity: 25,
    model: 'Chevrolet Express',
    assignedRoutes: 'R105',
    driver: 'Emily Davis',
    id: 3,
  },
  {
    vehicleNumber: 'BUS15',
    capacity: 20,
    model: 'Ram ProMaster',
    assignedRoutes: 'R106',
    driver: 'Michael Johnson',
    id: 4,
  },
  {
    vehicleNumber: 'BUS18',
    capacity: 10,
    model: 'Nissan NV200',
    assignedRoutes: 'R107',
    driver: 'David Wilson',
    id: 5,
  },
];

const TransportVehicleManagementScreen = () => {
  const dialog = useBoolean();
  const dialogDetailedView = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(vehiclesOverview);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const handleOnClick = (vehicleData: any) => {
    setSelectedVehicle(vehicleData);
    dialogDetailedView.onTrue();
  };

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };
  const handleSave = (dialogValue: Vehicle) => {
    const { vehicleNumber, capacity, model, driver, assignedRoutes, id } = dialogValue;

    if (isEdit) {
      const existingIndex = tableData.findIndex((val) => val.id === id);

      if (existingIndex !== -1) {
        const updatedData = tableData.map((val, index) =>
          index === existingIndex ? { ...val, assignedRoutes, capacity, driver } : val
        );
        setTableData(updatedData);
        closeDialog();
        return;
      }
    }

    const newVehicle = {
      vehicleNumber,
      capacity,
      model,
      driver,
      id,
      assignedRoutes,
    };

    const updatedData = [...tableData, newVehicle];
    setTableData(updatedData);
    closeDialog();
  };

  // const handleDelete = (data: any) => {
  //   const deletedEntry = tableData.filter((val) => val.id !== data.id);
  //   setTableData(deletedEntry);
  // };

  // const handleDetaildDialogClick = () => {
  //   dialogDetailedView.onFalse();
  // };

  const columnTable = [
    {
      id: 'vehicleNumber',
      label: 'Vehicle Number',
      render(value: any, row: any) {
        return (
          <React.Fragment key={row.vehicleNumber}>
            <Box display="flex" alignItems="center" gap={1}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  width: '80px',
                  height: '30px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
                onClick={() => handleOnClick(row)}
                elevation={4}
              >
                {row.vehicleNumber}
              </Paper>
            </Box>
          </React.Fragment>
        );
      },
    },
    { id: 'capacity', label: 'Capacity' },
    { id: 'model', label: 'Model' },
    { id: 'assignedRoutes', label: 'Assigned Routes' },
    { id: 'driver', label: 'Driver' },
    // {
    //   id: 'action',
    //   label: 'Action',
    //   render(value: any, row: any) {
    //     return (
    //       <ThreeDotsActions
    //         actions={({ popover }: any) => (
    //           <MenuList>
    //             <MenuItem
    //               onClick={() => {
    //                 setIsEdit(true);
    //                 setSelectedVehicle(row);
    //                 dialog.onTrue();
    //               }}
    //             >
    //               <Iconify icon="solar:pen-bold" />
    //               Edit
    //             </MenuItem>
    //             <MenuItem
    //               onClick={() => {
    //                 handleDelete(row);
    //               }}
    //             >
    //               <Iconify icon="solar:trash-bin-trash-bold" />
    //               Delete
    //             </MenuItem>
    //           </MenuList>
    //         )}
    //       />
    //     );
    //   },
    // },
  ];
  return (
    <>
      <CustomBreadcrumbs
        heading="Vehicle Management"
        links={[{ name: 'Transport' }, { name: 'Vehicle Management' }]}
        sx={{ mb: 2 }}
      />
      {/* <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          onClick={() => {
            dialog.onTrue();
          }}
          variant="contained"
          size="small"
        >
          Add new vehicle
        </Button>
      </Box> */}
      {/* <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Vehicle Overview
        </Typography>
      </Box> */}
      <CustomizableTable
        data={tableData}
        columns={columnTable}
        tableId="vehicle-management-table"
      />
      <CustomDialog
        title="Vehicle Details Modal"
        open={dialogDetailedView.value}
        handleClose={dialogDetailedView.onFalse}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            padding: 2,
            margin: '16px',
            borderRadius: '8px',
            height: '90vh',
          },
        }}
      >
        <TransportVehicleDetailView vehicleNumber={selectedVehicle} />
      </CustomDialog>

      {/* 
      {selectedVehicle && <> <Box py="15px">
        <Typography component="span" variant="h6" gutterBottom>
          Vehicle Details Modal
        </Typography>
        <Box sx={{ pb: "15px" }} />
       <CustomDialog 
      
        title="Vehicle Details Modal"
        open={dialogDetailedView.value}
        handleClose={dialogDetailedView.onFalse}>
          <TransportVehicleDetailView vehicleNumber={selectedVehicle} />
          </CustomDialog> 
      </Box></>} */}
      {dialog.value && (
        <TransportAddNewVehicleDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedVehicle}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
    </>
  );
};

export default TransportVehicleManagementScreen;
