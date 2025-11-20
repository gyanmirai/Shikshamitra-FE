'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';

import type { IAssignmentFormProps } from '../type';

export const allStudentIds = [
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'st6',
  'st7',
  'st8',
  'st9',
  'st10',
  'st11',
  'st12',
  'st13',
  'st14',
  'st15',
  'st16',
  'st17',
  'st18',
  'st19',
  'st20',
  'st21',
  'st22',
  'st23',
  'st24',
  'st25',
];

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ classes, dialog, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
  }, [classes, medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
  }, [allClass, classes]);

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getAssignmentInitialValues(editData, classes),
    validationSchema: assignmentValidationSchema(currentYear),
    onSubmit: (values) => {
      onClose(null, true);
      shikshaMitraToast.success({
        message: `Assignment Added successfully for ${values.subjects}!`,
      });
      // Submit logic would go here
    },
  });

  // const handleDrop = (acceptedFiles: File[]) => {
  //   formik.setFieldValue('attachments', [...(formik.values.attachments || []), ...acceptedFiles]);
  // };

  // const handleRemove = (fileToRemove: string | File) => {
  //   const updatedDocuments = (formik.values.attachments || []).filter((file) => {
  //     if (typeof fileToRemove === 'string') {
  //       return file.name !== fileToRemove;
  //     }
  //     return file !== fileToRemove;
  //   });
  //   formik.setFieldValue('attachments', updatedDocuments);
  // };

  // Configuration for file upload component
  // const uploadProps = {
  //   multiple: true,
  //   accept: { 'application/pdf': [] },
  // };

  // Handler to remove a single file attachment
  // const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
  //   setFieldValue('rubric', '');
  // }, []);

  // Handler to remove all file attachments
  // const handleRemoveAllFiles = useCallback((setFieldValue: (field: string, value: any) => void) => {
  //   setFieldValue('rubric', '');
  // }, []);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar sx={{ px: 1, height: '100%' }}>
          {/* Basic Details Section */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Basic Details">
              {/* Class */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                  <CustomSelect
                    label="Class *"
                    options={allClass}
                    value={formik.values.class || classes}
                    labelKey="name"
                    valueKey="name"
                    onChange={(val) => formik.setFieldValue('class', val)}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={!!(formik.touched.class && formik.errors.class)}
                    helperText={(formik.touched.class && formik.errors.class) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                  <CustomSelect
                    label="Division *"
                    multiple
                    options={allDivision}
                    value={formik.values.divisions.map((d) => d.divisionId)}
                    onChange={(val) => {
                      const selectedDivs = val as string[];
                      const existingDivs = formik.values.divisions || [];
                      const newDivisions = selectedDivs.map((divId) => {
                        const existing = existingDivs.find((d) => d.divisionId === divId);
                        return (
                          existing || {
                            divisionId: divId,
                            createdAt: dayjs(),
                            publishDate: null,
                            dueDate: null,
                          }
                        );
                      });
                      formik.setFieldValue('divisions', newDivisions);
                      formik.setFieldValue('students', selectedDivs.length ? allStudentIds : []);
                    }}
                    labelKey="name"
                    valueKey="name"
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={!!(formik.touched.divisions && formik.errors.divisions)}
                    helperText={
                      formik.touched.divisions &&
                      (typeof formik.errors.divisions === 'string'
                        ? formik.errors.divisions
                        : formik.errors.divisions?.some(
                              (divErr: any) =>
                                typeof divErr === 'object' &&
                                (divErr?.publishDate || divErr?.dueDate)
                            )
                          ? 'Select schedule dates also'
                          : undefined)
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Subject */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                  <CustomSelect
                    label="Subject *"
                    disabled={!formik.values.divisions.length}
                    options={[
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Science', label: 'Science' },
                      { value: 'History', label: 'History' },
                      { value: 'English', label: 'English' },
                    ]}
                    value={formik.values.subjects}
                    onChange={(val) => formik.setFieldValue('subjects', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.subjects && formik.errors.subjects)}
                    helperText={(formik.touched.subjects && formik.errors.subjects) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Assignment Title */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                  <TextField
                    fullWidth
                    label="Assignment Title *"
                    name="title"
                    size="small"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </ShakingTextField>
              </Grid>

              {/* Continue other fields (Assignment Type, Total Marks, Students) similarly using size={{ xs: ..., md: ... }} */}
            </SectionCard>
          </Grid>

          {/* Description Section */}
          <SectionCard title="Description and Document">
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  placeholder="Description"
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FileUploader
                value={formik.values.attachments}
                multiple
                showVisibleDocumentCount={1}
                onChange={(value) => formik.setFieldValue('attachments', value)}
                primaryText="Please Upload Your File"
                secondaryText="Maximum file size is 5MB"
              />
            </Grid>
          </SectionCard>

          {/* Schedule Assignment */}
          {formik.values.divisions.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Schedule Assignment">
                {formik.values.divisions.map((div, idx) => (
                  <Grid container spacing={3} key={div.divisionId} ml={0.4}>
                    <Grid size={{ xs: 12 }} mt={2}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: -1, lineHeight: 1.2 }}>
                        Div : {div.divisionId}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={
                          !!(
                            typeof formik.errors.divisions?.[idx] === 'object' &&
                            (formik.errors.divisions?.[idx] as any)?.publishDate &&
                            formik.touched.divisions?.[idx]?.publishDate
                          )
                        }
                      >
                        <DateTimePicker
                          label="Publish Date *"
                          value={div.publishDate}
                          onChange={(val) =>
                            formik.setFieldValue(`divisions[${idx}].publishDate`, val)
                          }
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          // minDateTime={dayjs()}
                          format="DD/MM/YYYY hh:mm"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: !!(
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                formik.errors.divisions?.[idx]?.publishDate &&
                                formik.touched.divisions?.[idx]?.publishDate
                              ),
                              helperText:
                                formik.touched.divisions?.[idx]?.publishDate &&
                                typeof formik.errors.divisions?.[idx] === 'object'
                                  ? (formik.errors.divisions?.[idx] as any)?.publishDate
                                  : '',
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={
                          !!(
                            typeof formik.errors.divisions?.[idx] === 'object' &&
                            formik.errors.divisions?.[idx]?.dueDate &&
                            formik.touched.divisions?.[idx]?.dueDate
                          )
                        }
                      >
                        <DateTimePicker
                          label="Due Date *"
                          value={div.dueDate}
                          onChange={(val) => formik.setFieldValue(`divisions[${idx}].dueDate`, val)}
                          disabled={!div.publishDate}
                          format="DD/MM/YYYY hh:mm"
                          // minDateTime={dayjs()}
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: !!(
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                formik.errors.divisions?.[idx]?.dueDate &&
                                formik.touched.divisions?.[idx]?.dueDate
                              ),
                              helperText:
                                formik.touched.divisions?.[idx]?.dueDate &&
                                typeof formik.errors.divisions?.[idx] === 'object'
                                  ? (formik.errors.divisions?.[idx] as any)?.dueDate
                                  : '',
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>
                ))}
              </SectionCard>
            </Grid>
          )}
        </Scrollbar>
      </Box>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            // formik.setFieldValue('status', 1);
            formik.handleSubmit();
          }}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
