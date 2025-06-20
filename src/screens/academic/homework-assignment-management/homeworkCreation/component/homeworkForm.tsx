'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Create } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Paper,
  Button,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import HomeworkTypeForm from '../../setting/homeworkType/homeworkTypeForm';

import type { IHomeWorkCreationFormProps } from '../type';

const HomeworkForm: React.FC<IHomeWorkCreationFormProps> = ({
  classes,
  subject,
  dialog,
  editData,
  onClose,
}) => {
  // State to control homework type dialog visibility
  const homeworkTypeDialog = useBoolean();
  // Configuration for file upload component
  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // State to store all available divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store all available classes/standards from the education medium
  const [allClass, setAllClass] = useState<Standards[]>([]);
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
  // State to store available division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getHomeworkInitialValues(editData, classes),
    validationSchema: homeworkValidationSchema,
    onSubmit: (values) => {},
  });

  console.log('formik.values---', formik.values.attachments);

  const handleDrop = (acceptedFiles: File[]) => {
    formik.setFieldValue('attachments', [...(formik.values.attachments || []), ...acceptedFiles]);
  };

  const handleRemove = (fileToRemove: string | File) => {
    const updatedDocuments = (formik.values.attachments || []).filter((file) => {
      if (typeof fileToRemove === 'string') {
        return file.name !== fileToRemove;
      }
      return file !== fileToRemove;
    });
    formik.setFieldValue('attachments', updatedDocuments);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar
          sx={{
            px: 1,
            height: '100%',
          }}
        >
          {/* Basic Details Section */}
          <Box sx={{ mb: 3 }}>
            {/* Class Selection */}
            <Grid item xs={12}>
              <SectionCard title="Basic Details">
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.class && formik.errors.class) || false}
                  >
                    <CustomSelect
                      label="Class *" // Select class from dropdown
                      options={allClass}
                      value={formik.values.class || classes}
                      // disabled={!!classes}
                      labelKey="name"
                      valueKey="name"
                      onChange={(val) => {
                        formik.setFieldValue('class', val);
                      }}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!(formik.touched.class && formik.errors.class) || false}
                      helperText={(formik.touched.class && formik.errors.class) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Division Selection */}
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.divisions && formik.errors.divisions) || false}
                  >
                    <CustomSelect
                      label="Division *" // Select division from dropdown
                      labelKey="name"
                      valueKey="name"
                      multiple
                      options={allDivision}
                      value={formik.values.divisions.map((d) => d.divisionId)} // value = selected division IDs
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
                      }}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        typeof formik.errors.divisions === 'string'
                          ? formik.errors.divisions
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Subject Selection */}
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.subject && formik.errors.subject) || false}
                  >
                    <CustomSelect
                      label="Subject *" // Select subject from dropdown
                      disabled={!formik.values.divisions || formik.values.divisions.length === 0}
                      options={[
                        { value: 'Mathematics', label: 'Mathematics' },
                        { value: 'Science', label: 'Science' },
                        { value: 'History', label: 'History' },
                        { value: 'English', label: 'English' },
                      ]}
                      value={formik.values.subject}
                      onChange={(val) => formik.setFieldValue('subject', val)}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.subject && formik.errors.subject) || false}
                      helperText={(formik.touched.subject && formik.errors.subject) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter Selection */}
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.chapter && formik.errors.chapter) || false}
                  >
                    <Autocomplete
                      options={[
                        { id: 'n1', name: '1. Numbers and Number Systems' },
                        { id: 'a1', name: '2. Algebra' },
                        { id: 'g1', name: '3. Geometry' },
                        { id: 'm1', name: '4. Mensuration' },
                        { id: 'r1', name: '5. Ratio and Proportion' },
                        { id: 'p1', name: '6. Profit and Loss' },
                        { id: 'i1', name: '7. Interest' },
                        { id: 'f1', name: '8. Fractions and Decimals' },
                        { id: 'e1', name: '9. Equations' },
                        { id: 's1', name: '10. Sets' },
                        { id: 't1', name: '11. Time and Work' },
                        { id: 'd1', name: '12. Data Handling' },
                      ]}
                      disabled={!formik.values.subject}
                      value={
                        formik.values.chapter
                          ? { id: formik.values.chapter, name: formik.values.chapter }
                          : null
                      }
                      onChange={(event, newValue) => {
                        formik.setFieldValue('chapter', newValue?.name || '');
                      }}
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Chapter"
                          error={formik.touched.chapter && Boolean(formik.errors.chapter)}
                          helperText={(formik.touched.chapter && formik.errors.chapter) as string}
                          size="small"
                          fullWidth
                        />
                      )}
                    />

                    {/* <Autocomplete
                    multiple
                    disabled={!formik.values.subject}
                    options={[
                      { value: 'numbers', label: 'Numbers and Number Systems' },
                      { value: 'algebra', label: 'Algebra' },
                      { value: 'geometry', label: 'Geometry' },
                      { value: 'mensuration', label: 'Mensuration' },
                      { value: 'statistics', label: 'Statistics and Probability' },
                      { value: 'trigonometry', label: 'Trigonometry' },
                      { value: 'coordinate', label: 'Coordinate Geometry' },
                      { value: 'sets', label: 'Sets and Relations' },
                    ]}
                    disableCloseOnSelect
                    getOptionLabel={(option: { value: string; label: string }) => option.label}
                    value={
                      formik.values.chapters?.map((chapter) => ({
                        value: chapter,
                        label: chapter,
                      })) || []
                    }
                    onChange={(event, newValue: Array<{ value: string; label: string }>) => {
                      formik.setFieldValue(
                        'chapters',
                        newValue.map((item) => item.value)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.label}
                      </li>
                    )}
                    renderTags={(value: Array<{ value: string; label: string }>) => {
                      if (value.length === 0) return null;
                      const first = value[0].label;
                      const remainingCount = value.length - 1;
                      return [
                        <Chip
                          key={first}
                          label={first}
                          sx={{ ml: 1 }}
                          size="small"
                          variant="soft"
                        />,
                        remainingCount > 0 && (
                          <TeacherListPopover
                            key="more-count"
                            data={value.slice(1)}
                            count={remainingCount}
                          />
                        ),
                      ];
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chapter *" // Select chapter from dropdown
                        size="small"
                        error={!!(formik.touched.chapters && formik.errors.chapters)}
                        helperText={
                          Array.isArray(formik.errors.chapters)
                            ? formik.errors.chapters.join(', ')
                            : (formik.touched.chapters && formik.errors.chapters) || undefined
                        }
                      />
                    )}
                  /> */}
                  </ShakingTextField>
                </Grid>

                {/* Homework Title */}
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.title && formik.errors.title) || false}
                  >
                    <TextField
                      fullWidth
                      label="Homework Title *" // Enter homework title
                      // placeholder="Enter title for the homework"
                      name="title"
                      size="small"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Homework Type */}
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.homeworkType && formik.errors.homeworkType) || false}
                  >
                    <CustomSelect
                      label="Homework Type *" // Select homework type from dropdown
                      options={[
                        { value: 'practice', label: 'Practice Questions' },
                        { value: 'reading', label: 'Reading Material' },
                        { value: 'revision', label: 'Revision' },
                      ]}
                      value={formik.values.homeworkType || ''}
                      onChange={(val) => formik.setFieldValue('homeworkType', val)}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.homeworkType && formik.errors.homeworkType) || false}
                      helperText={(formik.touched.homeworkType && formik.errors.homeworkType) || ''}
                    />
                  </ShakingTextField>
                  <Box mt={1} display="flex" justifyContent="flex-end">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="primary.main"
                      fontSize={12}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => homeworkTypeDialog.onTrue()}
                    >
                      Add Homework Type
                    </Typography>
                  </Box>

                  <CustomDialog
                    open={homeworkTypeDialog.value}
                    handleClose={homeworkTypeDialog.onFalse}
                    title="Add Homework Type"
                  >
                    <HomeworkTypeForm
                      onClose={homeworkTypeDialog.onFalse}
                      editData={null}
                      open={homeworkTypeDialog}
                    />
                  </CustomDialog>
                </Grid>
              </SectionCard>
            </Grid>
          </Box>

          {/* Description */}
          <Grid item xs={12}>
            <SectionCard title="Description and Documents">
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <Editor
                    value={formik.values.description}
                    onChange={(value) => {
                      formik.setFieldValue('description', value);
                    }}
                    placeholder="Description" // Enter homework description
                    sx={{ width: '100%' }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <FileUploader
                  // @ts-ignore
                  value={formik.values.attachments}
                  multiple
                  onChange={(value) => {
                    // const reader = new FileReader();
                    formik.setFieldValue('attachments', value);
                    // reader.readAsDataURL(value as File);
                    // reader.readAsDataURL(value as File);
                    // reader.onload = () => {
                    //   const base64String = reader.result;
                    // };
                  }}
                  primaryText="Please Upload Your File"
                  secondaryText="Maximum file size is 5MB"
                />
              </Grid>
            </SectionCard>
          </Grid>

          {/* Schedule Homework Switch */}
          {formik.values.divisions.length > 0 && (
            <Grid item xs={12} mt={3}>
              <SectionCard title="Schedule Homework">
                {formik.values.divisions.map((div, idx) => (
                  <Grid container spacing={2} ml={0.1} key={div.divisionId}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>
                        Div : {div.divisionId}
                      </Typography>
                    </Grid>

                    {/* Publish Date */}
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                          !!formik.touched.divisions?.[idx]?.publishDate
                        }
                      >
                        <DateTimePicker
                          label="Publish Date *"
                          value={div.publishDate ? dayjs(div.publishDate) : null}
                          onChange={(val) =>
                            formik.setFieldValue(`divisions[${idx}].publishDate`, val)
                          }
                          minDateTime={dayjs()} // Prevent selecting dates before today
                          slotProps={{
                            popper: {
                              disablePortal: true, // <-- correct place
                            },
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                                !!formik.touched.divisions?.[idx]?.publishDate,
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

                    {/* Due Date */}
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                          !!formik.touched.divisions?.[idx]?.dueDate
                        }
                      >
                        <DateTimePicker
                          label="Due Date *"
                          value={div.dueDate ? dayjs(div.dueDate) : null}
                          onChange={(val) => formik.setFieldValue(`divisions[${idx}].dueDate`, val)}
                          minDateTime={dayjs()} // Prevent selecting dates before today
                          slotProps={{
                            popper: {
                              disablePortal: true, // <-- correct place
                            },
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                                !!formik.touched.divisions?.[idx]?.dueDate,
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

          {/* Submission Type Radio Group */}
          <Grid item xs={12} mt={3} mb={1}>
            <SectionCard title="Submission Type">
              <FormControl
                component="fieldset"
                error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                sx={{ p: 2 }}
              >
                <RadioGroup
                  row
                  name="submissionType"
                  value={formik.values.submissionType?.toString()} // Convert number to string for matching
                  onChange={(event) =>
                    formik.setFieldValue('submissionType', Number(event.target.value))
                  } // Convert back to number
                >
                  <FormControlLabel value="0" control={<Radio />} label="Online Text" />
                  <FormControlLabel value="1" control={<Radio />} label="File Upload" />
                  <FormControlLabel value="2" control={<Radio />} label="In-Person Submission" />
                </RadioGroup>
                {formik.touched.submissionType && formik.errors.submissionType && (
                  <Typography variant="caption" color="error">
                    {formik.errors.submissionType}
                  </Typography>
                )}
              </FormControl>
            </SectionCard>
          </Grid>
        </Scrollbar>
      </Box>

      {/* Action Buttons */}
      <DialogActions sx={{ flexShrink: 0, p: 2 }}>
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
          startIcon={editData ? <Create /> : <Iconify icon={GlobalIcons.submit} />}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default HomeworkForm;

export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Paper sx={{ p: 3 }} elevation={6}>
    <Typography variant="h6" sx={{ mb: 2 }} color="primary.main">
      {title}
    </Typography>
    <Grid container spacing={2}>
      {children}
    </Grid>
  </Paper>
);

export const TeacherListPopover = ({
  data,
  count,
}: {
  data: Record<string, string>[];
  count: number;
}) => (
  <CustomTooltip
    title={
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, maxWidth: 230, borderRadius: 1 }}>
        {data.map((value) => (
          <Chip key={value.value} variant="soft" label={value.label} sx={{ mb: 1 }} size="small" />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip label={`+${count}`} sx={{ ml: 0.5, cursor: 'pointer' }} size="small" variant="soft" />
  </CustomTooltip>
);
