'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import RollCallSettingForm from './rollCallSetting/rollCallSettingForm';

import type { IRollCallSetting } from './rollCallSetting/type';

const RollCallSetting = () => {
  // Dialog state for the main form
  const dialog = useBoolean();

  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();

  // State to control form open/close
  const [open, setOpen] = useState(false);

  // State to store the selected roll call setting for editing
  const [selectedEntry, setSelectedEntry] = useState<IRollCallSetting | null>(null);

  const dispatch = useDispatch();

  // Get the changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles closing the roll call setting form
   * @param _e - Event object (optional)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e?: any, isSubmit?: boolean) => {
    // Check if form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      setSelectedEntry(null);
      dialog.onFalse();
      dispatch(setIsChanges(false));
      setOpen(false);
    } else if (!isChanges) {
      // Close form if no unsaved changes
      setSelectedEntry(null);
      dialog.onFalse();
      setOpen(false);
    }
  };

  // Dynamically generated links for the breadcrumbs based on the 'open' state.
  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Attendance And Leave Management', href: '' },
        { name: 'Setting', href: '' },
        { name: 'Roll Call Form', href: '' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Attendance And Leave Management', href: '' },
        { name: 'Setting', href: '' },
      ];

  return (
    <>
      <Box height="100%" display="flex" flexDirection="column">
        <CustomBreadcrumbs
          heading="Setting"
          description={
            open
              ? 'Create or update roll call settings, including name, time schedules, and description. Configure roll call parameters and make adjustments as needed.'
              : 'View and manage all roll call settings, including their schedules, timings, and descriptions. Add new roll calls, update existing ones, or remove them as necessary.'
          }
          links={links}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
              variant="contained"
              onClick={
                open
                  ? () => handleClose(null, false)
                  : () => {
                      dialog.onTrue();
                      setOpen(true);
                    }
              }
            >
              {open ? 'Back' : 'Roll Call'}
            </Button>
          }
        />{' '}
        {open ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <RollCallSettingForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
          </Card>
        ) : (
          <CustomizableTable
            noDataText={
              <>
                No Roll Call Found{' '}
                <Box
                  onClick={() => {
                    setOpen(true);
                    dialog.onTrue();
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
                >
                  Add Roll Call
                </Box>
              </>
            }
            tableId="roll-call-setting-table"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'rollCallName', label: 'Roll Call' },
              { id: 'startTime', label: 'Start Time' },
              { id: 'endTime', label: 'End Time' },
              { id: 'description', label: 'Description' },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'right',
                minWidth: 40,
                render: (value, row) => (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showDeleteIcon
                    handleDeleteClick={() => {
                      dialogForDeleteConfirmation.onTrue();
                    }}
                    showEditIcon
                    handleEditClick={() => {
                      setSelectedEntry(row as IRollCallSetting);
                      setOpen(true);
                      dialog.onTrue();
                    }}
                  />
                ),
              },
            ]}
            data={[
              {
                rollCallName: 'Morning Roll Call',
                startTime: '08:00',
                endTime: '08:15',
                description: 'Attendance check before first period.',
              },
              {
                rollCallName: 'Evening Roll Call',
                startTime: '18:00',
                endTime: '18:15',
                description: 'Final headcount before hostel curfew.',
              },
            ]}
          />
        )}
      </Box>

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <Box pb="20px" />
    </>
  );
};

export default RollCallSetting;
