'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { validationSchema } from '../validationSchema';
import { getLearningResourceInitialData } from './getLearningResourceInitialData';

import type { IResourceData, ICreateLearningResourcesProps } from '../type';

const CreateNewResource: React.FC<ICreateLearningResourcesProps> = ({
  data,
  onClose,
  onSave,
  isEdit,
  isSaving,
}) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
  }, [medium]);

  const formik = useFormik<IResourceData>({
    initialValues: getLearningResourceInitialData(isEdit, data),
    validationSchema,
    onSubmit: async (values) => {
      const updatedValues = {
        ...values,
        dateUploaded: isEdit ? values.dateUploaded : new Date().toLocaleDateString(), // Only update if not in edit mode
      };
      await onSave(updatedValues);
    },
  });

  const handleRemoveFile = (setFieldValue: (field: string, value: string) => void) => {
    setFieldValue('document', '');
  };

  const handleRemoveAllFiles = (setFieldValue: (field: string, value: string) => void) => {
    setFieldValue('document', '');
  };

  const { data: chapterOptionsData, isFetching: isChapterFetching } = useGetChaptersByStandardQuery(
    { standardId: formik.values.className, subjectId: formik.values.subject },
    { skip: !formik.values.className || !formik.values.subject }
  );

  const { data: subjectOptionsData, isFetching: isSubjectFetching } = useGetSubjectAssignmentsQuery(
    { standardId: formik.values.className },
    { skip: !formik.values.className }
  );

  const subjectOptions =
    subjectOptionsData?.data?.items
      ?.flatMap((item: any) => {
        if (item.status === SubjectAssignmentStatus.Draft) return [];
        return (item.subjects || []).map((subject: any) => ({
          id: subject.subjectId || subject.id,
          name: subject.subjectName || subject.subject?.name || 'Subject',
        }));
      })
      .filter((subject: any) => subject.id) || [];

  const chapterOptions = (
    chapterOptionsData?.items ||
    chapterOptionsData?.data?.items ||
    chapterOptionsData ||
    []
  ).map((chapter: any) => ({
    id: chapter.id,
    name: chapter.chapterName || chapter.name || chapter.title || 'Chapter',
  }));

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <CustomSelect
                    options={allClass}
                    value={formik.values.className}
                    onChange={(val) => {
                      formik.setFieldValue('className', val as string);
                      formik.setFieldValue('subject', '');
                      formik.setFieldValue('chapter', '');
                    }}
                    label="Class *"
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { minWidth: 270, width: '100%' } }}
                    error={!!(formik.touched.className && formik.errors.className) || false}
                    helperText={(formik.touched.className && formik.errors.className) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.subject && formik.errors.subject) || false}
                >
                  <CustomSelect
                    label="Subject *"
                    options={subjectOptions}
                    name="subject"
                    value={formik.values.subject}
                    onChange={(val) => {
                      formik.setFieldValue('subject', val as string);
                      formik.setFieldValue('chapter', '');
                    }}
                    isLoading={isSubjectFetching}
                    disabled={!formik.values.className}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                    error={!!(formik.touched.subject && formik.errors.subject) || false}
                    helperText={(formik.touched.subject && formik.errors.subject) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.chapter && formik.errors.chapter) || false}
                >
                  <CustomSelect
                    label="Chapter"
                    options={chapterOptions}
                    disabled={!formik.values.subject}
                    name="chapter"
                    value={formik.values.chapter || ''}
                    onChange={(val) => formik.setFieldValue('chapter', val as string)}
                    isLoading={isChapterFetching}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                    error={!!(formik.touched.chapter && formik.errors.chapter) || false}
                    helperText={(formik.touched.chapter && formik.errors.chapter) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
                >
                  <TextField
                    disabled={isEdit}
                    label="Resource Title *"
                    size="small"
                    name="resourceTitle"
                    value={formik.values.resourceTitle}
                    onChange={formik.handleChange}
                    fullWidth
                    error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
                    helperText={(formik.touched.resourceTitle && formik.errors.resourceTitle) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Upload
                  thumbnail
                  value={formik.values.document}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles[0];
                    if (!file) return;

                    formik.setFieldValue('document', file);
                  }}
                  multiple={false}
                  onDelete={() => handleRemoveFile(formik.setFieldValue)}
                  onRemoveAll={() => handleRemoveAllFiles(formik.setFieldValue)}
                  error={!!(formik.touched.document && formik.errors.document) || false}
                  helperText={(formik.touched.document && formik.errors.document) || ''}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={data ? GlobalIcons.edit : GlobalIcons.submit} />}
              disabled={isSaving}
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              {data ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default CreateNewResource;
