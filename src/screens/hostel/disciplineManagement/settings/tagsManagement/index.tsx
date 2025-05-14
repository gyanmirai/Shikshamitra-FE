'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import TagForm from './tagForm';

import type { ITag } from './type';

const TagSetting = (props: TabComponentType) => {
  // Dialog state for managing form visibility
  const dialog = useBoolean();
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();
  // State to manage form open/close status
  const [open, setOpen] = useState(false);
  // State to store the currently selected tag entry
  const [selectedEntry, setSelectedEntry] = useState<ITag | null>(null);

  // Redux dispatch hook
  const dispatch = useDispatch();
  // Get changes status from Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles the closing of the tag form dialog
   * @param _e - Event object (optional)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e?: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      setSelectedEntry(null);
      dialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedEntry(null);
      dialog.onFalse();
    }
  };

  return (
    <>
      <Box gap={3} display="flex" justifyContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            dialog.onTrue();
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          Emergency Level
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Emergency Level Found{' '}
            <Box
              onClick={() => {
                setOpen(true);
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
            >
              Emergency Level
            </Box>
          </>
        }
        tableId="tag-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'tagName', label: 'Tag Name' },
          { id: 'description', label: 'Description' },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,
            align: 'right',
            minWidth: 40,
            render: (value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                showDeleteIcon
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                }}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as ITag);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            tagName: 'Urgent',
            description: 'Used for tasks that require immediate attention.',
          },
          {
            tagName: 'Optional',
            description: 'Tasks that are nice to have but not critical.',
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setSelectedEntry(null);
        }}
        title={selectedEntry ? 'Edit Emergency Level' : 'Add Emergency Level'}
      >
        <TagForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>

      <Box pb="20px" />
    </>
  );
};

export default TagSetting;
