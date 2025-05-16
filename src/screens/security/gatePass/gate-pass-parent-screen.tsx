'use client';

import React, { useState } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EarlyGateRequestForm from './component/gate-pass-parent-form';
import EarlyGatePassRequestTable from './component/gate-pass-parent-table';

import type { IGetEarlyPassRequestFormValues } from './gate-pass-parent-interface';

const GatePassParentScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the IGetEarlyPassRequestFormValuesialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVisitor, setSelectedVisitor] = useState<IGetEarlyPassRequestFormValues | null>(
    null
  );

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Security', href: '' },
        { name: 'Gate Pass Request', href: '' },

        { name: 'Request Form' },
      ]
    : [
        { name: 'Security', href: '' },
        { name: 'Gate Pass Reques', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IGetEarlyPassRequestFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IGetEarlyPassRequestFormValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IGetEarlyPassRequestFormValues); // Data must be present
        break;

      case 'view':
        handleView(data as IGetEarlyPassRequestFormValues); // Data must be present
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
  const handleEdit = (data: IGetEarlyPassRequestFormValues) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IGetEarlyPassRequestFormValues) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IGetEarlyPassRequestFormValues) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Gate Pass Request"
        description={
          open
            ? 'Fill out the early gate pass request form by entering visitor details, purpose, and visit timing. Submit it for approval to ensure timely processing.'
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
            {open ? 'Back' : 'Request Early Pickup'}
          </Button>
        }
      />
      {!open && <EarlyGatePassRequestTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EarlyGateRequestForm
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

export default GatePassParentScreen;
