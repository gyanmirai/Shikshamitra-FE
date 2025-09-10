'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Button, Checkbox, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import VehicleFormDialog from './add-vehicle-form-dialog';
import { Vehicledata } from '../data/transport-vehicle-management-screen-data';
import TransportVehicleDetailView from '../../vehicleManagement/component/transport-vehicle-detail-view';

import type { IVehicle } from '../interface/vehicle-interface';

const TransportVehicleSettingScreen = () => {
  // Dialog state for vehicle details view
  const vehicleDetailsDilog = useBoolean(false);
  // Dialog state for vehicle form (add/edit)
  const vehicleFormDilog = useBoolean();
  // State to store selected vehicle data
  const [selectedEntry, setSelectedEntry] = useState<IVehicle>();
  // State to track if form is in edit mode
  const [isEdit] = useState<boolean>(false);
  // State to control dialog visibility
  const [open, setOpen] = useState<boolean>(false);
  const closeHandler = () => {
    // setIsEdit(false);
    setOpen(false);
  };

  const [selectedVehicle, setSelectedVehicle] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box height="100%">
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

            <Button startIcon={<Add />} onClick={() => setOpen(true)} variant="contained">
              Add Vehicle
            </Button>
          </Box>

          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedVehicle.length > 0}
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
                renderColumn: () => (
                  <Checkbox
                    checked={
                      Vehicledata?.length > 0 && selectedVehicle?.length === Vehicledata?.length
                    }
                    onChange={(e) => setSelectedVehicle(e.target.checked ? Vehicledata : [])}
                  />
                ),
                render: (value, row) => (
                  <Checkbox
                    checked={selectedVehicle.some((item: any) => item.id === row.id)}
                    onChange={(e) => {
                      const updatedSelection = e.target.checked
                        ? [...selectedVehicle, row]
                        : selectedVehicle.filter((item: any) => item.id !== row.id);
                      setSelectedVehicle(updatedSelection);
                    }}
                  />
                ),
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
                label: 'Fuel Type',
              },
              {
                id: 'registrationNumber',
                label: 'Registration Number',
              },
              {
                id: 'assignedRoute',
                label: 'Assigned Route',
                render: (value, row) => (
                  <Typography variant="body2">{row.assignedRoute.name}</Typography>
                ),
              },
              {
                id: 'assignedDriver',
                label: 'Assigned Driver',
                render: (value, row) => (
                  <Typography variant="body2">{row.assignedDriver.name}</Typography>
                ),
              },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                render: (value, row) => (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showEditIcon
                    showViewIcon
                    handleEditClick={() => {}}
                    handleViewClick={() => {
                      setSelectedEntry(row as IVehicle);
                      vehicleDetailsDilog.onTrue();
                    }}
                  />
                ),
              },
            ]}
          />

          {sendInstantNotificationDialogValue.value && (
            <SendInstantNotificationDialog
              open={sendInstantNotificationDialogValue.value}
              onClose={sendInstantNotificationDialogValue.onFalse}
              data={[]}
              userList={selectedVehicle}
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
    </Box>
  );
};

export default TransportVehicleSettingScreen;
