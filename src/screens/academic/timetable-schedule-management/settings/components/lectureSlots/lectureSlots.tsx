'use client';

import type { RootState } from 'src/redux/store';

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button, MenuList, MenuItem } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import CreateSlotsForm from './createSlotsForm';
import AssignSlots from './assignSlotsComponent';

const LectureSlots = () => {
  // Dialog state for creating new slots
  const createSlotsDialog = useBoolean();
  // Dialog state for assigning slots to other classes
  const assignSlotsDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              assignSlotsDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:arrow-right-bold" />
            Assign to other class
          </MenuItem>
        </MenuList>
      </>
    ),
    [assignSlotsDialog]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      createSlotsDialog.onFalse();

      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      createSlotsDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={createSlotsDialog.onTrue}
        >
          Create Slots
        </Button>
      </Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        noDataText={
          <>
            No Lecture Slots Found{' '}
            <Box
              onClick={() => {
                createSlotsDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Slots
            </Box>
          </>
        }
        columns={[
          { id: 'className', label: 'Class', filterType: 'number' },
          { id: 'periodSlots', label: 'Period Slots', filterType: 'number' },
          { id: 'breakSlots', label: 'Break Slots', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showViewIcon
                  handleViewClick={() => {}}
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            className: 1,
            periodSlots: 6, // Number of periods
            breakSlots: 2, // Number of breaks
          },
          {
            id: 2,
            className: 2,
            periodSlots: 5,
            breakSlots: 1,
          },
          {
            id: 3,
            className: 3,
            periodSlots: 7,
            breakSlots: 2,
          },
        ]}
      />

      <CustomDialog
        title="Create Slots"
        open={createSlotsDialog.value}
        handleClose={createSlotsDialog.onFalse}
        maxWidth="md"
      >
        <CreateSlotsForm
        // onSave={handleSave}
        // dialogValue={dialog.value}
        // onClose={closeDialog}
        // data={selectedEntry}
        // isEdit={isEdit}
        // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title="Assign this slot to another classes"
        open={assignSlotsDialog.value}
        handleClose={assignSlotsDialog.onFalse}
      >
        <AssignSlots />
      </CustomDialog>
    </Box>
  );
};

export default LectureSlots;
