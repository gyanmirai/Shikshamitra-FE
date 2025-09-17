import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { holidayValidationSchema } from './getHolidayValidationSchema';

import type { IHoliday, IHolidayFormProps } from './type';

const HolidayForm: React.FC<IHolidayFormProps> = ({ initialValues, onClose, isEdit = false }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  // State to store list of all organizations/branches
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
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

  const formik = useFormik<IHoliday>({
    initialValues: {
      id: initialValues?.id || '',
      holidayName: initialValues?.holidayName || '',
      holidayType: initialValues?.holidayType || '',
      importanceLevel: initialValues?.importanceLevel || 'Normal',
      startDate: initialValues?.startDate || null,
      endDate: initialValues?.endDate || null,
      description: initialValues?.description || '',
      attachment: initialValues?.attachment || null,
      organizations: initialValues?.organizations || [],
      audience: initialValues?.audience || [],
      createdBy: initialValues?.createdBy || '',
      createdOn: initialValues?.createdOn || dayjs(),
      status: initialValues?.status || 1, // Draft by default
    },
    validationSchema: holidayValidationSchema(currentYear),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            {/* Basic Info */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Basic Information">
                <Grid size={{ xs: 12, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.holidayName && formik.errors.holidayName)}
                  >
                    <TextField
                      label="Holiday Name *"
                      name="holidayName"
                      value={formik.values.holidayName}
                      onChange={formik.handleChange}
                      error={formik.touched.holidayName && Boolean(formik.errors.holidayName)}
                      helperText={formik.touched.holidayName && formik.errors.holidayName}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
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

                <Grid size={{ xs: 12, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.importanceLevel && formik.errors.importanceLevel)}
                  >
                    <CustomSelect
                      label="Importance Level *"
                      value={formik.values.importanceLevel}
                      onChange={(val) => formik.setFieldValue('importanceLevel', val)}
                      options={[
                        { value: 'Normal', label: 'Normal' },
                        { value: 'High', label: 'High' },
                        { value: 'Low', label: 'Low' },
                      ]}
                      error={
                        formik.touched.importanceLevel && Boolean(formik.errors.importanceLevel)
                      }
                      helperText={
                        (formik.touched.importanceLevel && formik.errors.importanceLevel) as string
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
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <TextField
                      label="Description / Message Body *"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      multiline
                      rows={4}
                      fullWidth
                      size="small"
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FileUploader
                    value={formik.values.attachment as any}
                    onChange={(val) => formik.setFieldValue('attachment', val)}
                    primaryText="File Uploads (PDF, poster, circular...)"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Audience */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Audience Selection">
                <Grid size={{ xs: 12, md: 6 }}>
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
                      formControlProps={{ fullWidth: true }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <CustomSelect
                      label="Audience *"
                      options={[
                        { value: 'Students', label: 'Students' },
                        { value: 'Parents', label: 'Parents' },
                        { value: 'Teachers', label: 'Teachers' },
                      ]}
                      value={formik.values.audience}
                      onChange={(val) => formik.setFieldValue('audience', val)}
                      multiple
                      error={formik.touched.audience && Boolean(formik.errors.audience)}
                      helperText={(formik.touched.audience && formik.errors.audience) as string}
                      formControlProps={{ fullWidth: true }}
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
