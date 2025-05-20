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

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
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
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);

  const handleChange = (field: string, value: any) => {
    onSubjectChange(subject.id, field, value);
  };

  const getError = (field: string) =>
    getIn(formik.touched, `subjects[${index}].${field}`) &&
    getIn(formik.errors, `subjects[${index}].${field}`);

  return (
    <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight={600}>
          {subject.subjectName || 'CHEMISTRY'}
        </Typography>
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
          <Grid item xs={18} sm={12} md={6}>
            <ShakingTextField error={!!getError('learningGoal')}>
              <Editor
                onChange={(value) => handleChange('learningGoal', value)}
                value={subject.learningGoal || ''}
                placeholder="Learning Goal"
                error={!!getError('learningGoal')}
                helperText={getError('learningGoal')}
              />
            </ShakingTextField>
          </Grid>
          {/* Prerequisites */}
          <Grid item xs={18} sm={12} md={6}>
            <ShakingTextField error={!!getError('prerequisites')}>
              <Editor
                onChange={(value) => handleChange('prerequisites', value)}
                value={subject.prerequisites || ''}
                placeholder="Prerequisites"
                error={!!getError('prerequisites')}
                helperText={getError('prerequisites')}
              />
            </ShakingTextField>
          </Grid>
          {/* Description */}
          <Grid item xs={18} sm={12} md={6}>
            <ShakingTextField error={!!getError('description')}>
              <TextField
                fullWidth
                multiline
                rows={4}
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
          <Grid item xs={18} sm={12} md={6}>
            <UploadBox
              onDrop={() => {}}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                    minHeight: 120,
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">Upload Document</Typography>
                </Box>
              }
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 1.5,
                minHeight: 120,
                bgcolor: 'grey.50',
              }}
              disabled={isPublished}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default SubjectCard;
