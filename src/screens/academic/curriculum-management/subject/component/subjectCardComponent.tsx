import { getIn } from 'formik';
import React, { useState } from 'react';

import { Box, Card, Grid, Collapse, TextField, Typography, CardContent } from '@mui/material';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Subheader } from 'src/components/nav-section';
import CustomSelect from 'src/components/custom-select';
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
  // Use the isSubjectOpen property from the subject object, defaulting to false if not set
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);

  const handleChange = (field: string, value: any) => {
    onSubjectChange(subject.id, field, value);
  };

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    // Also update the subject's isSubjectOpen property in formik state
    onSubjectChange(subject.id, 'isSubjectOpen', newExpandedState);
  };

  const getError = (field: string) =>
    getIn(formik.touched, `subjects[${index}].${field}`) &&
    getIn(formik.errors, `subjects[${index}].${field}`);

  return (
    <Box>
      <Subheader
        data-title="Subject"
        open={subject.isSubjectOpen}
        onClick={() => {
          toggleExpand();
        }}
        sx={{ pt: 0, fontWeight: 600 }}
      >
        {subject.subjectName || 'Subject Name'}
      </Subheader>
      {/* Collapsible Content */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <Collapse in={isExpanded}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Subject Code */}
              <Grid item xs={12} md={4}>
                <ShakingTextField error={!!getError('subjectCode')}>
                  <TextField
                    fullWidth
                    label="Subject Code *"
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
                <ShakingTextField error={!!getError('primaryTeacher')}>
                  <CustomSelect
                    label="Primary Teacher"
                    options={teacherOptions}
                    value={subject.primaryTeacher || ''}
                    onChange={(val) => handleChange('primaryTeacher', val)}
                    error={!!getError('primaryTeacher')}
                    helperText={getError('primaryTeacher')}
                    disabled={isPublished}
                  />
                </ShakingTextField>
              </Grid>

              {/* Secondary Teacher */}
              <Grid item xs={12} md={4}>
                <ShakingTextField error={!!getError('secondaryTeacher')}>
                  <CustomSelect
                    label="Secondary Teacher"
                    multiple
                    options={teacherOptions}
                    value={subject.secondaryTeacher || []}
                    onChange={(val) => handleChange('secondaryTeacher', val)}
                    error={!!getError('secondaryTeacher')}
                    helperText={
                      Array.isArray(getError('secondaryTeacher'))
                        ? getError('secondaryTeacher').join(', ')
                        : getError('secondaryTeacher')
                    }
                    disabled={isPublished}
                  />
                </ShakingTextField>
              </Grid>

              {/* Learning Goal */}
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12}>
                <ShakingTextField error={!!getError('description')}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
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
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Upload Document</Typography>
                    </Box>
                  }
                  sx={{ py: 1.4, width: '100%', borderRadius: 1.5 }}
                  disabled={isPublished}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
};

export default SubjectCard;
