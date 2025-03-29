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
import { Vehicledata } from '../data/transport-vehicle-management-screen-data';
import TransportVehicleDetailView from '../../vehicleManagement/component/transport-vehicle-detail-view';

import type { Vehicle } from '../data/transport-vehicle-management-screen-data';

const TransportVehicleSettingScreen = () => {
  const vehicleDetailsDilog = useBoolean(false);
  const vehicleFormDilog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<Vehicle>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

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
                        setSelectedEntry(row as Vehicle);

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
