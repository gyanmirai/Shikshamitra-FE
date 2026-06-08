'use client';

import { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Chip,
  Checkbox,
  ListItem,
  TextField,
  Autocomplete,
  ListItemButton,
} from '@mui/material';

import SubjectCard from './subjectCardComponent';
import SubjectFormActions from './SubjectFormActions';
import { SubjectAssignmentStatus } from '../../enum/subjectType';
import { useSubjectAssignmentForm } from './hooks/useSubjectAssignmentForm';
import { SubjectAssignmentFormSkeleton } from './components/SubjectAssignmentFormSkeleton';

import type { ISubjectAssignmentFormProps } from './type';

const SubjectAssignmentForm = ({
  onClose,
  data,
  isEdit,
  selectedClass,
  classId,
  subjectTableData,
}: ISubjectAssignmentFormProps) => {
  const isPublished =
    SubjectAssignmentStatus[data?.status as SubjectAssignmentStatus] === 'Published';
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const handleAccordionToggle = useCallback(
    (subjId: string) => setActiveSubjectId((prev) => (prev === subjId ? null : subjId)),
    []
  );

  const {
    formik,
    isLoading,
    isAddLoading,
    isUpdateLoading,
    isSubjectOptionsLoading,
    subjectsOptions,
    classOptions,
    handleSubjectChange,
    handleSubjectFieldChange,
    handleFileUpload,
  } = useSubjectAssignmentForm({ onClose, data, isEdit, selectedClass, classId, subjectTableData });

  const handleRemoveSubject = useCallback(
    (subject: { subjectId: string; electiveGroupId?: string; subjectType: number }) => {
      const removeKey = subject.subjectType === 1 ? subject.electiveGroupId : subject.subjectId;
      const nextSelected = (formik.values.selectedSubjects || []).filter(
        (opt: any) => opt.value !== removeKey
      );
      handleSubjectChange(nextSelected);
    },
    [formik.values.selectedSubjects, handleSubjectChange]
  );

  if (isLoading) return <SubjectAssignmentFormSkeleton />;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                  <CustomSelect
                    options={classOptions}
                    label="Class *"
                    value={formik.values.classId}
                    labelKey="label"
                    valueKey="value"
                    disabled={isEdit}
                    onChange={(val) => {
                      formik.setFieldValue('classId', val);
                      const standard = classOptions.find((c: any) => c.value === val);
                      formik.setFieldValue('className', standard?.label);
                    }}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    error={Boolean(formik.touched.className && formik.errors.className)}
                    helperText={
                      (formik.touched.className && formik.errors.className) || 'Select the class'
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.selectedSubjects && formik.errors.selectedSubjects)}
                >
                  <Autocomplete
                    multiple
                    fullWidth
                    size="small"
                    disableCloseOnSelect
                    disabled={isPublished}
                    options={subjectsOptions}
                    loading={isSubjectOptionsLoading}
                    getOptionLabel={(option: any) => option?.label ?? ''}
                    isOptionEqualToValue={(option, val) => option.value === val.value}
                    value={formik?.values?.selectedSubjects || []}
                    onChange={(_, newValue) => handleSubjectChange(newValue as any)}
                    ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
                    renderTags={(val, getTagProps) =>
                      val.map((option: any, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...tagProps}
                            label={option.label}
                            size="small"
                            variant="soft"
                            sx={{ ml: 0.5 }}
                          />
                        );
                      })
                    }
                    renderOption={(props, option: any, { selected }) => {
                      const { key, ...restProps } = props;
                      return (
                        <ListItem disablePadding key={key} {...restProps}>
                          <ListItemButton
                            disableTouchRipple
                            disableRipple
                            sx={{
                              py: 0.5,
                              px: 1,
                              minHeight: 'auto',
                              '&:hover': { backgroundColor: 'transparent' },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={selected}
                              disableRipple
                              sx={{ mr: 1, p: 0.5 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              {option.label}
                              <Chip
                                size="small"
                                label={option.type === 0 ? 'Core' : 'Elective'}
                                color={option.type === 0 ? 'primary' : 'secondary'}
                                sx={{ ml: 1, height: 20 }}
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subjects *"
                        name="selectedSubjects"
                        error={Boolean(
                          formik.touched.selectedSubjects && formik.errors.selectedSubjects
                        )}
                        helperText={
                          (formik.touched.selectedSubjects && formik.errors.selectedSubjects) ||
                          'Choose subjects'
                        }
                        inputProps={{ ...params.inputProps, readOnly: true }}
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              {formik.values.subjects && formik.values.subjects.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  {formik.values.subjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.subjectNo}
                      index={index}
                      formik={formik}
                      subject={subject}
                      isCore={formik.values.subjectType === 0}
                      isPublished={isPublished}
                      onSubjectChange={handleSubjectFieldChange}
                      onFileUpload={handleFileUpload}
                      activeSubjectId={activeSubjectId}
                      onAccordionToggle={handleAccordionToggle}
                      onRemove={() => handleRemoveSubject(subject)}
                    />
                  ))}
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          <SubjectFormActions
            isEdit={isEdit}
            isAddLoading={isAddLoading}
            isUpdateLoading={isUpdateLoading}
            currentStatus={formik.values.status}
            onCancel={() => onClose(null, false)}
            onSubmit={() => formik.handleSubmit()}
            onDraft={() => {
              formik.setFieldValue('status', PublishUnpublishStatusType.Draft);
              formik.handleSubmit();
            }}
            onPublish={() => {
              formik.setFieldValue('status', PublishUnpublishStatusType.Published);
              formik.handleSubmit();
            }}
          />
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SubjectAssignmentForm;
