'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  notificationTemplateApi,
  useDeleteNotificationTemplateMutation,
} from 'src/redux/communication/notification/notificationTemplateApi';

import NotificationTemplateForm from './Components/NotificationTemplateForm';
import NotificationTemplateTable from './Components/NotificationTemplateTemlate';

import type { INotificationTemplate } from './Components/type';

const TemplatesManagement = (props: TabComponentType) => {
  const [open, setOpen] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<INotificationTemplate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<INotificationTemplate | null>(null);
  const view_dialog = useBoolean();

  const [deleteTemplate, setDeleteTemplate] = useState<INotificationTemplate | null>(null);
  const confirm_dialog = useBoolean();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Delete document mutation
  const [deleteTemplateMutation, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteNotificationTemplateMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  // close dialog + reset
  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditingTemplate(null);
        setOpen(false);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      resetState();
    } else if (!isChanges) {
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {open ? (
        <CustomBreadcrumbs
          heading={editingTemplate ? 'Update Template' : 'Add Template'}
          description={
            editingTemplate
              ? 'Update the existing message template for announcements, events, or reminders.'
              : 'Create a new message template to be used in announcements, events, or reminders.'
          }
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Notifications', href: '/communication/notification/send-notification' },
            {
              name: 'Templates',
              onClick(e) {
                setOpen(false);
                setEditingTemplate(null);
              },
            },
            { name: editingTemplate ? 'Update Template' : 'Add Template' },
          ]}
          sx={{ px: 2, mb: 2 }}
          isBack
          onBack={() => {
            handleCloseDialog(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Templates"
          description="View and manage reusable templates including exam notifications, fee reminders, and event announcements."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Templates' },
          ]}
          sx={{ px: 2, mb: 1 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ px: '32px' }}
            >
              Template
            </Button>
          }
        />
      )}

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
          setOpenDialog={setOpen}
          setEditData={setEditingTemplate}
          onDelete={(row) => {
            confirm_dialog.onTrue();
            setDeleteTemplate(row);
          }}
          onEdit={(row) => {
            setOpen(true);
            setEditingTemplate(row);
          }}
          //   onView={(row) => {
          //     view_dialog.onTrue();
          //     setViewTemplate(row);
          //   }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setDeleteTemplate(null);
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete template <strong>{deleteTemplate?.templateName}</strong>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: deleteTemplate,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    notificationTemplateApi.util.updateQueryData(
                      'getNotificationTemplates',
                      undefined,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === deleteTemplate?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    notificationTemplateApi.util.updateQueryData(
                      'getNotificationTemplates',
                      undefined,
                      (draft: any) => {
                        if (!draft.items) return;
                        draft.items.splice(index, 0, deleteTemplate);
                      }
                    )
                  ),
                onCommit: () => deleteTemplateMutation(deleteTemplate?.id || ''),
              });
              confirm_dialog.onFalse();
              setDeleteTemplate(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      {/* View Details */}
      <CustomDialog
        title={`${viewTemplate?.templateName}`}
        open={view_dialog.value}
        handleClose={() => {
          setViewTemplate(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        ghjk
        {/* <TemplateViewDetails template={viewTemplate} /> */}
      </CustomDialog>
    </Box>
  );
};

export default TemplatesManagement;
