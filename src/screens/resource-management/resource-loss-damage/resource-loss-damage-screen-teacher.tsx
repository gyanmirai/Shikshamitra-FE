'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AddReportLossForm from './component/add-report-loss-form';
import ResourceLossDamageTableTeacher from './component/resource-loss-damage-table-table';

import type { IResourceIncidentFormValues } from './resource-loss-damage-interface';

const ResourceLossDamageScreenTeacher = () => {
  const addResourceLossDamagedDialog = useBoolean();

  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVisitor, setSelectedVisitor] = useState<IResourceIncidentFormValues | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [{ name: 'Resource Management' }, { name: 'Report Loss / Damage' }, { name: 'Form' }]
    : [{ name: 'Resource Management' }, { name: 'Report Loss / Damage' }];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IResourceIncidentFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IResourceIncidentFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IResourceIncidentFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IResourceIncidentFormValues); // Data must be present
        break;

      case 'new':
        setSelectedVisitor(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  // Populates state for editing an existing visitor and opens the dialog
  const handleEdit = (data: IResourceIncidentFormValues) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IResourceIncidentFormValues) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IResourceIncidentFormValues) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };
  return (
    <>
      <CustomBreadcrumbs
        heading="Report Loss / Damage"
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
                    setSelectedVisitor(null);
                    setEdit(false);
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Report Loss/Damage'}
          </Button>
        }
      />

      {!open && <ResourceLossDamageTableTeacher onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddReportLossForm
            onClose={() => setOpen(false)}
            data={{} as IResourceIncidentFormValues}
            isEdit={isEdit}
          />
        </Card>
      )}

      {/* {addResourceLossDamagedDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Report Loss/Damage"
          open={addResourceLossDamagedDialog.value}
          handleClose={addResourceLossDamagedDialog.onFalse}
        >
          <AddReportLossDialog
            onClose={() => {
              addResourceLossDamagedDialog.onFalse();
            }}
            data={{} as IResourceIncidentFormValues}
            isEdit={false}
          />
        </CustomDialog>
      )} */}
    </>
  );
};

export default ResourceLossDamageScreenTeacher;
