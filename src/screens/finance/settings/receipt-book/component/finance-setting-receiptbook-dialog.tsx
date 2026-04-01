import type { RootState } from 'src/redux/store';
import type { Board, Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddReceiptBookMutation,
  useUpdateReceiptBookMutation,
} from 'src/redux/finance/receiptBookApi';
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { receiptBookValidationSchema } from '../validationSchema';

import type { IProps, IReceiptBook } from '../receipt-book-interface';

const FinanceSettingReceiptbookDialog: React.FC<IProps> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();
  // POST mutation for creating
  const [addReceiptBook, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddReceiptBookMutation,
  });

  // PUT mutation for updating
  const [updateReceiptBook, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateReceiptBookMutation,
  });

  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // Memoized initial values for the form based on whether editing existing or creating new
  const initialValues = useMemo<IReceiptBook>(
    () => ({
      boardId: isEdit ? (data?.boardId ?? '') : '',
      mediumId: isEdit ? (data?.mediumId ?? '') : '',
      mediumStageId: isEdit ? (data?.mediumStageId ?? '') : '',
      name: isEdit ? (data?.name ?? '') : '',
      prefix: isEdit ? (data?.prefix ?? '') : '',
      suffix: isEdit ? (data?.suffix ?? '') : '',
      startingNumber: isEdit ? (data?.startingNumber ?? 0) : '',
      endingNumber: isEdit ? (data?.endingNumber ?? 0) : '',
      description: isEdit ? (data?.description ?? '') : '',
      isActive: isEdit ? (data?.isActive ?? false) : false,
    }),
    [data, isEdit]
  );

  // Formik hook for form handling with validation and submission logic
  const formik = useFormik<IReceiptBook>({
    initialValues,
    validationSchema: receiptBookValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Transform form data to API format
        const payload = {
          boardId: values.boardId,
          mediumId: values.mediumId,
          mediumStageId: values.mediumStageId,
          name: values.name,
          prefix: values.prefix || '',
          suffix: values.suffix || '',
          startingNumber: Number(values.startingNumber) || 0,
          endingNumber: Number(values.endingNumber) || 0,
          description: values.description || '',
        };

        if (isEdit && data?.id) {
          // Update existing receipt book
          await updateReceiptBook({
            id: data.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Receipt Book updated successfully`,
          });
        } else {
          // Create new receipt book
          await addReceiptBook({ academicYearId: currentYear?.id, body: payload }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Receipt Book added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${isEdit ? 'update' : 'create'} receipt book`,
        });
      }
    },
  });

  useEffect(() => {
    setBoards(currentYear?.boards || []);
    setMediums(
      currentYear?.boards?.find((board: Board) => board.id === formik.values.boardId)
        ?.educationMediums || []
    );
    setAllOrganization(
      currentYear?.boards
        ?.find((board: Board) => board.id === formik.values.boardId)
        ?.educationMediums?.find((medium: Medium) => medium.id === formik.values.mediumId)
        ?.educationMediumStages || []
    );
  }, [currentYear?.boards, formik.values.boardId, formik.values.mediumId]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            {(() => {
              const boardName =
                boards?.find((b: any) => b.id === formik.values.boardId)?.name || '';
              const mediumName = mediums?.find((m) => m.id === formik.values.mediumId)?.name || '';
              const orgName =
                allOrganization?.find((o) => o.id === formik.values.mediumStageId)?.name || '';
              const prefix = formik.values.prefix || '';
              const startNum = formik.values.startingNumber || '';
              const endNum = formik.values.endingNumber || '';
              const suffix = formik.values.suffix || '';
              const startFormatted = `${prefix}${startNum}${suffix}`;
              const endFormatted = `${prefix}${endNum}${suffix}`;
              const segments: { label: string; icon: string }[] = [
                boardName && { label: boardName, icon: 'solar:diploma-linear' },
                mediumName && { label: mediumName, icon: 'solar:translation-linear' },
                orgName && { label: orgName, icon: 'solar:buildings-2-linear' },
              ].filter(Boolean) as { label: string; icon: string }[];
              const hasAnyData = segments.length > 0 || startFormatted;

              return (
                <Card
                  sx={{
                    p: 0,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    boxShadow: `0 2px 12px 0 ${alpha(theme.palette.primary.main, 0.06)}`,
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.12)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 1,
                      py: 1,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify
                          icon="solar:document-linear"
                          sx={{ color: 'primary.main', width: 18, height: 18 }}
                        />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: 0.2 }}
                      >
                        Receipt Number Preview
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Body */}
                  <Box sx={{ p: 1.5 }}>
                    {!hasAnyData ? (
                      <Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
                        <Iconify
                          icon="solar:document-add-line-duotone"
                          sx={{ width: 36, height: 36, color: 'text.disabled' }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                          Fill in the fields below to preview your receipt number
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        {/* Category labels */}
                        {segments.length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {segments.map((segment, index) => (
                              <Label
                                key={index}
                                color="primary"
                                variant="soft"
                                startIcon={<Iconify icon={segment.icon} />}
                                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                {segment.label}
                              </Label>
                            ))}
                          </Stack>
                        )}

                        {/* Range display */}
                        {startFormatted && (
                          <>
                            {segments.length > 0 && (
                              <Divider
                                sx={{
                                  borderStyle: 'dashed',
                                  borderColor: alpha(theme.palette.grey[500], 0.2),
                                }}
                              />
                            )}
                            <Stack direction="row" alignItems="center" spacing={0}>
                              {/* Start block */}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    mb: 0.75,
                                    display: 'block',
                                  }}
                                >
                                  Starting Receipt
                                </Typography>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.grey[500], 0.06),
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontFamily:
                                        '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                                      fontWeight: 700,
                                      letterSpacing: 1,
                                      color: 'text.primary',
                                    }}
                                  >
                                    {startFormatted || '---'}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Connector */}
                              {endNum && (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mx: 1.5,
                                    mt: 2.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: '2px',
                                        bgcolor: alpha(theme.palette.primary.main, 0.3),
                                        borderRadius: 1,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                      }}
                                    >
                                      <Iconify
                                        icon="solar:arrow-right-bold"
                                        sx={{ width: 14, height: 14, color: 'primary.main' }}
                                      />
                                    </Box>
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: '2px',
                                        bgcolor: alpha(theme.palette.primary.main, 0.3),
                                        borderRadius: 1,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              )}

                              {/* End block */}
                              {endNum && (
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontWeight: 600,
                                      fontSize: '0.65rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: 1,
                                      mb: 0.75,
                                      display: 'block',
                                    }}
                                  >
                                    Ending Receipt
                                  </Typography>
                                  <Box
                                    sx={{
                                      px: 1.5,
                                      py: 1,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                                      border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                                      transition: 'all 0.25s ease',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontFamily:
                                          '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                                        fontWeight: 700,
                                        letterSpacing: 1,
                                        color: 'primary.dark',
                                      }}
                                    >
                                      {endFormatted}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Stack>
                          </>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Card>
              );
            })()}
          </Grid>

          {/* Board Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'boardId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    label="Board *"
                    options={boards || []}
                    labelKey="name"
                    valueKey="id"
                    value={formik.values.boardId}
                    onChange={(value) => {
                      formik.setFieldValue('boardId', value as string);
                      formik.setFieldTouched('boardId', false);
                      const selectedBoard = boards.find((b) => b.id === value);
                      setMediums(selectedBoard?.educationMediums || []);
                      formik.setFieldValue('mediumId', '');
                      formik.setFieldValue('mediumStageId', '');
                    }}
                    formControlProps={{ sx: { maxWidth: '100%', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Medium Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'mediumId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    label="Medium *"
                    options={mediums || []}
                    labelKey="name"
                    disabled={!formik.values.boardId}
                    valueKey="id"
                    value={formik.values.mediumId}
                    onChange={(value) => {
                      formik.setFieldValue('mediumId', value as string);
                      formik.setFieldTouched('mediumId', false);
                      const selectedMedium = mediums.find((m) => m.id === value);
                      setAllOrganization(selectedMedium?.educationMediumStages || []);
                      formik.setFieldValue('organization', '');
                    }}
                    formControlProps={{ sx: { maxWidth: '100%', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Organization Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'mediumStageId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.mediumStageId}
                    disabled={!formik.values.mediumId}
                    onChange={(val) => {
                      formik.setFieldValue('mediumStageId', val as any);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: '100%', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Receipt Book Name Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'name';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText =
                formik.touched[field] && formik.errors[field]
                  ? formik.errors[field]
                  : `${formik.values[field].length}/40 Maximum characters allowed`;
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Receipt Book Name *"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                    inputProps={{ maxLength: 40 }}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Prefix Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'prefix';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Prefix"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9/-]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Suffix Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'suffix';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Suffix"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9/-]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Starting Number Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'startingNumber';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name={field}
                    label="Starting Number"
                    value={formik.values[field]}
                    onChange={(e) => {
                      formik.setFieldValue(field, e.target.value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Ending Number Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'endingNumber';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name={field}
                    label="Ending Number"
                    value={formik.values[field]}
                    onChange={(e) => {
                      formik.setFieldValue(field, e.target.value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Description Field */}
          <Grid size={{ xs: 12, sm: 12 }}>
            {(() => {
              const field = 'description';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={3}
                    name={field}
                    label="Description"
                    value={formik.values[field]}
                    onChange={(e) => formik.setFieldValue(field, e.target.value)}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={data ? GlobalIcons.edit : GlobalIcons.submit}
              width={data ? 16 : 20}
              height={data ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          variant="contained"
          size="small"
          loading={isAddLoading || isUpdateLoading}
        >
          {data ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FinanceSettingReceiptbookDialog;
