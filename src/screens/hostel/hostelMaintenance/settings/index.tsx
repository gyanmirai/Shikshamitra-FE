'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import IncidentTypeSettingForm from './components/incidentForm';

import type { IIncidentTypeSetting } from './type';

const IncidentTypeSetting = () => {
  // Dialog state for opening/closing the form
  const dialog = useBoolean();
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();

  // State to control form visibility
  const [open, setOpen] = useState(false);
  // State to store selected incident type for editing
  const [selectedEntry, setSelectedEntry] = useState<IIncidentTypeSetting | null>(null);

  const dispatch = useDispatch();
  // Get changes status from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles closing of the incident type form
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

  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Maintenance', href: '' },
        { name: 'Settings', href: '' },
        { name: 'Incident Type Form', href: '' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Maintenance', href: '' },
        { name: 'Settings', href: '' },
      ];

  return (
    <>
      <Box height="100%" display="flex" flexDirection="column">
        <CustomBreadcrumbs
          heading="Incident Type Setting"
          description={
            open
              ? 'Create or update incident types with descriptions. Use this form to manage discipline categories.'
              : 'View and manage all incident types. You can add, edit, or delete incident types used for discipline tracking.'
          }
          links={links}
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
              {open ? 'Back' : 'Incident Type'}
            </Button>
          }
        />
        {open ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <IncidentTypeSettingForm
              dialog={dialog}
              editData={selectedEntry}
              onClose={handleClose}
            />
          </Card>
        ) : (
          <CustomizableTable
            noDataText={
              <>
                No Incident Type Found{' '}
                <Box
                  onClick={() => {
                    setOpen(true);
                    dialog.onTrue();
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
                >
                  Add Incident Type
                </Box>
              </>
            }
            tableId="incident-type-setting-table"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'incidentType', label: 'Incident Type' },
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
                      setSelectedEntry(row as IIncidentTypeSetting);
                      setOpen(true);
                      dialog.onTrue();
                    }}
                  />
                ),
              },
            ]}
            data={[
              {
                incidentType: 'Late Arrival',
                description: 'Student arrives after the scheduled entry time.',
              },
              {
                incidentType: 'Hostel Rule Violation',
                description: 'Breach of rules regarding hostel stay.',
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
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
      )}

      <Box pb="20px" />
    </>
  );
};

export default IncidentTypeSetting;
