import React, { useState } from 'react';

import { Box, Button, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ViewStopDetailDialog from './view-stop-details-dialog';
// import TransportAddingStopDialog from './transport-adding-stop-dialog';

const TransportStopsSettingScreen = () => {
  const addingStopDialog = useBoolean();
  const viewStopDialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any>();

  const stopData = [
    {
      name: 'Madhuram Circle',
      addressLine1: 'one',
      addressLine2: 'one',
      charges: '1,000.00',
      ridersCount: '2',
      riders: [],
    },
    {
      name: 'Madhuram Circle',
      addressLine1: 'one',
      addressLine2: 'one',
      charges: '1,000.00',
      ridersCount: '2',
      riders: [],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => {
            addingStopDialog.onTrue();
          }}
          variant="contained"
        >
          Add Stops
        </Button>
      </Box>
      <CustomizableTable
        data={stopData}
        columns={[
          {
            id: 'name',
            label: 'Name',
          },

          {
            id: 'charges',
            label: 'Charges ₹',
          },
          {
            id: 'ridersCount',
            label: 'Total Riders',
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

                          console.log('row', row);

                          viewStopDialog.onTrue();
                        }}
                      >
                        <Iconify icon="mdi:eye" />
                        View
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          // setIsEdit(true);
                          // setSelectedEntry(row);
                          // driverFormDilog.onTrue();
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

      {/* <Box>
                {addingStopDialog && <TransportAddingStopDialog dialogValue={addingStopDialog.value} onClose={() => { addingStopDialog.onFalse() }} />}
            </Box> */}

      {viewStopDialog && (
        <ViewStopDetailDialog
          dialogValue={viewStopDialog.value}
          onClose={() => {
            viewStopDialog.onFalse();
          }}
        />
      )}
    </Box>
  );
};

export default TransportStopsSettingScreen;
