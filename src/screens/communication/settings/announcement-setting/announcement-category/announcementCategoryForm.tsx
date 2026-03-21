'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';
import {
  Box,
  Button,
  Switch,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { CategoryForm } from './categoryForm';

import type { IAnnoucementCategory } from '../../type';

const announcementCategories: IAnnoucementCategory[] = [
  {
    id: 1,
    categoryName: 'School Events',
    categoryDescription: 'Announcements related to upcoming school events.',
    status: 'Publish',
  },
  {
    id: 2,
    categoryName: 'Holidays',
    categoryDescription: 'Information about school holidays and breaks.',
    status: 'UnPublish',
  },
  {
    id: 3,
    categoryName: 'Exams',
    categoryDescription: 'Updates and announcements about exams and schedules.',
    status: 'Publish',
  },
  {
    id: 4,
    categoryName: 'General Notices',
    categoryDescription: 'Important general notices for students and parents.',
    status: 'UnPublish',
  },
  {
    id: 5,
    categoryName: 'Sports',
    categoryDescription: 'Updates on sports events and team announcements.',
    status: 'Publish',
  },
];
const AnnouncementCategory = () => {
  // Dialog state for managing the main dialog visibility
  const dialog = useBoolean();

  // State for managing the list of announcement categories
  const [announcementCategoryTable, setAnnouncementCategoryTable] =
    useState<IAnnoucementCategory[]>(announcementCategories);

  // Dialog state for managing the publish/unpublish confirmation dialog
  const confirmPublishDialog = useBoolean();

  // Dialog state for managing the delete confirmation dialog
  const confirmDeleteDialog = useBoolean();

  // State to track if the form is in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store the currently selected category for editing
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // State to store pending status change information before confirmation
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  /**
   * Handles the status change of a category and triggers confirmation dialog
   * @param id - The ID of the category to change
   * @param value - The current status value ('Publish' or 'Unpublish')
   */
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  /**
   * Confirms and applies the pending status change to the selected category
   */
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setAnnouncementCategoryTable((prevSubject) =>
        prevSubject.map((Category) =>
          Category.id === id ? { ...Category, status: newValue } : Category
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  /**
   * Closes all dialogs and resets selected category state
   */
  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedCategory(null);
  };

  /**
   * Deletes a category from the announcement table
   * @param comingCategory - The category object to be deleted
   */
  const handleDelete = (comingCategory: any) => {
    setAnnouncementCategoryTable((prevData) =>
      prevData.filter((category) => category.id !== comingCategory.id)
    );
    handleCloseDialog();
  };

  /**
   * Handles form submission for creating or updating a category
   * @param values - The form values containing category data
   */
  const handleSubmit = (values: any) => {
    if (isEdit && selectedCategory) {
      setAnnouncementCategoryTable(
        announcementCategoryTable.map((category) => (category.id === values.id ? values : category))
      );
    } else {
      setAnnouncementCategoryTable([...announcementCategoryTable, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedCategory(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={3}>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={() => {
              dialog.onTrue();
            }}
          >
            Announcement Category
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="announcement-category-table"
        columns={[
          { id: 'categoryName', label: 'Category Name', align: 'left' },
          { id: 'categoryDescription', label: 'Category Description' },
          {
            id: 'status',
            label: 'Publish',
            filterType: 'enum',
            enumOptions: PublishUnpublishStatusOptions,
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value)}
                />
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            sticky: true,
            isSort: false,
            align: 'left',
            minWidth: 100,
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                showDeleteIcon
                showEditIcon
                handleEditClick={() => {
                  dialog.onTrue();
                  setSelectedCategory(row);
                  setIsEdit(true);
                }}
                handleDeleteClick={() => {
                  confirmDeleteDialog.onTrue();
                  setSelectedCategory(row);
                }}
                showThreeDots={false}
              />
            ),
          },
        ]}
        data={announcementCategoryTable}
      />

      <CustomDialog
        title={isEdit ? 'Edit Category' : 'Create Category'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <CategoryForm data={selectedCategory} onSubmit={handleSubmit} isEdit={isEdit} />
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
              handleDelete(selectedCategory);
            }}
          />
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default AnnouncementCategory;
