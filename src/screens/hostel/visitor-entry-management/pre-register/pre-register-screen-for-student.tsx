'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PreRegisterForm from './component/pre-register-form';
import PreRegisterTable from './component/pre-register-table';

import type { IPreVisitorLog } from './pre-register-interface';

const PreRegisterScreenForStudent = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);
  const markInDialog = useBoolean();
  const markOutDialog = useBoolean();
  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedVisitor, setSelectedVisitor] = useState<IPreVisitorLog | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Visitor Management', href: '/visitor/dashboard' },
        { name: 'Pre Register Visitor', href: '' },
        { name: 'Visitor Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Visitor Management', href: '/visitor/dashboard' },
        { name: 'Pre Register Visitor', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IPreVisitorLog | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IPreVisitorLog); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IPreVisitorLog); // Data must be present
        break;

      case 'view':
        handleView(data as IPreVisitorLog); // Data must be present
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
  const handleEdit = (data: IPreVisitorLog) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IPreVisitorLog) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IPreVisitorLog) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Pre Register Visitor"
        description={
          open
            ? 'Pre-register a visitor by entering their details, such as name, contact information, visit date, and purpose. Save pre-registrations to streamline check-in on arrival.'
            : 'View and manage all pre-registered visitors, including their scheduled visits and personal details. Add new pre-registrations or update existing ones.'
        }
        links={links}
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
            {open ? 'Back' : 'Pre-register Visitor'}
          </Button>
        }
      />
      {!open && (
        <PreRegisterTable
          onClick={handleClick}
          onMarkOut={(data) => {
            setSelectedVisitor(data);
            markOutDialog.onTrue();
          }}
          onMarkIn={(data) => {
            setSelectedVisitor(data);
            markInDialog.onTrue();
          }}
        />
      )}
      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <PreRegisterForm
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
          title="Delete Visitor"
          content="Are you sure you want to delete this visitor entry?"
          action={
            <Button variant="contained" color="error" onClick={() => {}}>
              Yes
            </Button>
          }
        />
      )}
      <ConfirmDialog
        open={markInDialog.value}
        onClose={() => {
          setSelectedVisitor(null);
          markInDialog.onFalse();
        }}
        title="Mark In"
        content="Are you sure you want to mark this visitor as checked in?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Mark In
          </Button>
        }
      />
      <ConfirmDialog
        open={markOutDialog.value}
        onClose={() => {
          setSelectedVisitor(null);
          markOutDialog.onFalse();
        }}
        title="Mark Out"
        content="Are you sure you want to mark this visitor as checked out?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Mark Out
          </Button>
        }
      />{' '}
    </Box>
  );
};

export default PreRegisterScreenForStudent;
