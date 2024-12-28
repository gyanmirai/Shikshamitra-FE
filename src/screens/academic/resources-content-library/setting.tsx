'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FileStorageOverview } from 'src/sections/file-manager/file-storage-overview';

interface TCategory {
  id: number;
  categoryName: string;
}

const initialCategories: TCategory[] = [
  {
    id: 1,
    categoryName: 'Company Annual Report 2023',
  },
  {
    id: 2,
    categoryName: 'Q4 Marketing Strategy',
  },
  {
    id: 3,
    categoryName: 'Team Building Photos',
  },
];

const GB = 1000000000 * 24;
const Setting = (props: TabComponentType) => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();

  const handleCloseDialog = () => {
    setSelectedCategory(null);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedCategory) {
      setCategories((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedCategory.id
            ? {
                ...a,
                categoryName: values.categoryName,
              }
            : a
        )
      );
    } else {
      // Create new activity
      const newCategory: TCategory = {
        id: Math.max(...categories.map((a) => a.id)) + 1,
        categoryName: values.categoryName,
      };
      setCategories((prevActivities) => [...prevActivities, newCategory]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedCategory) {
      setCategories(categories.filter((category) => category.id !== selectedCategory.id));
      deleteConfirmDialog.onFalse();
      setSelectedCategory(null);
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Resource Content Library' },
          { name: 'Settings' },
        ]}
        sx={{ px: 1, mb: 6 }}
      />
      <Grid container spacing={2} marginTop={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <CustomSelect
                options={[]}
                label="Who can upload resources"
                value=""
                onChange={() => {}}
              />
              <CustomSelect
                options={[]}
                label="Who can edit resources"
                value=""
                onChange={() => {}}
              />
              <CustomSelect
                options={[]}
                label="Who can delete resources"
                value=""
                onChange={() => {}}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
              <Button variant="outlined">Reset</Button>
              <Button variant="contained">Save</Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {categories.map((category) => (
                  <Box
                    key={category.id}
                    component="li"
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                      m: 0.5,
                      borderRadius: '15px',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {category.categoryName}
                      </Typography>
                    </Box>
                    <Box>
                      <Iconify
                        icon="solar:pen-bold"
                        sx={{ height: '18px', width: '18px', mr: 2, cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsEdit(true);
                          dialog.onTrue();
                        }}
                      />
                      <Iconify
                        icon="mdi:delete"
                        sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedCategory(category);
                          deleteConfirmDialog.onTrue();
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => {
                  dialog.onTrue();
                  setIsEdit(false);
                  setSelectedCategory(null);
                }}
              >
                Add Resource Category
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Category' : 'Add Category'}
      >
        <AddCategory onSubmit={handleSubmit} data={selectedCategory} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Weightage"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCategory?.categoryName} category ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      <Card sx={{ p: 2, mt: 1 }}>
        <Typography variant="h6">Notifications</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch />
            <Typography>New Resources</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch />
            <Typography>Content Updates</Typography>
          </Box>
        </Box>
      </Card>
      <FileStorageOverview
        total={GB}
        chart={{ series: 76 }}
        data={[
          {
            name: 'Images',
            usedStorage: GB / 2,
            filesCount: 223,
            icon: (
              <Box component="img" src={`${CONFIG.site.basePath}/assets/icons/files/ic-img.svg`} />
            ),
          },
          {
            name: 'Media',
            usedStorage: GB / 5,
            filesCount: 223,
            icon: (
              <Box
                component="img"
                src={`${CONFIG.site.basePath}/assets/icons/files/ic-video.svg`}
              />
            ),
          },
          {
            name: 'Documents',
            usedStorage: GB / 5,
            filesCount: 223,
            icon: (
              <Box
                component="img"
                src={`${CONFIG.site.basePath}/assets/icons/files/ic-document.svg`}
              />
            ),
          },
          {
            name: 'Other',
            usedStorage: GB / 10,
            filesCount: 223,
            icon: (
              <Box component="img" src={`${CONFIG.site.basePath}/assets/icons/files/ic-file.svg`} />
            ),
          },
        ]}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default Setting;

interface AddCategoryProps {
  onSubmit: (values: TCategory) => void;
  data: TCategory | null;
  isEdit: boolean;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onSubmit, data, isEdit }) => {
  const formik = useFormik({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      categoryName: isEdit && data ? data?.categoryName : '',
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
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
            </Grid>{' '}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" color="primary" variant="contained">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
