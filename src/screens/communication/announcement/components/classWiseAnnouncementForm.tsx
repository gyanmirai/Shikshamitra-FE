'use client';

import type React from 'react';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { DateTimePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Chip,
  Dialog,
  Button,
  Divider,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  DialogContent,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { getClassInitialValues } from './getClassInitialValues';
import { classWiseValidationSchema } from '../validationSchema';
import ClassWiseAnnouncementCard from './ClassWiseDetails/ClassWiseAnnouncementPreview';

import type { IClassWiseAnnouncement, IClassWiseAnnouncementFormProps } from '../type';

const AnnouncementForm: React.FC<IClassWiseAnnouncementFormProps> = ({
  onClose,
  onSubmit,
  initialValues = null,
  isEdit = false,
}: IClassWiseAnnouncementFormProps) => {
  const theme = useTheme();
  const previewDialog = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes

  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const formik = useFormik<IClassWiseAnnouncement>({
    initialValues: getClassInitialValues(initialValues),
    validationSchema: classWiseValidationSchema(currentYear),
    onSubmit: (values) => {
      if (initialValues) {
        shikshaMitraToast.success({
          message: `Announcement : ${values.title} updated successfully!`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Announcement : ${values.title} added successfully!`,
        });
      }
      onClose(null, true);
    },
  });
  console.log('formik erroes===', formik.errors);
  console.log('formik values===', formik.values);

  // Update divisions list when class selection changes
  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      if (!isEdit) formik.setFieldValue('divisions', []); // only reset on create
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);

      if (!isEdit) {
        const divisionIds = divisions.map((div: any) => div.id);
        formik.setFieldValue('divisions', [...divisionIds]);
      }
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      if (!isEdit) formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  // Update classes list when organization selection changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    const withAll = allClasses.length
      ? [{ id: 'all', name: 'All', divisions: [] }, ...allClasses]
      : [];
    setAllClass(withAll);

    if (!isEdit) formik.setFieldValue('classes', []); // only reset on create
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
          <Box display="flex" flexDirection="column" gap={2} height="100%">
            <Scrollbar sx={{ p: 2, height: '100%' }}>
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Basic Information">
                  <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                    <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                      <TextField
                        fullWidth
                        label="Title *"
                        name="title"
                        value={formik.values.title}
                        onChange={(e) => {
                          const value = e.target.value
                            // Remove everything except letters and spaces
                            .replace(/[^a-zA-Z\s]/g, '')
                            // Capitalize each word
                            .split(' ')
                            .map((word) =>
                              word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                            )
                            .join(' ');
                          formik.setFieldValue('title', value);
                        }}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        size="small"
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                    <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                      <Autocomplete
                        fullWidth
                        multiple
                        options={[
                          {
                            announcementType: 'Academic',
                            description: 'Academic',
                            color: '#1976d2',
                          },
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
                        value={formik.values.type}
                        onChange={(_, newValue) => formik.setFieldValue('type', newValue)}
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
                            error={formik.touched.type && Boolean(formik.errors.type)}
                            helperText={
                              Array.isArray(formik.errors.type)
                                ? formik.errors.type.join(', ')
                                : (formik.touched.type && formik.errors.type) || undefined
                            }
                          />
                        )}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                    <ShakingTextField
                      error={!!(formik.touched.importance_level && formik.errors.importance_level)}
                    >
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
                          ].find(
                            (opt) => opt.levelName === formik?.values?.importance_level?.levelName
                          ) || null
                        }
                        onChange={(_, newValue) =>
                          formik.setFieldValue(
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
                            error={
                              formik.touched.importance_level &&
                              Boolean(formik.errors.importance_level)
                            }
                            helperText={
                              formik.touched.importance_level && formik.errors.importance_level
                                ? formik.errors.importance_level
                                : undefined
                            }
                          />
                        )}
                      />
                    </ShakingTextField>
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
                        ...(!!formik.touched.description &&
                          !!formik.errors.description && {
                            borderColor: theme.palette.error.main,
                          }),
                        '&:focus-within': {
                          borderColor: theme.vars.palette.text.primary,
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FileUploader
                      value={formik.values.attachment as any}
                      multiple={false}
                      showVisibleDocumentCount={1}
                      onChange={(value) => formik.setFieldValue('attachment', value)}
                      primaryText="Please Upload Your File"
                      secondaryText="Maximum file size is 5MB"
                    />
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SectionCard title="Audience Selction">
                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
                      <CustomSelect
                        options={allClass}
                        label="Class *"
                        multiple
                        value={formik.values.classes}
                        onChange={(val) => {
                          const value = val as string[];

                          const allClassIds =
                            allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                          const isAllClicked = value.includes('all');
                          const wasAllPreviouslySelected = (
                            formik.values.classes as string[]
                          ).includes('all');

                          if (isAllClicked && !wasAllPreviouslySelected) {
                            // "All" was just clicked - select all classes
                            formik.setFieldValue('classes', ['all', ...allClassIds]);
                          } else if (!isAllClicked && wasAllPreviouslySelected) {
                            // "All" was just unchecked - deselect all classes
                            formik.setFieldValue('classes', []);
                          } else if (isAllClicked && wasAllPreviouslySelected) {
                            // Individual item was selected/deselected while "All" was already selected
                            const selectedWithoutAll = value.filter((id) => id !== 'all');

                            if (selectedWithoutAll.length === allClassIds.length) {
                              // All individual items are selected, keep "All" selected
                              formik.setFieldValue('classes', ['all', ...allClassIds]);
                            } else {
                              // Not all individual items are selected, remove "All"
                              formik.setFieldValue('classes', selectedWithoutAll);
                            }
                          } else {
                            // "All" is not selected, handle individual selections
                            const selectedWithoutAll = value.filter((id) => id !== 'all');

                            if (selectedWithoutAll.length === allClassIds.length) {
                              // All individual items are selected, add "All"
                              formik.setFieldValue('classes', ['all', ...allClassIds]);
                            } else {
                              // Not all items selected, just keep individual selections
                              formik.setFieldValue('classes', selectedWithoutAll);
                            }
                          }
                        }}
                        onBlur={() => formik.setFieldTouched('classes', true)}
                        error={formik.touched.classes && Boolean(formik.errors.classes)}
                        helperText={(formik.touched.classes && formik.errors.classes) as string}
                        labelKey="name"
                        valueKey="id"
                        formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                        disabled={!formik.values.organizations}
                      />
                    </ShakingTextField>
                  </Grid>

                  {!(formik.values.classes as string[]).includes('all') &&
                    formik.values.classes.length > 0 && (
                      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <ShakingTextField
                          error={!!(formik.touched.divisions && formik.errors.divisions)}
                        >
                          <CustomSelect
                            options={allDivision}
                            label="Division *"
                            value={formik.values.divisions}
                            onChange={(val) => formik.setFieldValue('divisions', val)}
                            onBlur={() => formik.setFieldTouched('divisions', true)}
                            error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                            helperText={
                              (formik.touched.divisions && formik.errors.divisions) as string
                            }
                            labelKey="name"
                            valueKey="id"
                            multiple={
                              !(formik.values.classes as string[]).includes('all') ||
                              formik.values.classes.length > 1
                            }
                            formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                            disabled={formik.values.classes.length === 0}
                          />
                        </ShakingTextField>
                      </Grid>
                    )}
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12 }} mb={2}>
                <SectionCard title="Delivery Channels">
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {['In-App', 'Email', 'SMS', 'Whatsapp'].map((type) => {
                        const labels: Record<string, string> = {
                          'In-App': 'In-App',
                          Email: 'Email',
                          SMS: 'SMS',
                          Whatsapp: 'Whatsapp',
                        };

                        return (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                checked={formik.values.notification_preferences.includes(type)}
                                onChange={() => {
                                  const current = formik.values.notification_preferences || [];
                                  if (current.includes(type)) {
                                    formik.setFieldValue(
                                      'notification_preferences',
                                      current.filter((c: string) => c !== type)
                                    );
                                  } else {
                                    formik.setFieldValue('notification_preferences', [
                                      ...current,
                                      type,
                                    ]);
                                  }
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2">{labels[type]}</Typography>
                              </Box>
                            }
                          />
                        );
                      })}
                    </Box>
                    {formik.touched.notification_preferences &&
                      formik.errors.notification_preferences && (
                        <FormHelperText
                          error
                          sx={{
                            fontSize: '10px !important',
                            marginBottom: 0,
                            position: 'none',
                            marginLeft: ' 0px !important',
                            bottom: 0,
                          }}
                        >
                          {String(formik.errors.notification_preferences)}
                        </FormHelperText>
                      )}
                    {/* Helper Text inside SectionCard */}
                  </Grid>
                </SectionCard>
              </Grid>
              {/* Start Time DatePicker */}
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Scheduling">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                    >
                      <DateTimePicker
                        label="Start Date-Time *"
                        format="DD/MM/YYYY hh:mm"
                        value={dayjs(formik.values.startDate)}
                        onChange={(newValue) => {
                          formik.setFieldValue('startDate', newValue);
                          formik.setFieldTouched('startDate', false);

                          // Recalculate duration if endDate already selected
                          if (newValue && formik.values.endDate) {
                            const start = dayjs(newValue);
                            const end = dayjs(formik.values.endDate);

                            const diffInHours = end.diff(start, 'hour');
                            const diffInDays = end.diff(start, 'day');

                            if (diffInHours >= 24) {
                              formik.setFieldValue('durationUnit', 'days');
                              formik.setFieldValue('duration', Math.max(0, diffInDays));
                            } else {
                              formik.setFieldValue('durationUnit', 'hours');
                              formik.setFieldValue('duration', Math.max(0, diffInHours));
                            }
                          }
                        }}
                        minDateTime={dayjs()} // <- disables past date and time
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
                      <DateTimePicker
                        label="End Date-Time *"
                        format="DD/MM/YYYY hh:mm"
                        minDate={dayjs(formik.values.startDate)}
                        maxDate={dayjs(currentYear?.endDate)}
                        value={dayjs(formik.values.endDate)}
                        onChange={(newValue) => {
                          formik.setFieldValue('endDate', newValue);
                          formik.setFieldTouched('endDate', false);

                          // Recalculate duration if startDate already selected
                          if (newValue && formik.values.startDate) {
                            const start = dayjs(formik.values.startDate);
                            const end = dayjs(newValue);

                            const diffInHours = end.diff(start, 'hour');
                            const diffInDays = end.diff(start, 'day');

                            if (diffInHours >= 24) {
                              formik.setFieldValue('durationUnit', 'days');
                              formik.setFieldValue('duration', Math.max(0, diffInDays));
                            } else {
                              formik.setFieldValue('durationUnit', 'hours');
                              formik.setFieldValue('duration', Math.max(0, diffInHours));
                            }
                          }
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

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={
                        formik.values.duration
                          ? `Duration (in ${formik.values.durationUnit === 'days' ? 'days' : 'hours'}) *`
                          : 'Duration *'
                      }
                      name="duration"
                      type="number"
                      value={formik.values.duration}
                      disabled
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                      error={formik.touched.duration && Boolean(formik.errors.duration)}
                      helperText={formik.touched.duration && formik.errors.duration}
                      size="small"
                    />
                  </Grid>

                  {formik.values.notification_preferences.includes('inApp') && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.isAllowAcknoledgement}
                            onChange={(e) =>
                              formik.setFieldValue('isAllowAcknoledgement', e.target.checked)
                            }
                          />
                        }
                        label="Allow Acknowledgement? (checkbox → recipients click “I’ve read this”)"
                      />
                    </Grid>
                  )}
                </SectionCard>
              </Grid>
            </Scrollbar>
            <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.eye} />}
                onClick={() => {
                  formik.validateForm().then((errors) => {
                    if (Object.keys(errors).length === 0) {
                      previewDialog.onTrue();
                    } else {
                      formik.setTouched(
                        Object.keys(errors).reduce(
                          (acc, key) => {
                            acc[key] = true;
                            return acc;
                          },
                          {} as Record<string, boolean>
                        )
                      );
                    }
                  });
                }}
              >
                Preview
              </Button>
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
                type="submit"
                startIcon={
                  <Iconify
                    icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                    width={initialValues ? 16 : 20}
                    height={initialValues ? 16 : 20}
                  />
                }
              >
                {initialValues ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          </Box>
        </form>
      </BackPopUpChecked>
      <Dialog
        open={previewDialog.value}
        onClose={() => {
          setIsChanges(false);
          previewDialog.onFalse();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          },
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" p={1.5}>
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Preview</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Remove announcement from the system. This action will permanently delete the announcement and it will no longer be visible to users."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsChanges(false);
              previewDialog.onFalse();
            }}
            sx={{ color: theme.vars.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </Box>
        <Divider />
        {/* Scrollable Content */}
        <Scrollbar>
          <DialogContent sx={{ p: 2 }}>
            <ClassWiseAnnouncementCard formikValues={formik.values} />
          </DialogContent>
        </Scrollbar>
      </Dialog>
    </>
  );
};

export default AnnouncementForm;
