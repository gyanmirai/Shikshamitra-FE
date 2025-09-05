'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EarlyGatePassFormStaff from './component/gate-pass-staff-form';
import GateStaffPassRequestTable from './component/gate-pass-staff-table';

import type { IGatePassStaffFormValues } from './gate-pass-staff-interface';

const GatePassStaffScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the IGatePassStaffFormValuesialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVisitor, setSelectedVisitor] = useState<IGatePassStaffFormValues | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Security', href: '' },
        { name: 'Gate Pass Request', href: '' },

        { name: 'Gate Pass Request Form' },
      ]
    : [
        { name: 'Security', href: '' },
        { name: 'Gate Pass Request', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IGatePassStaffFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IGatePassStaffFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IGatePassStaffFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IGatePassStaffFormValues); // Data must be present
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
  const handleEdit = (data: IGatePassStaffFormValues) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IGatePassStaffFormValues) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IGatePassStaffFormValues) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Gate Pass Request"
        description={
          open
            ? 'Fill out the early gate pass request form by entering the required information and submitting it for approval.'
            : 'View your submitted gate pass requests, check their approval status, and manage them by updating or canceling if needed.'
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
                ? () => setOpen(false)
                : () => {
                    setSelectedVisitor(null);
                    setEdit(false);
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Request Gate Pass'}
          </Button>
        }
      />
      {!open && <GateStaffPassRequestTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EarlyGatePassFormStaff
            data={selectedVisitor}
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
            setSelectedVisitor(null);
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

export default GatePassStaffScreen;
