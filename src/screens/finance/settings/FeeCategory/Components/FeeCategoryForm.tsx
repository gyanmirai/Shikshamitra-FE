'use client';

import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  Box,
  Grid,
  Paper,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useGetFeeCategoriesQuery,
  useAddFeeCategoryMutation,
  useGetFeeCategoryByIdQuery,
  useUpdateFeeCategoryMutation,
} from 'src/redux/feeCategory/feeCategoryApi';

import { feeCategoryValidationSchema } from './FeeCategoryValidation';
import { getFeeCategoryInitialValues } from './FeeCategoryInitialValues';

import type { IFeeCategoryFormProps } from './type';

const FeeCategoryForm: React.FC<IFeeCategoryFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  // States for removing fee head
  const removeConfirm = useBoolean();
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  // Fetch all fee categories for unique name validation
  const { data: feeCategoriesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: { academicYearId: currentYear?.id },
    options: {
      skip: !currentYear?.id || !open?.value || editData,
    },
  });

  // Fetch fee category details (including mapped fee heads) in edit mode
  const { data: feeCategoryDetails, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoryByIdQuery,
    params: editData?.id,
    options: {
      skip: !editData?.id || !open?.value,
    },
  });

  // Fetch all fee heads for the dropdown
  const {
    data: feeHeadsData,
    isLoading: isFeeHeadsLoading,
    refetch: refetchFeeHeads,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id, maxResultCount: 1000 },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (feeCategoriesData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [feeCategoriesData]
  );

  const feeHeadOptions = useMemo(() => feeHeadsData?.items || [], [feeHeadsData]);

  const [addFeeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeCategoryMutation,
  });

  const [updateFeeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeCategoryMutation,
  });

  const [addFeeHead, { isLoading: isAddFeeHeadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeHeadMutation,
  });

  const [updateFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeHeadMutation,
  });

  const categoryDetails = feeCategoryDetails?.data || feeCategoryDetails || editData;

  const formik = useFormik({
    initialValues: getFeeCategoryInitialValues(categoryDetails),
    enableReinitialize: true,
    validationSchema: feeCategoryValidationSchema(existingNames, categoryDetails),
    onSubmit: (values) => {
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: any) => {
    try {
      let categoryId = editData?.id;

      if (!categoryId) {
        // 1. Create the Fee Category first
        const resCategory = await addFeeCategory({
          academicYearId: currentYear?.id,
          body: {
            categoryName: values.categoryName,
            description: values.description,
            feeHeads: [], // initially empty, we will update with mapped fee heads right after
          },
        }).unwrap();
        categoryId = resCategory.data?.id || resCategory.id;
      }

      // 2. Create or update fee heads on the backend
      const mappedFeeHeads = await Promise.all(
        values.feeHeads.map(async (fh: any) => {
          // Check if a fee head with this name already exists in the academic year
          const existingFeeHead = feeHeadsData?.items?.find(
            (item: any) => item.name.trim().toLowerCase() === fh.name.trim().toLowerCase()
          );

          if (fh.feeHeadId) {
            // Update existing fee head
            await updateFeeHead({
              id: fh.feeHeadId,
              body: {
                feeCategoryId: categoryId,
                name: fh.name.trim(),
                description: fh.description || '',
              },
            }).unwrap();

            return {
              feeHeadId: fh.feeHeadId,
              description: fh.description || '',
              isConcessionApplied: fh.isConcessionApplied,
            };
          }

          if (existingFeeHead) {
            // Reuse existing fee head with the same name
            await updateFeeHead({
              id: existingFeeHead.id,
              body: {
                feeCategoryId: categoryId,
                name: existingFeeHead.name,
                description: fh.description || existingFeeHead.description || '',
              },
            }).unwrap();

            return {
              feeHeadId: existingFeeHead.id,
              description: fh.description || '',
              isConcessionApplied: fh.isConcessionApplied,
            };
          }

          // Create new fee head
          const resHead = await addFeeHead({
            academicYearId: currentYear?.id,
            body: {
              feeCategoryId: categoryId,
              name: fh.name.trim(),
              description: fh.description || '',
            },
          }).unwrap();
          const realId = resHead.data?.id || resHead.id;

          return {
            feeHeadId: realId,
            description: fh.description || '',
            isConcessionApplied: fh.isConcessionApplied,
          };
        })
      );

      // 3. Update the Fee Category with the complete mapped fee heads
      await updateFeeCategory({
        feeCategoryId: categoryId,
        body: {
          categoryName: values.categoryName,
          description: values.description,
          feeHeads: mappedFeeHeads,
        },
      }).unwrap();

      refetchFeeHeads();

      shikshaMitraToast.success({
        message: `${values.categoryName} Fee Category ${editData ? 'updated' : 'added'} successfully`,
      });

      onClose(null, true);
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  };

  const handleAddFeeHead = () => {
    formik.setFieldValue('feeHeads', [
      ...(formik.values.feeHeads ?? []),
      {
        feeHeadId: '',
        name: '',
        description: '',
        isConcessionApplied: false,
      },
    ]);
  };

  const handleRemoveClick = (idx: number) => {
    // If only one Fee Head exists, prevent deletion
    if (formik.values.feeHeads.length <= 1) {
      shikshaMitraToast.error({
        message: 'At least one Fee Head is required. Cannot remove the last Fee Head.',
      });
      return;
    }
    setRemoveIndex(idx);
    removeConfirm.onTrue();
  };

  const handleConfirmRemove = () => {
    if (removeIndex !== null) {
      const heads = [...(formik.values.feeHeads ?? [])];
      heads.splice(removeIndex, 1);
      formik.setFieldValue('feeHeads', heads);
    }
    removeConfirm.onFalse();
    setRemoveIndex(null);
  };

  if (isLoadingDetails || isFeeHeadsLoading) {
    return <LoadingScreen />;
  }

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Section 1 -- Fee Category Information */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.categoryName && formik.errors.categoryName) || false}
            >
              <TextField
                fullWidth
                label="Category Name *"
                name="categoryName"
                size="small"
                value={formik.values.categoryName}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                    .replace(/^\s+/g, '') // Remove leading spaces
                    .replace(/^\d+/, ''); // Remove leading numbers
                  value = value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');

                  formik.setFieldValue('categoryName', value);
                }}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={
                  formik.touched.categoryName && formik.errors.categoryName
                    ? (formik.errors.categoryName as string)
                    : ''
                }
                inputProps={{ maxLength: 100 }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                formik.touched.description && formik.errors.description
                  ? (formik.errors.description as string)
                  : ''
              }
              inputProps={{ maxLength: 500 }}
            />
          </Grid>

          {/* Section 2 -- Fee Heads */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Fee Heads
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Add and configure all Fee Heads belonging to this Fee Category.
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddFeeHead}
                    size="small"
                  >
                    Add Fee Head
                  </Button>
                </Box>
              </Box>

              {formik.values.feeHeads.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  py={4}
                  border="1px dashed"
                  borderColor="divider"
                  borderRadius={1}
                >
                  <Iconify
                    icon="solar:document-bold-duotone"
                    width={48}
                    height={48}
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No Fee Heads added.
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Click &quot;Add Fee Head&quot; to map Fee Heads.
                  </Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {formik.values.feeHeads.map((fh, idx) => {
                    const feeHeadError = Array.isArray(formik.errors.feeHeads)
                      ? (formik.errors.feeHeads[idx] as FormikErrors<any>)
                      : undefined;

                    const feeHeadTouched = Array.isArray(formik.touched.feeHeads)
                      ? formik.touched.feeHeads[idx]
                      : undefined;

                    return (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 2,
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Grid container spacing={2}>
                          {/* Fee Head Name */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <ShakingTextField
                              error={!!(feeHeadTouched?.name && feeHeadError?.name)}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                label="Fee Head Name *"
                                name={`feeHeads.${idx}.name`}
                                value={fh.name}
                                onChange={(e) => {
                                  let value = e.target.value
                                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                                    .replace(/^\s+/g, '') // Remove leading spaces
                                    .replace(/^\d+/, ''); // Remove leading numbers
                                  value = value
                                    .split(' ')
                                    .map((word) =>
                                      word
                                        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                        : ''
                                    )
                                    .join(' ');
                                  formik.setFieldValue(`feeHeads.${idx}.name`, value);
                                }}
                                error={!!(feeHeadTouched?.name && feeHeadError?.name)}
                                helperText={
                                  feeHeadTouched?.name && feeHeadError?.name
                                    ? (feeHeadError.name as string)
                                    : `${fh.name.length}/40 Maximum characters allowed`
                                }
                                inputProps={{ maxLength: 40 }}
                              />
                            </ShakingTextField>
                          </Grid>

                          {/* Concession Applicable Switch */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={fh.isConcessionApplied}
                                  onChange={(e) => {
                                    formik.setFieldValue(
                                      `feeHeads.${idx}.isConcessionApplied`,
                                      e.target.checked
                                    );
                                  }}
                                  size="small"
                                />
                              }
                              label={
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Enable if concessions are allowed for this Fee Head.
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>

                          {/* Description */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              multiline
                              label="Description"
                              name={`feeHeads.${idx}.description`}
                              value={fh.description}
                              onChange={formik.handleChange}
                              error={!!(feeHeadTouched?.description && feeHeadError?.description)}
                              helperText={
                                feeHeadTouched?.description && feeHeadError?.description
                                  ? (feeHeadError.description as string)
                                  : ''
                              }
                              inputProps={{ maxLength: 500 }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 1 }}>
                            <Button
                              color="error"
                              size="small"
                              startIcon={<Iconify icon={GlobalIcons.delete} />}
                              onClick={() => handleRemoveClick(idx)}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Box>
              )}
              {typeof formik.errors.feeHeads === 'string' && formik.touched.feeHeads && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {formik.errors.feeHeads}
                </Typography>
              )}
            </Paper>
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
          onClick={(e: any) => formik.handleSubmit(e)}
          loading={isAddLoading || isUpdateLoading}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={editData?.name || ''}
        itemType="Fee Category"
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

      {/* Remove Fee Head Confirmation */}
      <ConfirmDialog
        open={removeConfirm.value}
        onClose={removeConfirm.onFalse}
        title="Remove Fee Head?"
        content="This Fee Head will be removed from this Fee Category."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmRemove}>
            Remove
          </Button>
        }
      />
    </BackPopUpChecked>
  );
};

export default FeeCategoryForm;
