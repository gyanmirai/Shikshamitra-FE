'use client'

import * as yup from 'yup';
import React, { useState, useEffect } from 'react'

import { Box, Button, MenuItem, MenuList, TextField, Tooltip, Typography } from '@mui/material';

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
  charges: string;  // Can be formatted as currency if needed
  pickupTime: string;  // e.g., "08:00 AM"
  dropoffTime: string;  // e.g., "08:30 AM"
}

interface Route {
  routeNumber: string;  // Unique identifier for the route
  startPoint: string;
  endPoint: string;
  totalStops: number;  // Number of drop locations
  assignedDrivers: string;  // List of assigned drivers
  assignedVehicles: string[];  // List of assigned vehicles
  dropLocations: DropLocation[];  // List of drop locations
}

const routesData: Route[] = [
  {
    routeNumber: "R101",
    startPoint: "Main Campus",
    endPoint: "Downtown Station",
    totalStops: 3,
    assignedDrivers: "Jane Smith",
    assignedVehicles: ["Bus A", "Bus B"],
    dropLocations: [
      {
        busStop: "Central Park",
        charges: "$2.00",
        pickupTime: "08:00 AM",
        dropoffTime: "08:30 AM"
      },
      {
        busStop: "River Valley",
        charges: "$2.50",
        pickupTime: "08:35 AM",
        dropoffTime: "09:00 AM"
      },
      {
        busStop: "City Mall",
        charges: "$3.00",
        pickupTime: "09:05 AM",
        dropoffTime: "09:30 AM"
      }
    ]
  },
  {
    routeNumber: "R102",
    startPoint: "North Park",
    endPoint: "South City",
    totalStops: 2,
    assignedDrivers: "Emily Davis",
    assignedVehicles: ["Bus C"],
    dropLocations: [
      {
        busStop: "Downtown Station",
        charges: "$2.00",
        pickupTime: "08:15 AM",
        dropoffTime: "08:45 AM"
      },
      {
        busStop: "Market Square",
        charges: "$2.50",
        pickupTime: "08:50 AM",
        dropoffTime: "09:15 AM"
      }
    ]
  }
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
                 <Iconify icon="solar:pen-bold" />
                Assign Students/Staff
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // handleDelete(row)
                }}
              >
                <Iconify icon="solar:map" />
                View on Map
              </MenuItem>
              <MenuItem
                onClick={() => {
                  // handleDelete(row)
                }}
              >
               <Iconify icon="mingcute:notification-fill" />
                Notify
              </MenuItem>
            </MenuList>
          )}
        />
      );
    },
  },
]


const RoutesAndSchedulesScreen = () => {

  const dialog = useBoolean();
  const [selectedExpense, setSelectedExpense] = useState(routesData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(routesData);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  }

  useEffect(() => { }, [selectedExpense, isEdit]);

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
  }

  return (<>
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
      title="Create New Route"
    >
      <CreateRoutesForm />
    </CustomDialog>

  </>);
};

export default RoutesAndSchedulesScreen;



interface RouteDetails {
  routeName: string;
  startPoint: string;
  endPoint: string;
}

interface NewEntry {
  busStop: string;
  pickupTime: string;
  dropoffTime: string;
  charges: number;
}

interface EnterRouteDetailsProps {
  onChange: (value: any) => void;
  routeDetails: RouteDetails;
}

const EnterRouteDetails: React.FC<EnterRouteDetailsProps> = ({ onChange, routeDetails }) => (
 
 <Box sx={{ display: 'flex', flexDirection: "column", gap: 2, mb: 4 }}>
    <TextField
      name="routeName"
      label="Route Name"
      value={routeDetails.routeName}
      onChange={(e) => onChange(e)}
      size="small"
    />
    <TextField
      name="startPoint"
      label="Start Point"
      value={routeDetails.startPoint}
      onChange={onChange}
      size="small"
    />
    <TextField
      name="endPoint"
      label="End Point"
      value={routeDetails.endPoint}
      onChange={onChange}
      size="small"
    />
  </Box>
);

interface AddBusStopsProps {
  onChange: (value: any) => void; 
  selectedStop: string;
}

