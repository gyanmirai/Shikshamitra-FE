'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Checkbox, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import VehicleFormDialog from './add-vehicle-form-dialog';
import TransportVehicleDetailView from '../../vehicleManagement/component/transport-vehicle-detail-view';

const TransportVehicleSettingScreen = () => {
  const Vehicledata = [
    {
      id: 'bus1',
      name: 'School Bus 1',
      type: 'Bus',
      capacity: 40,
      occupied: 40,
      registrationNumber: 'MH-12-AB-1234',
      registrationDate: '01-01-2020',
      registrationExpiryDate: '01-01-2025',
      insurance: {
        policyNumber: 'INS123456',
        provider: 'National Insurance Co.',
        expiryDate: '01-01-2024',
        coverageDetails: 'Third-party and comprehensive coverage',
      },
      maintenance: {
        lastMaintenanceDate: '01-10-2023',
        nextScheduledMaintenance: '01-02-2024',
        notes: 'Oil change and brake check completed.',
      },
      fuelType: 'Diesel',
      currentStatus: 'Active',
      trackingEnabled: true,
      trackerId: 'GPS12345',
      assignedDriver: {
        id: 'driver1',
        name: 'Rakesh Mahajan',
      },
      assignedRoute: {
        id: 'route1',
        name: 'Route 1: Downtown to School',
      },
      dailyInspection: [
        {
          date: '2024-12-10',
          inspector: 'John Doe',
          remarks: 'Brakes are slightly worn; consider maintenance.',
          issuesFound: ['Brakes'],
          actionTaken: 'Scheduled maintenance for brakes.',
        },
        {
          date: '2024-12-09',
          inspector: 'Jane Smith',
          remarks: 'All systems functioning well.',
          issuesFound: [],
          actionTaken: 'None',
        },
      ],
      studentList: [
        { name: 'Jay', id: '' },
        { name: 'Hiren', id: '' },
      ],
    },
    {
      id: 'bus2',
      name: 'School Bus 2',
      type: 'Bus',
      capacity: 50,
      occupied: 40,
      registrationNumber: 'MH-12-CD-5678',
      registrationDate: '01-03-2019',
      registrationExpiryDate: '01-03-2024',
      insurance: {
        policyNumber: 'INS654321',
        provider: 'State Insurance Corp.',
        expiryDate: '01-03-2024',
        coverageDetails: 'Third-party only',
      },
      maintenance: {
        lastMaintenanceDate: '01-09-2023',
        nextScheduledMaintenance: '01-01-2024',
        notes: 'Tire replacement required soon.',
      },
      fuelType: 'CNG',
      currentStatus: 'Inactive',
      trackingEnabled: false,
      trackerId: null,
      assignedDriver: {
        id: 'driver2',
        name: 'Rajesh Patel',
      },
      assignedRoute: {
        id: 'route2',
        name: 'Route 2: Suburb to School',
      },
      dailyInspection: [
        {
          date: '2024-12-10',
          inspector: 'Jane Smith',
          remarks: 'Tire pressure low.',
          issuesFound: ['Tire pressure'],
          actionTaken: 'Inflated tires.',
        },
      ],
      studentList: [],
    },
  ];

  const vehicleDetailsDilog = useBoolean(false);
  const vehicleFormDilog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any>();
  const [isEdit, setIsEdit] = useState<any>(false);
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
        <VehicleFormDialog
          onClose={closeHandler}
          vehicle={selectedEntry}
          dialogValue={vehicleFormDilog.value}
          isEdit={isEdit}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Vehicle Management"
              links={[{ name: 'Transport' }, { name: 'Vehicle Management' }]}
              sx={{ px: 1, mb: 2 }}
            />

            <Box display="flex" justifyContent="flex-end">
              <Button
                startIcon={<Add />}
                onClick={() => {
                  setOpen(true);
                  // vehicleFormDilog.onTrue();
                }}
                variant="contained"
              >
                Add Vehicle
              </Button>
            </Box>
          </Box>

          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            tableId="vehicle-management-table"
            data={Vehicledata}
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
                        !!Vehicledata?.length && selectedStudents?.length === Vehicledata?.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(Vehicledata || []);
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  );
                },
                render(value: any, row: any) {
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
              {
                id: 'name',
                label: 'Name',
              },

              {
                id: 'capacity',
                label: 'Capacity',
              },
              {
                id: 'occupied',
                label: 'Occupied',
              },
              {
                id: 'fuelType',
                label: 'Fule Type',
              },
              {
                id: 'registrationNumber',
                label: 'Registration Number',
              },

              {
                id: 'assignedRoute',
                label: 'Assigned Route',
                render(value, row) {
                  return <Typography fontSize="12px">{row.assignedRoute.name}</Typography>;
                },
              },
              {
                id: 'assignedDriver',
                label: 'Assigned Driver',
                render(value, row) {
                  return <Typography fontSize="12px">{row.assignedDriver.name}</Typography>;
                },
              },
              {
                id: 'action',
                label: 'Action',
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showEditIcon
                      showViewIcon
                      handleEditClick={() => {}}
                      handleViewClick={() => {
                        setSelectedEntry(row);

                        console.log('row', row);

                        vehicleDetailsDilog.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
          />

          {sendInstantNotificationDialogValue.value && (
            <SendInstantNotificationDialog
              open={sendInstantNotificationDialogValue.value}
              onClose={sendInstantNotificationDialogValue.onFalse}
              data={[]}
              userList={selectedStudents}
            />
          )}

          <CustomDialog
            title="Vehicle Details"
            open={vehicleDetailsDilog.value}
            handleClose={vehicleDetailsDilog.onFalse}
            maxWidth="xl"
            fullWidth
            PaperProps={{
              sx: {
                padding: 2,
                margin: '16px',
                borderRadius: '8px',
                height: '100vh',
              },
            }}
          >
            <Scrollbar sx={{ p: 3 }}>
              <TransportVehicleDetailView vehicleNumber={selectedEntry} />
            </Scrollbar>
          </CustomDialog>
        </>
      )}
    </>
  );
};

export default TransportVehicleSettingScreen;
