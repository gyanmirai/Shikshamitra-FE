'use client';

import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { keyframes } from '@mui/system';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Tooltip,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import type { SeatingPlanSubject, SeatingPlanScope } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  availableSubjects: SeatingPlanSubject[];
  subjectWiseSubjectOwners: Map<string, SeatingPlanScope>;
  allSubjectPlanWithAllocations?: SeatingPlanScope;
  isSaving?: boolean;
  onSubmit: (values: { planName: string; subjectIds: string[] }) => Promise<void>;
  initialPlanName?: string;
  initialSubjectIds?: string[];
}

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
`;

const validationSchema = Yup.object().shape({
  planName: Yup.string().trim().required('Plan name is required'),
  subjectIds: Yup.array()
    .of(Yup.string())
    .min(1, 'Please select at least one subject for this seating plan'),
});

export default function CreateSeatingPlanDialog({
  open,
  onClose,
  availableSubjects = [],
  subjectWiseSubjectOwners,
  allSubjectPlanWithAllocations,
  isSaving = false,
  onSubmit,
  initialPlanName = '',
  initialSubjectIds = [],
}: Props) {
  const theme = useTheme();

  // Find unowned subjects that can be selected
  const selectableSubjects = useMemo(
    () =>
      availableSubjects.filter(
        (subject) => !subjectWiseSubjectOwners.has(subject.examSubjectId)
      ),
    [availableSubjects, subjectWiseSubjectOwners]
  );

  const initialValues = useMemo(() => {
    // Default to unowned subjects if none provided
    const defaultSubjectIds =
      initialSubjectIds.length > 0
        ? initialSubjectIds
        : selectableSubjects.map((s) => s.examSubjectId);

    return {
      planName: initialPlanName,
      subjectIds: defaultSubjectIds,
    };
  }, [initialPlanName, initialSubjectIds, selectableSubjects]);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit(values);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        isSubmitting,
      }) => {
        const selectedCount = values.subjectIds.length;
        const totalAvailableCount = availableSubjects.length;
        const allAvailableSelected =
          selectableSubjects.length > 0 &&
          selectableSubjects.every((s) => values.subjectIds.includes(s.examSubjectId));

        // Get names of selected subjects for suggestion chips and preview
        const selectedSubjectNames = availableSubjects
          .filter((s) => values.subjectIds.includes(s.examSubjectId))
          .map((s) => s.subjectName);

        // Smart name suggestions based on selection
        const nameSuggestions = useMemo(() => {
          if (selectedSubjectNames.length === 0) return [];
          const combined = selectedSubjectNames.slice(0, 2).join(' & ');
          const extra = selectedSubjectNames.length > 2 ? ' Group' : '';
          return [
            `${combined}${extra}`,
            `${combined} Session`,
            `${combined} Seating`,
            'Morning Session',
          ];
        }, [selectedSubjectNames]);

        const hasOwnedConflict = values.subjectIds.some((id) =>
          subjectWiseSubjectOwners.has(id)
        );

        const handleSelectAll = () => {
          const allSelectableIds = selectableSubjects.map((s) => s.examSubjectId);
          setFieldValue('subjectIds', allSelectableIds);
          setFieldTouched('subjectIds', true);
        };

        const handleClearAll = () => {
          setFieldValue('subjectIds', []);
          setFieldTouched('subjectIds', true);
        };

        const handleToggleSubject = (subjectId: string, isOwned: boolean) => {
          if (isOwned) return;
          const next = values.subjectIds.includes(subjectId)
            ? values.subjectIds.filter((id) => id !== subjectId)
            : [...values.subjectIds, subjectId];
          setFieldValue('subjectIds', next);
          setFieldTouched('subjectIds', true);
        };

        const scopeTypeLabel = useMemo(() => {
          if (selectedCount === 0) return 'No Subjects Selected';
          if (selectedCount === totalAvailableCount) return 'All-Subjects Plan (Full Exam)';
          if (selectedCount === 1) return 'Single-Subject Plan';
          return `Multi-Subject Plan (${selectedCount} Subjects)`;
        }, [selectedCount, totalAvailableCount]);

        return (
          <CustomDialog
            open={open}
            handleClose={onClose}
            disableClose={isSaving || isSubmitting}
            title={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:chair-bold-duotone" width={24} height={24} />
                </Box>
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={700} component="span">
                      Create Seating Plan
                    </Typography>
                    <CustomTooltip
                      arrow
                      placement="right"
                      title="Group subjects together to customize classroom allocations and seating layouts independently."
                    >
                      <Iconify
                        icon={GlobalIcons.info}
                        sx={{ cursor: 'pointer', color: 'info.main' }}
                        width={16}
                        height={16}
                      />
                    </CustomTooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Group subjects to manage dedicated room and seating allocations
                  </Typography>
                </Stack>
              </Stack>
            }
            maxWidth="md"
            hasForm={false}
          >
            <Form onSubmit={handleSubmit}>
              <DialogScrollContent>
                <Stack spacing={2.5}>
                  {/* Context Guidance Callout */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.25,
                      bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.06),
                      borderColor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.2),
                    }}
                  >
                    <Iconify
                      icon="solar:info-circle-bold"
                      width={20}
                      height={20}
                      sx={{ color: 'info.main', mt: 0.2, flexShrink: 0 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="info.darker">
                        Custom Seating Scope
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Select the subjects that share this seating arrangement. A separate room and
                        desk layout will be saved for this plan.
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Warning for Existing Allocations */}
                  {allSubjectPlanWithAllocations && (
                    <Alert severity="warning" variant="outlined" sx={{ borderRadius: 1.5 }}>
                      The <strong>All-Subjects</strong> plan already has student allocations. Creating
                      this subject group allows you to configure independent seating rules and room
                      layouts for the selected subjects.
                    </Alert>
                  )}

                  {/* Error if owned subject was selected */}
                  {hasOwnedConflict && (
                    <Alert severity="error" variant="outlined" sx={{ borderRadius: 1.5 }}>
                      One or more selected subjects already belong to another subject-wise plan.
                      Please remove them before proceeding.
                    </Alert>
                  )}

                  {/* Plan Name Section */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.background.neutralChannel, 0.35),
                      borderColor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.16),
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Plan Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Give this arrangement a clear identifier
                        </Typography>
                      </Box>

                      <TextField
                        name="planName"
                        value={values.planName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Science & English Morning Session"
                        fullWidth
                        size="small"
                        error={touched.planName && Boolean(errors.planName)}
                        helperText={touched.planName && errors.planName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="solar:pen-bold-duotone" width={18} sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          animation:
                            touched.planName && errors.planName
                              ? `${shakeAnimation} 0.4s ease-in-out`
                              : 'none',
                        }}
                      />

                      {/* Name Suggestion Chips */}
                      {nameSuggestions.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', pt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Quick suggestions:
                          </Typography>
                          {nameSuggestions.map((suggestion) => (
                            <Chip
                              key={suggestion}
                              label={suggestion}
                              size="small"
                              variant={values.planName === suggestion ? 'filled' : 'outlined'}
                              color={values.planName === suggestion ? 'primary' : 'default'}
                              onClick={() => {
                                setFieldValue('planName', suggestion);
                                setFieldTouched('planName', true);
                              }}
                              icon={<Iconify icon="solar:magic-stick-3-bold-duotone" width={14} />}
                              sx={{
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                  borderColor: 'primary.main',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </Paper>

                  {/* Subject Selection Section */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      borderColor:
                        touched.subjectIds && errors.subjectIds
                          ? theme.palette.error.main
                          : varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
                      bgcolor: (t) => varAlpha(t.vars.palette.background.neutralChannel, 0.35),
                    }}
                  >
                    <Stack spacing={1.5}>
                      {/* Section Header with Controls */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700}>
                            Select Subjects <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                          </Typography>
                          <Label
                            color={selectedCount > 0 ? 'primary' : 'default'}
                            variant="soft"
                          >
                            {selectedCount} of {totalAvailableCount} selected
                          </Label>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="text"
                            disabled={allAvailableSelected || selectableSubjects.length === 0}
                            startIcon={<Iconify icon="solar:check-read-bold-duotone" width={16} />}
                            onClick={handleSelectAll}
                            sx={{ fontSize: '0.8rem', py: 0.25 }}
                          >
                            Select All Available
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            disabled={selectedCount === 0}
                            startIcon={<Iconify icon="solar:trash-bin-trash-bold-duotone" width={16} />}
                            onClick={handleClearAll}
                            sx={{ fontSize: '0.8rem', py: 0.25, color: 'text.secondary' }}
                          >
                            Clear
                          </Button>
                        </Stack>
                      </Box>

                      {/* Subject Cards Grid */}
                      <Grid container spacing={1.5}>
                        {availableSubjects.map((subject) => {
                          const isSelected = values.subjectIds.includes(subject.examSubjectId);
                          const owner = subjectWiseSubjectOwners.get(subject.examSubjectId);
                          const isOwned = Boolean(owner);

                          return (
                            <Grid key={subject.examSubjectId} size={{ xs: 12, sm: 6 }}>
                              <Tooltip
                                title={
                                  isOwned
                                    ? `This subject is already included in "${owner?.name}". A subject can only belong to one subject-wise plan at a time.`
                                    : ''
                                }
                                arrow
                                disableHoverListener={!isOwned}
                              >
                                <Paper
                                  variant="outlined"
                                  onClick={() => handleToggleSubject(subject.examSubjectId, isOwned)}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: isOwned ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: isSelected
                                      ? (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.08)
                                      : isOwned
                                        ? (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.08)
                                        : 'background.paper',
                                    borderColor: isSelected
                                      ? 'primary.main'
                                      : isOwned
                                        ? (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.24)
                                        : 'divider',
                                    boxShadow: isSelected
                                      ? (t) => `0 4px 12px 0 ${alpha(t.palette.primary.main, 0.12)}`
                                      : 'none',
                                    opacity: isOwned ? 0.65 : 1,
                                    '&:hover': !isOwned
                                      ? {
                                        borderColor: 'primary.main',
                                        bgcolor: (t) =>
                                          isSelected
                                            ? varAlpha(t.vars.palette.primary.mainChannel, 0.12)
                                            : alpha(t.palette.primary.main, 0.04),
                                        transform: 'translateY(-1px)',
                                      }
                                      : {},
                                  }}
                                >
                                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={isOwned}
                                      size="small"
                                      sx={{ p: 0.5 }}
                                    />

                                    <Box
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isSelected
                                          ? 'primary.main'
                                          : (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
                                        color: isSelected ? 'common.white' : 'text.secondary',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Iconify icon="solar:book-bookmark-bold-duotone" width={18} height={18} />
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        variant="subtitle2"
                                        noWrap
                                        sx={{
                                          fontWeight: isSelected ? 700 : 600,
                                          color: isSelected ? 'primary.main' : 'text.primary',
                                        }}
                                      >
                                        {subject.subjectName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        Exam Subject
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  {isOwned ? (
                                    <Label
                                      color="warning"
                                      variant="soft"
                                      startIcon={<Iconify icon="solar:lock-bold" width={12} />}
                                      sx={{ flexShrink: 0, fontSize: '0.7rem' }}
                                    >
                                      In {owner?.name}
                                    </Label>
                                  ) : isSelected ? (
                                    <Label
                                      color="success"
                                      variant="soft"
                                      startIcon={<Iconify icon="solar:check-circle-bold" width={12} />}
                                      sx={{ flexShrink: 0, fontSize: '0.7rem' }}
                                    >
                                      Selected
                                    </Label>
                                  ) : null}
                                </Paper>
                              </Tooltip>
                            </Grid>
                          );
                        })}
                      </Grid>

                      {/* Error helper text if no subjects selected */}
                      {touched.subjectIds && errors.subjectIds && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            pt: 0.5,
                          }}
                        >
                          <Iconify icon="solar:danger-triangle-bold" width={14} />
                          {errors.subjectIds as string}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

                  {/* Summary Preview Footer */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.background.neutralChannel, 0.6),
                      borderColor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.16),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Scope Classification:
                      </Typography>
                      <Label
                        color={
                          selectedCount === totalAvailableCount
                            ? 'primary'
                            : selectedCount === 1
                              ? 'info'
                              : selectedCount > 1
                                ? 'secondary'
                                : 'default'
                        }
                        variant="soft"
                      >
                        {scopeTypeLabel}
                      </Label>
                    </Stack>

                    {selectedSubjectNames.length > 0 && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Included:
                        </Typography>
                        {selectedSubjectNames.slice(0, 3).map((name) => (
                          <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                        {selectedSubjectNames.length > 3 && (
                          <Chip
                            label={`+${selectedSubjectNames.length - 3} more`}
                            size="small"
                            variant="soft"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                    )}
                  </Paper>
                </Stack>
              </DialogScrollContent>

              <DialogActions
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  justifyContent: 'flex-end',
                  gap: 1,
                }}
              >
                <CancelButton
                  onClick={onClose}
                />
                <SubmitButton
                  buttonText="Create Seating Plan"
                  type="submit"
                  loading={isSaving || isSubmitting}
                  disabled={
                    isSaving ||
                    isSubmitting ||
                    hasOwnedConflict ||
                    values.subjectIds.length === 0 ||
                    !values.planName.trim()
                  }
                  startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
                />
              </DialogActions>
            </Form>
          </CustomDialog>
        );
      }}
    </Formik>
  );
}
