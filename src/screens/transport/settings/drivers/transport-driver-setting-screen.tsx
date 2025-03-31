import React, { useState } from 'react';

import { MenuItem, MenuList } from '@mui/material';
import { FamilyRestroomRounded } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { Driverdata } from '../data/transport-driver-data';
import DriverFormDialog from './transport-driver-form-dialog';
import TransportDriverDetailsDialog from './transport-driver-details-dialog';

import type { Driver } from '../data/transport-driver-data';

const TransportDriverSettingScreen = () => {
  const driverDetailsDilog = useBoolean();
  const driverFormDilog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<Driver>();
  const [isEdit, setIsEdit] = useState<any>(FamilyRestroomRounded);
  return (
    <>
      <CustomizableTable
        tableId="transport-driver-table"
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
                          setSelectedEntry(row as Driver);

                          driverDetailsDilog.onTrue();
                        }}
                      >
                        <Iconify icon="mdi:eye" />
                        View
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row as Driver);

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
    </>
  );
};

export default TransportDriverSettingScreen;
