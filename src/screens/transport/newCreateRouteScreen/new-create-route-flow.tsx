'use client';

import 'leaflet/dist/leaflet.css';

import * as yup from 'yup';
import React, { useState } from 'react';
import IconEnum from 'src/utils/common-icon';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { Box, Button, Checkbox, MenuItem, MenuList } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { routesData } from './data/new-route-data';
import ManageStopsWithRiders from './component/stop-details';
import ViewRouteDetailsDialog from './view-route-details-dialog';
import AssignVehicleAndDriver from './component/assign-vehicle-and-driver';
import TransportMap from '../routesAndSchedules/component/view-on-map-dialog';

const NewCreateRouteScreen = () => {
  const ViewRouteDetailsdialog = useBoolean();

  const [selectedRoute] = useState<any>();
  const [mapDialogOpen, setMapDialogOpen] = useState<boolean>(false);
  const [mapData, setMapData] = useState<any>(null);
  const handleViewOnMap = (data: any) => {
    const { startPointLatAndLong, endPointLatAndLong, wayPointLatAndLong } = data;

    setMapData({ startPointLatAndLong, endPointLatAndLong, wayPointLatAndLong });
    //
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
            />
            <Box sx={{ mr: '15px', mb: '20px' }} gap={1} display="flex" justifyContent="flex-end">
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
  const [scheduleData] = useState<any>([]);

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
  //
  // }, [allRouteDetails, allRouteDetails.stops]);

  // const handleStop = (newStop: RoutePoint) => {
  //

  //   setAllRouteDetails((prevDetails: any) => {
  //     const updatedDetails = {
  //       ...prevDetails,
  //       stops: [...prevDetails.stops, newStop],
  //     };
  //

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
