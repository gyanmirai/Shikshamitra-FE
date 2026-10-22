'use client';

import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { createFilterOptions } from '@mui/material/Autocomplete';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import FeeHeadDependencies, {
  feeHeadDependencyMessage,
} from '../../components/FeeHeadDependencies';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetFeeCategoriesQuery,
  useAddFeeCategoryMutation,
  useGetFeeCategoryByIdQuery,
  useUpdateFeeCategoryMutation,
} from 'src/redux/feeCategory/feeCategoryApi';
import {
  Box,
  Paper,
  Stack,
  Drawer,
  Button,
  Switch,
  Divider,
  Tooltip,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import { feeCategoryValidationSchema } from './FeeCategoryValidation';
import { getFeeCategoryInitialValues } from './FeeCategoryInitialValues';

import type { IFeeCategoryFormProps } from './type';

const FormInfoIcon = ({ label, title }: { label: string; title: string }) => (
  <CustomTooltip arrow placement="right" title={title}>
    <IconButton aria-label={label} size="small">
      <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
    </IconButton>
  </CustomTooltip>
);

const capitalizeWords = (value: string) =>
  value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');

const FeeCategoryForm: React.FC<IFeeCategoryFormProps> = ({
  open,
  onClose,
  editData,
  onBusyChange,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  // States for removing fee head
  const removeConfirm = useBoolean();
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const [formikNameSearch, setFormikNameSearch] = useState('');

  // Search current and archived categories for name validation
  const { data: feeCategoriesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: { academicYearId: currentYear?.id, search: formikNameSearch, page: 1, pageSize: 100 },
    options: {
      skip: !currentYear?.id || !open?.value || !formikNameSearch,
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

  const {
    data: incomeCategoryData,
    isLoading: isIncomeCategoryLoading,
    isFetching: isIncomeCategoryFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceRoutingOptionsQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      operation: 'fee-head',
    },
    options: {
      skip: !currentYear?.id || !open?.value,
    },
  });

  const incomeCategoryOptions = useMemo(
    () =>
      (incomeCategoryData?.items ?? []).map((category: any) => {
        const displayName = String(category.name ?? '');
        const match = displayName.match(/^(.*?)\s*\[([^\]]+)\]$/);
        return {
          id: category.id,
          displayName,
          name: match?.[1]?.trim() || displayName,
          code: match?.[2] || '',
        };
      }),
    [incomeCategoryData]
  );

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (feeCategoriesData?.items ?? []).map((t: any) =>
          t.name.trim().replace(/\s+/g, ' ').toLowerCase()
        )
      ),
    [feeCategoriesData]
  );
  const existingNamesSignature = JSON.stringify(
    (feeCategoriesData?.items ?? []).map((category: any) => [
      category.id,
      category.name,
      category.isActive,
    ])
  );

  const [addFeeCategory, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFeeCategoryMutation,
    popupConfig: { error: false },
  });

  const [updateFeeCategory, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeCategoryMutation,
    popupConfig: { error: false },
  });

  const categoryDetails = editData?.id
    ? feeCategoryDetails?.id === editData.id
      ? feeCategoryDetails
      : editData
    : null;

  const formik = useFormik({
    initialValues: getFeeCategoryInitialValues(categoryDetails),
    enableReinitialize: true,
    validationSchema: feeCategoryValidationSchema(
      existingNames,
      categoryDetails,
      feeCategoriesData?.items
    ),
    onSubmit: async (values) => {
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      return performSubmission(values);
    },
  });

  useEffect(() => {
    const timer = setTimeout(
      () => setFormikNameSearch(formik.values.name.trim().replace(/\s+/g, ' ')),
      300
    );
    return () => clearTimeout(timer);
  }, [formik.values.name]);
  useEffect(() => {
    if (formik.values.name) void formik.validateField('name');
  }, [existingNamesSignature]);

  // Perform the actual form submission -- single call creates/updates the category and all its fee heads together
  const performSubmission = async (values: any) => {
    try {
      const body = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description || '',
        feeHeads: values.feeHeads.map((fh: any) => ({
          id: fh.id || null,
          incomeCategoryId: fh.incomeCategoryId,
          name: fh.name.trim(),
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
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === 'Finance:FeeCategory:010002') {
        formik.setFieldError('name', problem.detail);
        formik.setFieldTouched('name', true, false);
      } else shikshaMitraToast.error({ message: problem.detail });
    }
  };

  const handleAddFeeHead = () => {
    formik.setFieldValue('feeHeads', [
      ...(formik.values.feeHeads ?? []),
      {
        id: '',
        incomeCategoryId: '',
        name: '',
        description: '',
        isConcessionApplied: false,
      },
    ]);
  };

  const handleRemoveClick = (idx: number) => {
    const original = categoryDetails?.feeHeads.find(
      (head: any) => head.id === formik.values.feeHeads[idx]?.id
    );
    if (original?.isUsedInDownstream || original?.dependencies?.isBlocked) return;
    if (formik.values.feeHeads.length <= 1) return;
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

  const isSaving = isAddLoading || isUpdateLoading || formik.isSubmitting;
  useEffect(() => {
    onBusyChange?.(isSaving);
    return () => onBusyChange?.(false);
  }, [isSaving, onBusyChange]);

  const handleSubmit = async () => {
    if (isSaving) return;
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      await formik.setTouched({
        name: true,
        description: true,
        feeHeads: formik.values.feeHeads.map(() => ({
          name: true,
          incomeCategoryId: true,
          description: true,
        })),
      });
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector<HTMLElement>(
          '[data-fee-category-editor] [aria-invalid="true"]'
        );
        const nextAction = formik.values.feeHeads.length
          ? document.querySelector<HTMLElement>(
              '[data-fee-category-editor] input[name="feeHeads.0.name"]'
            )
          : document.querySelector<HTMLElement>('[data-add-fee-head]');
        (firstInvalid ?? nextAction)?.focus();
      });
      return;
    }
    await formik.submitForm();
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Drawer
        anchor="right"
        open={open.value}
        onClose={(_event, reason) => {
          if (!isSaving && reason !== 'backdropClick') onClose(null, false);
        }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 760 }, maxWidth: '100%' } }}
      >
        <Box
          data-fee-category-editor
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Box
            sx={{
              px: 2,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {editData ? 'Update Fee Category' : 'Add Fee Category'}
              </Typography>
              <FormInfoIcon
                label="About fee categories"
                title="A fee category groups related fee heads for fee setup."
              />
            </Box>
            <IconButton
              aria-label="Close fee category editor"
              onClick={() => onClose(null, false)}
              disabled={isSaving}
              sx={{ width: 44, height: 44 }}
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Box>
          <Divider />
          {isLoadingDetails ? (
            <Stack
              spacing={2}
              sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'hidden' }}
              role="status"
              aria-label="Loading fee category editor"
            >
              <Skeleton variant="rounded" height={180} />
              <Skeleton variant="rounded" height={260} />
            </Stack>
          ) : (
            <Scrollbar sx={{ flex: 1, minHeight: 0, bgcolor: 'background.neutral' }}>
              <Box sx={{ p: 2 }}>
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  <Paper
                    component="section"
                    aria-labelledby="category-details-heading"
                    variant="outlined"
                    sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, minWidth: 0 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Iconify
                        icon="solar:tag-linear"
                        width={20}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography
                          id="category-details-heading"
                          variant="subtitle1"
                          component="h3"
                        >
                          Category Details
                        </Typography>
                        <FormInfoIcon
                          label="About category details"
                          title="Give this group a clear name. The description is optional."
                        />
                      </Stack>
                    </Stack>
                    <Stack spacing={2}>
                      <ShakingTextField
                        error={!!(formik.touched.name && formik.errors.name) || false}
                      >
                        <TextField
                          fullWidth
                          label="Category name *"
                          name="name"
                          size="small"
                          value={formik.values.name}
                          onChange={(event) => {
                            formik.setFieldValue('name', capitalizeWords(event.target.value));
                          }}
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={
                            (formik.touched.name && formik.errors.name
                              ? (formik.errors.name as string)
                              : undefined) || undefined
                          }
                          inputProps={{ maxLength: 100 }}
                        />
                      </ShakingTextField>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        label="Description (optional)"
                        name="description"
                        size="small"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={
                          (formik.touched.description && formik.errors.description
                            ? (formik.errors.description as string)
                            : undefined) || undefined
                        }
                        inputProps={{ maxLength: 500 }}
                      />
                    </Stack>
                  </Paper>

                  <Paper
                    component="section"
                    aria-labelledby="fee-heads-heading"
                    variant="outlined"
                    sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, minWidth: 0 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ mb: 2 }}
                    >
                      <Iconify
                        icon="solar:layers-linear"
                        width={20}
                        sx={{ color: 'text.secondary', flexShrink: 0 }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Typography id="fee-heads-heading" variant="subtitle1" component="h3">
                          Fee Heads
                        </Typography>
                        <FormInfoIcon
                          label="About fee heads"
                          title="Add at least one fee head. Each head needs a name and an active income category."
                        />
                      </Stack>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddFeeHead}
                        size="small"
                        data-add-fee-head
                      >
                        Add Fee Head
                      </Button>
                    </Stack>

                    {formik.values.feeHeads.length === 0 ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        py={3}
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
                          Add at least one fee head to this category.
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Each fee head needs an income category.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.5}>
                        {formik.values.feeHeads.map((fh, idx) => {
                          const feeHeadError = Array.isArray(formik.errors.feeHeads)
                            ? (formik.errors.feeHeads[idx] as FormikErrors<any>)
                            : undefined;

                          const feeHeadTouched = Array.isArray(formik.touched.feeHeads)
                            ? formik.touched.feeHeads[idx]
                            : undefined;

                          const originalHead = categoryDetails?.feeHeads.find(
                            (head: any) => head.id === fh.id
                          );
                          const removalBlocked = Boolean(
                            originalHead?.isUsedInDownstream ||
                            originalHead?.dependencies?.isBlocked
                          );
                          const selectedIncomeCategory =
                            incomeCategoryOptions.find(
                              (option: any) => option.id === fh.incomeCategoryId
                            ) ?? null;

                          return (
                            <Paper
                              key={idx}
                              component="section"
                              aria-label={`Fee head ${idx + 1}${fh.name.trim() ? `: ${fh.name.trim()}` : ''}`}
                              variant="outlined"
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                                borderLeft: '4px solid',
                                borderLeftColor: 'primary.main',
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr) 44px',
                                columnGap: 1,
                                rowGap: 1.5,
                              }}
                            >
                              {removalBlocked && (
                                <Box sx={{ gridColumn: '1 / -1', gridRow: 2, mt: 1.5 }}>
                                  <FeeHeadDependencies
                                    name={fh.name}
                                    feeHeadId={fh.id}
                                    dependencies={originalHead?.dependencies}
                                  />
                                </Box>
                              )}
                              <Box
                                sx={{
                                  gridColumn: 1,
                                  gridRow: 1,
                                  alignSelf: 'start',
                                }}
                              >
                                <Box
                                  aria-label={`Fee head ${idx + 1}`}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 1.25,
                                    bgcolor: 'primary.lighter',
                                    color: 'primary.main',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: 700,
                                    typography: 'subtitle2',
                                    flexShrink: 0,
                                  }}
                                >
                                  {String(idx + 1).padStart(2, '0')}
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  gridColumn: '1 / -1',
                                  gridRow: 2,
                                  display: 'grid',
                                  gridTemplateColumns: {
                                    xs: 'minmax(0, 1fr)',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    md: 'repeat(2, minmax(0, 1fr))',
                                  },
                                  gap: 1.5,
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
                                      label="Fee head name *"
                                      name={`feeHeads.${idx}.name`}
                                      value={fh.name}
                                      onChange={(event) => {
                                        formik.setFieldValue(
                                          `feeHeads.${idx}.name`,
                                          capitalizeWords(event.target.value)
                                        );
                                      }}
                                      error={!!(feeHeadTouched?.name && feeHeadError?.name)}
                                      helperText={
                                        (feeHeadTouched?.name && feeHeadError?.name
                                          ? (feeHeadError.name as string)
                                          : undefined) || undefined
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
                                        feeHeadTouched?.incomeCategoryId &&
                                        feeHeadError?.incomeCategoryId
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
                                      getOptionLabel={(option: any) => option?.name || ''}
                                      filterOptions={createFilterOptions({
                                        stringify: (option: any) => option.displayName,
                                      })}
                                      isOptionEqualToValue={(option: any, value: any) =>
                                        option?.id === value?.id
                                      }
                                      onChange={(_event, value: any) => {
                                        formik.setFieldValue(
                                          `feeHeads.${idx}.incomeCategoryId`,
                                          value?.id || ''
                                        );
                                        formik.setFieldTouched(
                                          `feeHeads.${idx}.incomeCategoryId`,
                                          false
                                        );
                                      }}
                                      onBlur={() =>
                                        formik.setFieldTouched(
                                          `feeHeads.${idx}.incomeCategoryId`,
                                          true
                                        )
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
                                            <Box sx={{ minWidth: 0 }} title={option.displayName}>
                                              <Typography noWrap>{option.name}</Typography>
                                              {option.code && (
                                                <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                                  noWrap
                                                >
                                                  {option.code}
                                                </Typography>
                                              )}
                                            </Box>
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
                                            (feeHeadTouched?.incomeCategoryId &&
                                            feeHeadError?.incomeCategoryId
                                              ? (feeHeadError.incomeCategoryId as string)
                                              : undefined) || undefined
                                          }
                                          InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                <FormInfoIcon
                                                  label="About income categories"
                                                  title="Income categories are configured in Accounts Settings."
                                                />
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
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

                                {/* Concession Applicable Switch */}
                                <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                                  <FormControlLabel
                                    sx={{
                                      m: 0,
                                      width: '100%',
                                      justifyContent: 'space-between',
                                      gap: 1,
                                    }}
                                    labelPlacement="start"
                                    control={
                                      <Switch
                                        checked={fh.isConcessionApplied}
                                        slotProps={{
                                          input: {
                                            role: 'switch',
                                            'aria-label': `Enable concessions for ${fh.name.trim() || `fee head ${idx + 1}`}`,
                                          },
                                        }}
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
                                      <Typography variant="body2" color="text.secondary">
                                        Enable concessions
                                      </Typography>
                                    }
                                  />
                                </Box>

                                <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    label="Description (optional)"
                                    name={`feeHeads.${idx}.description`}
                                    value={fh.description}
                                    onChange={formik.handleChange}
                                    error={
                                      !!(feeHeadTouched?.description && feeHeadError?.description)
                                    }
                                    helperText={
                                      (feeHeadTouched?.description && feeHeadError?.description
                                        ? (feeHeadError.description as string)
                                        : undefined) || undefined
                                    }
                                    inputProps={{ maxLength: 500 }}
                                  />
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  gridColumn: 2,
                                  gridRow: 1,
                                  justifySelf: 'end',
                                  alignSelf: 'start',
                                }}
                              >
                                <Tooltip
                                  title={
                                    formik.values.feeHeads.length <= 1
                                      ? 'At least one fee head is required'
                                      : removalBlocked
                                        ? feeHeadDependencyMessage(
                                            fh.name,
                                            originalHead?.dependencies
                                          )
                                        : 'Remove fee head'
                                  }
                                >
                                  <span>
                                    <IconButton
                                      color="error"
                                      size="small"
                                      sx={{ width: 44, height: 44 }}
                                      disabled={
                                        formik.values.feeHeads.length <= 1 || removalBlocked
                                      }
                                      aria-label={`Remove ${fh.name.trim() || `fee head ${idx + 1}`}`}
                                      onClick={() => handleRemoveClick(idx)}
                                    >
                                      <Iconify icon={GlobalIcons.delete} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                    {typeof formik.errors.feeHeads === 'string' && formik.touched.feeHeads && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {formik.errors.feeHeads}
                      </Typography>
                    )}
                  </Paper>
                </Stack>
              </Box>
            </Scrollbar>
          )}

          <Box
            sx={{
              px: 2,
              py: 1.75,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
              size="small"
              disabled={isSaving}
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
              variant="contained"
              size="small"
              onClick={handleSubmit}
              loading={isSaving}
              disabled={isLoadingDetails}
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </Box>
        </Box>
      </Drawer>

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
          <Button
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            onClick={handleConfirmRemove}
          >
            Remove
          </Button>
        }
      />
    </BackPopUpChecked>
  );
};

export default FeeCategoryForm;
