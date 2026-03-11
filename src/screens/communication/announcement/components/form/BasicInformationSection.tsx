import React, { memo } from 'react';
import { useFormikContext } from 'formik';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import FileUploader from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Chip, Checkbox, TextField, Typography, Autocomplete } from '@mui/material';

import type { ISchoolWiseAnnouncementFormValues } from '../../type';

const options = [
  { value: 'cricketGroup', label: 'Cricket Group' },
  { value: 'mathLegendGroup', label: 'Math Legend Group' },
  { value: 'scienceInnovators', label: 'Science Innovators' },
  { value: 'literatureClub', label: 'Literature Club' },
  { value: 'musicTeam', label: 'Music Team' },
  { value: 'artCrew', label: 'Art Crew' },
];

const BasicInformationSection = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ISchoolWiseAnnouncementFormValues>();
  const theme = useTheme();

  return (
    <SectionCard title="Basic Information">
      {/* Title */}
      <Grid size={{ xs: 12, md: 6, sm: 3 }}>
        <ShakingTextField error={!!(touched.title && errors.title)}>
          <TextField
            fullWidth
            label="Title *"
            name="title"
            value={values.title}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              setFieldValue('title', value);
            }}
            error={touched.title && Boolean(errors.title)}
            helperText={touched.title && errors.title}
            size="small"
          />
        </ShakingTextField>
      </Grid>

      {/* Announcement Type */}
      <Grid size={{ xs: 12, md: 6, sm: 3 }}>
        <ShakingTextField error={!!(touched.type && errors.type)}>
          <Autocomplete
            fullWidth
            multiple
            filterSelectedOptions
            options={[
              { announcementType: 'Academic', description: 'Academic', color: '#d219b3ff' },
              {
                announcementType: 'Administrative',
                description: 'Administrative',
                color: '#FF9800',
              },
              {
                announcementType: 'Extracurricular',
                description: 'Extracurricular',
                color: '#4CAF50',
              },
            ]}
            isOptionEqualToValue={(option, value) =>
              option.announcementType === value.announcementType
            }
            value={values.type}
            onChange={(_, newValue) => setFieldValue('type', newValue)}
            getOptionLabel={(option) => option.announcementType}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.announcementType}
                  label={option.description}
                  size="small"
                  color="default"
                  variant="soft"
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={option.color} />
                  <Typography variant="caption" fontSize="13px">
                    {option.announcementType}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Announcement Type *"
                size="small"
                error={touched.type && Boolean(errors.type)}
                helperText={
                  Array.isArray(errors.type)
                    ? errors.type.join(', ')
                    : (touched.type && errors.type) || undefined
                }
              />
            )}
          />
        </ShakingTextField>
      </Grid>

      {/* Audience */}
      <Grid size={{ xs: 12, md: 6, sm: 3 }}>
        <ShakingTextField error={!!(touched.audience && errors.audience)}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            getOptionLabel={(option) => option?.label || ''}
            value={values.audience}
            onChange={(_, newValue) => setFieldValue('audience', newValue)}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option?.value}
                  label={option?.label}
                  size="small"
                  color="default"
                  variant="soft"
                  sx={{ height: 22 }}
                />
              ))
            }
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option?.value}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  checked={selected}
                />
                {option?.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Audience *"
                fullWidth
                size="small"
                error={touched.audience && Boolean(errors.audience)}
                helperText={
                  Array.isArray(errors.audience)
                    ? errors.audience.join(', ')
                    : (touched.audience && errors.audience) || undefined
                }
              />
            )}
            sx={{ minWidth: 300 }}
          />
        </ShakingTextField>
      </Grid>

      {/* Importance Level */}
      <Grid size={{ xs: 12, md: 6, sm: 3 }}>
        <ShakingTextField error={!!(touched.importance_level && errors.importance_level)}>
          <Autocomplete
            fullWidth
            options={[
              { levelName: 'normal', description: 'Normal', color: '#1976d2' },
              { levelName: 'urgent', description: 'Urgent', color: '#FF5252' },
              { levelName: 'critical', description: 'Critical', color: '#D32F2F' },
            ]}
            value={
              [
                { levelName: 'normal', description: 'Normal', color: '#1976d2' },
                { levelName: 'urgent', description: 'Urgent', color: '#FF5252' },
                { levelName: 'critical', description: 'Critical', color: '#D32F2F' },
              ].find((opt) => opt.levelName === values?.importance_level?.levelName) || null
            }
            onChange={(_, newValue) =>
              setFieldValue(
                'importance_level',
                newValue || { levelName: '', description: '', color: '' }
              )
            }
            getOptionLabel={(option) => option.description}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={option.color} />
                  <Typography variant="caption" fontSize="13px">
                    {option.description}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Importance Level"
                size="small"
                error={touched.importance_level && Boolean(errors.importance_level)}
                helperText={
                  touched.importance_level && errors.importance_level
                    ? (errors.importance_level as string)
                    : undefined
                }
              />
            )}
          />
        </ShakingTextField>
      </Grid>

      {/* Description */}
      <Grid size={{ xs: 12 }}>
        <Editor
          value={values.description}
          onChange={(value) => setFieldValue('description', value)}
          placeholder="Description"
          sx={{
            border: `1px solid ${theme.vars.palette.grey[500]}`,
            borderRadius: 1,
            '&:hover': { borderColor: theme.vars.palette.text.primary },
            ...(!!touched.description &&
              !!errors.description && {
                borderColor: theme.palette.error.main,
              }),
            '&:focus-within': {
              borderColor: theme.vars.palette.text.primary,
              borderWidth: 2,
            },
          }}
        />
      </Grid>

      {/* File Uploader */}
      <Grid size={{ xs: 12 }}>
        <FileUploader
          value={values.attachment}
          multiple={false}
          showVisibleDocumentCount={1}
          onChange={(value) => setFieldValue('attachment', value)}
          primaryText="Please Upload Your File"
          secondaryText="Maximum file size is 5MB"
        />
      </Grid>
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * This component is memoized because it contains expensive text input and editor components.
 * It sits inside a Formik context and should only re-render when its specific field values change.
 * However, since it consumes Formik context directly, strict React.memo might be bypassed if context changes.
 * Ideally, we should pass props, but for now we rely on Formik's optimization or React.memo if parent passes props.
 * Here we use memo to prevent re-renders from parent state changes not affecting the form.
 */
export default memo(BasicInformationSection);
