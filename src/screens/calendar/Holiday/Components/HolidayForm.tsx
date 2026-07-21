import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type { IHolidayType } from 'src/screens/communication/settings/HolidayType/type';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
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
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetGroupsQuery } from 'src/redux/calendar/GroupManagement/groupManagementApi';
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
  useAddHolidayMutation,
  useGetHolidayTypeQuery,
  useUpdateHolidayMutation,
} from 'src/redux/communication/holiday/holidayDataApi';

import { holidayValidationSchema } from './getHolidayValidationSchema';

import type { IHoliday, IHolidayFormProps } from './type';

const toFileData = (value?: any) => {
  if (!value) return null;
  if (value instanceof File) return value;
  if (typeof value === 'object') return value;

  return {
    name: value.split('/').pop() || value,
    url: value,
  };
};

const serializeFileValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof File) return value.name;
  if (value.url) return value.url;
  if (value.base64) return value.base64;
  if (value.name) return value.name;
  return '';
};

const HolidayForm: React.FC<IHolidayFormProps> = ({ initialValues, onClose, isEdit = false }) => {
  const theme = useTheme();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to store list of all classes/standards
  const [, setAllClass] = useState<Standards[]>([]);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [addHoliday, { isLoading: addLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHolidayMutation,
  });

  const [updateHoliday, { isLoading: updateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHolidayMutation,
  });

  const {
    data: holidayTypeData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHolidayTypeQuery,
  });
  const { data: groupData, isLoading: isGroupDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupsQuery,
    params: { academicYearId: currentYear?.id, includeDetails: true },
    options: { skip: !currentYear?.id },
  });

  const formik = useFormik<IHoliday>({
    initialValues: {
      id: initialValues?.id || '',
      holidayName: initialValues?.holidayName || '',
      holidayTypeId: initialValues?.holidayTypeId || '',
      startDate: parseDateOnly(initialValues?.startDate) || null,
      audience: initialValues?.audienceIds || initialValues?.audience || [],
      endDate: parseDateOnly(initialValues?.endDate) || null,
      description: initialValues?.description || '',
      attachment: toFileData(initialValues?.attachment || initialValues?.attachments),
      createdBy: initialValues?.createdBy || '',
      createdOn: initialValues?.createdOn || dayjs(),
      status: initialValues?.status || 1, // Draft by default
    },
    validationSchema: holidayValidationSchema(currentYear),
    onSubmit: async (values) => {
      if (!currentYear?.id) {
        shikshaMitraToast.error({
          message: 'Please select an academic year before saving holiday',
        });
        return;
      }

      try {
        const payload = {
          // name: values.holidayName,
          // holidayTypeId: values.holidayType, // Assuming this is the ID
          // startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
          // endDate: dayjs(values.endDate).format('YYYY-MM-DD'),
          // description: values.description,
          // audience: values.audience,
          // attachment: values.attachment ? 'base64-or-url' : undefined, // Handle file upload
          academicYearId: currentYear?.id,
          holidayName: values.holidayName,
          holidayTypeId: values.holidayTypeId,
          startDate: toDateOnly(values.startDate),
          endDate: toDateOnly(values.endDate),
          description: values.description,
          audienceIds: values.audience,
          attachments: serializeFileValue(values.attachment),
        };

        if (initialValues) {
          await updateHoliday({
            id: initialValues.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Holiday: ${values.holidayName} updated successfully!`,
          });
        } else {
          await addHoliday({
            params: {
              academicYearId: currentYear?.id,
            },
            data: payload,
          }).unwrap();

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
        <Box display="flex" flexDirection="column" gap={1} height="100%">
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
                      data-testid="calendar-holiday-name-input"
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
                    error={!!(formik.touched.holidayTypeId && formik.errors.holidayTypeId)}
                  >
                    <CustomSelect
                      label="Holiday Type *"
                      value={formik.values.holidayTypeId}
                      onChange={(val) => formik.setFieldValue('holidayTypeId', val)}
                      isLoading={isLoading || isFetching}
                      options={
                        holidayTypeData?.items.map((item: IHolidayType) => ({
                          value: item.id,
                          label: item.name,
                        })) || []
                      }
                      error={formik.touched.holidayTypeId && Boolean(formik.errors.holidayTypeId)}
                      helperText={
                        (formik.touched.holidayTypeId && formik.errors.holidayTypeId) as string
                      }
                      formControlProps={
                        { fullWidth: true, 'data-testid': 'calendar-holiday-type-select' } as any
                      }
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
                          'data-testid': 'calendar-holiday-start-date',
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.startDate && Boolean(formik.errors.startDate),
                          helperText: formik.touched.startDate && formik.errors.startDate,
                        } as any,
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
                          'data-testid': 'calendar-holiday-end-date',
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.endDate && Boolean(formik.errors.endDate),
                          helperText: formik.touched.endDate && formik.errors.endDate,
                        } as any,
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
                      loading={isGroupDataLoading}
                      disableCloseOnSelect
                      options={groupData?.items || []}
                      getOptionLabel={(option) => option?.name || ''}
                      value={formik.values.audience
                        .map((val) => groupData?.items.find((opt: any) => opt.id === val))
                        .filter(Boolean)}
                      onChange={(_, newValue) =>
                        formik.setFieldValue(
                          'audience',
                          newValue.map((opt: any) => opt?.id)
                        )
                      }
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option?.id}
                            label={option?.name}
                            size="small"
                            color="default"
                            variant="soft"
                            sx={{ height: 22 }}
                          />
                        ))
                      }
                      renderOption={(props, option, { selected }) => (
                        <li {...props} key={option?.id}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlank fontSize="small" />}
                            checkedIcon={<CheckBox fontSize="small" />}
                            checked={selected}
                          />
                          {option?.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          data-testid="calendar-holiday-audience-select"
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
            <LoadingButton
              data-testid="calendar-holiday-submit-button"
              variant="contained"
              size="small"
              type="submit"
              loading={addLoading || updateLoading}
              startIcon={
                <Iconify
                  icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
            >
              {initialValues ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default HolidayForm;
