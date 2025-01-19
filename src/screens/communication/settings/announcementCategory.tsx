'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
  Box,
  Grid,
  Button,
  Switch,
  MenuList,
  MenuItem,
  TextField,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TCategory {
  id: number;
  categoryName: string;
  categoryDescription: string;
  status: string;
}

const announcementCategories: TCategory[] = [
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

const SettingAnnouncement = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Setting Announcement"
      links={[{ name: 'Communication' }, { name: 'Settings' }, { name: 'Setting Announcement' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <AnnouncementCategory />
    <AnnouncementImportant />
  </Box>
);

export default SettingAnnouncement;

const AnnouncementCategory = () => {
  const dialog = useBoolean();
  const [announcementCategoryTable, setAnnouncementCategoryTable] =
    useState<TCategory[]>(announcementCategories);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

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

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedCategory(null);
  };

  const handleDelete = (comingCategory: any) => {
    setAnnouncementCategoryTable((prevData) =>
      prevData.filter((category) => category.id !== comingCategory.id)
    );
    handleCloseDialog();
  };

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
          { id: 'categoryName', label: 'Category Name' },
          { id: 'categoryDescription', label: 'Category Description' },
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
                          setSelectedCategory(row);
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
                        setSelectedCategory(row);
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

interface CategoryFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, data = null, isEdit = false }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: {
      categoryName: data?.categoryName || '',
      categoryDescription: data?.categoryDescription || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="categoryName"
                size="small"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Description"
                name="categoryDescription"
                size="small"
                rows={4}
                multiline
                value={formik.values.categoryDescription}
                onChange={formik.handleChange}
                error={
                  formik.touched.categoryDescription && Boolean(formik.errors.categoryDescription)
                }
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};

interface TImportant {
  id: number;
  importantLevel: string;
  importantLevelDesc: string;
  status: string;
}

const initialImportantData: TImportant[] = [
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
  const dialog = useBoolean();
  const [importantLevelData, setImportantLevelData] = useState<TImportant[]>(initialImportantData);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedImportant, setSelectedImportant] = useState<any | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

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

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedImportant(null);
  };

  const handleDelete = (comingImportant: any) => {
    setImportantLevelData((prevData) =>
      prevData.filter((important) => important.id !== comingImportant.id)
    );
    handleCloseDialog();
  };

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

interface ImportantFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

const ImportantForm: React.FC<ImportantFormProps> = ({ onSubmit, data = null, isEdit = false }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: {
      importantLevel: data?.importantLevel || '',
      importantLevelDesc: data?.importantLevelDesc || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Important Level"
                name="importantLevel"
                size="small"
                value={formik.values.importantLevel}
                onChange={formik.handleChange}
                error={formik.touched.importantLevel && Boolean(formik.errors.importantLevel)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Important Level Desc"
                name="importantLevelDesc"
                size="small"
                rows={4}
                multiline
                value={formik.values.importantLevelDesc}
                onChange={formik.handleChange}
                error={
                  formik.touched.importantLevelDesc && Boolean(formik.errors.importantLevelDesc)
                }
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
