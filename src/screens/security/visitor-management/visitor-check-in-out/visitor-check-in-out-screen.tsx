'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TodayVisitorTable from './component/today-visitor-table';
import WalkInVisitorForm from './component/walk-in-visitor-form';

import type { IWalkInVisitorFormValues } from './visitor-check-in-out-interface';

const VisitorCheckInOutScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);
  const deleteDialog = useBoolean();

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedData, setSelectedData] = useState<IWalkInVisitorFormValues | null>(null);
  const links = open
    ? [{ name: 'Security' }, { name: 'Visitor Checkpoint ' }, { name: 'Walk In Visitor' }]
    : [{ name: 'Security' }, { name: 'Visitor Checkpoint' }];

  //   // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IWalkInVisitorFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        setSelectedData(data);
        setEdit(true);
        setOpen(true);
        break;

      case 'delete':
        handleDelete(data as IWalkInVisitorFormValues);
        break;

      case 'view':
        handleView(data as IWalkInVisitorFormValues);
        break;

      case 'new':
        setSelectedData(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  //   // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IWalkInVisitorFormValues) => {
    setSelectedData(data);
    deleteDialog.onTrue();
  };

  //   // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IWalkInVisitorFormValues) => {
    setSelectedData(data);
    setEdit(false);
    setOpen(true);
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Visitor Checkpoint"
        description="This is the Pre-Approved Visitor screen. Here, you can enter visitor details and request approval in advance. Once approved, guards can easily manage their check-in and check-out."
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => setOpen(false)
                : () => {
                    setEdit(false);
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Walk In Visitor'}
          </Button>
        }
      />

      {!open && <TodayVisitorTable onClick={handleClick} />}

      {open && (
        <WalkInVisitorForm
          data={selectedData}
          isEdit={isEdit}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}

      {/* {raisedConcernDialog.value && selectedResource && (
        <CustomDialog
          maxWidth="md"
          open={raisedConcernDialog.value}
          handleClose={() => {
            raisedConcernDialog.onFalse();
          }}
          title={`Raise ${selectedResource?.name} Concern`}
        >
          <RaisedConcernForResourcesDialog
            data={selectedResource}
            onClose={raisedConcernDialog.onFalse}
          />
        </CustomDialog>
      )} */}
    </Box>
  );
};

export default VisitorCheckInOutScreen;
