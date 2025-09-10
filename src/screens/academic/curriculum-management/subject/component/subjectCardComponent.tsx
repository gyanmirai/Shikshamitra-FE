import { getIn } from 'formik';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { fileData } from 'src/components/file-thumbnail';
import CustomTooltip from 'src/components/custom-tooltip';
import { SingleFilePreview } from 'src/components/upload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Grid,
  Chip,
  Avatar,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  FormHelperText,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { TeacherProfile, ISubjectCardProps } from './type';

const SubjectCard: React.FC<ISubjectCardProps> = ({
  formik,
  subject,
  isCore,
  isPublished,
  teacherOptions,
  onSubjectChange,
  index,
}: ISubjectCardProps) => {
  const theme = useTheme();
  console.log('subject---', subject);

  // State to control accordion expansion, initialized with subject's isSubjectOpen or false
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();

  const uploadProps = {
    multiple: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'video/*': [], // Added video file support
      'application/vnd.ms-powerpoint': [], // PPT
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [], // PPTX
      'application/msword': [], // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // DOCX
    },
  };
  // Handler for updating subject fields
  // @param field - The field name to update
  // @param value - The new value to set
  const handleChange = (field: string, value: any) => {
    onSubjectChange(subject.id, field, value);
  };

  useEffect(() => {
    setIsExpanded(subject.isSubjectOpen || false);
  }, [subject.id, subject.isSubjectOpen]);

  // Get validation error for a specific field
  // @param field - The field name to check for errors
  // @returns The error message if field is touched and has error, otherwise undefined
  const getError = (field: string) =>
    getIn(formik.touched, `subjects[${index}].${field}`) &&
    getIn(formik.errors, `subjects[${index}].${field}`);

  const handleDrop = (acceptedFiles: File[]) => {
    handleChange('documents', [...(subject.documents || []), ...acceptedFiles]);
  };

  const handleRemove = (fileToRemove: string | File) => {
    const updatedDocuments = (subject.documents || []).filter((file) => {
      if (typeof fileToRemove === 'string') {
        return file.name !== fileToRemove;
      }
      return file !== fileToRemove;
    });
    handleChange('documents', updatedDocuments);
  };

  const handleView = (file: File | string) => {
    setPreviewFile(file);
    previewDialog.onTrue();
  };

  return (
    <>
      <Accordion
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
        sx={{
          border: '1px solid #ccc',
          boxShadow: 'none', // optional, remove default shadow
          borderRadius: 1, // optional, round corners
          '&:before': {
            display: 'none', // remove default divider line at top
          },
          mb: '16px',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" gap={0.5}>
            {/* <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                mt: 0.5,
                backgroundColor: subject.subjectColor,
              }}
            /> */}
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectColorIndicator color={subject?.subjectColor} />

              <Typography variant="subtitle1" fontWeight={600} sx={{ mr: 1 }}>
                {subject.subjectName || 'CHEMISTRY'}
              </Typography>
            </Box>
            {!isExpanded && subject.subjectCode && (
              <Chip label={`Code : ${subject.subjectCode}`} size="small" variant="outlined" />
            )}
            {!isExpanded && subject.primaryTeacher?.name && (
              <Chip
                label={`Primary Teacher : ${subject.primaryTeacher?.name}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Subject Code */}
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!getError('subjectCode')}>
                <TextField
                  fullWidth
                  label="Subject Code *"
                  size="small"
                  value={subject.subjectCode || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const uppercaseValue = rawValue.toUpperCase().replace(/[^A-Z0-9\-_]/g, ''); // removes special chars except dash and underscore
                    formik.setFieldValue(`subjects.${index}.subjectCode`, uppercaseValue);
                  }}
                  disabled={isPublished}
                  error={!!getError('subjectCode')}
                  helperText={getError('subjectCode')}
                />
              </ShakingTextField>
            </Grid>

            {/* Primary Teacher */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!getError('primaryTeacher')}>
                <Autocomplete
                  options={
                    teacherOptions?.filter(
                      (option) =>
                        !subject.secondaryTeacher?.some(
                          (secondary: any) => secondary.id === option.id
                        )
                    ) || []
                  }
                  getOptionLabel={(option: any) => option.name || ''}
                  value={subject.primaryTeacher}
                  onChange={(event, newValue) =>
                    formik.setFieldValue(`subjects.${index}.primaryTeacher`, newValue)
                  }
                  disabled={isPublished}
                  renderOption={(props, option: any) => <li {...props}>{option.name || ''}</li>}
                  renderTags={(value: any) => {
                    if (!value) return null;
                    return (
                      <Chip
                        avatar={<Avatar>{value.label.charAt(0)}</Avatar>}
                        label={value.label}
                        onDelete={
                          isPublished ? undefined : () => handleChange('primaryTeacher', '')
                        }
                        sx={{ ml: 1 }}
                        size="small"
                      />
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Primary Teacher"
                      size="small"
                      error={!!getError('primaryTeacher')}
                      helperText={getError('primaryTeacher')}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Secondary Teacher */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!getError('secondaryTeacher')}>
                <Autocomplete
                  multiple
                  options={
                    teacherOptions?.filter((option) => subject.primaryTeacher?.id !== option.id) ||
                    []
                  }
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name || ''}
                  value={subject.secondaryTeacher || []}
                  onChange={(event, newValue) =>
                    formik.setFieldValue(`subjects.${index}.secondaryTeacher`, newValue)
                  }
                  isOptionEqualToValue={(option, value) => option.name === value.name}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </li>
                  )}
                  renderTags={(value) => {
                    if (value.length === 0) return null;
                    const first = value[0];
                    const remainingCount = value.length - 1;
                    return [
                      <Chip
                        key={first.name}
                        avatar={<Avatar>{first?.name?.charAt(0)}</Avatar>}
                        label={first.name}
                        sx={{ ml: 1 }}
                        size="small"
                        variant="soft"
                      />,
                      remainingCount > 0 && (
                        <TeacherListPopover
                          key="more-count"
                          teachers={value.slice(1)}
                          count={remainingCount}
                        />
                      ),
                    ];
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Secondary Teacher"
                      value={`${subject.secondaryTeacher?.length || 0} Teachers Selected`}
                      size="small"
                      error={!!getError('secondaryTeacher')}
                      helperText={getError('secondaryTeacher')}
                    />
                  )}
                />

                <FormHelperText>
                  {Array.isArray(getError('secondaryTeacher'))
                    ? getError('secondaryTeacher').join(', ')
                    : getError('secondaryTeacher')}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Learning Goal */}
            <Grid size={{ xs: 12 }} mb={-2}>
              <Typography variant="subtitle2">Learning Goal</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!getError('learningGoal')}>
                <Editor
                  onChange={(value) => handleChange('learningGoal', value)}
                  value={subject.learningGoal || ''}
                  placeholder="Learning Goal"
                  error={!!getError('learningGoal')}
                  helperText={getError('learningGoal')}
                  sx={{
                    border: `1px solid ${theme.vars.palette.grey[500]}`,
                    borderRadius: 1,
                    '&:hover': { borderColor: theme.vars.palette.text.primary },
                    '&:focus-within': {
                      borderColor: theme.vars.palette.text.primary,
                      borderWidth: 2,
                    },
                    ...(!!getError('learningGoal') && {
                      borderColor: theme.vars.palette.text.primary,
                    }),
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Prerequisites */}
            <Grid size={{ xs: 12 }} mb={-2}>
              <Typography variant="subtitle2">Prerequisites</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!getError('prerequisites')}>
                <Editor
                  onChange={(value) => handleChange('prerequisites', value)}
                  value={subject.prerequisites || ''}
                  placeholder="Prerequisites"
                  error={!!getError('prerequisites')}
                  helperText={getError('prerequisites')}
                  sx={{
                    border: `1px solid ${theme.vars.palette.grey[500]}`,
                    borderRadius: 1,
                    '&:hover': { borderColor: theme.vars.palette.text.primary },
                    '&:focus-within': {
                      borderColor: theme.vars.palette.text.primary,
                      borderWidth: 2,
                    },
                    ...(!!getError('prerequisites') && {
                      borderColor: theme.palette.error.main,
                    }),
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }} mb={-2}>
              <Typography variant="subtitle2">Description</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!getError('description')}>
                <Editor
                  onChange={(value) => handleChange('description', value)}
                  value={subject.description || ''}
                  placeholder="Description"
                  error={!!getError('description')}
                  helperText={getError('description')}
                  sx={{
                    border: `1px solid ${theme.vars.palette.grey[500]}`,
                    borderRadius: 1,
                    '&:hover': { borderColor: theme.vars.palette.text.primary },
                    '&:focus-within': {
                      borderColor: theme.vars.palette.text.primary,
                      borderWidth: 2,
                    },
                    ...(!!getError('description') && {
                      borderColor: theme.palette.error.main,
                    }),
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Upload Document */}
            <Grid size={{ xs: 12 }}>
              <CustomUpload
                multiple
                previewCount={6}
                onChange={(files) => formik.setFieldValue(`subjects.${index}.documents`, files)}
                value={subject.documents}
                label="Upload Your Subject Documents"
                outputFormat="file"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
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
    </>
  );
};

export default SubjectCard;

// TeacherListPopover Component
export const TeacherListPopover = ({
  teachers,
  count,
}: {
  teachers: TeacherProfile[];
  count: number;
}) => (
  <CustomTooltip
    sx={{ textAlign: 'justify' }}
    title={
      <Box sx={{ p: 1, maxWidth: 180, borderRadius: 1 }}>
        {teachers.map((teacher) => (
          <Chip
            key={teacher.name}
            variant="soft"
            avatar={<Avatar sx={{ width: 24, height: 24 }}>{teacher?.name?.charAt(0)}</Avatar>}
            label={teacher.name}
            sx={{ ml: 0.5, height: 24, fontSize: 12, mb: 1 }}
            size="small"
          />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip
      label={`+${count}`}
      sx={{ ml: 0.5, height: 24, fontSize: 12, cursor: 'pointer' }}
      size="small"
      variant="soft"
    />
  </CustomTooltip>
);
