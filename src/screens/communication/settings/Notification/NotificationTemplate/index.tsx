'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Box, Card } from '@mui/material';

import NotificationTemplateForm from './Components/NotificationTemplateForm';
import { NotificationViewDialog } from './Components/NotificationViewDialog';
import NotificationTemplateTable from './Components/NotificationTemplateTable';
import { NotificationBreadcrumbs } from './Components/NotificationBreadcrumbs';
import { NotificationDeleteDialog } from './Components/NotificationDeleteDialog';
import { useNotificationTemplateState } from './hooks/useNotificationTemplateState';
import { useNotificationTemplateActions } from './hooks/useNotificationTemplateActions';

const TemplatesManagement = (props: TabComponentType) => {
  const {
    open,
    setOpen,
    editingTemplate,
    setEditingTemplate,
    deleteTemplate,
    setDeleteTemplate,
    viewTemplate,
    setViewTemplate,
    viewDialog,
    confirmDialog,
    handleCloseDialog,
  } = useNotificationTemplateState();

  const { templateData, isTemplateLoading, isDeleteLoading, handleDelete } =
    useNotificationTemplateActions();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <NotificationBreadcrumbs
        open={open}
        editingTemplate={editingTemplate}
        setOpen={setOpen}
        setEditingTemplate={setEditingTemplate}
        handleCloseDialog={handleCloseDialog}
      />

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', minHeight: 0 }}>
          <NotificationTemplateForm
            editData={editingTemplate}
            open={open}
            onClose={handleCloseDialog}
          />
        </Card>
      ) : (
        <NotificationTemplateTable
          data={templateData?.items || []}
          isLoading={isTemplateLoading}
          setOpenDialog={setOpen}
          setEditData={setEditingTemplate}
          onDelete={(row) => {
            confirmDialog.onTrue();
            setDeleteTemplate(row);
          }}
          onEdit={(row) => {
            setOpen(true);
            setEditingTemplate(row);
          }}
          // onView logic if needed in future
          // onView={(row) => {
          //   viewDialog.onTrue();
          //   setViewTemplate(row);
          // }}
        />
      )}

      {/* Delete Confirmation */}
      <NotificationDeleteDialog
        open={confirmDialog.value}
        deleteTemplate={deleteTemplate}
        isDeleteLoading={isDeleteLoading}
        onClose={() => {
          setDeleteTemplate(null);
          confirmDialog.onFalse();
        }}
        onConfirm={() => handleDelete(deleteTemplate, setDeleteTemplate, confirmDialog)}
      />

      {/* View Details */}
      <NotificationViewDialog
        open={viewDialog.value}
        viewTemplate={viewTemplate}
        onClose={() => {
          setViewTemplate(null);
          viewDialog.onFalse();
        }}
      />
    </Box>
  );
};

export default TemplatesManagement;
