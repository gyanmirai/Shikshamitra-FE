import { getIn } from 'formik';
import React, { useState } from 'react';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Grid,
  Chip,
  Avatar,
  Checkbox,
  useTheme,
  Accordion,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  FormHelperText,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ITeacherOption, ISubjectCardProps } from './type';

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

  // State to control accordion expansion, initialized with subject's isSubjectOpen or false
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);

  const uploadProps = {
    multiple: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  };
  // Handler for updating subject fields
  // @param field - The field name to update
  // @param value - The new value to set
  const handleChange = (field: string, value: any) => {
    onSubjectChange(subject.id, field, value);
  };

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

  return (
    <Scrollbar sx={{ height: 'auto' }}>
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
          mb: 2, // optional margin between accordions
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" gap={2}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                mt: 0.5,
                backgroundColor: subject.subjectColor,
              }}
            />

            <Typography variant="subtitle1" fontWeight={600}>
              {subject.subjectName || 'CHEMISTRY'}
            </Typography>
            {subject.subjectCode && (
              <Chip label={`Code : ${subject.subjectCode}`} size="small" variant="outlined" />
            )}
            {subject.primaryTeacher && (
              <Chip
                label={`Primary Teacher : ${subject.primaryTeacher}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Subject Code */}
            <Grid item xs={12} md={4}>
              <ShakingTextField error={!!getError('subjectCode')}>
                <TextField
                  fullWidth
                  label="Subject Code *"
                  // placeholder="Enter Subject Code"
                  size="small"
                  value={subject.subjectCode || ''}
                  onChange={(e) => handleChange('subjectCode', e.target.value)}
                  disabled={isPublished}
                  error={!!getError('subjectCode')}
                  helperText={getError('subjectCode')}
                />
              </ShakingTextField>
            </Grid>
            {/* Primary Teacher */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!getError('primaryTeacher')}>
                <Autocomplete
                  options={teacherOptions.filter(
                    (teacher: ITeacherOption) => !subject.secondaryTeacher?.includes(teacher.value)
                  )}
                  getOptionLabel={(option: ITeacherOption) => option.label}
                  value={teacherOptions.find(
                    (opt: ITeacherOption) => opt.value === subject.primaryTeacher
                  )}
                  onChange={(event, newValue: ITeacherOption | null) =>
                    handleChange('primaryTeacher', newValue?.label || '')
                  }
                  disabled={isPublished}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderOption={(props, option) => <li {...props}>{option.label}</li>}
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
                      label="Select Primary Teacher"
                      size="small"
                      error={!!getError('primaryTeacher')}
                      helperText={getError('primaryTeacher')}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            {/* Secondary Teacher */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!getError('secondaryTeacher')}>
                <Autocomplete
                  multiple
                  options={teacherOptions.filter(
                    (teacher: ITeacherOption) => teacher.value !== subject.primaryTeacher
                  )}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.label}
                  value={teacherOptions.filter((opt: ITeacherOption) =>
                    (subject.secondaryTeacher || []).includes(opt.value)
                  )}
                  onChange={(event, newValue) =>
                    handleChange(
                      'secondaryTeacher',
                      newValue.map((item) => item.value)
                    )
                  }
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
                  renderTags={(value) => {
                    if (value.length === 0) return null;
                    const first = value[0];
                    const remainingCount = value.length - 1;
                    return [
                      <Chip
                        key={first.value}
                        avatar={<Avatar>{first.label.charAt(0)}</Avatar>}
                        label={first.label}
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
                      label="Select Secondary Teacher"
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
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!getError('learningGoal')}>
                <Editor
                  onChange={(value) => handleChange('learningGoal', value)}
                  value={subject.learningGoal || ''}
                  placeholder="Enter Learning Goal"
                  error={!!getError('learningGoal')}
                  helperText={getError('learningGoal')}
                  sx={{ height: '200px' }}
                />
              </ShakingTextField>
            </Grid>
            {/* Prerequisites */}
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!getError('prerequisites')}>
                <Editor
                  onChange={(value) => handleChange('prerequisites', value)}
                  value={subject.prerequisites || ''}
                  placeholder="Enter Prerequisites"
                  error={!!getError('prerequisites')}
                  helperText={getError('prerequisites')}
                  sx={{ height: '200px' }}
                />
              </ShakingTextField>
            </Grid>
            {/* Description */}
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!getError('description')}>
                <TextField
                  fullWidth
                  multiline
                  rows={9.3}
                  label="Description"
                  // placeholder="Enter Description"
                  size="small"
                  value={subject.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isPublished}
                  error={!!getError('description')}
                  helperText={getError('description')}
                />
              </ShakingTextField>
            </Grid>
            {/* Upload Document */}
            <Grid item xs={12} md={6}>
              <Upload
                {...uploadProps}
                multiple
                value={subject.documents}
                onDrop={handleDrop}
                onRemove={handleRemove}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Scrollbar>
  );
};

export default SubjectCard;

// TeacherListPopover Component
export const TeacherListPopover = ({
  teachers,
  count,
}: {
  teachers: ITeacherOption[];
  count: number;
}) => (
  <CustomTooltip
    title={
      <Box sx={{ p: 1, maxWidth: 180, borderRadius: 1 }}>
        {teachers.map((teacher) => (
          <Chip
            key={teacher.value}
            variant="soft"
            avatar={<Avatar sx={{ width: 24, height: 24 }}>{teacher.label.charAt(0)}</Avatar>}
            label={teacher.label}
            sx={{ mb: 1 }}
            size="small"
          />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip label={`+${count}`} sx={{ ml: 0.5, cursor: 'pointer' }} size="small" variant="soft" />
  </CustomTooltip>
);
