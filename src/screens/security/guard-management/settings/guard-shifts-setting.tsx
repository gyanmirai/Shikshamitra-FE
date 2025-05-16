'use client';

import React, { useState } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GuardShiftsForm from './component/guard-shifts-form';
import GuardShiftsTable from './component/guard-shift-table';

import type { IGuardShiftFormValues } from './guard-settings-interface';

const GuardShiftsSettings = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedShifts, setSelectedShifts] = useState<IGuardShiftFormValues | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Security', href: '' },
        { name: 'Guard Shift Configuration', href: '' },

        { name: 'Guard Shift Configuration Form' },
      ]
    : [
        { name: 'Security', href: '' },
        { name: 'Guard Shift Configuration', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IGuardShiftFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IGuardShiftFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IGuardShiftFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IGuardShiftFormValues); // Data must be present
        break;

      case 'new':
        setSelectedShifts(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  // Populates state for editing an existing visitor and opens the dialog
  const handleEdit = (data: IGuardShiftFormValues) => {
    setSelectedShifts(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IGuardShiftFormValues) => {
    setSelectedShifts(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IGuardShiftFormValues) => {
    setSelectedShifts(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Guard Shift Configuration"
        description="Create Shifts to manage Guard duty effeciently."
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
                    setSelectedShifts(null);
                    setEdit(false);
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Add Shift'}
          </Button>
        }
      />
      {!open && <GuardShiftsTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <GuardShiftsForm
            data={selectedShifts}
            onClose={() => {
              setOpen(false);
            }}
            isEdit={isEdit}
          />
        </Card>
      )}

      {deleteDialog.value && (
        <ConfirmDialog
          open={deleteDialog.value}
          onClose={() => {
            setSelectedShifts(null);
            deleteDialog.onFalse();
          }}
          title="Delete"
          content="Are you sure you want to delete this entry?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Delete
            </Button>
          }
        />
      )}
    </Box>
  );
};

export default GuardShiftsSettings;
