'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { fileData } from 'src/components/file-thumbnail';
import { shikshaMitraToast } from 'src/components/toast';
import { SingleFilePreview } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  useAddChapterMutation,
  useUpdateChapterMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { getChapterInitialValues } from './initialValues';
import { getChapterValidationSchema } from './validationSchema';

import type { IChapterFormValues, IAddNewChapterProps } from './type';

// Component for adding or editing a chapter with form validation and file upload functionality
export const AddNewChapter: React.FC<IAddNewChapterProps> = ({
  onClose,
  onSubmit,
  isEdit = false,
  initialValues = null,
  className,
  subject,
  classId,
  subjectId,
  existingChapters = [],
}: IAddNewChapterProps) => {
  // State for managing uploaded documents and their metadata
  // const [documents, setDocuments] = useState<IDocument[]>(initialValues?.documents || []);
  // State for tracking files that have been uploaded but not yet processed
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();
  const [addChapter, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChapterMutation,
  });
  const [updateChapter, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChapterMutation,
  });
  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const formik = useFormik<IChapterFormValues>({
    initialValues: getChapterInitialValues(initialValues),
    validationSchema: getChapterValidationSchema(currentYear, existingChapters, initialValues?.id),
    onSubmit: async (values) => {
      try {
        if (!classId || !subjectId) {
          shikshaMitraToast.error({
            message: 'Class and Subject must be selected before saving a chapter.',
          });
          return;
        }

        const documents = (values.documents ?? []).filter(
          (doc): doc is string => typeof doc === 'string' && Boolean(doc)
        );

        // Shared formatted dates
        const formattedStartDate = dateConvertor(
          values?.startDate?.format(dateFormat) || '',
          false
        );
        const formattedEndDate = dateConvertor(values?.endDate?.format(dateFormat) || '', false);

        if (initialValues) {
          const updatePayload = {
            assignedSubjectId: subjectId,
            chapterNo: values.chapterNo,
            chapterName: values.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: values.description,
            documents,
          };

          await updateChapter({
            id: initialValues.id,
            body: updatePayload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} updated successfully`,
          });
        } else {
          const postPayload = {
            assignedSubjectId: subjectId,
            chapters: [
              {
                chapterNo: values.chapterNo,
                chapterName: values.chapterName.trim(),
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                description: values.description,
                documents,
              },
            ],
          };

          await addChapter({ standardId: classId, subjectId, body: postPayload }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        shikshaMitraToast.error({
          message: `Failed to save chapter: ${errorMessage}`,
        });
      }
    },
  });

  const handleFileUpload = async (files: (File | string)[]) => {
    const uploadedFiles: (string | File)[] = [];
    const formData = new FormData();
    formData.append('FileName', (files[0] as File)?.name);
    formData.append('File', files[0] as File);
    const response = await uploadCurriculumFile(formData).unwrap();
    uploadedFiles.push(response.data);

    formik.setFieldValue(`documents`, uploadedFiles);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            {/* ── Context Header ───────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: (t) => `rgba(${t.vars.palette.primary.mainChannel} / 0.06)`,
                border: (t) => `1px solid rgba(${t.vars.palette.primary.mainChannel} / 0.18)`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Iconify
                icon="mdi:book-education-outline"
                width={22}
                sx={{ color: 'primary.main', flexShrink: 0 }}
              />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Class
                </Typography>
                <Chip label={className} size="small" color="primary" variant="soft" />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Subject
                </Typography>
                <Chip label={subject} size="small" color="secondary" variant="soft" />
              </Stack>
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  size="small"
                  variant="soft"
                  color={initialValues ? 'warning' : 'success'}
                  label={initialValues ? 'Editing Chapter' : 'New Chapter'}
                />
              </Box>
            </Paper>

            {/* ── Section 1 : Chapter Info ─────────────────────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify icon="mdi:information-outline" width={18} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Chapter Info
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                {/* Chapter Number */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                  >
                    <TextField
                      fullWidth
                      label="Chapter Number *"
                      name="chapterNo"
                      type="number"
                      placeholder="e.g. 1"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:pound" width={15} sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      value={formik.values.chapterNo}
                      onChange={formik.handleChange}
                      size="small"
                      error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                      helperText={formik.touched.chapterNo && formik.errors.chapterNo}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter Name */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                  >
                    <TextField
                      fullWidth
                      label="Chapter Name *"
                      name="chapterName"
                      placeholder="e.g. Introduction to Algebra"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify
                              icon="mdi:book-open-variant"
                              width={15}
                              sx={{ color: 'text.disabled' }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      value={formik.values.chapterName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        formik.setFieldValue('chapterName', value);
                      }}
                      size="small"
                      error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                      helperText={formik.touched.chapterName && formik.errors.chapterName}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter Start Date */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                  >
                    <DatePicker
                      label="Chapter Start Date *"
                      format="DD/MM/YYYY"
                      value={formik.values.startDate}
                      disablePast
                      onChange={(newValue) => {
                        formik.setFieldValue('startDate', newValue);
                      }}
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          placeholder: 'DD/MM/YYYY',
                          error: !!(formik.touched.startDate && formik.errors.startDate) || false,
                          helperText: formik.touched.startDate && formik.errors.startDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter End Date */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                  >
                    <DatePicker
                      label="Chapter End Date *"
                      format="DD/MM/YYYY"
                      disablePast
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.endDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('endDate', newValue);
                      }}
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          placeholder: 'DD/MM/YYYY',
                          error: !!(formik.touched.endDate && formik.errors.endDate) || false,
                          helperText: formik.touched.endDate && formik.errors.endDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Section 2 : Content ──────────────────────────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify icon="mdi:text-box-outline" width={18} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Content
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Editor
                value={formik.values.description}
                onChange={(value) => {
                  formik.setFieldValue('description', value);
                }}
                placeholder="Describe what this chapter covers, key topics and learning outcomes…"
                sx={{
                  border: `1px solid ${theme.vars.palette.grey[500]}`,
                  borderRadius: 1,
                  '&:hover': { borderColor: theme.vars.palette.text.primary },
                  ...(!!formik.errors.description && {
                    borderColor: theme.palette.error.main,
                  }),
                  '&:focus-within': {
                    borderColor: theme.vars.palette.text.primary,
                    borderWidth: 2,
                  },
                }}
              />
            </Paper>

            {/* ── Section 3 : Attachments ──────────────────────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify icon="mdi:paperclip" width={18} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Attachments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  — PDFs, images, slides
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <CustomUpload
                multiple
                previewCount={6}
                onChange={(files) => {
                  handleFileUpload(files);
                }}
                value={formik.values.documents}
                label="Drag & drop files here, or click to browse"
                outputFormat="file"
              />
            </Paper>
          </Scrollbar>

          {/* ── Sticky Footer ────────────────────────────────────── */}
          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
              boxShadow: 'var(--shadows-10)',
              bgcolor: 'background.paper',
            }}
          >
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: 2 },
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
              loading={isUpdateLoading || isAddLoading}
              type="submit"
              size="small"
              variant="contained"
              sx={{
                minWidth: 120,
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              {initialValues ? 'Update Chapter' : 'Save Chapter'}
            </Button>
          </DialogActions>

          <CustomDialog
            open={previewDialog.value}
            handleClose={() => {
              setPreviewFile(null);
              previewDialog.onFalse();
            }}
            title={previewFile ? fileData(previewFile).name : ''}
            maxWidth="sm"
          >
            <Scrollbar sx={{ height: 600, maxHeight: '100%' }}>
              {previewFile && <SingleFilePreview file={previewFile} />}
            </Scrollbar>
          </CustomDialog>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};
