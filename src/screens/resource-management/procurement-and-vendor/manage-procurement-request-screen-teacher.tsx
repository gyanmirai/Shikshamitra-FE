'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Card, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AddProcurementRequestForm from './component/add-procurement-request-form';
import TeacherProcurementRequestTable from './component/teacher-procurement-request-table';

import type { IProcurementAndVendorFromValues } from './procurement-and-vendor-interface';

const ManageProcurementRequestScreenTeacher = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [, setSelectedVisitor] = useState<IProcurementAndVendorFromValues | null>(null);

  // Manages the open/close state of the delete confirmation dialog
  const deleteDialog = useBoolean(false);

  const links = open
    ? [
        { name: 'Resource Management', href: '/resourceManagement/dashboard' },
        { name: 'Procurement & Vendors' },
        { name: 'Procurement Request' },
        { name: 'Form' },
      ]
    : [
        { name: 'Resource Management', href: '/resourceManagement/dashboard' },
        { name: 'Procurement & Vendors' },
        { name: 'Procurement Request' },
      ];

  // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IProcurementAndVendorFromValues | null, action: string) => {
    switch (action) {
      case 'edit':
        handleEdit(data as IProcurementAndVendorFromValues); // Data must be present
        break;

      case 'delete':
        handleDelete(data as IProcurementAndVendorFromValues); // Data must be present
        break;

      case 'view':
        handleView(data as IProcurementAndVendorFromValues); // Data must be present
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
  const handleEdit = (data: IProcurementAndVendorFromValues) => {
    setSelectedVisitor(data);
    setEdit(true);
    setOpen(true);
  };

  // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IProcurementAndVendorFromValues) => {
    setSelectedVisitor(data);
    deleteDialog.onTrue();
  };

  // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IProcurementAndVendorFromValues) => {
    setSelectedVisitor(data);
    setEdit(false);
    setOpen(true);
  };
  // const addNewProcurementRequest = useBoolean();
  return (
    <>
      <CustomBreadcrumbs
        heading="Procurement Request"
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
            {open ? 'Back' : 'New Request'}
          </Button>
        }
      />

      {!open && <TeacherProcurementRequestTable onClick={handleClick} />}

      {open && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddProcurementRequestForm
            fromTeacher
            data={{} as IProcurementAndVendorFromValues}
            isEdit={false}
            onClose={() => setOpen(false)}
          />
        </Card>
      )}

      {/* {addNewProcurementRequest.value && (
        <CustomDialog
          maxWidth="md"
          open={addNewProcurementRequest.value}
          handleClose={addNewProcurementRequest.onFalse}
          title="Add Procurement Request"
        >
          <AddProcurementRequestDialog
            data={{} as IProcurementAndVendorFromValues}
            isEdit={false}
          />
        </CustomDialog>
      )} */}
    </>
  );
};

export default ManageProcurementRequestScreenTeacher;