const AddBusStops: React.FC<AddBusStopsProps> = ({ onChange, selectedStop }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
      options={[
        { value: "dindoli", label: "Dindoli" },
        { value: "varachha", label: "Varachha" },
      ]}
      label="Select Bus Stop"
      name="selectedBusStop"
      value={selectedStop}
      // @ts-ignore
      onChange={(e)=>{onChange(e)}} // Pass the event
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

interface AssignVehicleAndDriverProps {
  onChange: (e: any, name:string) => void; 
  vehicle: string;
  driver: string;
}

const AssignVehicleAndDriver: React.FC<AssignVehicleAndDriverProps> = ({ onChange, vehicle, driver }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
      options={[
        { value: "bus1", label: "Bus 1 - 30 Seater" },
        { value: "bus2", label: "Bus 2 - 40 Seater" },
        { value: "van1", label: "Van 1 - 10 Seater" },
        { value: "bus3", label: "Bus 3 - 50 Seater" },
      ]} // Replace with actual vehicle options
      label="Assign Vehicle"
      name="vehicle"
      value={vehicle}
      // @ts-ignore
      onChange={(value: string) => onChange(value, "vehicle")}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <CustomSelect
      options={[
        { value: "driver1", label: "John Doe - License No: ABC123" },
        { value: "driver2", label: "Jane Smith - License No: XYZ456" },
        { value: "driver3", label: "Mike Johnson - License No: DEF789" },
        { value: "driver4", label: "Emily Davis - License No: GHI012" },
      ]} // Replace with actual driver options
      label="Assign Driver"
      name="driver"
      value={driver}
      // @ts-ignore
      onChange={(value: string) => onChange(value, "driver")}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

interface SetScheduleProps {
  scheduleData: NewEntry[];
}

const SetSchedule: React.FC<SetScheduleProps> = ({ scheduleData }) => {
  const columnsTable = [
    { key: "busStop", label: 'Bus Stop' },
    { key: 'pickupTime', label: 'Pickup Time' },
    { key: 'dropoffTime', label: 'Dropoff Time' },
    { key: 'charges', label: 'Charges' }
  ];
 console.log("xyz", scheduleData)
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
  xyz
    </Box>
  );
};

const CreateRoutesForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [routeDetails, setRouteDetails] = useState({
    routeName: 'g',
    startPoint: 'g',
    endPoint: 'g',
  });
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [vehicle, setVehicle] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<NewEntry[]>([]);

  const handleInputChange = (e:any) => {
    console.log("evenet", e)
    const { name, value } = e.target;
    setRouteDetails(prev => ({ ...prev, [name]: value }));
    const newEntry: NewEntry = {
      busStop: selectedStop,
      pickupTime: routeDetails.startPoint, 
      dropoffTime: routeDetails.endPoint, 
      charges: 100, 
    };
    setScheduleData(prev => [...prev, newEntry]);
    
  };

  const handleSelectChange = (e:any) => {
    console.log("evenet", e)
   
    setSelectedStop(e);
    const newEntry: NewEntry = {
      busStop: selectedStop,
      pickupTime: routeDetails.startPoint, 
      dropoffTime: routeDetails.endPoint, 
      charges: 100, 
    };
    setScheduleData(prev => [...prev, newEntry]);
  };

  const handleVehicleChange = (e: any, name:string) => {
  if(name === "driver"){
   setDriver(e)
  }else{
    setVehicle(e);
  }
    
  };

  // const handleDriverChange = (e: React.ChangeEvent<{ value: unknown }>) => {
  //   const { value } = e.target; // Extract value from the event
  //   setDriver(value as string);
  // };

  const handleSubmit = () => {
    const newEntry: NewEntry = {
      busStop: selectedStop,
      pickupTime: routeDetails.startPoint, 
      dropoffTime: routeDetails.endPoint, 
      charges: 100, 
    };
    setScheduleData(prev => [...prev, newEntry]);

    setSelectedStop('');
    setVehicle('');
    setDriver('');
  };

  const allRouteSteps = [
    <EnterRouteDetails onChange={handleInputChange} routeDetails={routeDetails} />,
    <AddBusStops onChange={handleSelectChange} selectedStop={selectedStop} />,
    <AssignVehicleAndDriver 
      onChange={handleVehicleChange} 
      vehicle={vehicle} 
      driver={driver} 
    />,
    <Box>
      <Button variant="contained" onClick={handleSubmit}>Add Schedule</Button>
      <SetSchedule scheduleData={scheduleData} />
    </Box>,
  ];

  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={[
        'Enter Route Details',
        'Add Bus Stops',
        'Assign Vehicle and Driver',
        'Set Schedule',
      ]}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => (
        <Box p={2}>
          {allRouteSteps[step]}
        </Box>
      )}
    />
  );
};