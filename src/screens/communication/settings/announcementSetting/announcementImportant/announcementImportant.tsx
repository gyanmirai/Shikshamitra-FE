'use client';

import { useState } from 'react';

import {
  Box,
  Button,
  Switch,
  MenuList,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { ImportantForm } from './announcementImpForm';

import type { IAnnouncementImportant } from '../../type';

const initialImportantData: IAnnouncementImportant[] = [
  {
    id: 1,
    importantLevel: 'High',
    importantLevelDesc: 'Critical updates that require immediate attention.',
    status: 'Publish',
  },
  {
    id: 2,
    importantLevel: 'Medium',
    importantLevelDesc: 'Important updates that are not urgent but need to be addressed soon.',
    status: 'Publish',
  },
  {
    id: 3,
    importantLevel: 'Low',
    importantLevelDesc: 'General updates that are informative but not time-sensitive.',
    status: 'UnPublish',
  },
  {
    id: 4,
    importantLevel: 'Urgent',
    importantLevelDesc: 'Emergency announcements requiring immediate action.',
    status: 'Publish',
  },
  {
    id: 5,
    importantLevel: 'Informational',
    importantLevelDesc: 'Updates for awareness without immediate action required.',
    status: 'UnPublish',
  },
];

const AnnouncementImportant = () => {
  // Dialog state for managing the main dialog visibility
  const dialog = useBoolean();

  // State to manage the list of important announcements
  const [importantLevelData, setImportantLevelData] =
    useState<IAnnouncementImportant[]>(initialImportantData);

  // Dialog state for confirming publish/unpublish actions
  const confirmPublishDialog = useBoolean();

  // Dialog state for confirming delete actions
  const confirmDeleteDialog = useBoolean();

  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store the currently selected important announcement for editing
  const [selectedImportant, setSelectedImportant] = useState<any | null>(null);

  // State to track pending status changes before confirmation
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  /**
   * Handles the status change (Publish/Unpublish) for an announcement level
   * @param id - The ID of the announcement level to update
   * @param value - The current status value
   */
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  /**
   * Confirms and applies the pending status change to the announcement level
   */
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setImportantLevelData((prevSubject) =>
        prevSubject.map((important) =>
          important.id === id ? { ...important, status: newValue } : important
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  /**
   * Closes all dialogs and resets selected announcement level
   */
  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedImportant(null);
  };

  /**
   * Deletes an announcement level from the list
   * @param comingImportant - The announcement level to delete
   */
  const handleDelete = (comingImportant: any) => {
    setImportantLevelData((prevData) =>
      prevData.filter((important) => important.id !== comingImportant.id)
    );
    handleCloseDialog();
  };

  /**
   * Handles form submission for creating or updating an announcement level
   * @param values - The form values containing announcement level data
   */
  const handleSubmit = (values: any) => {
    if (isEdit && selectedImportant) {
      setImportantLevelData(
        importantLevelData.map((important) => (important.id === values.id ? values : important))
      );
    } else {
      setImportantLevelData([...importantLevelData, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedImportant(null);
  };
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={3} mt={2}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Announcement Important Level
        </Button>
      </Box>
      <CustomizableTable
        tableId="important-level-table"
        columns={[
          { id: 'importantLevel', label: 'Important Level' },
          { id: 'importantLevelDesc', label: 'Important Level Desc' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
                />
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    {row.status === 'UnPublish' && (
                      <MenuItem
                        onClick={() => {
                          dialog.onTrue();
                          setSelectedImportant(row);
                          setIsEdit(true);
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        confirmDeleteDialog.onTrue();
                        setSelectedImportant(row);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={importantLevelData}
      />

      <CustomDialog
        title={isEdit ? 'Edit Important Level' : 'Create Important Level'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <ImportantForm data={selectedImportant} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirmDeleteDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Category?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDeleteDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedImportant);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default AnnouncementImportant;
