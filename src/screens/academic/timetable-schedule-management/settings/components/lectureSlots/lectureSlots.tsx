'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Button, MenuList, MenuItem } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CreateSlotsForm from './createSlotsForm';
import ViewCreateSlots from './ViewCreateSlots';
import AssignSlots from './assignSlotsComponent';

const LectureSlots = () => {
  const [editData, setEditData] = useState<any>(null);
  const [disabled, setDisabled] = useState(false);
  const addLectureSlotDialog = useBoolean(false);
  const [isEdit, setIsEdit] = useState(false);
  const viewSlotsDialog = useBoolean();

  const assignSlotsDialog = useBoolean();

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

  // Mock data with proper structure
  const mockData = [
    {
      id: 1,
      className: '1',
      schoolHours: '07:00 AM - 12:30 PM',
      previousClassSlots: '',
      periodSlots: 6,
      breakSlots: 2,
      slotConfigurations: [
        {
          id: 'config-1',
          totalSlots: '8',
          weekRange: [0, 4] as [number, number],
          timeSlots: [
            {
              id: '0',
              startTime: dayjs('2024-01-01T07:00'),
              endTime: dayjs('2024-01-01T08:40'),
              slotType: 'period',
            },
            {
              id: '1',
              startTime: dayjs('2024-01-01T08:40'),
              endTime: dayjs('2024-01-01T09:20'),
              slotType: 'period',
            },
            {
              id: '2',
              startTime: dayjs('2024-01-01T09:20'),
              endTime: dayjs('2024-01-01T09:30'),
              slotType: 'break',
              breakType: 'short',
            },
            {
              id: '3',
              startTime: dayjs('2024-01-01T09:30'),
              endTime: dayjs('2024-01-01T10:10'),
              slotType: 'period',
            },
            {
              id: '4',
              startTime: dayjs('2024-01-01T10:10'),
              endTime: dayjs('2024-01-01T10:50'),
              slotType: 'period',
            },
            {
              id: '5',
              startTime: dayjs('2024-01-01T10:50'),
              endTime: dayjs('2024-01-01T11:30'),
              slotType: 'period',
            },
            {
              id: '6',
              startTime: dayjs('2024-01-01T11:30'),
              endTime: dayjs('2024-01-01T12:00'),
              slotType: 'break',
              breakType: 'lunch',
            },
            {
              id: '7',
              startTime: dayjs('2024-01-01T12:00'),
              endTime: dayjs('2024-01-01T12:30'),
              slotType: 'period',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      className: '2',
      schoolHours: '07:00 AM - 11:50 AM',
      previousClassSlots: '1',
      periodSlots: 5,
      breakSlots: 1,
      slotConfigurations: [
        {
          id: 'config-2',
          totalSlots: '6',
          weekRange: [0, 5] as [number, number],
          timeSlots: [
            {
              id: '0',
              startTime: dayjs('2024-01-01T07:00'),
              endTime: dayjs('2024-01-01T08:40'),
              slotType: 'period',
            },
            {
              id: '1',
              startTime: dayjs('2024-01-01T08:40'),
              endTime: dayjs('2024-01-01T09:20'),
              slotType: 'period',
            },
            {
              id: '2',
              startTime: dayjs('2024-01-01T09:20'),
              endTime: dayjs('2024-01-01T09:50'),
              slotType: 'break',
              breakType: 'short',
            },
            {
              id: '3',
              startTime: dayjs('2024-01-01T09:50'),
              endTime: dayjs('2024-01-01T10:30'),
              slotType: 'period',
            },
            {
              id: '4',
              startTime: dayjs('2024-01-01T10:30'),
              endTime: dayjs('2024-01-01T11:10'),
              slotType: 'period',
            },
            {
              id: '5',
              startTime: dayjs('2024-01-01T11:10'),
              endTime: dayjs('2024-01-01T11:50'),
              slotType: 'period',
            },
          ],
        },
      ],
    },
    {
      id: 3,
      className: '3',
      schoolHours: '07:00 AM - 12:40 PM',
      previousClassSlots: '',
      periodSlots: 7,
      breakSlots: 2,
      slotConfigurations: [
        {
          id: 'config-3',
          totalSlots: '9',
          weekRange: [0, 4] as [number, number],
          timeSlots: [
            {
              id: '0',
              startTime: dayjs('2024-01-01T07:00'),
              endTime: dayjs('2024-01-01T08:40'),
              slotType: 'period',
            },
            {
              id: '1',
              startTime: dayjs('2024-01-01T08:40'),
              endTime: dayjs('2024-01-01T09:20'),
              slotType: 'period',
            },
            {
              id: '2',
              startTime: dayjs('2024-01-01T09:20'),
              endTime: dayjs('2024-01-01T09:30'),
              slotType: 'break',
              breakType: 'short',
            },
            {
              id: '3',
              startTime: dayjs('2024-01-01T09:30'),
              endTime: dayjs('2024-01-01T10:10'),
              slotType: 'period',
            },
            {
              id: '4',
              startTime: dayjs('2024-01-01T10:10'),
              endTime: dayjs('2024-01-01T10:50'),
              slotType: 'period',
            },
            {
              id: '5',
              startTime: dayjs('2024-01-01T10:50'),
              endTime: dayjs('2024-01-01T11:30'),
              slotType: 'period',
            },
            {
              id: '6',
              startTime: dayjs('2024-01-01T11:30'),
              endTime: dayjs('2024-01-01T12:00'),
              slotType: 'break',
              breakType: 'lunch',
            },
            {
              id: '7',
              startTime: dayjs('2024-01-01T12:00'),
              endTime: dayjs('2024-01-01T12:40'),
              slotType: 'period',
            },
          ],
        },
      ],
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Conditional Breadcrumbs */}
      {viewSlotsDialog.value ? (
        <CustomBreadcrumbs
          heading="View Slots"
          description="View the detailed lecture slots for the selected class."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'View Slots' },
          ]}
          sx={{ mb: 2 }}
          isBack
          onBack={() => {
            viewSlotsDialog.onFalse();
          }}
        />
      ) : addLectureSlotDialog.value ? (
        <CustomBreadcrumbs
          heading="Add Lecture Slot"
          description="Add a new lecture slot for a class."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
            { name: 'Add Lecture Slot' },
          ]}
          sx={{ mb: 2 }}
          isBack
          onBack={() => {
            addLectureSlotDialog.onFalse();
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Lecture Slots"
          description="Configure and manage lecture slots for each class, including periods and breaks."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
          ]}
          action={
            <Button
              sx={{ width: '160px' }}
              startIcon={<Add />}
              onClick={() => {
                addLectureSlotDialog.onTrue();
                setIsEdit(false);
              }}
              variant="contained"
              size="small"
            >
              Lecture Slot
            </Button>
          }
          sx={{ mb: 2 }}
        />
      )}

      {/* Conditional Card/Table Rendering */}
      {addLectureSlotDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <CreateSlotsForm
            disabled={disabled}
            handleClose={handleClose}
            data={editData}
            isEdit={isEdit}
          />
        </Card>
      ) : viewSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <ViewCreateSlots data={editData} />
        </Card>
      ) : assignSlotsDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
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
            {
              id: 'totalSlots',
              label: 'Total Slots',
              filterType: 'number',
              render(value, row) {
                return row.periodSlots + row.breakSlots;
              },
            },
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
          data={mockData}
        />
      )}
    </Box>
  );
};

export default LectureSlots;
