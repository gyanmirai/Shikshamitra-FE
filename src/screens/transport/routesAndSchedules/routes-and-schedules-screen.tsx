'use client';

import 'leaflet/dist/leaflet.css';

import type { LatLngExpression } from 'leaflet';

import * as yup from 'yup';
import { useMapEvents } from 'react-leaflet';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Paper,
  Table,
  Button,
  MenuItem,
  MenuList,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import TransportMap from './component/view-on-map-dialog';

interface DropLocation {
  busStop: string;

  pickupTime: string;
  dropoffTime: string;
}

interface Route {
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  totalStops: number;
  assignedDrivers: string;
  assignedVehicles: string;
  dropLocations: DropLocation[];
  startPointLatAndLong: [number, number];
  endPointLatAndLong: [number, number];
  wayPointLatAndLong: [number, number][];
}

const routesData: Route[] = [
  {
    routeNumber: 'R102',
    startPoint: 'North Park',
    endPoint: 'South City',
    startPointLatAndLong: [21.233659274910956, 72.862602819098],
    endPointLatAndLong: [21.14843573826047, 72.88572990744605],
    wayPointLatAndLong: [
      [21.200659, 72.870602],
      [21.180435, 72.880729],
    ],
    totalStops: 2,
    assignedDrivers: 'Emily Davis',
    assignedVehicles: 'Bus C',
    dropLocations: [
      {
        busStop: 'Downtown Station',

        pickupTime: '08:15 AM',
        dropoffTime: '08:45 AM',
      },
      {
        busStop: 'Market Square',

        pickupTime: '08:50 AM',
        dropoffTime: '09:15 AM',
      },
    ],
  },
  // Add more routes as needed
];

