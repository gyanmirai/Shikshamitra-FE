import React, { useState } from 'react';

import { MenuItem, MenuList } from '@mui/material';
import { FamilyRestroomRounded } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import DriverFormDialog from './transport-driver-form-dialog';
import TransportDriverDetailsDialog from './transport-driver-details-dialog';

const TransportDriverSettingScreen = () => {
  const Driverdata = [
    {
      id: 'driver1',
      name: 'Rakesh Mahajan',
      age: '34',
      licenseNumber: 'DL123456',
      licenseExpiryDate: '20-05-2025',
      contactNumber: '+91-234-567-8951',
      address: '123 Main Street, Anytown, USA',
      emergencyContact: {
        name: 'Ravi Mahajan',
        number: '+91-234-567-8951',
      },
      experience: '10 years',
      workingHours: {
        morning: '6 AM - 9 AM',
        evening: '3 PM - 6 PM',
      },
      status: 'Active',
      vehicle: {
        id: 'bus1',
        name: 'School Bus 1',
        capacity: 40,
      },
      assignedRoute: 'route1',
    },
    {
      id: 'driver2',
      name: 'Rajesh Patel',
      age: '40',
      licenseNumber: 'DL654321',
      licenseExpiryDate: '08-15-2024',
      contactNumber: '+91-234-567-8928',
      address: '456 Elm Street, Anytown, USA',
      emergencyContact: {
        name: 'Poonam Patel',
        number: '+91-234-567-8928',
      },
      experience: '15 years',
      workingHours: {
        morning: '5 AM - 8 AM',
        evening: '2 PM - 5 PM',
      },
      status: 'Inactive',
      vehicle: {
        id: 'bus2',
        name: 'School Bus 2',
        capacity: 50,
      },
      assignedRoute: 'route2',
    },
    {
      id: 'driver1',
      name: 'Sumit Mahajan',
      age: '34',
      licenseNumber: 'DL123456',
      licenseExpiryDate: '08-08-2025',
      contactNumber: '+91-234-567-8908',
      address: '123 Main Street, Anytown, USA',
      emergencyContact: {
        name: 'Ravi Mahajan',
        number: '+91-234-567-8908',
      },
      experience: '10 years',
      workingHours: {
        morning: '6 AM - 9 AM',
        evening: '3 PM - 6 PM',
      },
      status: 'Active',
    },
  ];

  const driverDetailsDilog = useBoolean();
  const driverFormDilog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any>();
  const [isEdit, setIsEdit] = useState<any>(FamilyRestroomRounded);
  return (
    <>
      <CustomizableTable
        data={Driverdata}
        columns={[
          {
            id: 'name',
            label: 'Name',
          },

          {
            id: 'age',
            label: 'Age',
          },
          {
            id: 'assignedRoute',
            label: 'Assigned Route',
          },
          {
            id: 'licenseNumber',
            label: 'License Number',
          },
          {
            id: 'contactNumber',
            label: 'Contact Number',
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          // setIsEdit(true);
                          setSelectedEntry(row);

                          driverDetailsDilog.onTrue();
                        }}
                      >
                        <Iconify icon="mdi:eye" />
                        View
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);

                          driverFormDilog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
      />
      {driverFormDilog && (
        <DriverFormDialog
          isEdit={isEdit}
          onClose={() => {
            driverFormDilog.onFalse();
          }}
          driver={selectedEntry}
          dialogValue={driverFormDilog.value}
        />
      )}
      {driverDetailsDilog && (
        <TransportDriverDetailsDialog
          onClose={() => {
            driverDetailsDilog.onFalse();
          }}
          driver={selectedEntry}
          dialogValue={driverDetailsDilog.value}
        />
      )}
      ;
    </>
  );
};

export default TransportDriverSettingScreen;
