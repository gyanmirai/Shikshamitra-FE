'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Card, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CreateSlotsForm from './createSlotsForm';
import AssignSlots from './assignSlotsComponent';

const LectureSlots = ({ addLectureSlotDialog, isEdit, setIsEdit, showBreadcrumb = true }: any) => {
  const [editData, setEditData] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const assignSlotsDialog = useBoolean();
  const viewSlotsDialog = useBoolean();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            assignSlotsDialog.onTrue();
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:arrow-right-circle" sx={{ height: '16px', width: '16px' }} />
          Assign to other class
        </MenuItem>
      </MenuList>
    ),
    [assignSlotsDialog]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setIsEdit(false);
        setDisabled(false);
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      viewSlotsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addLectureSlotDialog.onFalse();
      assignSlotsDialog.onFalse();
      viewSlotsDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box>
      {/* Conditional Breadcrumbs */}
      {showBreadcrumb &&
        (addLectureSlotDialog.value ? (
          <CustomBreadcrumbs
            heading={isEdit ? 'Update Lecture Slots' : 'Add Lecture Slots'}
            description={
              isEdit
                ? 'Update existing lecture slots configuration including period and break timings.'
                : 'Create new lecture slots by defining period and break timings for a class.'
            }
            isBack
            onBack={() => handleClose(null, false)}
            links={[
              { name: 'Academic', href: '/academic/dashboard' },

              {
                name: 'Settings',
                href: '/academic/timetableSettings',
                onClick: () => {
                  addLectureSlotDialog.onFalse();
                  setEditData(null);
                  setIsEdit(false);
                },
              },
              {
                name: isEdit ? 'Update Lecture Slots' : 'Add Lecture Slots',
              },
            ]}
            sx={{ px: 1, mb: 1 }}
          />
        ) : viewSlotsDialog.value ? (
          <CustomBreadcrumbs
            heading="View Lecture Slots"
            description="View detailed lecture slots configuration including all period and break timings."
            isBack
            onBack={() => {
              viewSlotsDialog.onFalse();
              setTimeout(() => {
                setEditData(null);
                setDisabled(false);
                setIsEdit(false);
              }, 200);
            }}
            links={[
              { name: 'Academic', href: '/academic/dashboard' },

              {
                name: 'Settings',
                href: '/academic/timetableSettings',
                onClick: () => {
                  viewSlotsDialog.onFalse();
                  setEditData(null);
                },
              },
              {
                name: 'View Lecture Slots',
              },
            ]}
            sx={{ px: 1, mb: 1 }}
          />
        ) : assignSlotsDialog.value ? (
          <CustomBreadcrumbs
            heading="Assign to Other Classes"
            description="Assign existing lecture slots configuration to other classes in the system."
            isBack
            onBack={() => assignSlotsDialog.onFalse()}
            links={[
              { name: 'Academic', href: '/academic/dashboard' },

              {
                name: 'Settings',
                href: '/academic/timetableSettings',
                onClick: () => assignSlotsDialog.onFalse(),
              },
              {
                name: 'Assign Slots',
              },
            ]}
            sx={{ px: 1, mb: 1 }}
          />
        ) : null)}

      {/* Conditional Card Rendering */}
      {addLectureSlotDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: showBreadcrumb ? 2 : 0 }}>
          <CreateSlotsForm
            disabled={disabled}
            handleClose={handleClose}
            data={editData}
            isEdit={isEdit}
          />
        </Card>
      ) : viewSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: showBreadcrumb ? 2 : 0 }}>
          <CreateSlotsForm disabled={disabled} isEdit={isEdit} data={editData} />
        </Card>
      ) : assignSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: showBreadcrumb ? 2 : 0 }}>
          <AssignSlots onClose={handleClose} />
        </Card>
      ) : (
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
                  endTime: dayjs('2025-07-05T12:30'),
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
              ],
            },
          ]}
        />
      )}
    </Box>
  );
};

export default LectureSlots;
