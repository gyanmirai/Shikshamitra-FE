'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GatePassRequestTable from './component/gate-pass-table';
import GatePassRequestForm from './component/pass-request-form';

import type { IGatePassFormValues } from './gate-pass-system-interface';

const GatePassSystemScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVisitor, setSelectedVisitor] = useState<IGatePassFormValues | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Security', href: '' },
        { name: 'Create Gate Pass', href: '' },

        { name: 'Gate Pass Request Form' },
      ]
    : [
        { name: 'Security', href: '' },
        { name: 'Create Gate Pass', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IGatePassFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IGatePassFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IGatePassFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IGatePassFormValues); // Data must be present
        break;

      case 'new':
        setSelectedVisitor(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
    }
  };

  // Populates state for editing an existing visitor and opens the dialog
  const handleEdit = (data: IGatePassFormValues) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IGatePassFormValues) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IGatePassFormValues) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Create Gate Pass"
        description={
          open
            ? 'Request a gate pass by providing visitor details, purpose of visit, date, and time. Submit the request for approval to ensure a smooth entry process.'
            : 'View and manage all gate pass requests, track approval status, and update or cancel pending requests as needed.'
        }
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
      {!open && <GatePassRequestTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <GatePassRequestForm
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
              Yes
            </Button>
          }
        />
      )}
    </Box>
  );
};

export default GatePassSystemScreen;
