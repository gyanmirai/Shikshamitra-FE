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
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
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
    validationSchema: getChapterValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const payload = {
          assignedSubjectId: subjectId,
          chapterNumber: values.chapterNo,
          chapterName: values.chapterName,
          chapterStartTime: dateConvertor(values.startDate.format(dateFormat), false),
          chapterEndTime: dateConvertor(values.endDate.format(dateFormat), false),
          description: values.description,
          documents:
            formik.values.documents?.map((doc: File | string) =>
              typeof doc === 'string' ? doc : doc
            ) || [],
        };

        if (initialValues) {
          // For update, include the chapter ID
          const updatePayload = {
            id: initialValues.id, // Assuming initialValues has an 'id' for the chapter
            body: payload,
          };
          await updateChapter(updatePayload).unwrap();
          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} : ${values.chapterName} has been updated successfully for ${subject} in Class ${className}`,
          });
        } else {
          await addChapter(payload).unwrap();
          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} : ${values.chapterName} has been successfully added to ${subject} for Class ${className}`,
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
            <Grid container spacing={3}>
              {/* Chapter Number Input */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" gap={2}>
                  <Typography variant="body2">
                    <strong>Class : </strong>
                    {className}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Subject : </strong>
                    {subject}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                >
                  <TextField
                    fullWidth
                    label="Chapter Number *"
                    name="chapterNo"
                    type="number"
                    inputProps={{ min: 0 }}
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

              {/* Chapter Name Input */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                >
                  <TextField
                    fullWidth
                    label="Chapter Name  *"
                    name="chapterName"
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

              {/* Start Time DatePicker */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                >
                  <DatePicker
                    label="Chapter Start Date *"
                    format="DD/MM/YYYY"
                    value={formik.values.startDate}
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
                        error: !!(formik.touched.startDate && formik.errors.startDate) || false,
                        helperText: formik.touched.startDate && formik.errors.startDate,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* End Time DatePicker */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                >
                  <DatePicker
                    label="Chapter End Date *"
                    format="DD/MM/YYYY"
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
                        error: !!(formik.touched.endDate && formik.errors.endDate) || false,
                        helperText: formik.touched.endDate && formik.errors.endDate,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Rich Text Editor for Chapter Content */}
              <Grid size={{ xs: 12 }} mb={-2}>
                <Typography variant="subtitle2">Description</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => {
                    formik.setFieldValue('description', value);
                  }}
                  placeholder="Description"
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
              </Grid>

              {/* Document Upload Section */}
              <Grid size={{ xs: 12 }}>
                <CustomUpload
                  multiple
                  previewCount={6}
                  onChange={(files) => {
                    handleFileUpload(files);
                  }}
                  value={formik.values.documents}
                  label="Upload Your Chapter Documents"
                  outputFormat="file"
                />
              </Grid>
            </Grid>
          </Scrollbar>

          {/* Form Actions */}

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
            >
              {initialValues ? 'Update' : 'Submit'}
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
