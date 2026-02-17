'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Grid, Button, TextField, DialogActions } from '@mui/material';
import {
  usePutExpenseCategoryMutation,
  usePostExpenseCategoryMutation,
} from 'src/redux/finance/expenseCategory';

import { getExpenseCategoryInitialValues } from './ExpenseCategoryInitialValues';
import { expenseCategoryValidationSchema } from './ExpenseCategoryValidationSchema';

import type { IExpenseCategoryFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [tag, setTag] = useState('');

  // POST mutation for creating
  const [addExpenseCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostExpenseCategoryMutation,
  });

  // PUT mutation for updating
  const [updateExpenseCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutExpenseCategoryMutation,
  });

  const formik = useFormik({
    initialValues: getExpenseCategoryInitialValues(editData),
    validationSchema: expenseCategoryValidationSchema,
    onSubmit: async (values) => {
      try {
        // Transform form data to API format
        const payload = {
          name: values.name,
          description: values.description || '',
          tags: values.tags || [],
        };

        if (editData?.id) {
          // Update existing expense category
          await updateExpenseCategory({
            expenseCategoryId: editData.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Expense Category updated successfully`,
          });
        } else {
          // Create new expense category
          await addExpenseCategory({
            academicYearId: currentYear?.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Expense Category added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} expense category`,
        });
      }
    },
  });

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (trimmed && !formik.values.tags.includes(trimmed)) {
        formik.setFieldValue('tags', [...formik.values.tags, trimmed]);
        setTag('');
      }
    }
  };

  const handleDelete = (deleteTag: any) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter((t: string) => t !== deleteTag)
    );
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Expense Category Name */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Expense Category Name *"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('name', value);
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.tags && formik.errors.tags) || false}>
              <TextField
                fullWidth
                size="small"
                label="Tags *"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        alignItems: 'center',
                        maxWidth: '100%',
                      }}
                    >
                      {formik.values.tags.map((t: string, index: number) => (
                        <Chip
                          key={index}
                          label={t}
                          onDelete={() => handleDelete(t)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    minHeight: 'auto',
                  },
                  '& .MuiInputBase-input': {
                    flexGrow: 1,
                    minWidth: '80px',
                  },
                }}
                error={formik.touched.tags && Boolean(formik.errors.tags)}
                helperText={
                  formik.touched.tags && typeof formik.errors.tags === 'string'
                    ? formik.errors.tags
                    : undefined
                }
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          loading={isAddLoading || isUpdateLoading}
          disabled={isAddLoading || isUpdateLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
