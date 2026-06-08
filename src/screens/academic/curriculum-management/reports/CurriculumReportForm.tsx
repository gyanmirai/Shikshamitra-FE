'use client';

import type { CurriculumReportTitle } from 'src/enums/curriuculum-reports';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { useCurriculumReportForm } from './hooks/useCurriculumReportForm';

const CurriculumReportForm = ({ report }: { report: CurriculumReportTitle }) => {
  const {
    medium,
    formik,
    showField,
    isRequired,
    allOrganization,
    allClass,
    allDivision,
    subjectOptions,
    isSubjectLoading,
    chapterOptions,
    isChapterLoading,
    handleOrganizationChange,
    handleClassChange,
  } = useCurriculumReportForm(report);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Organisation */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.organization && formik.errors.organization)}
                >
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.organization}
                    onChange={handleOrganizationChange}
                    onBlur={() => formik.setFieldTouched('organization', true)}
                    error={formik.touched.organization && Boolean(formik.errors.organization)}
                    helperText={
                      (formik.touched.organization && formik.errors.organization) as string
                    }
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!medium}
                  />
                </ShakingTextField>
              </Grid>

              {/* Class */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
                  <CustomSelect
                    options={allClass}
                    label={`Class${isRequired('classes') ? ' *' : ''}`}
                    multiple
                    value={formik.values.classes}
                    onChange={handleClassChange}
                    onBlur={() => formik.setFieldTouched('classes', true)}
                    error={formik.touched.classes && Boolean(formik.errors.classes)}
                    helperText={(formik.touched.classes && formik.errors.classes) as string}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!formik.values.organization}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              {!(formik.values.classes as string[]).includes('all') &&
                formik.values.classes.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                    >
                      <CustomSelect
                        options={allDivision}
                        label={`Division${isRequired('divisions') ? ' *' : ''}`}
                        value={formik.values.divisions}
                        onChange={(val) => formik.setFieldValue('divisions', val)}
                        onBlur={() => formik.setFieldTouched('divisions', true)}
                        error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                        helperText={(formik.touched.divisions && formik.errors.divisions) as string}
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

              {/* Subject */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                  <CustomSelect
                    labelId="subjects-dropdown-label"
                    id="subjects-dropdown"
                    value={formik.values.subjects}
                    onBlur={() => formik.setFieldTouched('subjects', true)}
                    onChange={(val) => formik.setFieldValue('subjects', val)}
                    size="small"
                    label={`Subject${isRequired('subjects') ? ' *' : ''}`}
                    name="subjects"
                    error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                    helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    options={subjectOptions}
                    multiple
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!formik.values.organization}
                    isLoading={isSubjectLoading}
                  />
                </ShakingTextField>
              </Grid>

              {/* Chapter */}
              {showField('chapters') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.chapters && formik.errors.chapters)}>
                    <CustomSelect
                      labelId="chapters-dropdown-label"
                      id="chapters-dropdown"
                      value={formik.values.chapters}
                      onBlur={() => formik.setFieldTouched('chapters', true)}
                      onChange={(val) => formik.setFieldValue('chapters', val)}
                      size="small"
                      label="Chapter"
                      name="chapters"
                      error={formik.touched.chapters && Boolean(formik.errors.chapters)}
                      helperText={(formik.touched.chapters && formik.errors.chapters) as string}
                      options={chapterOptions}
                      multiple
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.classes.length || !formik.values.subjects.length}
                      isLoading={isChapterLoading}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit */}
              <Grid size={12} justifyContent="flex-end" display="flex">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  variant="contained"
                  size="small"
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default CurriculumReportForm;
