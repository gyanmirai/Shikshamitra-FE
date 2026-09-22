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
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIncomeCategoriesQuery } from 'src/redux/finance/incomeCategory';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetFeeHeadModulesQuery } from 'src/redux/feeHeadModule/feeHeadModuleApi';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetFeeCategoriesQuery,
  useAddFeeCategoryMutation,
  useGetFeeCategoryByIdQuery,
  useUpdateFeeCategoryMutation,
} from 'src/redux/feeCategory/feeCategoryApi';
import {
  Box,
  Grid,
  Paper,
  Button,
  Switch,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

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

  // Fetch the fee head module lookup for the Module dropdown
  const { data: moduleData, isLoading: isModulesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadModulesQuery,
    options: {
      skip: !open?.value,
    },
  });

  const moduleOptions = useMemo(
    () => (moduleData || []).map((m: any) => ({ label: m.displayName, value: m.value })),
    [moduleData]
  );

  const {
    data: incomeCategoryData,
    isLoading: isIncomeCategoryLoading,
    isFetching: isIncomeCategoryFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      includeInactive: false,
    },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const incomeCategoryOptions = useMemo(
    () =>
      (incomeCategoryData?.items ?? []).map((category: any) => ({
        id: category.id,
        displayName: `${category.code ? `${category.code} — ` : ''}${category.name} → ${
          category.defaultAccountHeadName || 'No account head'
        }`,
      })),
    [incomeCategoryData]
  );

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (feeCategoriesData?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [feeCategoriesData]
  );

  const [addFeeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeCategoryMutation,
  });

  const [updateFeeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeCategoryMutation,
  });

  const categoryDetails = feeCategoryDetails || editData;

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

  // Perform the actual form submission -- single call creates/updates the category and all its fee heads together
  const performSubmission = async (values: any) => {
    try {
      const body = {
        name: values.name.trim(),
        description: values.description || '',
        feeHeads: values.feeHeads.map((fh: any) => ({
          id: fh.id || null,
          incomeCategoryId: fh.incomeCategoryId,
          name: fh.name.trim(),
          module: fh.module === '' ? null : fh.module,
          isConcessionApplied: fh.isConcessionApplied,
          description: fh.description || '',
        })),
      };

      if (editData?.id) {
        await updateFeeCategory({
          id: editData.id,
          body,
        }).unwrap();
      } else {
        await addFeeCategory({
          academicYearId: currentYear?.id,
          body,
        }).unwrap();
      }

      shikshaMitraToast.success({
        message: `${values.name} Fee Category ${editData ? 'updated' : 'added'} successfully`,
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
        id: '',
        incomeCategoryId: '',
        name: '',
        module: '',
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

  if (isLoadingDetails || isModulesLoading) {
    return <LoadingScreen />;
  }

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Section 1 -- Fee Category Information */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Category Name *"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={(e) => {
                  formik.setFieldValue(
                    'name',
                    e.target.value.replace(/\s+/g, ' ').replace(/^\s+/g, '')
                  );
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  formik.touched.name && formik.errors.name ? (formik.errors.name as string) : ''
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

                    const selectedIncomeCategory =
                      incomeCategoryOptions.find(
                        (option: any) => option.id === fh.incomeCategoryId
                      ) ?? null;

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
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            Fee Head {idx + 1}
                          </Typography>
                          <Tooltip title="Remove fee head">
                            <IconButton
                              color="error"
                              size="small"
                              aria-label={`Remove fee head ${idx + 1}`}
                              onClick={() => handleRemoveClick(idx)}
                            >
                              <Iconify icon={GlobalIcons.delete} />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'minmax(0, 1fr)',
                              sm: 'repeat(2, minmax(0, 1fr))',
                              md: 'minmax(150px, 1fr) minmax(220px, 1.45fr) minmax(130px, 0.8fr) minmax(170px, auto)',
                            },
                            gap: 2,
                            alignItems: 'start',
                          }}
                        >
                          {/* Fee Head Name */}
                          <Box minWidth={0}>
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
                                  formik.setFieldValue(
                                    `feeHeads.${idx}.name`,
                                    e.target.value.replace(/\s+/g, ' ').replace(/^\s+/g, '')
                                  );
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
                          </Box>

                          {/* Income Category */}
                          <Box minWidth={0}>
                            <ShakingTextField
                              error={
                                !!(
                                  feeHeadTouched?.incomeCategoryId && feeHeadError?.incomeCategoryId
                                )
                              }
                            >
                              <Autocomplete
                                size="small"
                                fullWidth
                                options={incomeCategoryOptions}
                                value={selectedIncomeCategory}
                                loading={isIncomeCategoryLoading || isIncomeCategoryFetching}
                                disabled={Boolean(fh.isUsedInDownstream)}
                                getOptionLabel={(option: any) => option?.displayName || ''}
                                isOptionEqualToValue={(option: any, value: any) =>
                                  option?.id === value?.id
                                }
                                onChange={(_event, value: any) => {
                                  formik.setFieldValue(
                                    `feeHeads.${idx}.incomeCategoryId`,
                                    value?.id || ''
                                  );
                                  formik.setFieldTouched(`feeHeads.${idx}.incomeCategoryId`, false);
                                }}
                                onBlur={() =>
                                  formik.setFieldTouched(`feeHeads.${idx}.incomeCategoryId`, true)
                                }
                                noOptionsText="No income categories found"
                                renderOption={(props, option: any) => {
                                  const { key, ...optionProps } = props;

                                  return (
                                    <Box
                                      component="li"
                                      key={key}
                                      {...optionProps}
                                      sx={{ minWidth: 0 }}
                                    >
                                      <Typography
                                        noWrap
                                        title={option.displayName}
                                        sx={{
                                          minWidth: 0,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {option.displayName}
                                      </Typography>
                                    </Box>
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    name={`feeHeads.${idx}.incomeCategoryId`}
                                    label="Income Category *"
                                    error={
                                      !!(
                                        feeHeadTouched?.incomeCategoryId &&
                                        feeHeadError?.incomeCategoryId
                                      )
                                    }
                                    helperText={
                                      feeHeadTouched?.incomeCategoryId &&
                                      feeHeadError?.incomeCategoryId
                                        ? (feeHeadError.incomeCategoryId as string)
                                        : 'Determines the Income Account Head for posting.'
                                    }
                                    inputProps={{
                                      ...params.inputProps,
                                      title: selectedIncomeCategory?.displayName || '',
                                    }}
                                  />
                                )}
                                slotProps={{
                                  paper: { sx: { overflowX: 'hidden' } },
                                  listbox: { sx: { overflowX: 'hidden' } },
                                }}
                                sx={{
                                  minWidth: 0,
                                  '& .MuiAutocomplete-inputRoot': {
                                    minWidth: 0,
                                    flexWrap: 'nowrap',
                                  },
                                  '& .MuiAutocomplete-input': {
                                    minWidth: '0 !important',
                                    textOverflow: 'ellipsis',
                                  },
                                }}
                              />
                            </ShakingTextField>
                          </Box>

                          {/* Module */}
                          <Box minWidth={0}>
                            <ShakingTextField
                              error={!!(feeHeadTouched?.module && feeHeadError?.module)}
                            >
                              <CustomSelect
                                name={`feeHeads.${idx}.module`}
                                label="Module"
                                options={moduleOptions}
                                value={fh.module ?? ''}
                                labelKey="label"
                                valueKey="value"
                                onChange={(value) => {
                                  formik.setFieldValue(`feeHeads.${idx}.module`, value);
                                  formik.setFieldTouched(`feeHeads.${idx}.module`, false);
                                }}
                                error={!!(feeHeadTouched?.module && feeHeadError?.module)}
                                helperText={
                                  feeHeadTouched?.module && feeHeadError?.module
                                    ? (feeHeadError.module as string)
                                    : ''
                                }
                                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                              />
                            </ShakingTextField>
                          </Box>

                          {/* Concession Applicable Switch */}
                          <Box
                            sx={{
                              minWidth: 0,
                              minHeight: 40,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <FormControlLabel
                              sx={{
                                m: 0,
                                gap: 0.5,
                                '& .MuiFormControlLabel-label': { whiteSpace: 'nowrap' },
                              }}
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
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  Enable concessions
                                </Typography>
                              }
                            />
                          </Box>

                          {/* Description */}
                          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, minWidth: 0 }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              maxRows={4}
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
                          </Box>
                        </Box>
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
