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
import { DownstreamUsageWarning } from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetIncomeCategoriesQuery,
  usePutIncomeCategoryMutation,
  usePostIncomeCategoryMutation,
} from 'src/redux/finance/incomeCategory';

import { getIncomeCategoryInitialValues } from './IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategoryValidationSchema';

import type { IIncomeCategoryFormProps } from './type';

const IncomeCategoryForm: React.FC<IIncomeCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State for downstream usage warning dialog
  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  const { data: incomeCategoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 1000 },
    options: {
      skip: !currentYear?.id || !open?.value || editData,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (incomeCategoryData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [incomeCategoryData]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

  const [tag, setTag] = useState('');
  const [tagError, setTagError] = useState('');

  // POST mutation for creating
  const [addIncomeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostIncomeCategoryMutation,
  });

  // PUT mutation for updating
  const [updateIncomeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutIncomeCategoryMutation,
  });

  const formik = useFormik({
    initialValues: getIncomeCategoryInitialValues(editData),
    enableReinitialize: true,
    validationSchema: incomeCategoryValidationSchema(existingNames, editData),
    onSubmit: async (values) => {
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
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
        incomeHeadId: values.incomeHeadId || undefined,
      };

      if (editData?.id) {
        // Update existing income category
        await updateIncomeCategory({
          incomeCategoryId: editData.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.name} Income Category updated successfully`,
        });
      } else {
        // Create new income category
        await addIncomeCategory({
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.name} Income Category added successfully`,
        });
      }
      onClose(null, true);
    } catch (error) {
      console.error('Save operation failed:', error);
      shikshaMitraToast.error({
        message: `Failed to ${editData ? 'update' : 'create'} income category`,
      });
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (formik.values.tags.some((t: string) => t.toLowerCase() === trimmed.toLowerCase())) {
        setTagError(`Tag "${trimmed}" already exists`);
        return;
      }
      formik.setFieldValue('tags', [...formik.values.tags, trimmed]);
      setTag('');
      setTagError('');
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
          {/* Income Category Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Income Category Name *"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={(e) => {
                  const value = e.target.value
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
                helperText={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : `${formik.values.name.length}/40 characters`
                }
                inputProps={{ maxLength: 40 }}
              />
            </ShakingTextField>
          </Grid>
          {/* Income Head */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.incomeHeadId && formik.errors.incomeHeadId) || false}
            >
              <HeadSelector
                name="incomeHeadId"
                label="Income Head"
                headType="Income"
                value={formik.values.incomeHeadId}
                onChange={(val) => formik.setFieldValue('incomeHeadId', val)}
                error={formik.touched.incomeHeadId && Boolean(formik.errors.incomeHeadId)}
                helperText={
                  formik.touched.incomeHeadId ? (formik.errors.incomeHeadId as string) : undefined
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
                onChange={(e) => {
                  setTag(e.target.value);
                  if (tagError) setTagError('');
                }}
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
                error={(formik.touched.tags && Boolean(formik.errors.tags)) || Boolean(tagError)}
                helperText={
                  tagError ||
                  (formik.touched.tags && typeof formik.errors.tags === 'string'
                    ? formik.errors.tags
                    : `Press enter after typing a tag to add it`)
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
        itemType="Income Category"
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

export default IncomeCategoryForm;
