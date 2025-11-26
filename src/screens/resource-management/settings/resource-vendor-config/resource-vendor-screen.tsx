'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import ResourceVendorForm from './component/resource-vendor-form';
import ResourceVendorTable from './component/resource-vendor-table';

import type { IResourceVendorFormValues } from './resource-vendor-config-interface';

const ResourceVendorScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVendor, setSelectedVendor] = useState<IResourceVendorFormValues | null>(null);

  //   // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [{ name: 'Resource Management' }, { name: 'Vendor Configuration' }, { name: 'Form' }]
    : [{ name: 'Resource Management' }, { name: 'Vendor Configuration' }];

  //   // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IResourceVendorFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IResourceVendorFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IResourceVendorFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IResourceVendorFormValues); // Data must be present
        break;

      case 'new':
        setSelectedVendor(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
    }
  };

  //   // Populates state for editing an existing visitor and opens the dialog
  const handleEdit = (data: IResourceVendorFormValues) => {
    setSelectedVendor(data);
    setEdit(true);
    setOpen(true);
  };

  //   // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IResourceVendorFormValues) => {
    setSelectedVendor(data);
    deleteDialog.onTrue();
  };

  //   // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IResourceVendorFormValues) => {
    setSelectedVendor(data);
    setEdit(false);
    setOpen(true);
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Vendor Configuration"
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
            {open ? 'Back' : 'Add Vendor'}
          </Button>
        }
      />

      {!open && <ResourceVendorTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ResourceVendorForm
            onClose={() => setOpen(false)}
            data={selectedVendor}
            isEdit={isEdit}
          />
        </Card>
      )}
    </Box>
  );
};

export default ResourceVendorScreen;
