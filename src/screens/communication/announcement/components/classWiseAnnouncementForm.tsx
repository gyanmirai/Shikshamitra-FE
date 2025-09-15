'use client';

import type React from 'react';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { getClassInitialValues } from './getClassInitialValues';
import { classWiseValidationSchema } from '../validationSchema';

import type { IClassWiseAnnouncement, IClassWiseAnnouncementFormProps } from '../type';

const AnnouncementForm: React.FC<IClassWiseAnnouncementFormProps> = ({
  onClose,
  onSubmit,
  initialValues = null,
  isEdit = false,
}: IClassWiseAnnouncementFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // State to store list of all organizations/branches
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const formik = useFormik<IClassWiseAnnouncement>({
    initialValues: getClassInitialValues(initialValues),
    validationSchema: classWiseValidationSchema(currentYear),
    onSubmit: (values) => {},
  });

  // Update organizations list when medium changes
  useEffect(() => {
    const orgs = cloneDeep(medium?.educationMediumStages || []);

    // Add "All" if not present
    if (!orgs.some((org: Organization) => org.id === 'all')) {
      orgs.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumId: '',
        standards: [],
      });
    }

    setAllOrganization(orgs);
  }, [medium?.educationMediumStages]);

  // Update divisions list when class selection changes
  useEffect(() => {
    if (formik.values.classes.length === 0) {
      // Reset divisions when no classes selected
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      // Handle single class selection
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);

      // Auto-select all divisions for the selected class
      const divisionIds = divisions.map((div: any) => div.id);
      formik.setFieldValue('divisions', [...divisionIds]);
    } else {
      // Handle multiple classes or "all" selection
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

      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  // Update classes list when organization selection changes
  useEffect(() => {
    if (formik.values.organizations.length === 0) {
      setAllClass([]);
      formik.setFieldValue('classes', []);
      return;
    }

    if (formik.values.organizations.includes('all')) {
      // If "All" organizations selected → merge all org classes
      const mergedStandards = allOrganization
        .filter((org: any) => org.id !== 'all')
        .flatMap((org: any) => org.standards || []);

      // Add "All" option
      const withAll = [
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          educationMediumStageId: '',
          divisions: [],
        },
        ...mergedStandards,
      ];

      setAllClass(withAll);
      // 🚫 Do not auto-select classes
      formik.setFieldValue('classes', []);
    } else {
      // Specific organizations selected → merge their classes
      const mergedStandards = formik.values.organizations
        .map(
          (orgId: string) => allOrganization.find((org: any) => org?.id === orgId)?.standards || []
        )
        .flat();

      // Add "All" option
      const withAll = [
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          educationMediumStageId: '',
          divisions: [],
        },
        ...mergedStandards,
      ];

      setAllClass(withAll);
      // 🚫 Do not auto-select classes
      formik.setFieldValue('classes', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations]);

  console.log('formik----values---', formik.values);
  console.log('formik----erroes---', formik.errors);

  return (
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
                    <CustomSelect
                      label="Announcement Type *"
                      options={[
                        { value: 'academic', label: 'Academic' },
                        { value: 'administrative', label: 'Administrative' },
                        { value: 'extracurriculam', label: 'Extracurriculam' },
                      ]}
                      value={formik.values.type}
                      onChange={(val) => formik.setFieldValue('type', val)}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={
                        formik.touched.type && formik.errors.type ? formik.errors.type : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                  <ShakingTextField
                    error={!!(formik.touched.importance_level && formik.errors.importance_level)}
                  >
                    <CustomSelect
                      label="Importance Level"
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                      value={formik.values.importance_level as string}
                      onChange={(val) => formik.setFieldValue('importance_level', val as string)}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={
                        formik.touched.importance_level && Boolean(formik.errors.importance_level)
                      }
                      helperText={
                        formik.touched.importance_level && formik.errors.importance_level
                          ? formik.errors.importance_level
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <TextField
                      fullWidth
                      label="Description *"
                      name="description"
                      multiline
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      size="small"
                      rows={4}
                    />
                  </ShakingTextField>
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
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.organizations && formik.errors.organizations)}
                  >
                    <CustomSelect
                      options={allOrganization}
                      label="Organization *"
                      multiple
                      value={formik.values.organizations}
                      onChange={(val) => {
                        const value = val as string[];

                        const allOrgIds = allOrganization.map((org: any) => org.id);
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.organizations as string[]
                        ).includes('all');

                        let selectedOrganizations: string[] = [];

                        if (isAllClicked && !wasAllPreviouslySelected) {
                          selectedOrganizations = [
                            'all',
                            ...allOrgIds.filter((id) => id !== 'all'),
                          ];
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          selectedOrganizations = [];
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allOrgIds.length) {
                            selectedOrganizations = ['all', ...allOrgIds];
                          } else {
                            selectedOrganizations = selectedWithoutAll;
                          }
                        } else {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allOrgIds.length) {
                            selectedOrganizations = ['all', ...allOrgIds];
                          } else {
                            selectedOrganizations = selectedWithoutAll;
                          }
                        }

                        formik.setFieldValue('organizations', selectedOrganizations);
                      }}
                      onBlur={() => formik.setFieldTouched('organizations', true)}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations && formik.errors.organizations) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  {!(formik.values.classes as string[]).includes('all') &&
                    formik.values.classes.length > 0 && (
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
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <CustomSelect
                      label="Select Audience"
                      options={[
                        { value: 'Staff', label: 'Staff' },
                        { value: 'Students', label: 'Students' },
                        { value: 'Parents', label: 'Parents' },
                      ]}
                      multiple
                      value={formik.values.audience}
                      onChange={(val) => formik.setFieldValue('audience', val)}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={formik.touched.audience && Boolean(formik.errors.audience)}
                      helperText={
                        Array.isArray(formik.errors.audience)
                          ? formik.errors.audience.join(', ')
                          : (formik.touched.audience && formik.errors.audience) || undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Start Time DatePicker */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Scheduling & Control">
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                  >
                    <DatePicker
                      label="Start Date *"
                      format="DD/MM/YYYY"
                      value={dayjs(formik.values.startDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('startDate', newValue);
                      }}
                      minDate={dayjs(currentYear?.startDate)}
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
                    <DatePicker
                      label="End Date *"
                      format="DD/MM/YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={dayjs(formik.values.endDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('endDate', newValue);
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

                <Grid size={{ xs: 12 }}>
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
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12 }} mb={2}>
              <SectionCard title="Delivery Channels">
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['inApp', 'email', 'sms', 'whatsapp'].map((type) => {
                      const labels: Record<string, string> = {
                        inApp: 'In-App',
                        email: 'Email',
                        sms: 'SMS',
                        whatsapp: 'Whatsapp',
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
                      <FormHelperText error sx={{ pl: -4 }}>
                        {String(formik.errors.notification_preferences)}
                      </FormHelperText>
                    )}
                </Grid>
              </SectionCard>
            </Grid>
          </Scrollbar>
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
  );
  // <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
  //   <Box display="flex" flexDirection="column" gap={2} height="100%">
  //     <Scrollbar sx={{ p: 2, height: '100%' }}>
  //       <Grid container spacing={2}>
  //         {/* Title */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
  //             <TextField
  //               fullWidth
  //               label="Title"
  //               name="title"
  //               value={formik.values.title}
  //               onChange={formik.handleChange}
  //               error={formik.touched.title && Boolean(formik.errors.title)}
  //               helperText={formik.touched.title && formik.errors.title}
  //               size="small"
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Class */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
  //             <CustomSelect
  //               options={classData?.items || []}
  //               value={formik.values.className}
  //               onChange={(val) => formik.setFieldValue('className', val)}
  //               label="Class"
  //               isLoading={isLoading}
  //               multiple
  //               labelKey="name"
  //               valueKey="name"
  //               formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
  //               error={formik.touched.className && Boolean(formik.errors.className)}
  //               helperText={
  //                 Array.isArray(formik.errors.className)
  //                   ? formik.errors.className.join(', ')
  //                   : (formik.touched.className && formik.errors.className) || undefined
  //               }
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Division */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
  //             <CustomSelect
  //               label="Select Divisions"
  //               options={[
  //                 {
  //                   value: isAllSelected ? 'deselectAll' : 'all',
  //                   label: isAllSelected ? 'Deselect All' : 'All',
  //                 },
  //                 ...divisionOption,
  //               ]}
  //               value={formik.values.division}
  //               onChange={(val) => handleDivisionChange(val as string[])}
  //               multiple
  //               formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
  //               error={formik.touched.division && Boolean(formik.errors.division)}
  //               helperText={
  //                 Array.isArray(formik.errors.division)
  //                   ? formik.errors.division.join(', ')
  //                   : (formik.touched.division && formik.errors.division) || undefined
  //               }
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Audience */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
  //             <CustomSelect
  //               label="Select Audience"
  //               options={[
  //                 { value: 'Students', label: 'Students' },
  //                 { value: 'Parents', label: 'Parents' },
  //               ]}
  //               multiple
  //               value={formik.values.audience}
  //               onChange={(val) => formik.setFieldValue('audience', val)}
  //               formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
  //               error={formik.touched.audience && Boolean(formik.errors.audience)}
  //               helperText={
  //                 Array.isArray(formik.errors.audience)
  //                   ? formik.errors.audience.join(', ')
  //                   : (formik.touched.audience && formik.errors.audience) || undefined
  //               }
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Expiry Date */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.expiryDate && formik.errors.expiryDate)}>
  //             <DateTimePicker
  //               label="Expiry Date & Time"
  //               value={formik.values.expiryDate}
  //               onChange={(value) => formik.setFieldValue('expiryDate', value)}
  //               format="DD-MM-YYYY HH:mm"
  //               slotProps={{
  //                 textField: {
  //                   size: 'small',
  //                   fullWidth: true,
  //                   error: formik.touched.expiryDate && Boolean(formik.errors.expiryDate),
  //                   helperText: formik.touched.expiryDate && formik.errors.expiryDate,
  //                 },
  //               }}
  //               disablePast
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Category */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.category && formik.errors.category)}>
  //             <CustomSelect
  //               label="Select Category"
  //               options={[
  //                 { value: 'academic', label: 'Academic' },
  //                 { value: 'administrative', label: 'Administrative' },
  //                 { value: 'extracurriculam', label: 'Extracurriculam' },
  //               ]}
  //               value={formik.values.category}
  //               onChange={(val) => formik.setFieldValue('category', val)}
  //               formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
  //               error={formik.touched.category && Boolean(formik.errors.category)}
  //               helperText={(formik.touched.category && formik.errors.category) || undefined}
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Importance Level */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField
  //             error={!!(formik.touched.importance_level && formik.errors.importance_level)}
  //           >
  //             <CustomSelect
  //               label="Importance Level"
  //               options={[
  //                 { value: 'urgent', label: 'Urgent' },
  //                 { value: 'critical', label: 'Critical' },
  //                 { value: 'high', label: 'High' },
  //                 { value: 'medium', label: 'Medium' },
  //                 { value: 'low', label: 'Low' },
  //                 { value: 'informational', label: 'Informational' },
  //               ]}
  //               value={formik.values.importance_level}
  //               onChange={(val) => formik.setFieldValue('importance_level', val)}
  //               formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
  //               error={formik.touched.importance_level && Boolean(formik.errors.importance_level)}
  //               helperText={
  //                 (formik.touched.importance_level && formik.errors.importance_level) || undefined
  //               }
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Schedule Switch */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={formik.values.isScheduled}
  //                 onChange={(e) => formik.setFieldValue('isScheduled', e.target.checked)}
  //               />
  //             }
  //             label="Schedule Announcement"
  //           />
  //         </Grid>

  //         {/* Conditional Schedule Date */}
  //         {formik.values.isScheduled && (
  //           <Grid size={{ xs: 12, md: 6 }}>
  //             <ShakingTextField
  //               error={!!(formik.touched.publishDate && formik.errors.publishDate)}
  //             >
  //               <DateTimePicker
  //                 label="Schedule Date & Time"
  //                 value={formik.values.publishDate}
  //                 format="DD-MM-YYYY HH:mm"
  //                 onChange={handleDateChange}
  //                 slotProps={{
  //                   textField: {
  //                     size: 'small',
  //                     fullWidth: true,
  //                     error: formik.touched.publishDate && Boolean(formik.errors.publishDate),
  //                   },
  //                 }}
  //                 disablePast
  //               />
  //             </ShakingTextField>
  //           </Grid>
  //         )}

  //         {/* Description */}
  //         <Grid size={{ xs: 12 }}>
  //           <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
  //             <TextField
  //               fullWidth
  //               label="Announcement Description"
  //               name="description"
  //               multiline
  //               value={formik.values.description}
  //               onChange={formik.handleChange}
  //               error={formik.touched.description && Boolean(formik.errors.description)}
  //               helperText={formik.touched.description && formik.errors.description}
  //               size="small"
  //               rows={4}
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Upload */}
  //         <Grid size={{ xs: 12 }}>
  //           <UploadBox
  //             onDrop={() => {}}
  //             placeholder={
  //               <Box
  //                 sx={{
  //                   display: 'flex',
  //                   flexDirection: 'column',
  //                   alignItems: 'center',
  //                   gap: 0.5,
  //                   color: 'text.disabled',
  //                 }}
  //               >
  //                 <Iconify icon="eva:cloud-upload-fill" width={40} />
  //                 <Typography variant="body2">Upload Document</Typography>
  //               </Box>
  //             }
  //             sx={{ py: 2.5, width: '100%', height: 'auto', borderRadius: 1.5 }}
  //           />
  //         </Grid>

  //         {/* Link */}
  //         <Grid size={{ xs: 12, md: 6 }}>
  //           <ShakingTextField error={!!(formik.touched.link && formik.errors.link)}>
  //             <TextField
  //               fullWidth
  //               label="Link"
  //               name="link"
  //               value={formik.values.link}
  //               onChange={formik.handleChange}
  //               error={formik.touched.link && Boolean(formik.errors.link)}
  //               helperText={formik.touched.link && formik.errors.link}
  //               size="small"
  //               InputProps={{
  //                 startAdornment: (
  //                   <InputAdornment position="start">
  //                     <Iconify icon="typcn:attachment" />
  //                   </InputAdornment>
  //                 ),
  //               }}
  //             />
  //           </ShakingTextField>
  //         </Grid>

  //         {/* Notification Preferences */}
  //         <Grid size={{ xs: 12 }}>
  //           <Typography variant="subtitle2" gutterBottom>
  //             Notification Preferences
  //           </Typography>
  //           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
  //             {['email', 'sms', 'app'].map((type) => {
  //               const icons: Record<string, string> = {
  //                 email: 'mdi:email-outline',
  //                 sms: 'mdi:message-outline',
  //                 app: 'mdi:bell-outline',
  //               };
  //               const labels: Record<string, string> = {
  //                 email: 'Email',
  //                 sms: 'SMS',
  //                 app: 'App Notification',
  //               };
  //               return (
  //                 <FormControlLabel
  //                   key={type}
  //                   control={
  //                     <Checkbox
  //                       checked={formik.values.notification_preferences.includes(type)}
  //                       onChange={() => handleNotificationPreferenceChange(type)}
  //                     />
  //                   }
  //                   label={
  //                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
  //                       <Iconify icon={icons[type]} />
  //                       <Typography variant="body2">{labels[type]}</Typography>
  //                     </Box>
  //                   }
  //                 />
  //               );
  //             })}
  //           </Box>
  //           {formik.touched.notification_preferences &&
  //             formik.errors.notification_preferences && (
  //               <FormHelperText error>
  //                 {String(formik.errors.notification_preferences)}
  //               </FormHelperText>
  //             )}
  //         </Grid>
  //       </Grid>
  //     </Scrollbar>
  //     <DialogActions>
  //       <Button type="submit" variant="contained">
  //         {isEdit ? 'Update' : 'Create'}
  //       </Button>
  //     </DialogActions>
  //   </Box>
  // </form>
};

export default AnnouncementForm;
