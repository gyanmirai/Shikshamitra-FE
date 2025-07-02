'use client';

import type { RootState } from 'src/redux/store';

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import CreateSlotsForm from './createSlotsForm';
import AssignSlots from './assignSlotsComponent';

const LectureSlots = ({ addLectureSlotDialog }: any) => {
  // Dialog state for creating new slots
  // const addLectureSlotDialog = useBoolean();
  const [disabled, setDisabled] = useState(false);
  // Dialog state for assigning slots to other classes
  const assignSlotsDialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  const viewSlotsDialog = useBoolean();
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
              pop.onClose();
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
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
        // Add any other state resets here if needed
      }, 200); // Match this with dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
    }
  };

  return (
    <Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        noDataText={
          <>
            No Lecture Slots Found{' '}
            <Box
              onClick={() => {
                addLectureSlotDialog.onTrue();
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
            align: 'left',
            isSort: false,
            isFilter: false,
            minWidth: '80px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showViewIcon
                  handleViewClick={() => {
                    viewSlotsDialog.onTrue();
                    setDisabled(true);
                  }}
                  handleEditClick={() => {
                    setIsEdit(true);
                    addLectureSlotDialog.onTrue();
                  }}
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Lecture Slots' : 'Add Lecture Slots'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isEdit
                  ? 'Update existing lecture slots configuration'
                  : 'Add new lecture slots configuration'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={addLectureSlotDialog.value}
        handleClose={() => {
          addLectureSlotDialog.onFalse();
          setIsEdit(false);
        }}
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Lecture Slots</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View lecture slots configuration"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewSlotsDialog.value}
        handleClose={viewSlotsDialog.onFalse}
        maxWidth="md"
      >
        <CreateSlotsForm
          disabled={disabled}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign to other class</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign existing lecture slots configuration to other classes"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={assignSlotsDialog.value}
        handleClose={assignSlotsDialog.onFalse}
      >
        <AssignSlots onClose={handleClose} />
      </CustomDialog>
    </Box>
  );
};

export default LectureSlots;
