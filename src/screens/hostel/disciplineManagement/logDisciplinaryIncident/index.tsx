'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import disciplineData from 'src/json/hostel/disciplineIncident/discipline-data.json';

import IncidentForm from './components/incidentForm';
import TakeActionForm from './components/takeActionForm';
import HostelIncidentTable from './components/incidentTable';

import type { IHostelIncident } from './type';

const LogDisciplinaryManagement = () => {
  // Dialog state for adding disciplinary incidents
  const addIncidentDialog = useBoolean();
  const viewIncidentDialog = useBoolean();

  // Selected incident for editing/viewing
  const [selectedIncident, setSelectedIncident] = useState<IHostelIncident | null>(null);

  // Controls form visibility
  const [open, setOpen] = useState(false);

  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Dialog state for deleting incidents
  const deleteIncidentDialog = useBoolean();

  // Redux dispatch
  const dispatch = useDispatch();

  // Disciplinary incidents data
  const [incidentData] = useState<IHostelIncident[]>(disciplineData);

  // Breadcrumb navigation links based on form state
  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        {
          name: 'Disciplinary Actions Tracking & Management',
          href: '/hostel/log-disciplinary-incident',
        },
        { name: 'Log Disciplinary Incident', href: '' },
        { name: 'Incident Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        {
          name: 'Disciplinary Actions Tracking & Management',
          href: '/hostel/log-disciplinary-incident',
        },
        { name: 'Log Disciplinary Incident', href: '' },
      ];

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedIncident(null);
      addIncidentDialog.onFalse();
      viewIncidentDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedIncident(null);
      addIncidentDialog.onFalse();
      viewIncidentDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Log Disciplinary Incident"
        description={
          open
            ? 'Create or update disciplinary incident details, including student information, incident type, and disciplinary actions taken. Manage incident records and make adjustments as needed.'
            : 'View and manage all disciplinary incidents, including their details, status, and follow-up actions. Add new incident entries or update existing ones.'
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
                    setOpen(true);
                    addIncidentDialog.onTrue();
                  }
            }
          >
            {open ? 'Back' : 'Incident'}
          </Button>
        }
      />{' '}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <IncidentForm
            open={addIncidentDialog}
            onClose={() => {
              handleClose(null, false);
            }}
            editData={selectedIncident}
          />
        </Card>
      ) : (
        <HostelIncidentTable
          onDelete={(data) => {
            setSelectedIncident(data);
            deleteIncidentDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedIncident(data);
            setOpen(true);
          }}
          onView={(data) => {
            setSelectedIncident(data);
            viewIncidentDialog.onTrue();
          }}
          open={open}
          onAddIncident={addIncidentDialog}
          setOpenDialog={setOpen}
          editData={selectedIncident}
          setEditData={setSelectedIncident}
          data={incidentData}
        />
      )}
      <CustomDialog
        open={viewIncidentDialog.value}
        handleClose={() => {
          viewIncidentDialog.onFalse();
          setSelectedIncident(null);
        }}
        title="Take Action"
        maxWidth="md"
      >
        <TakeActionForm
          open={viewIncidentDialog}
          onClose={() => {
            handleClose(null, false);
          }}
          editData={selectedIncident}
        />
      </CustomDialog>
      <ConfirmDialog
        open={deleteIncidentDialog.value}
        onClose={() => {
          setSelectedIncident(null);
          deleteIncidentDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default LogDisciplinaryManagement;
