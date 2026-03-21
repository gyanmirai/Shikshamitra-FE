import { getIn } from 'formik';
import { Editor } from 'src/components/editor';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { fileData } from 'src/components/file-thumbnail';
import CustomTooltip from 'src/components/custom-tooltip';
import { SingleFilePreview } from 'src/components/upload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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

import type { TeacherProfile, ISubjectCardProps } from '../type';

const SubjectCard: React.FC<ISubjectCardProps> = ({
  formik,
  subject,
  isCore,
  isPublished,
  // teacherOptions,
  onSubjectChange,
  index,
  onFileUpload,
}: ISubjectCardProps) => {
  // const theme = useTheme();
  const { data: employee, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  // State to control accordion expansion, initialized with subject's isSubjectOpen or false
  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();

  // @param field - The field name to update
  // @param value - The new value to set
  const handleChange = (field: string, value: any) => {
    if (!subject?.subjectNo) return;
    onSubjectChange(subject?.subjectNo, field, value);
  };

  useEffect(() => {
    setIsExpanded(subject.isSubjectOpen || false);
  }, [subject.subjectNo, subject.isSubjectOpen]);

  // Get validation error for a specific field
  // @param field - The field name to check for errors
  // @returns The error message if field is touched and has error, otherwise undefined
  const getError = (field: string) =>
    getIn(formik.touched, `subjects[${index}].${field}`) &&
    getIn(formik.errors, `subjects[${index}].${field}`);

  return (
    <>
      <Accordion
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
        sx={{
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.customShadows?.z1 || theme.shadows[1],
          transition: (theme) => theme.transitions.create(['box-shadow', 'background-color']),
          '&:hover': {
            boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[4],
          },
          '&:before': { display: 'none' },
          mb: 2,
          overflow: 'hidden',
          '&.Mui-expanded': {
            m: 0,
            mb: 3,
            border: (theme) => `1px solid ${theme.palette.primary.main}`,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            py: 1,
            px: 2,
            pb: 0,
            pt: 0,
            bgcolor: (theme) => (isExpanded ? theme.palette.action.hover : 'transparent'),
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              display: 'flex',
              gap: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <SubjectColorIndicator color={subject?.subjectColor} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {subject.subjectName || 'Untitled Subject'}
            </Typography>

            {!isExpanded && (
              <Box sx={{ display: 'flex', gap: 1, ml: 1, flexWrap: 'wrap' }}>
                {subject.subjectCode && (
                  <Chip
                    label={`Code: ${subject.subjectCode}`}
                    size="small"
                    variant="soft"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
                {subject.primaryTeacher && (
                  <Chip
                    label={`Lead: ${subject.primaryTeacher}`}
                    size="small"
                    variant="soft"
                    color="info"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Grid container spacing={3}>
            {/* Standard Detail Row */}
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!getError('subjectCode')}>
                <TextField
                  fullWidth
                  label="Subject Code"
                  placeholder="e.g. MATH-101"
                  size="small"
                  value={subject.subjectCode || ''}
                  onChange={(e) => {
                    const uppercaseValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9\-_]/g, '');
                    formik.setFieldValue(`subjects.${index}.subjectCode`, uppercaseValue);
                  }}
                  disabled={isPublished}
                  error={!!getError('subjectCode')}
                  helperText={getError('subjectCode')}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!getError('primaryTeacher')}>
                <Autocomplete
                  options={
                    employee?.items?.filter(
                      (option: any) =>
                        !subject.secondaryTeacher?.some(
                          (secondary: any) => (secondary.id || secondary) === option.id
                        )
                    ) || []
                  }
                  value={employee?.items?.find((t: any) => t.id === subject.primaryTeacher) ?? null}
                  getOptionLabel={(option) => option.fullName ?? ''}
                  onChange={(_, newValue) =>
                    formik.setFieldValue(`subjects.${index}.primaryTeacher`, newValue?.id ?? '')
                  }
                  loading={isLoading}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {option.fullName?.[0]}
                      </Avatar>
                      {option.fullName}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Primary Teacher" size="small" />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth error={!!getError('secondaryTeacher')}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={
                    employee?.items?.filter(
                      (option: any) => option.id !== subject.primaryTeacher
                    ) || []
                  }
                  loading={isLoading}
                  value={
                    employee?.items?.filter((t: any) =>
                      subject.secondaryTeacher?.includes(t?.id as any)
                    ) || []
                  }
                  getOptionLabel={(option) => option?.fullName ?? ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, newValue) =>
                    formik.setFieldValue(
                      `subjects.${index}.secondaryTeacher`,
                      newValue.map((item) => item.id)
                    )
                  }
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        checked={selected}
                        sx={{ mr: 1 }}
                      />
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>
                        {option.fullName?.[0]}
                      </Avatar>
                      {option?.fullName}
                    </li>
                  )}
                  renderTags={(values) => {
                    if (!values || values.length === 0) return null;
                    const first = values[0];
                    const remaining = values.length - 1;

                    return [
                      <Chip
                        key={first?.id}
                        avatar={<Avatar>{first?.fullName?.[0]}</Avatar>}
                        label={first?.fullName}
                        size="small"
                        variant="soft"
                        sx={{ ml: 1 }}
                      />,
                      remaining > 0 && (
                        <TeacherListPopover
                          key="popover"
                          teachers={values.slice(1)}
                          count={remaining}
                        />
                      ),
                    ];
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Secondary Teachers"
                      placeholder={subject.secondaryTeacher?.length ? '' : 'Select assist teachers'}
                      size="small"
                      error={!!getError('secondaryTeacher')}
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

            {/* Content Sections */}
            {[
              { label: 'Learning Goals', field: 'learningGoal' },
              { label: 'Prerequisites', field: 'prerequisites' },
              { label: 'Description', field: 'description' },
            ].map((section) => (
              <Grid key={section.field} size={{ xs: 12 }}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {section.label}
                  </Typography>
                </Box>
                <ShakingTextField error={!!getError(section.field)}>
                  <Editor
                    onChange={(value) => handleChange(section.field, value)}
                    value={(subject as any)[section.field] || ''}
                    placeholder={`Enter ${section.label.toLowerCase()}...`}
                    error={!!getError(section.field)}
                    sx={{
                      borderRadius: 1,
                      border: (theme) =>
                        `1px solid ${
                          getError(section.field) ? theme.palette.error.main : theme.palette.divider
                        }`,
                      '&:hover': {
                        borderColor: 'text.secondary',
                      },
                      '&:focus-within': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                      maxHeight: 250,
                      overflow: 'hidden',
                    }}
                  />
                  {getError(section.field) && (
                    <FormHelperText error sx={{ ml: 1 }}>
                      {getError(section.field)}
                    </FormHelperText>
                  )}
                </ShakingTextField>
              </Grid>
            ))}

            {/* Upload Document */}
            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <CustomUpload
                multiple
                previewCount={6}
                onChange={(files) => {
                  onFileUpload(files, index);
                }}
                value={subject.documents}
                label="Attach Support Documents"
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
            key={teacher.fullName}
            variant="soft"
            avatar={<Avatar sx={{ width: 24, height: 24 }}>{teacher?.fullName?.charAt(0)}</Avatar>}
            label={teacher.fullName}
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
