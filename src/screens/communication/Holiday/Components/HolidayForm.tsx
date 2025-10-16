import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { holidayValidationSchema } from './getHolidayValidationSchema';
import { audienceOptions } from '../../announcement/schoolannouncementForm';

import type { IHoliday, IHolidayFormProps } from './type';

const HolidayForm: React.FC<IHolidayFormProps> = ({ initialValues, onClose, isEdit = false }) => {
  const theme = useTheme();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik<IHoliday>({
    initialValues: {
      id: initialValues?.id || '',
      holidayName: initialValues?.holidayName || '',
      holidayType: initialValues?.holidayType || '',
      startDate: initialValues?.startDate || null,
      classes: initialValues?.classes || [],
      endDate: initialValues?.endDate || null,
      description: initialValues?.description || '',
      attachment: initialValues?.attachment || null,
      audience: initialValues?.audience || [],
      createdBy: initialValues?.createdBy || '',
      createdOn: initialValues?.createdOn || dayjs(),
      status: initialValues?.status || 1, // Draft by default
    },
    validationSchema: holidayValidationSchema(currentYear),
    onSubmit: (values) => {
      if (initialValues) {
        shikshaMitraToast.success({
          message: `Holiday : ${values.holidayName} updated successfully!`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Holiday : ${values.holidayName} added successfully!`,
        });
      }
      onClose(null, true);
    },
  });
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
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            {/* Basic Info */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Basic Information">
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.holidayName && formik.errors.holidayName)}
                  >
                    <TextField
                      label="Holiday Name *"
                      name="holidayName"
                      value={formik.values.holidayName}
                      onChange={(e) => {
                        const value = e.target.value
                          // Remove everything except letters and spaces
                          .replace(/[^a-zA-Z0-9\s]/g, '')
                          // Capitalize each word
                          .split(' ')
                          .map((word) =>
                            word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                          )
                          .join(' ');
                        formik.setFieldValue('holidayName', value);
                      }}
                      error={formik.touched.holidayName && Boolean(formik.errors.holidayName)}
                      helperText={formik.touched.holidayName && formik.errors.holidayName}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.holidayType && formik.errors.holidayType)}
                  >
                    <CustomSelect
                      label="Holiday Type *"
                      value={formik.values.holidayType}
                      onChange={(val) => formik.setFieldValue('holidayType', val)}
                      options={[
                        { value: 'National Holiday', label: 'National Holiday' },
                        { value: 'Festival', label: 'Festival' },
                        { value: 'School Holiday', label: 'School Holiday' },
                      ]}
                      error={formik.touched.holidayType && Boolean(formik.errors.holidayType)}
                      helperText={
                        (formik.touched.holidayType && formik.errors.holidayType) as string
                      }
                      formControlProps={{ fullWidth: true }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
                    <DatePicker
                      label="Start Date *"
                      value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                      onChange={(date) => formik.setFieldValue('startDate', date)}
                      format="DD/MM/YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.startDate && Boolean(formik.errors.startDate),
                          helperText: formik.touched.startDate && formik.errors.startDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.endDate && formik.errors.endDate)}>
                    <DatePicker
                      label="End Date *"
                      value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                      format="DD/MM/YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      onChange={(date) => formik.setFieldValue('endDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.endDate && Boolean(formik.errors.endDate),
                          helperText: formik.touched.endDate && formik.errors.endDate,
                        },
                      }}
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
                    onChange={(val) => formik.setFieldValue('attachment', val)}
                    primaryText="File Uploads (PDF, Poster, Circular etc)"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Audience */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Audience Selection">
                <Grid size={{ xs: 12, md: 6 }}>
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
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <CustomSelect
                      label="Select Audience *"
                      options={audienceOptions}
                      multiple
                      value={formik.values.audience.map((aud) => aud.name)} // show only names in the UI
                      onChange={(val) => {
                        const selectedObjects = audienceOptions.filter((opt) =>
                          (val as string[]).includes(opt.name)
                        );
                        formik.setFieldValue('audience', selectedObjects);
                      }}
                      labelKey="name"
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
          </Scrollbar>
          {/* Actions */}
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
};

export default HolidayForm;
