'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import HeadSelector from 'src/screens/finance/components/HeadSelector';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Grid, Button, TextField, DialogActions } from '@mui/material';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetExpenseCategoryQuery,
  usePutExpenseCategoryMutation,
  usePostExpenseCategoryMutation,
} from 'src/redux/finance/expenseCategory';

import { getExpenseCategoryInitialValues } from './ExpenseCategoryInitialValues';
import { expenseCategoryValidationSchema } from './ExpenseCategoryValidationSchema';

import type { IExpenseCategoryFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State for downstream usage warning dialog
  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  const { data: expenseCategoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseCategoryQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 1000 },
    options: {
      skip: !currentYear?.id || !open?.value || editData,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (expenseCategoryData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [expenseCategoryData]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

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
    enableReinitialize: true,
    validationSchema: expenseCategoryValidationSchema(existingNames, editData),
    onSubmit: async (values) => {
      // Check if updating an item that is used downstream
      if ((editData as any)?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      await performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: any) => {
    try {
      // Transform form data to API format
      const payload = {
        name: values.name,
        description: values.description || '',
        tags: values.tags || [],
        expenseHeadId: values.expenseHeadId || undefined,
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
  };

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
        <Grid container spacing={3}>
          {/* Expense Category Name */}
          <Grid size={{ xs: 12, md: 6 }}>
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
                    .replace(/^\s+/g, '')
                    .trimStart()
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
          {/* Expense Head */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.expenseHeadId && formik.errors.expenseHeadId) || false}
            >
              <HeadSelector
                name="expenseHeadId"
                label="Expense Head"
                headType="Expense"
                value={formik.values.expenseHeadId}
                onChange={(val) => formik.setFieldValue('expenseHeadId', val)}
                error={formik.touched.expenseHeadId && Boolean(formik.errors.expenseHeadId)}
                helperText={
                  formik.touched.expenseHeadId ? (formik.errors.expenseHeadId as string) : undefined
                }
              />
            </ShakingTextField>
          </Grid>
          {/* Tags */}
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
                    : 'Press Enter to add a tag'
                }
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

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={editData?.name || ''}
        itemType="Expense Category"
        isLoading={isAddLoading || isUpdateLoading}
        onConfirm={async () => {
          if (pendingFormValues) {
            await performSubmission(pendingFormValues);
            setShowDownstreamWarning(false);
            setPendingFormValues(null);
          }
        }}
        onCancel={() => {
          setShowDownstreamWarning(false);
          setPendingFormValues(null);
        }}
      />
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
