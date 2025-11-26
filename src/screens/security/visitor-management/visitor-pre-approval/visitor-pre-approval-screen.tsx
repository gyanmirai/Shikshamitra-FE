'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VisitorApprovalTable from './component/visitor-pre-approval-table';
import VisitorPreApprovedForm from './component/visitor-pre-approval-form';

import type { IVisitorPreApprovalFormValues } from './visitor-pre-approval-interface';

const VisitorPreApprovalScreen = () => {
  // Controls the visibility of the Add/Edit visitor dialog
  const [open, setOpen] = useState(false);
  const deleteDialog = useBoolean();

  // Tracks whether the dialog is in Edit mode (true) or Add mode (false)
  const [isEdit, setEdit] = useState(false);

  // Holds the visitor data selected for editing; null when adding a new visitor
  const [selectedData, setSelectedData] = useState<IVisitorPreApprovalFormValues | null>(null);
  const links = open
    ? [{ name: 'Security' }, { name: 'Visitor Pre-Approval' }, { name: 'Pre-Approval Form' }]
    : [{ name: 'Security' }, { name: 'Visitor Pre-Approval' }];

  //   // Handles logic for each table action: edit, delete, view, or new entry
  const handleClick = (data: IVisitorPreApprovalFormValues | null, action: string) => {
    switch (action) {
      case 'edit':
        setSelectedData(data);
        setEdit(true);
        setOpen(true);
        break;

      case 'delete':
        handleDelete(data as IVisitorPreApprovalFormValues);
        break;

      case 'view':
        handleView(data as IVisitorPreApprovalFormValues);
        break;

      case 'new':
        setSelectedData(null); // No data needed for new entry
        setEdit(false);
        setOpen(true);
        break;

      default:
    }
  };

  //   // Triggers delete confirmation dialog for selected visitor
  const handleDelete = (data: IVisitorPreApprovalFormValues) => {
    setSelectedData(data);
    deleteDialog.onTrue();
  };

  //   // Opens dialog in view-only mode (edit = false)
  const handleView = (data: IVisitorPreApprovalFormValues) => {
    setSelectedData(data);
    setEdit(false);
    setOpen(true);
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Visitor Pre-Approval"
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
            {open ? 'Back' : 'Pre-Approval Request'}
          </Button>
        }
      />

      {!open && <VisitorApprovalTable onClick={handleClick} />}

      {open && (
        <VisitorPreApprovedForm
          data={selectedData}
          isEdit={isEdit}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}

      {/* {raisedConcernDialog.value && selectedResource && (
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
      )} */}
    </Box>
  );
};

export default VisitorPreApprovalScreen;
