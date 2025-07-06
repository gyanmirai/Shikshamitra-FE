'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
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

const LectureSlots = ({ addLectureSlotDialog, isEdit, setIsEdit }: any) => {
  // State to track if form is in edit mode
  // const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  // State to control form input fields being disabled/enabled
  const [disabled, setDisabled] = useState(false);

  // Dialog state for assigning slots to other classes
  const assignSlotsDialog = useBoolean();

  // Dialog state for viewing slot details
  const viewSlotsDialog = useBoolean();

  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function
  const dispatch = useDispatch();

  // Memoized actions menu component for the table
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              // Open assign slots dialog and close popover
              assignSlotsDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle" sx={{ height: '16px', width: '16px' }} />
            Assign to other class
          </MenuItem>
        </MenuList>
      </>
    ),
    [assignSlotsDialog]
  );
  /**
   * Handles closing of lecture slot dialogs and resetting state
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   *
   * This method:
   * 1. Defines a resetState helper to clear changes flag after dialog animation
   * 2. Closes dialogs and resets state if:
   *    - Form was submitted successfully
   *    - User confirms leaving with unsaved changes
   *    - No unsaved changes exist
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setIsEdit(false);
        setDisabled(false);
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // Match this with dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        noDataText={
          <>
            Lecture Slots Data Not Found{' '}
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
                    setIsEdit(false);
                    setEditData(row as any);
                  }}
                  handleEditClick={() => {
                    setDisabled(false);
                    setIsEdit(true);
                    setEditData(row as any);
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
            periodSlots: 6,
            breakSlots: 2,
            timeSlots: [
              {
                id: 0,
                startTime: dayjs('2024-01-01T07:00'),
                endTime: dayjs('2025-07-05T08:40'),
                slotType: 'period',
              },
              {
                id: 1,
                startTime: dayjs('2025-07-05T08:40'),
                endTime: dayjs('2025-07-05T09:20'),
                slotType: 'period',
              },
              {
                id: 2,
                startTime: dayjs('2025-07-05T09:20'),
                endTime: dayjs('2025-07-05T09:30'),
                slotType: 'break',
                breakType: 'short',
              },
              {
                id: 3,
                startTime: dayjs('2025-07-05T09:30'),
                endTime: dayjs('2025-07-05T10:10'),
                slotType: 'period',
              },
              {
                id: 4,
                startTime: dayjs('2025-07-05T10:10'),
                endTime: dayjs('2025-07-05T10:50'),
                slotType: 'period',
              },
              {
                id: 5,
                startTime: dayjs('2025-07-05T10:50'),
                endTime: dayjs('2025-07-05T11:30'),
                slotType: 'period',
              },
              {
                id: 6,
                startTime: dayjs('2025-07-05T11:30'),
                endTime: dayjs('2025-07-05T12:00'),
                slotType: 'break',
                breakType: 'lunch',
              },
              {
                id: 7,
                startTime: dayjs('2025-07-05T12:00'),
                endTime: dayjs('2024-01-01T12:30'),
                slotType: 'period',
              },
            ],
          },
          {
            id: 2,
            className: 2,
            periodSlots: 5,
            breakSlots: 1,
            timeSlots: [
              {
                id: 0,
                startTime: dayjs('2024-01-01T07:00'),
                endTime: dayjs('2025-07-05T08:40'),
                slotType: 'period',
              },
              {
                id: 1,
                startTime: dayjs('2025-07-05T08:40'),
                endTime: dayjs('2025-07-05T09:20'),
                slotType: 'period',
              },
              {
                id: 2,
                startTime: dayjs('2025-07-05T09:20'),
                endTime: dayjs('2025-07-05T09:50'),
                slotType: 'break',
                breakType: 'short',
              },
              {
                id: 3,
                startTime: dayjs('2025-07-05T09:50'),
                endTime: dayjs('2025-07-05T10:30'),
                slotType: 'period',
              },
              {
                id: 4,
                startTime: dayjs('2025-07-05T10:30'),
                endTime: dayjs('2025-07-05T11:10'),
                slotType: 'period',
              },
              {
                id: 5,
                startTime: dayjs('2025-07-05T11:10'),
                endTime: dayjs('2024-01-01T07:00'),
                slotType: 'period',
              },
            ],
          },
          {
            id: 3,
            className: 3,
            periodSlots: 7,
            breakSlots: 2,
            timeSlots: [
              {
                id: 0,
                startTime: dayjs('2024-01-01T07:00'),
                endTime: dayjs('2025-07-05T08:40'),
                slotType: 'period',
              },
              {
                id: 1,
                startTime: dayjs('2025-07-05T08:40'),
                endTime: dayjs('2025-07-05T09:20'),
                slotType: 'period',
              },
              {
                id: 2,
                startTime: dayjs('2025-07-05T09:20'),
                endTime: dayjs('2025-07-05T09:30'),
                slotType: 'break',
                breakType: 'short',
              },
              {
                id: 3,
                startTime: dayjs('2025-07-05T09:30'),
                endTime: dayjs('2025-07-05T10:10'),
                slotType: 'period',
              },
              {
                id: 4,
                startTime: dayjs('2025-07-05T10:10'),
                endTime: dayjs('2025-07-05T10:50'),
                slotType: 'period',
              },
              {
                id: 5,
                startTime: dayjs('2025-07-05T10:50'),
                endTime: dayjs('2025-07-05T11:30'),
                slotType: 'period',
              },
              {
                id: 6,
                startTime: dayjs('2025-07-05T11:30'),
                endTime: dayjs('2025-07-05T12:00'),
                slotType: 'break',
                breakType: 'lunch',
              },
              {
                id: 7,
                startTime: dayjs('2025-07-05T12:00'),
                endTime: dayjs('2025-07-05T12:40'),
                slotType: 'period',
              },
              {
                id: 8,
                startTime: dayjs('2025-07-05T12:40'),
                endTime: dayjs('2024-01-01T12:30'),
                slotType: 'period',
              },
            ],
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
          setTimeout(() => {
            setIsEdit(false);
            setDisabled(false);
            setEditData(null);
          }, 200); // Match this with dialog close animation
        }}
        maxWidth="md"
      >
        <CreateSlotsForm
          disabled={disabled}
          handleClose={handleClose}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          data={editData}
          isEdit={isEdit}
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
        handleClose={() => {
          viewSlotsDialog.onFalse();
          setTimeout(() => {
            setDisabled(false);
            setEditData(null);
            setIsEdit(false);
          }, 200); // Match this with dialog close animation
        }}
        maxWidth="md"
      >
        <CreateSlotsForm
          disabled={disabled}
          isEdit={isEdit}
          data={editData}
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
