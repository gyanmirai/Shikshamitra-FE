'use client';

import type React from 'react';
import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { getClassInitialValues } from './getClassInitialValues';
import { classWiseValidationSchema } from '../validationSchema';

import type { IClassWiseAnnouncement, IClassWiseAnnouncementFormProps } from '../type';

const AnnouncementForm: React.FC<IClassWiseAnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}: IClassWiseAnnouncementFormProps) => {
  // Determines the announcement status based on scheduling and date
  // Returns 'Published' if not scheduled, 'Scheduled' if date is in future
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  // Available division options for the announcement
  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  // Track if all divisions are selected by comparing initial division length with available options
  const [isAllSelected, setIsAllSelected] = useState(
    initialValues?.divisions?.length === divisionOption.length
  );

  const formik = useFormik<IClassWiseAnnouncement>({
    initialValues: getClassInitialValues(initialValues),
    validationSchema: classWiseValidationSchema,
    onSubmit: (values) => {},
  });

  /**
   * Fetches class data using a custom hook that combines query and mutation functionality
   * @returns {Object} An object containing class data and loading state
   * @property {Array} data - The fetched class data
   * @property {boolean} isLoading - Loading state indicator
   */
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Toggles notification preferences by adding or removing them from the selected preferences array
   * @param preference - The notification preference to toggle
   */
  const handleNotificationPreferenceChange = (preference: string) => {
    const currentPreferences = formik.values.notification_preferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter((p) => p !== preference)
      : [...currentPreferences, preference];

    formik.setFieldValue('notification_preferences', updatedPreferences);
  };

  /**
   * Handles division selection changes including select all/deselect all functionality
   * @param selectedValues - Array of selected division values
   */
  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllSelected(selectedValues.length === divisionOption.length);
    }
  };
  return <>Announcement Form</>;
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
