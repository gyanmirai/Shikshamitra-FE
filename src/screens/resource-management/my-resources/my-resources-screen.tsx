'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MyResourceTable from './component/my-resource-table';
import NewResourcesRequestForm from './component/new-resource-request-form';
import RaisedConcernForResourcesDialog from './component/raise-concern-dialog';

import type { IMyResources } from './my-resources-interface';

const MyResourcesScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);
  const raisedConcernDialog = useBoolean();

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedResource, setSelectedResource] = useState<IMyResources | null>(null);
  const links = open
    ? [
        { name: 'Resource Management' },
        { name: 'My Resources' },
        { name: 'Request New Resources Form' },
      ]
    : [{ name: 'Resource Management' }, { name: 'My Resources' }];

  //   // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IMyResources | null, action: string) => {
    switch (action) {
      case 'concern':
        handleConcern(data as IMyResources); // Data must be present
        break;

      case 'new':
        setSelectedResource(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
    }
  };

  //   // Populates state for editing an existing visitor and opens the dialog
  const handleConcern = (data: IMyResources) => {
    setSelectedResource(data);
    raisedConcernDialog.onTrue();
    setOpen(false);
  };

  //   //   // Triggers delete confirmation dialog for selected visitor
  //   const handleDelete = (data: IMyResources) => {
  //     setSelectedVendor(data);
  //     deleteDialog.onTrue();
  //   };

  //   //   // Opens dialog in view-only mode (edit = false)
  //   const handleView = (data: IMyResources) => {
  //     setSelectedVendor(data);
  //     setEdit(false);
  //     setOpen(true);
  //   };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="My Resources"
        links={links}
        sx={{ mb: 2 }}
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
            {open ? 'Back' : 'Resource Request'}
          </Button>
        }
      />

      {!open && <MyResourceTable onClick={handleClick} />}

      {open && (
        <NewResourcesRequestForm
          onClose={() => {
            setOpen(false);
          }}
        />
      )}

      {raisedConcernDialog.value && selectedResource && (
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
      )}
    </Box>
  );
};

export default MyResourcesScreen;
