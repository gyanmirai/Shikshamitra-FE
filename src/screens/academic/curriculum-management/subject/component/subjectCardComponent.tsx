import { getIn } from 'formik';
import React, { useState } from 'react';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Grid,
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

import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ISubjectCardProps } from './type';

const SubjectCard: React.FC<ISubjectCardProps> = ({
  formik,
  subject,
  isCore,
  isPublished,
  teacherOptions,
  onSubjectChange,
  index,
}: ISubjectCardProps) => {
  // State to control accordion expansion, initialized with subject's isSubjectOpen or false
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);

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
          {subject.subjectCode && <Label color="secondary">{subject?.subjectCode}</Label>}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Subject Code */}
          <Grid item xs={12} sm={6} md={4}>
            <ShakingTextField error={!!getError('subjectCode')}>
              <TextField
                fullWidth
                label="Subject Code *"
                placeholder="Enter Subject Code"
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
          <Grid item xs={12} sm={6} md={4}>
            <ShakingTextField error={!!getError('primaryTeacher')}>
              <Autocomplete
                options={teacherOptions}
                getOptionLabel={(option) => option.label}
                value={teacherOptions.find((opt) => opt.value === subject.primaryTeacher) || null}
                onChange={(event, newValue) =>
                  handleChange('primaryTeacher', newValue?.value || '')
                }
                disabled={isPublished}
                isOptionEqualToValue={(option, value) => option.value === value.value}
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
            </ShakingTextField>
          </Grid>
          {/* Secondary Teacher */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth error={!!getError('secondaryTeacher')}>
              <Autocomplete
                multiple
                options={teacherOptions}
                disableCloseOnSelect
                getOptionLabel={(option) => option.label}
                value={teacherOptions.filter((opt) =>
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Secondary Teacher"
                    placeholder="Select Secondary Teacher"
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
          <Grid item xs={12} md={6} lg={4}>
            <ShakingTextField error={!!getError('learningGoal')}>
              <Editor
                onChange={(value) => handleChange('learningGoal', value)}
                value={subject.learningGoal || ''}
                placeholder="Enter Learning Goal"
                error={!!getError('learningGoal')}
                helperText={getError('learningGoal')}
              />
            </ShakingTextField>
          </Grid>
          {/* Prerequisites */}
          <Grid item xs={12} md={6} lg={4}>
            <ShakingTextField error={!!getError('prerequisites')}>
              <Editor
                onChange={(value) => handleChange('prerequisites', value)}
                value={subject.prerequisites || ''}
                placeholder="Enter Prerequisites"
                error={!!getError('prerequisites')}
                helperText={getError('prerequisites')}
              />
            </ShakingTextField>
          </Grid>
          {/* Description */}
          <Grid item xs={12} md={6} lg={4}>
            <ShakingTextField error={!!getError('description')}>
              <TextField
                fullWidth
                multiline
                rows={9.5}
                label="Description"
                placeholder="Enter Description"
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
          <Grid item xs={12}>
            <Upload
              multiple
              value={subject.documents}
              onDrop={handleDrop}
              onRemove={handleRemove}
              sx={{}}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default SubjectCard;
