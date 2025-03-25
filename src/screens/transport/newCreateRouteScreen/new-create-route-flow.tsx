'use client';

import 'leaflet/dist/leaflet.css';

import * as yup from 'yup';
import React, { useState } from 'react';

import { Box, Button, Checkbox, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import IconEnum from 'src/utils/common-icon';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import ManageStopsWithRiders from './component/stop-details';
import ViewRouteDetailsDialog from './view-route-details-dialog';
import AssignVehicleAndDriver from './component/assign-vehicle-and-driver';
import TransportMap from '../routesAndSchedules/component/view-on-map-dialog';

const NewCreateRouteScreen = () => {
  const routesData = [
    {
      routeName: 'Route 1 - North Campus',
      vehicle: 'Bus 1',
      driver: 'Rajesh Kumar',
      totalStops: 4,
      totalRiders: 16,
      startPointLatAndLong: [21.233659274910956, 72.862602819098],
      endPointLatAndLong: [21.14843573826047, 72.88572990744605],
      wayPointLatAndLong: [
        [21.200659, 72.870602],
        [21.180435, 72.880729],
      ],
      stops: [
        {
          stopName: 'MG Road Metro Station',
          pickUpTime: '08:00 AM',
          dropOffTime: '03:30 PM',
          assignedRiders: 15,
          students: [
            { name: 'Aryan Sharma', grade: '10', rollNumber: 'S101' },
            { name: 'Priya Singh', grade: '8', rollNumber: 'S102' },
            { name: 'Kunal Verma', grade: '9', rollNumber: 'S103' },
            { name: 'Sneha Gupta', grade: '7', rollNumber: 'S104' },
            { name: 'Rohit Das', grade: '11', rollNumber: 'S105' },
            { name: 'Ayesha Khan', grade: '6', rollNumber: 'S106' },
          ],
        },
        {
          stopName: 'Cyber City Tower 5',
          pickUpTime: '08:15 AM',
          dropOffTime: '03:15 PM',
          assignedRiders: 10,
          students: [
            { name: 'Ananya Roy', grade: '8', rollNumber: 'S107' },
            { name: 'Arjun Patel', grade: '10', rollNumber: 'S108' },
            { name: 'Ritika Mehra', grade: '9', rollNumber: 'S109' },
            { name: 'Kabir Malhotra', grade: '12', rollNumber: 'S110' },
            { name: 'Manav Joshi', grade: '7', rollNumber: 'S111' },
          ],
        },
        {
          stopName: 'DLF Phase 2 Gate 3',
          pickUpTime: '08:30 AM',
          dropOffTime: '03:00 PM',
          assignedRiders: 20,
          students: [
            { name: 'Ishita Pandey', grade: '11', rollNumber: 'S112' },
            { name: 'Harsh Vardhan', grade: '6', rollNumber: 'S113' },
            { name: 'Nidhi Kapoor', grade: '8', rollNumber: 'S114' },
            { name: 'Sanjana Iyer', grade: '10', rollNumber: 'S115' },
          ],
        },
        {
          stopName: 'Sector 14 Market',
          pickUpTime: '08:45 AM',
          dropOffTime: '02:45 PM',
          assignedRiders: 25,
          students: [
            { name: 'Rajiv Nair', grade: '7', rollNumber: 'S201' },
            { name: 'Meera Kapoor', grade: '9', rollNumber: 'S202' },
            { name: 'Akash Jain', grade: '11', rollNumber: 'S203' },
          ],
        },
      ],
    },
    {
      routeName: 'Route 2 - South City',
      vehicle: 'Van 1',
      driver: 'Anita Verma',
      totalStops: 4,
      totalRiders: 16,
      startPointLatAndLong: [21.14856834029464, 72.88578355767018],
      endPointLatAndLong: [21.212188582367023, 72.89996326440937],
      wayPointLatAndLong: [
        [21.200659, 72.870602],
        [21.180435, 72.880729],
      ],
      stops: [
        {
          stopName: 'Huda City Centre',
          pickUpTime: '07:45 AM',
          dropOffTime: '03:15 PM',
          assignedRiders: 8,
          students: [
            { name: 'Divya Reddy', grade: '8', rollNumber: 'S204' },
            { name: 'Neha Saxena', grade: '10', rollNumber: 'S205' },
            { name: 'Aditya Bansal', grade: '6', rollNumber: 'S206' },
            { name: 'Pooja Mishra', grade: '8', rollNumber: 'S207' },
          ],
        },
        {
          stopName: 'Sector 40 Community Center',
          pickUpTime: '08:00 AM',
          dropOffTime: '03:00 PM',
          assignedRiders: 7,
          students: [
            { name: 'Rohan Malhotra', grade: '7', rollNumber: 'S208' },
            { name: 'Simran Chawla', grade: '12', rollNumber: 'S209' },
            { name: 'Ankit Tiwari', grade: '10', rollNumber: 'S210' },
          ],
        },
      ],
    },
    {
      routeName: 'Route 3 - West Side',
      vehicle: 'Bus 2',
      driver: 'Vikram Singh',
      totalStops: 4,
      totalRiders: 5,
      startPointLatAndLong: [21.233659274910956, 72.862602819098],
      endPointLatAndLong: [21.14843573826047, 72.88572990744605],
      wayPointLatAndLong: [
        [21.200659, 72.870602],
        [21.180435, 72.880729],
      ],
      stops: [
        {
          stopName: 'Rajiv Chowk',
          pickUpTime: '07:30 AM',
          dropOffTime: '03:30 PM',
          assignedRiders: 18,
          students: [
            { name: 'Isha Mathur', grade: '7', rollNumber: 'S302' },
            { name: 'Ravi Yadav', grade: '8', rollNumber: 'S303' },
            { name: 'Tanya Bhardwaj', grade: '9', rollNumber: 'S304' },
            { name: 'Aman Chandra', grade: '10', rollNumber: 'S305' },
          ],
        },
        {
          stopName: 'Udyog Vihar Phase 4',
          pickUpTime: '07:45 AM',
          dropOffTime: '03:15 PM',
          assignedRiders: 22,
          students: [
            { name: 'Kritika Singh', grade: '11', rollNumber: 'S306' },
            { name: 'Anshuman Rao', grade: '12', rollNumber: 'S307' },
            { name: 'Pallavi Das', grade: '8', rollNumber: 'S308' },
            { name: 'Rahul Tripathi', grade: '9', rollNumber: 'S309' },
          ],
        },
        {
          stopName: 'IFFCO Chowk Metro Station',
          pickUpTime: '08:00 AM',
          dropOffTime: '03:00 PM',
          assignedRiders: 30,
          students: [
            { name: 'Anjali Sinha', grade: '11', rollNumber: 'S313' },
            { name: 'Kartik Goel', grade: '12', rollNumber: 'S314' },
            { name: 'Pranav Joshi', grade: '9', rollNumber: 'S315' },
            { name: 'Ira Sharma', grade: '7', rollNumber: 'S316' },
          ],
        },
        {
          stopName: 'Sector 17 Post Office',
          pickUpTime: '08:15 AM',
          dropOffTime: '02:45 PM',
          assignedRiders: 25,
          students: [
            { name: 'Shivani Thakur', grade: '6', rollNumber: 'S310' },
            { name: 'Ritika Sehgal', grade: '7', rollNumber: 'S311' },
            { name: 'Nikhil Tandon', grade: '10', rollNumber: 'S312' },
          ],
        },
      ],
    },
  ];
  const dialog = useBoolean();
  const ViewRouteDetailsdialog = useBoolean();

  const [selectedRoute, setSelectedRoute] = useState<any>();
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

  const mapDialogClose = () => {
    setMapDialogOpen(false);
    setMapData(null);
  };

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    // setIsEdit(false);
    setOpen(false);
  };

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      {open ? (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between">
            <CustomBreadcrumbs
              heading="Routes and Schedules"
              links={[{ name: 'Transport' }, { name: 'Routes and Schedules' }, { name: 'Form' }]}
              sx={{ px: 1, mb: 2 }}
            />
            <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
              <Button
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={closeHandler}
                variant="contained"
                size="small"
              >
                Back
              </Button>
            </Box>
          </Box>
          <CreateRoutesForm onClose={closeHandler} />
        </Box>
      ) : (
        <>
          {/* Breadcrumbs and Create Button */}
          <Box
            pb="20px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Routes and Schedules"
              links={[{ name: 'Transport' }, { name: 'Routes and Schedules' }]}
              sx={{ px: 1, mb: 2 }}
            />
            <Box display="flex" flexDirection="row" justifyContent="flex-end">
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                variant="contained"
                size="small"
              >
                Create New Route
              </Button>
            </Box>
          </Box>

          {/* Routes Table */}
          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            tableId="routes-table"
            data={routesData}
            columns={[
              {
                id: 'checkBox',
                align: 'left',
                minWidth: '60px',
                isSort: false,
                isFilter: false,
                label: '',
                renderColumn() {
                  return (
                    <Checkbox
                      checked={
                        !!routesData?.length && selectedStudents?.length === routesData?.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(routesData || []);
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  );
                },
                render(value, row) {
                  return (
                    <Checkbox
                      checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, row]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                        }
                      }}
                    />
                  );
                },
              },
              { id: 'routeName', label: 'Route Name' },
              { id: 'vehicle', label: 'Assigned Vehicle' },
              { id: 'driver', label: 'Assigned Driver' },
              { id: 'totalStops', label: 'Total Stops' },
              { id: 'totalRiders', label: 'Total Riders' },
              {
                id: 'action',
                label: 'Action',
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      placement="right-top"
                      actions={({ popover }) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              handleViewOnMap(row);
                            }}
                          >
                            <Iconify icon={IconEnum.VIEW} sx={{ mr: 1 }} />
                            View on Map
                          </MenuItem>
                        </MenuList>
                      )}
                    />
                  );
                },
              },
            ]}
          />
        </>
      )}

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      {/* View Route Details Dialog */}
      {ViewRouteDetailsdialog.value && (
        <ViewRouteDetailsDialog
          onClose={ViewRouteDetailsdialog.onFalse}
          dialogValue={ViewRouteDetailsdialog.value}
          data={selectedRoute}
        />
      )}

      {/* Map Dialog */}
      {mapDialogOpen && (
        <CustomDialog fullScreen title="R102" open={mapDialogOpen} handleClose={mapDialogClose}>
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

export default NewCreateRouteScreen;

interface CreateRoutesProps {
  onClose: () => void;
  // addNewRouteHandle: (route: Route) => void;
}

const CreateRoutesForm: React.FC<CreateRoutesProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [routeDetails, setRouteDetails] = useState({
    routeName: '',
    startPoint: '',
    endPoint: '',
  });
  const [selectedStop, setSelectedStop] = useState<any>([]);
  const [vehicle, setVehicle] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<any>([]);

  // interface RoutePoint {
  //   id: number;
  //   name: string;
  //   coordinates: [number, number];
  // }

  // interface RouteDetailsNew {
  //   startPoint: RoutePoint | null;
  //   endPoint: RoutePoint | null;
  //   stops: RoutePoint[];
  // }

  // const [allRouteDetails, setAllRouteDetails] = useState<any>({
  //   startPoint: null,
  //   endPoint: null,
  //   stops: [],
  // });

  // const [stepOneInfo, setStepOneInfo] = useState<any>(null);
  // const handleLocationData = (data: any, locationType: string) => {
  //   // Update route details based on locationType
  //   setAllRouteDetails((prevDetails: any) => {
  //     const newDetails = {
  //       ...prevDetails,
  //       startPoint: locationType === 'start' ? data.start : prevDetails.startPoint,
  //       endPoint: locationType === 'end' ? data.end : prevDetails.endPoint,
  //     };

  //     setStepOneInfo(newDetails);
  //     return newDetails;
  //   });
  // };

  // useEffect(() => {
  //   console.log('Updated route data:', allRouteDetails);
  // }, [allRouteDetails, allRouteDetails.stops]);

  // const handleStop = (newStop: RoutePoint) => {
  //   console.log('new stop from handle stop', newStop);

  //   setAllRouteDetails((prevDetails: any) => {
  //     const updatedDetails = {
  //       ...prevDetails,
  //       stops: [...prevDetails.stops, newStop],
  //     };
  //     console.log('Updated route details:', updatedDetails);

  //     return updatedDetails;
  //   });
  // };

  const allRouteSteps = [<AssignVehicleAndDriver />, <ManageStopsWithRiders />];

  // const validationSchemas = [
  //   yup.object().shape({
  //     routeName: yup.string().required('Route name is required'),
  //     startPoint: yup.string().required('start point is required'),
  //     endPoint: yup.string().required('end point is required'),
  //   }),
  // ];

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
    }
  };

  return (
    <CustomStepperWithFormik
      scrollbarHeight="60vh"
      initialValues={{}}
      steps={['Assign Vehicle and Driver', 'Enter Route Details']}
      activeStep={activeStep}
      handleBack={handleBack}
      validationSchema={yup.object()}
      // validationSchema={validationSchemas[activeStep]}
      handleNext={handleNext}
      renderItem={({ formik, activeStep: step }: any) => <Box p={2}>{allRouteSteps[step]}</Box>}
    />
  );
};
