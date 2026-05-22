'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Button, MenuList, MenuItem, Typography } from '@mui/material';
import { useGetLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

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
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const dispatch = useDispatch();

  const { data: lectureSlotsData, isLoading: isLectureSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
  });

  const tableData = lectureSlotsData?.items ?? [];

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setEditData(row);
            assignSlotsDialog.onTrue();
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:arrow-right-circle" sx={{ height: '16px', width: '16px' }} />
          Assign to other class
        </MenuItem>
      </MenuList>
    ),
    [assignSlotsDialog, setEditData]
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setIsEdit(false);
      setDisabled(false);
      setEditData(null);
      dispatch(setIsChanges(false));
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

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'standardName', label: 'Class', filterType: 'number' },
      {
        id: 'slotConfigurations',
        label: 'Slot Configuration',
        isSort: false,
        isFilter: false,
        render: (_: any, row: any) => (
          <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
            {row?.slotConfigurations?.map((item: any, index: number) => {
              const { fromDay, toDay, totalSlots } = item;
              const startLabel = getDayLabel(fromDay);
              const endLabel = getDayLabel(toDay);
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: (theme) => theme.vars.palette.background.paper,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.1,
                      py: 0.1,
                      borderRadius: 1,
                      bgcolor: (theme) => theme.palette.action.selected,
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.93em',
                      letterSpacing: 0.1,
                      mr: 0.5,
                    }}
                  >
                    {fromDay === toDay ? startLabel : `${startLabel} → ${endLabel}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: (theme) => theme.palette.text.secondary, ml: 1 }}
                  >
                    {totalSlots} slot{totalSlots > 1 ? 's' : ''}
                  </Typography>
                </Box>
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
          isBack
          onBack={() => handleClose(null)}
        />
      ) : addLectureSlotDialog.value ? (
        <CustomBreadcrumbs
          heading={`${isEdit ? 'Update' : 'Add'} Lecture Slot`}
          description={`${isEdit ? 'Update' : 'Add'} a new lecture slot for a class.`}
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
            { name: `${isEdit ? 'Update' : 'Add'} Lecture Slot` },
          ]}
          isBack
          onBack={() => handleClose(null)}
        />
      ) : assignSlotsDialog.value ? (
        <CustomBreadcrumbs
          heading="Assign Lecture Slot"
          description="Assign this lecture slot configuration to one or more classes."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Timetable', href: '/academic/newTimetable' },
            { name: 'Settings' },
            { name: 'Lecture Slots' },
            { name: 'Assign Lecture Slot' },
          ]}
          isBack
          onBack={() => handleClose(null)}
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
                setEditData(null);
                setIsEdit(false);
                addLectureSlotDialog.onTrue();
              }}
              variant="contained"
              size="small"
            >
              Lecture Slot
            </Button>
          }
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
          <AssignSlots
            onClose={handleClose}
            lectureSlotId={editData?.id}
            sourceClassName={editData?.standardName}
          />
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
          data={tableData}
          isLoading={isLectureSlotsLoading}
        />
      )}
    </Box>
  );
};

export default LectureSlots;
