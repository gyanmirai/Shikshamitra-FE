'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';

import ViewCreateSlots from './ViewCreateSlots';
import AssignSlots from './assignSlotsComponent';
import CreateSlotsForm, { getDayLabel } from './createSlotsForm';

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
      totalSlots: 15,
      periodSlots: 12,
      breakSlots: 3,
      slotConfigurations: [
        {
          id: 'c1-config-0-2',
          totalSlots: 8,
          periodSlots: 6,
          breakSlots: 2,
          weekRange: [0, 2],
          timeSlots: [
            { id: '0', startTime: '07:00', endTime: '08:40', slotType: 'period' },
            { id: '1', startTime: '08:40', endTime: '09:20', slotType: 'period' },
            {
              id: '2',
              startTime: '09:20',
              endTime: '09:30',
              slotType: 'break',
              breakType: 'short',
            },
            { id: '3', startTime: '09:30', endTime: '10:10', slotType: 'period' },
            { id: '4', startTime: '10:10', endTime: '10:50', slotType: 'period' },
            { id: '5', startTime: '10:50', endTime: '11:30', slotType: 'period' },
            {
              id: '6',
              startTime: '11:30',
              endTime: '12:00',
              slotType: 'break',
              breakType: 'lunch',
            },
            { id: '7', startTime: '12:00', endTime: '12:30', slotType: 'period' },
          ],
        },
        {
          id: 'c1-config-3-5',
          totalSlots: 7,
          periodSlots: 5,
          breakSlots: 2,
          weekRange: [3, 5],
          timeSlots: [
            { id: '0', startTime: '07:30', endTime: '08:30', slotType: 'period' },
            { id: '1', startTime: '08:30', endTime: '09:10', slotType: 'period' },
            {
              id: '2',
              startTime: '09:10',
              endTime: '09:25',
              slotType: 'break',
              breakType: 'short',
            },
            { id: '3', startTime: '09:25', endTime: '10:05', slotType: 'period' },
            { id: '4', startTime: '10:05', endTime: '10:45', slotType: 'period' },
            {
              id: '5',
              startTime: '10:45',
              endTime: '11:15',
              slotType: 'break',
              breakType: 'lunch',
            },
            { id: '6', startTime: '11:15', endTime: '12:00', slotType: 'period' },
          ],
        },
      ],
    },
    {
      id: 2,
      className: '2',
      schoolHours: '07:30 AM - 01:00 PM',
      previousClassSlots: '1',
      totalSlots: 13,
      periodSlots: 11,
      breakSlots: 2,
      slotConfigurations: [
        {
          id: 'c2-config-1-4',
          totalSlots: 9,
          periodSlots: 7,
          breakSlots: 2,
          weekRange: [0, 4],
          timeSlots: [
            { id: '0', startTime: '07:30', endTime: '08:20', slotType: 'period' },
            { id: '1', startTime: '08:20', endTime: '09:10', slotType: 'period' },
            {
              id: '2',
              startTime: '09:10',
              endTime: '09:30',
              slotType: 'break',
              breakType: 'short',
            },
            { id: '3', startTime: '09:30', endTime: '10:20', slotType: 'period' },
            { id: '4', startTime: '10:20', endTime: '11:10', slotType: 'period' },
            { id: '5', startTime: '11:10', endTime: '12:00', slotType: 'period' },
            {
              id: '6',
              startTime: '12:00',
              endTime: '12:20',
              slotType: 'break',
              breakType: 'lunch',
            },
            { id: '7', startTime: '12:20', endTime: '12:40', slotType: 'period' },
            { id: '8', startTime: '12:40', endTime: '01:00', slotType: 'period' },
          ],
        },
        {
          id: 'c2-config-5-only',
          totalSlots: 4,
          periodSlots: 4,
          breakSlots: 0,
          weekRange: [5, 5],
          timeSlots: [
            { id: '0', startTime: '08:00', endTime: '08:45', slotType: 'period' },
            { id: '1', startTime: '08:45', endTime: '09:30', slotType: 'period' },
            { id: '2', startTime: '09:30', endTime: '10:15', slotType: 'period' },
            { id: '3', startTime: '10:15', endTime: '11:00', slotType: 'period' },
          ],
        },
      ],
    },
    {
      id: 3,
      className: '3',
      schoolHours: '08:00 AM - 01:30 PM',
      previousClassSlots: '2',
      totalSlots: 14,
      periodSlots: 12,
      breakSlots: 2,
      slotConfigurations: [
        {
          id: 'c3-config-0-1',
          totalSlots: 8,
          periodSlots: 6,
          breakSlots: 2,
          weekRange: [0, 1],
          timeSlots: [
            { id: '0', startTime: '08:00', endTime: '08:50', slotType: 'period' },
            { id: '1', startTime: '08:50', endTime: '09:40', slotType: 'period' },
            {
              id: '2',
              startTime: '09:40',
              endTime: '09:55',
              slotType: 'break',
              breakType: 'short',
            },
            { id: '3', startTime: '09:55', endTime: '10:45', slotType: 'period' },
            { id: '4', startTime: '10:45', endTime: '11:35', slotType: 'period' },
            {
              id: '5',
              startTime: '11:35',
              endTime: '12:05',
              slotType: 'break',
              breakType: 'lunch',
            },
            { id: '6', startTime: '12:05', endTime: '12:45', slotType: 'period' },
            { id: '7', startTime: '12:45', endTime: '01:30', slotType: 'period' },
          ],
        },
        {
          id: 'c3-config-2-5',
          totalSlots: 6,
          periodSlots: 6,
          breakSlots: 0,
          weekRange: [2, 5],
          timeSlots: [
            { id: '0', startTime: '08:30', endTime: '09:15', slotType: 'period' },
            { id: '1', startTime: '09:15', endTime: '10:00', slotType: 'period' },
            { id: '2', startTime: '10:00', endTime: '10:45', slotType: 'period' },
            { id: '3', startTime: '10:45', endTime: '11:30', slotType: 'period' },
            { id: '4', startTime: '11:30', endTime: '12:15', slotType: 'period' },
            { id: '5', startTime: '12:15', endTime: '01:00', slotType: 'period' },
          ],
        },
      ],
    },
  ];
  const columns: IColumn[] = useMemo(
    () => [
      { id: 'className', label: 'Class', filterType: 'number' },
      {
        id: 'slotConfiguration',
        label: 'Slot Configuration',
        isSort: false,
        render: (_: any, row: any) => (
          <Box>
            {row.slotConfigurations?.map((item: any, index: number) => {
              const [start, end] = item.weekRange;

              const startLabel = getDayLabel(start);
              const endLabel = getDayLabel(end);

              return (
                <Typography key={index} variant="body2">
                  {start === end ? startLabel : `${startLabel} To ${endLabel}`}
                  {' : '}
                  {item.totalSlots}
                </Typography>
              );
            })}
          </Box>
        ),
      },
      {
        id: 'action',
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
    ],
    [actions, addLectureSlotDialog, viewSlotsDialog]
  );
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
          columns={columns}
          data={mockData}
        />
      )}
    </Box>
  );
};

export default LectureSlots;