const RoutesAndSchedulesScreen = () => {
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
                {/* <MenuItem
                  onClick={() => {
                    // setIsEdit(true);
                    // setSelectedExpense(row);
                    // dialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Edit Route
                </MenuItem> */}
                {/* <MenuItem
                  onClick={() => {
                    // handleDelete(row)
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Assign Students/Staff
                </MenuItem> */}
                <MenuItem
                  onClick={() => {
                    handleViewOnMap(row);
                  }}
                >
                  <Iconify icon="solar:eye-bold" />
                  View on Map
                </MenuItem>
                {/* <MenuItem
                  onClick={() => {
                    // handleDelete(row)
                  }}
                >
                  <Iconify icon="mingcute:notification-fill" />
                  Notify
                </MenuItem> */}
              </MenuList>
            )}
          />
        );
      },
    },
  ];
  const dialog = useBoolean();
  const mapDialog = useBoolean();
  const [selectedExpense, setSelectedExpense] = useState(routesData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(routesData);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapData, setMapData] = useState<any>(null);

  const handleViewOnMap = (data: any) => {
    const { startPointLatAndLong, endPointLatAndLong, wayPointLatAndLong } = data;

    setMapData({ startPointLatAndLong, endPointLatAndLong, wayPointLatAndLong });
    console.log('Map data being set:', {
      startPointLatAndLong,
      endPointLatAndLong,
      wayPointLatAndLong,
    });
    setMapDialogOpen(true);
  };

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };
  const mapDialogClose = () => {
    setMapDialogOpen(false);
    setMapData(null);
  };

  useEffect(() => {}, [selectedExpense, isEdit, mapDialogOpen]);

  const handleSave = (item: any) => {
    console.log('from the save', item);
    const updatedData = [...tableData, item];
    setTableData(updatedData);
  };

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    // setIsEdit(false);
    setOpen(false);
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
      <CustomizableTable data={tableData} columns={columns} tableId="routes-and-schedules-table" />
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create New Route"
      >
        <CreateRoutesForm onClose={dialog.onFalse} addNewRouteHandle={handleSave} />
      </CustomDialog>
      {mapDialogOpen && (
        <CustomDialog maxWidth="md" title="R102" open={mapDialogOpen} handleClose={mapDialogClose}>
          <TransportMap
            start={mapData?.startPointLatAndLong}
            end={mapData?.endPointLatAndLong}
            waypoints={mapData?.wayPointLatAndLong}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default RoutesAndSchedulesScreen;

interface RouteDetails {
  routeName: string;
  startPoint: string;
  endPoint: string;
}

interface NewEntry {
  stopDetails: SelectedStop[];
  startPoint: string;
  endPoint: string;
  routeName: string;
  assignedDriver: string;
  assignedBus: string;
}

interface EnterRouteDetailsProps {
  onChange: (value: any) => void;
  routeDetails: RouteDetails;
}

const EnterRouteDetails: React.FC<EnterRouteDetailsProps> = ({ onChange, routeDetails }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
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

interface SelectedStop {
  stopId: number;
  stopName: string;
  pickupTime?: string;
  dropoffTime?: string;
  assignedStudents?: string[]; // Updated to hold student names
}

interface AddBusStopsProps {
  onChange: (value: SelectedStop[]) => void;
  selectedStop: SelectedStop[];
}

const AddBusStops: React.FC<AddBusStopsProps> = ({ onChange, selectedStop }) => {
  const [busStops, setBusStops] = useState<SelectedStop[]>(selectedStop);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const handleTimeChange = (stopId: number, type: 'pickupTime' | 'dropoffTime', time: string) => {
    const updatedStops = busStops.map((stop) =>
      stop.stopId === stopId ? { ...stop, [type]: time } : stop
    );
    setBusStops(updatedStops);
    onChange(updatedStops);
  };

  const handleStudentChange = (stopId: number, selectedStudents: string[]) => {
    const updatedStops = busStops.map((stop) =>
      stop.stopId === stopId ? { ...stop, assignedStudents: selectedStudents } : stop
    );
    setBusStops(updatedStops);
    onChange(updatedStops);
  };
  const position: LatLngExpression = [21.212907926175802, 72.85037234842194];

  const fetchCityName = async (lat: number, lng: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    console.log(data);
    return (
      data.display_name || data.address?.suburb || data.address?.neighbourhood || 'Unknown Location'
    );
  };

  const isPointOnRoute = (lat: number, lng: number) => {
    const startLat = 21.212907926175802;
    const startLng = 72.85037234842194;
    const endLat = 21.232128871923543;
    const endLng = 72.90404790256112;
    // const [startLat, startLng] = startPoint;
    // const [endLat, endLng] = endPoint;

    const latDiff = endLat - startLat;
    const lngDiff = endLng - startLng;

    // Simple linear interpolation
    const isWithinLat = lat >= Math.min(startLat, endLat) && lat <= Math.max(startLat, endLat);
    const isWithinLng = lng >= Math.min(startLng, endLng) && lng <= Math.max(startLng, endLng);

    return isWithinLat && isWithinLng;
  };
  const DetectClick: React.FC = () => {
    useMapEvents({
      // eslint-disable-next-line consistent-return
      click: async (e) => {
        const { lat, lng } = e.latlng;
        console.log(`Clicked at: ${lat}, ${lng}`);

        const locationName = await fetchCityName(lat, lng);
        if (isPointOnRoute(lat, lng)) {
          const newStop = {
            stopId: Math.random(),
            stopName: locationName,
          };

          setBusStops((prevStops) => [...prevStops, newStop]);

          setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
          onChange([...busStops, newStop]);
        } else {
          return alert('This stop is outside the defined route.');
        }
      },
    });
    return null;
  };

  useEffect(() => {
    console.log('Current bus stops:', busStops);
  }, [busStops]);
  const handleRemoveStop = (stopId: number) => {
    const updatedStops = busStops.filter((stop) => stop.stopId !== stopId);
    setBusStops(updatedStops);
    onChange(updatedStops);
  };

  return (
    <Box display="flex" flexDirection="row" gap={2}>
      <Box flex={3}>
        <CustomSelect
          multiple
          options={[
            { value: 'dindoli', label: 'Dindoli' },
            { value: 'varachha', label: 'Varachha' },
          ]}
          label="Select Bus Stop"
          name="selectedBusStop"
          // @ts-ignore
          value={busStops.map((stop) => stop.stopName)}
          onChange={(e) => {
            // @ts-ignore
            const selectedBusStops = e.map((value: string) => ({
              stopId: Math.random(),
              stopName: value,
              pickupTime: '',
              dropoffTime: '',
              assignedStudents: [], // Initialize with an empty array
            }));
            setBusStops(selectedBusStops);
            onChange(selectedBusStops);
          }}
          formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
        />
        {/* {busStops.map(stop => (
            <Box key={stop.stopId} sx={{ width: "100%", display: 'flex', gap: 2 , justifyContent:"center" , alignItems:"center", justifyItems:"center" }}>
                <TextField
                    fullWidth
                    label={`Pickup Time For ${stop.stopName}`}
                    type="time"
                    value={stop.pickupTime || ''}
                    onChange={(e) => handleTimeChange(stop.stopId, 'pickupTime', e.target.value)}
                    inputProps={{
                      style: { 

                          color: stop.pickupTime ? 'inherit' : 'transparent', // Hide when empty
                      }
                  }}
                />
                <TextField

                    fullWidth
                    label={`Dropoff Time For ${stop.stopName}`}
                    type="time"
                    value={stop.dropoffTime || ''}
                    onChange={(e) => handleTimeChange(stop.stopId, 'dropoffTime', e.target.value)}
                    inputProps={{
                      style: { 
                          color: stop.pickupTime ? 'inherit' : 'transparent', // Hide when empty
                      }
                  }}
                />
                <CustomSelect
                    multiple
                    options={[
                        { value: "naveen", label: "Naveen" },
                        { value: "ramesh", label: "Ramesh" },
                    ]}
                    label="Select Student"
                    name="selectedStudent"
                    // @ts-ignore
                    value={stop.assignedStudents}  
                    // @ts-ignore
                    onChange={(e) => handleStudentChange(stop.stopId, e)} 
                    inputProps={{
                      style: { 
                          height: "150px"
                      }
                  }} 
                />
            </Box>
        ))} */}
      </Box>
      {/* <Box height="250px" width="250px">
        <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false} >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.lat, marker.lng]} >
              <Popup>{`Stop: ${busStops[index]?.stopName || 'Unknown'}`}</Popup>
            </Marker>
          ))}

          <DetectClick />
        </MapContainer>
      </Box> */}
      <Box flex={2} width="200px">
        {busStops.length > 0 ? (
          busStops.map((stop) => (
            <Box
              key={stop.stopId}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" noWrap>
                {stop.stopName}
              </Typography>
              <Button
                onClick={() => handleRemoveStop(stop.stopId)}
                size="small"
                variant="outlined"
                color="error"
                sx={{ minWidth: '24px', height: '24px', padding: '0' }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
              </Button>
            </Box>
          ))
        ) : (
          <Typography>No bus stops added yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

interface AssignVehicleAndDriverProps {
  onChange: (e: any, name: string) => void;
  vehicle: string;
  driver: string;
}

const AssignVehicleAndDriver: React.FC<AssignVehicleAndDriverProps> = ({
  onChange,
  vehicle,
  driver,
}) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
      options={[
        { value: 'bus1', label: 'Bus 1 - 30 Seater' },
        { value: 'bus2', label: 'Bus 2 - 40 Seater' },
        { value: 'van1', label: 'Van 1 - 10 Seater' },
        { value: 'bus3', label: 'Bus 3 - 50 Seater' },
      ]} // Replace with actual vehicle options
      label="Assign Vehicle"
      name="vehicle"
      value={vehicle}
      // @ts-ignore
      onChange={(value: string) => onChange(value, 'vehicle')}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <CustomSelect
      options={[
        { value: 'driver1', label: 'John Doe - License No: ABC123' },
        { value: 'driver2', label: 'Jane Smith - License No: XYZ456' },
        { value: 'driver3', label: 'Mike Johnson - License No: DEF789' },
        { value: 'driver4', label: 'Emily Davis - License No: GHI012' },
      ]} // Replace with actual driver options
      label="Assign Driver"
      name="driver"
      value={driver}
      // @ts-ignore
      onChange={(value: string) => onChange(value, 'driver')}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  </Box>
);

interface NewEntry {
  routeName: string;
  stopDetails: SelectedStop[];
}

interface SetScheduleProps {
  scheduleData: NewEntry[];
  onChange: (value: SelectedStop[]) => void;
}

const SetSchedule: React.FC<SetScheduleProps> = ({ scheduleData, onChange }) => {
  const [localScheduleData, setLocalScheduleData] = useState<NewEntry[]>(scheduleData);

  const columnsTable = [
    { key: 'busStop', label: 'Bus Stop' },
    { key: 'pickupTime', label: 'Pickup Time' },
    { key: 'dropoffTime', label: 'Dropoff Time' },
  ];

  console.log('console.log', scheduleData);
  const handleTimeChange = (
    routeName: string,
    stopName: string,
    timeType: 'pickupTime' | 'dropoffTime',
    time: string,
    stopId: number
  ) => {
    const updateData: SelectedStop[] = scheduleData[0].stopDetails.map((e) => {
      if (e.stopId === stopId) {
        return {
          ...e,
          [timeType]: time,
        };
      }
      return e;
    });

    onChange(updateData);

    setLocalScheduleData((prevData) =>
      prevData.map((entry) => {
        if (entry.routeName === routeName) {
          return {
            ...entry,
            stopDetails: entry.stopDetails.map((stop) => {
              if (stop.stopName === stopName) {
                return { ...stop, [timeType]: time };
              }
              return stop;
            }),
          };
        }
        return entry;
      })
    );
  };

  useEffect(() => {
    setLocalScheduleData(scheduleData);
  }, [scheduleData]);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columnsTable.map((column) => (
                <TableCell key={column.key}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {localScheduleData.map((entry, index) =>
              entry.stopDetails.map((stop) => (
                <TableRow key={`${entry.routeName}-${index}-${stop.stopName}`}>
                  <TableCell>{stop.stopName}</TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={stop.pickupTime || ''}
                      onChange={(e) =>
                        handleTimeChange(
                          entry.routeName,
                          stop.stopName,
                          'pickupTime',
                          e.target.value,
                          stop.stopId
                        )
                      }
                      inputProps={{ style: { padding: '5px' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={stop.dropoffTime || ''}
                      onChange={(e) =>
                        handleTimeChange(
                          entry.routeName,
                          stop.stopName,
                          'dropoffTime',
                          e.target.value,
                          stop.stopId
                        )
                      }
                      inputProps={{ style: { padding: '5px' } }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface CreateRoutesProps {
  onClose: () => void;
  addNewRouteHandle: (route: Route) => void;
}

const CreateRoutesForm: React.FC<CreateRoutesProps> = ({ onClose, addNewRouteHandle }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [routeDetails, setRouteDetails] = useState({
    routeName: '',
    startPoint: '',
    endPoint: '',
  });
  const [selectedStop, setSelectedStop] = useState<SelectedStop[]>([]);
  const [vehicle, setVehicle] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<NewEntry[]>([]);

  useEffect(() => {
    // Create a new entry from selected stops
    const newScheduleData: NewEntry = {
      stopDetails: selectedStop,
      startPoint: routeDetails.startPoint,
      endPoint: routeDetails.endPoint,
      routeName: routeDetails.routeName,
      assignedDriver: driver,
      assignedBus: vehicle,
    };

    if (activeStep === 3) {
      setScheduleData((prev) => [
        ...prev.filter((entry) => entry.routeName !== newScheduleData.routeName),
        newScheduleData,
      ]);
    }
  }, [selectedStop, routeDetails, driver, vehicle, activeStep]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setRouteDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedStops: SelectedStop[]) => {
    setSelectedStop(selectedStops);
  };

  const handleVehicleChange = (e: any, name: string) => {
    if (name === 'driver') {
      setDriver(e);
    } else {
      setVehicle(e);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = (isLastStep: boolean) => {
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handleSubmit = () => {
    if (scheduleData.length <= 0) {
      console.warn('No scheduled data available');
      onClose();
      return;
    }

    const newRoute: any = {
      routeNumber: scheduleData[0].routeName,
      startPoint: scheduleData[0].startPoint,
      endPoint: scheduleData[0].endPoint,
      totalStops: scheduleData.length,
      assignedDrivers: scheduleData[0].assignedDriver,
      assignedVehicles: scheduleData[0].assignedBus,
      dropLocations: scheduleData[0].stopDetails.map((val) => ({
        busStop: val.stopName,
        pickupTime: val.pickupTime,
        dropoffTime: val.dropoffTime,
      })),
    };

    addNewRouteHandle(newRoute);

    console.log('New Route', newRoute);

    setSelectedStop([]);
    setVehicle('');
    setDriver('');
    setRouteDetails({
      routeName: '',
      startPoint: '',
      endPoint: '',
    });

    onClose();
  };

  interface RoutePoint {
    id: number;
    name: string;
    coordinates: [number, number];
  }

  interface RouteDetailsNew {
    startPoint: RoutePoint | null;
    endPoint: RoutePoint | null;
    stops: RoutePoint[];
  }

  const [allRouteDetails, setAllRouteDetails] = useState<any>({
    startPoint: null,
    endPoint: null,
    stops: [],
  });

  const [stepOneInfo, setStepOneInfo] = useState<any>(null);
  const handleLocationData = (data: any, locationType: string) => {
    // Update route details based on locationType
    setAllRouteDetails((prevDetails: any) => {
      const newDetails = {
        ...prevDetails,
        startPoint: locationType === 'start' ? data.start : prevDetails.startPoint,
        endPoint: locationType === 'end' ? data.end : prevDetails.endPoint,
      };

      setStepOneInfo(newDetails);
      return newDetails;
    });
  };

  useEffect(() => {
    console.log('Updated route data:', allRouteDetails);
  }, [allRouteDetails, allRouteDetails.stops]);

  const handleStop = (newStop: RoutePoint) => {
    console.log('new stop from handle stop', newStop);

    setAllRouteDetails((prevDetails: any) => {
      const updatedDetails = {
        ...prevDetails,
        stops: [...prevDetails.stops, newStop],
      };
      console.log('Updated route details:', updatedDetails);

      return updatedDetails;
    });
  };

  const allRouteSteps = [
    // <LocationPicker onLocationSelect={handleLocationData}/>,
    <EnterRouteDetails onChange={handleInputChange} routeDetails={routeDetails} />,
    // <BusStopPicker stepOneInfo={stepOneInfo} onStopsChange={handleStop} />,
    <AddBusStops onChange={handleSelectChange} selectedStop={selectedStop} />,
    // <FinalRoute routeDetails={allRouteDetails} />,
    <AssignVehicleAndDriver onChange={handleVehicleChange} vehicle={vehicle} driver={driver} />,
    <SetSchedule scheduleData={scheduleData} onChange={handleSelectChange} />,
  ];

  const validationSchemas = [
    yup.object().shape({
      routeName: yup.string().required('Route name is required'),
      startPoint: yup.string().required('start point is required'),
      endPoint: yup.string().required('end point is required'),
    }),
  ];

  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={['Enter Route Details', 'Add Bus Stops', 'Assign Vehicle and Driver', 'Set Schedule']}
      activeStep={activeStep}
      handleBack={handleBack}
      validationSchema={yup.object()}
      // validationSchema={validationSchemas[activeStep]}
      handleNext={handleNext}
      renderItem={({ formik, activeStep: step }: any) => <Box p={2}>{allRouteSteps[step]}</Box>}
    />
  );
};
