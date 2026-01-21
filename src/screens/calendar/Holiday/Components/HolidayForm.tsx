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
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Chip,
  Grid,
  Button,
  Checkbox,
  TextField,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useAddHolidayTypeMutation,
  useUpdateHolidayTypeMutation,
} from 'src/redux/communication/holiday/holidayDataApi';

import { holidayValidationSchema } from './getHolidayValidationSchema';

import type { IHoliday, IHolidayFormProps } from './type';

const options = [
  { value: 'cricketGroup', label: 'Cricket Group' },
  { value: 'mathLegendGroup', label: 'Math Legend Group' },
  { value: 'scienceInnovators', label: 'Science Innovators' },
  { value: 'literatureClub', label: 'Literature Club' },
  { value: 'musicTeam', label: 'Music Team' },
  { value: 'artCrew', label: 'Art Crew' },
];
const HolidayForm: React.FC<IHolidayFormProps> = ({ initialValues, onClose, isEdit = false }) => {
  const theme = useTheme();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to store list of all classes/standards
  const [, setAllClass] = useState<Standards[]>([]);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { addHoliday } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHolidayTypeMutation,
  });

  const { updateHoliday } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHolidayTypeMutation,
  });

  const formik = useFormik<IHoliday>({
    initialValues: {
      id: initialValues?.id || '',
      holidayName: initialValues?.holidayName || '',
      holidayType: initialValues?.holidayType || '',
      startDate: initialValues?.startDate || null,
      audience: initialValues?.audience || [],
      endDate: initialValues?.endDate || null,
      description: initialValues?.description || '',
      attachment: initialValues?.attachment || null,
      createdBy: initialValues?.createdBy || '',
      createdOn: initialValues?.createdOn || dayjs(),
      status: initialValues?.status || 1, // Draft by default
    },
    validationSchema: holidayValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.holidayName,
          holidayTypeId: values.holidayType, // Assuming this is the ID
          startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(values.endDate).format('YYYY-MM-DD'),
          description: values.description,
          audience: values.audience,
          attachment: values.attachment ? 'base64-or-url' : undefined, // Handle file upload
        };

        if (initialValues) {
          await updateHoliday({
            holidayId: values.id,
            ...payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Holiday: ${values.holidayName} updated successfully!`,
          });
        } else {
          await addHoliday(payload).unwrap();

          shikshaMitraToast.success({
            message: `Holiday: ${values.holidayName} added successfully!`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message:
            error?.data?.message || `Failed to ${initialValues ? 'update' : 'create'} holiday`,
        });
      }
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
          <Scrollbar
            sx={{
              p: 2,
              height: '100%',
              '& .simplebar-wrapper': {
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
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
              <SectionCard title="Audience Selection" paperProps={{ sx: { mb: 0 } }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={options}
                      getOptionLabel={(option) => option?.label || ''}
                      value={formik.values.audience
                        .map((val) => options.find((opt) => opt.value === val))
                        .filter(Boolean)}
                      onChange={(_, newValue) =>
                        formik.setFieldValue(
                          'audience',
                          newValue.map((opt) => opt?.value)
                        )
                      }
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
                          error={formik.touched.audience && Boolean(formik.errors.audience)}
                          helperText={formik.touched.audience && formik.errors.audience}
                        />
                      )}
                      sx={{ minWidth: 300 }}
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
