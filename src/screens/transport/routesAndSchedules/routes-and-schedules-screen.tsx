'use client';

import * as yup from 'yup';
import React, { useState, useEffect } from 'react';

import { Box, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CommonTable from 'src/components/commonTable';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

// interface RoutesList {
//     routeNumber: string,
//     startPoint: string,
//     endPoint: string,
//     totalStop: string,
//     assignedDriver: string,
//     action?: string,

// };

// const routesData: RoutesList[] = [
//   {
//       routeNumber: "R101",
//       startPoint: "Main Campus",
//       endPoint: "Downtown Station",
//       totalStop: "5",
//       assignedDriver: "John Doe",
//       action: "View Details"
//   },
//   {
//       routeNumber: "R102",
//       startPoint: "North Park",
//       endPoint: "South City",
//       totalStop: "3",
//       assignedDriver: "Jane Smith",
//       action: "View Details"
//   },
//   {
//       routeNumber: "R103",
//       startPoint: "East Side",
//       endPoint: "West End",
//       totalStop: "4",
//       assignedDriver: "Michael Johnson",
//       action: "View Details"
//   },
//   {
//       routeNumber: "R104",
//       startPoint: "Uptown",
//       endPoint: "City Center",
//       totalStop: "6",
//       assignedDriver: "Emily Davis",
//       action: "View Details"
//   },
//   {
//       routeNumber: "R105",
//       startPoint: "Riverfront",
//       endPoint: "Market Square",
//       totalStop: "2",
//       assignedDriver: "David Wilson",
//       action: "View Details"
//   }
// ];

interface DropLocation {
  busStop: string;
  charges: string; // Can be formatted as currency if needed
  pickupTime: string; // e.g., "08:00 AM"
  dropoffTime: string; // e.g., "08:30 AM"
}

interface Route {
  routeNumber: string; // Unique identifier for the route
  startPoint: string;
  endPoint: string;
  totalStops: number; // Number of drop locations
  assignedDrivers: string; // List of assigned drivers
  assignedVehicles: string[]; // List of assigned vehicles
  dropLocations: DropLocation[]; // List of drop locations
}

const routesData: Route[] = [
  {
    routeNumber: 'R101',
    startPoint: 'Main Campus',
    endPoint: 'Downtown Station',
    totalStops: 3,
    assignedDrivers: 'Jane Smith',
    assignedVehicles: ['Bus A', 'Bus B'],
    dropLocations: [
      {
        busStop: 'Central Park',
        charges: '$2.00',
        pickupTime: '08:00 AM',
        dropoffTime: '08:30 AM',
      },
      {
        busStop: 'River Valley',
        charges: '$2.50',
        pickupTime: '08:35 AM',
        dropoffTime: '09:00 AM',
      },
      {
        busStop: 'City Mall',
        charges: '$3.00',
        pickupTime: '09:05 AM',
        dropoffTime: '09:30 AM',
      },
    ],
  },
  {
    routeNumber: 'R102',
    startPoint: 'North Park',
    endPoint: 'South City',
    totalStops: 2,
    assignedDrivers: 'Emily Davis',
    assignedVehicles: ['Bus C'],
    dropLocations: [
      {
        busStop: 'Downtown Station',
        charges: '$2.00',
        pickupTime: '08:15 AM',
        dropoffTime: '08:45 AM',
      },
      {
        busStop: 'Market Square',
        charges: '$2.50',
        pickupTime: '08:50 AM',
        dropoffTime: '09:15 AM',
      },
    ],
  },
  // Add more routes as needed
];

const columns = [
  { id: 'routeNumber', label: 'Route Number' },
  { id: 'startPoint', label: 'Start Point' },
  { id: 'endPoint', label: 'End Point' },
  { id: 'totalStops', label: 'Total Stop' },
  { id: 'assignedDrivers', label: 'Assigned Driver' },
  {
    id: 'action',
    label: 'Action',
    render(value: any, row: any) {
      return (
        <ThreeDotsActions
          actions={({ popover }: any) => (
            <MenuList>
              <MenuItem
                onClick={() => {
                  // setIsEdit(true);
                  // setSelectedExpense(row);
                  // dialog.onTrue();
                }}
              >
                <Iconify icon="solar:pen-bold" />
                Edit Route
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // handleDelete(row)
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                Assign Students/Staff
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // handleDelete(row)
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                View on Map
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // handleDelete(row)
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                Notify
              </MenuItem>
            </MenuList>
          )}
        />
      );
    },
  },
];

const RoutesAndSchedulesScreen = () => {
  const dialog = useBoolean();
  const [selectedExpense, setSelectedExpense] = useState(routesData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(routesData);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  useEffect(() => {}, [selectedExpense, isEdit]);

  const handleSave = (dataFromDialog: any) => {
    // const { expenseCategory, expenseAmount, paymentMethod, date, paymentStatus, id } = dataFromDialog;
    // if (dataFromDialog) {
    //     const existingEntryIndex = expenseData.findIndex(val => id === val.id);
    //     const newExpenseEntry = {
    //         expenseCategory,
    //         expenseAmount,
    //         paymentMethod,
    //         date,
    //         paymentStatus,
    //         id,
    //         action: isEdit ? 'edit' : 'add',
    //     };
    //     const updatedData = [...expenseData];
    //     if (isEdit && existingEntryIndex !== -1) {
    //         updatedData[existingEntryIndex] = newExpenseEntry;
    //     } else {
    //         updatedData.push(newExpenseEntry);
    //     }
    //     setTableData(updatedData);
    // }
    // closeDialog();
    // console.log('Updated Data:', dataFromDialog);
  };

  const handleDelete = (item: any) => {
    // expenseData = expenseData.filter(val =>
    //     (val.id) !== (item.id)
    // );
    // setTableData([...expenseData]);
  };

  return (
    <>
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Create New Route
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Routes List
        </Typography>
      </Box>
      <CustomizableTable data={tableData} columns={columns} />
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="New Budget"
      >
        <CreateRoutesForm />
      </CustomDialog>
    </>
  );
};

export default RoutesAndSchedulesScreen;
const EnterRouteDetails = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
    <TextField name="route Name" label="Route Name" value="" onChange={() => {}} size="small" />
    <TextField name="startpoint" label="Start Point" value="" onChange={() => {}} size="small" />
    <TextField name="endPoint" label="end Point" value="" onChange={() => {}} size="small" />
    {/* <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} /> */}
  </Box>
);

const AddBusStops = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
      options={[
        { value: 'dindoli', label: 'Dindoli' },
        { value: 'varachha', label: 'Varachha' },
      ]}
      label="Select Bus Stop"
      name="selectDepartments"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

const AssignVehicleAndDriver = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
      options={[]}
      label="Assign Vehicle"
      name="Assignvehicle"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <CustomSelect
      options={[]}
      label="Assign Driver"
      name="Assigndriver"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

const Setschedule = () => {
  const columnsTable = [
    { key: 'busStop', label: 'Bus Stop' },
    { key: 'pickupTime', label: 'Pickup Time' },
    { key: 'dropoffTime', label: 'Dropoff Time' },
    { key: 'charges', label: 'Charges' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <CommonTable isPagination={false} data={[]} columns={columnsTable} />
    </Box>
  );
};

const allRouteSteps = [EnterRouteDetails, AddBusStops, AssignVehicleAndDriver, Setschedule];

const CreateRoutesForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={['Enter Route Details', 'Add Bus Stops', 'Assign Vehicle and Driver', 'Set schedule']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allRouteSteps[step];
        return (
          <Box p={2}>
            <StepComponent />
          </Box>
        );
      }}
    />
  );
};
