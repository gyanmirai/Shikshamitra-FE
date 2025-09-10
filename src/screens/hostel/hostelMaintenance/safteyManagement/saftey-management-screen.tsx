'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ReportSafteyManagemtForm from './component/saftey-management-form';
import ReportSafteyManagementTable from './component/saftey-management-table';

import type { IAddSafteyManagement } from './saftey-management-interface';

const SafteyManagemtScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedReport, setSelectedReport] = useState<IAddSafteyManagement | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Maintenance', href: '' },
        { name: 'Safety/Discipline Management', href: '' },
        { name: 'Report Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Maintenance', href: '' },
        { name: 'Safety/Discipline Management', href: '' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IAddSafteyManagement | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IAddSafteyManagement); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IAddSafteyManagement); // Data must be present
        break;

      case 'view':
        handleView(data as IAddSafteyManagement); // Data must be present
        break;

      case 'new':
        setSelectedReport(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
        console.warn('Unknown action:', action);
    }
  };

  // Populates state for editing an existing visitor and opens the dialog
  const handleEdit = (data: IAddSafteyManagement) => {
    setSelectedReport(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IAddSafteyManagement) => {
    setSelectedReport(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IAddSafteyManagement) => {
    setSelectedReport(data);
    setEdit(false);
    setOpen(true);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Safety/Discipline Management"
        description={
          open
            ? 'Report a maintenance-related incident by providing details such as title, type, urgency, date, time, and description. Submitting this form alerts the relevant team for prompt action.'
            : 'View and manage all reported maintenance incidents, track their status, and review details such as urgency, date, and resolution actions. Update or resolve reports as needed.'
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
                    setSelectedReport(null);
                    setEdit(false);
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Report Incident'}
          </Button>
        }
      />
      {!open && <ReportSafteyManagementTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ReportSafteyManagemtForm
            data={selectedReport}
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
            setSelectedReport(null);
            deleteDialog.onFalse();
          }}
          title="Delete Incident"
          content="Are you sure you want to delete this Incident entry?"
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

export default SafteyManagemtScreen;
