'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import AddStopIndex from './AddStopComponents';
import StopManagementTable from './Components/StopManagementTable';

import type { IStopData } from './Components/type';

const StopManagement = () => {
  // State for selected stop record
  const [selectedStop, setSelectedStop] = useState<IStopData | null>(null);

  // Custom hooks for dialogs
  const addStopDialog = useBoolean();

  // Redux
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handle form/dialog close
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addStopDialog.onFalse();
      setSelectedStop(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addStopDialog.onFalse();
      setSelectedStop(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addStopDialog.value ? (
        <CustomBreadcrumbs
          heading={selectedStop ? 'Update Stop' : 'Add Stop'}
          description={
            selectedStop
              ? 'Update stop details such as stop name, location, and assigned routes to maintain accurate transport management.'
              : 'This screen allows users to create a new stop by filling in all related fields such as stop name, landmark, and route assignment.'
          }
          isBack
          onBack={() => handleClose(null, false)}
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            {
              name: 'Stop Management',
              href: '/transport/stopManagement',
              onClick: () => {
                addStopDialog.onFalse();
                setSelectedStop(null);
              },
            },
            { name: selectedStop ? 'Update Stop' : 'Add Stop' },
          ]}
          sx={{ mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Stop Management"
          description="This screen displays all created transport stops with details like stop name, location, and assigned routes. It also provides an option to create a new stop for better route management."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Stop Management', href: '/transport/stopManagement' },
          ]}
          action={
            <Button
              onClick={() => addStopDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
            >
              Stop
            </Button>
          }
          sx={{ mb: 2 }}
        />
      )}

      <>
        {/* Form for add/edit stop */}
        {addStopDialog.value ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <AddStopIndex open={addStopDialog} onClose={handleClose} editData={selectedStop} />
          </Card>
        ) : (
          <StopManagementTable
            addStop={addStopDialog}
            setEditData={setSelectedStop}
            onEdit={(data) => {
              addStopDialog.onTrue();
              setSelectedStop(data);
            }}
          />
        )}
      </>
    </Box>
  );
};

export default StopManagement;
