import { getIn } from 'formik';
import { useState } from 'react';
import { Editor } from 'src/components/editor';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { fileData } from 'src/components/file-thumbnail';
import { SingleFilePreview } from 'src/components/upload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Grid,
  Chip,
  Accordion,
  TextField,
  Typography,
  FormHelperText,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import TeacherSelectionFields from './TeacherSelectionFields';
import { useTeacherSelection } from './hooks/useTeacherSelection';

import type { ISubjectCardProps } from '../type';

const SubjectCard: React.FC<ISubjectCardProps> = ({
  formik,
  subject,
  isPublished,
  onSubjectChange,
  index,
  onFileUpload,
}) => {
  const {
    primaryTeacherObj,
    setPrimaryTeacherObj,
    secondaryTeacherObjs,
    setSecondaryTeacherObjs,
    fetchPrimaryTeacherOptions,
    fetchSecondaryTeacherOptions,
  } = useTeacherSelection({
    primaryTeacherId: subject.primaryTeacher,
    secondaryTeacherIds: subject.secondaryTeacher,
  });

  const [isExpanded, setIsExpanded] = useState(subject.isSubjectOpen || false);
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();

  const handleChange = (field: string, value: unknown) => {
    if (!subject?.subjectNo) return;
    onSubjectChange(subject.subjectNo, field, value);
  };

  const getError = (field: string) =>
    getIn(formik.touched, `subjects[${index}].${field}`) &&
    getIn(formik.errors, `subjects[${index}].${field}`);

  return (
    <>
      <Accordion
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
        sx={{
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.customShadows?.z1 || theme.shadows[1],
          transition: (theme) => theme.transitions.create(['box-shadow', 'background-color']),
          '&:hover': {
            boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[4],
          },
          '&:before': { display: 'none' },
          mb: 2,
          overflow: 'hidden',
          '&.Mui-expanded': {
            m: 0,
            mb: 3,
            border: (theme) => `1px solid ${theme.palette.primary.main}`,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            py: 1,
            px: 2,
            pb: 0,
            pt: 0,
            bgcolor: (theme) => (isExpanded ? theme.palette.action.hover : 'transparent'),
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              display: 'flex',
              gap: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <SubjectColorIndicator color={subject?.subjectColor} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {subject.subjectName || 'Untitled Subject'}
            </Typography>

            {!isExpanded && (
              <Box sx={{ display: 'flex', gap: 1, ml: 1, flexWrap: 'wrap' }}>
                {subject.subjectCode && (
                  <Chip
                    label={`Code: ${subject.subjectCode}`}
                    size="small"
                    variant="soft"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
                {subject.primaryTeacher && (
                  <Chip
                    label={`Lead: ${primaryTeacherObj?.label || subject.primaryTeacher}`}
                    size="small"
                    variant="soft"
                    color="info"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!getError('subjectCode')}>
                <TextField
                  fullWidth
                  label="Subject Code *"
                  placeholder="e.g. MATH-101"
                  size="small"
                  value={subject.subjectCode || ''}
                  onChange={(e) => {
                    const uppercaseValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9\-_]/g, '');
                    formik.setFieldValue(`subjects.${index}.subjectCode`, uppercaseValue);
                  }}
                  error={!!getError('subjectCode')}
                  helperText={getError('subjectCode')}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TeacherSelectionFields
                index={index ?? 0}
                primaryTeacherObj={primaryTeacherObj}
                secondaryTeacherObjs={secondaryTeacherObjs}
                secondaryTeacherIds={subject.secondaryTeacher}
                primaryTeacherId={subject.primaryTeacher}
                fetchPrimaryTeacherOptions={fetchPrimaryTeacherOptions}
                fetchSecondaryTeacherOptions={fetchSecondaryTeacherOptions}
                onPrimaryChange={(newValue) => {
                  setPrimaryTeacherObj(newValue);
                  formik.setFieldValue(`subjects.${index}.primaryTeacher`, newValue?.id ?? '');
                  formik.setFieldTouched(`subjects.${index}.primaryTeacher`, true, false);
                  formik.setFieldTouched(`subjects.${index}.secondaryTeacher`, true, false);
                }}
                onSecondaryChange={(newValues) => {
                  setSecondaryTeacherObjs(newValues);
                  formik.setFieldValue(
                    `subjects.${index}.secondaryTeacher`,
                    newValues.map((item) => item.id)
                  );
                  formik.setFieldTouched(`subjects.${index}.secondaryTeacher`, true, false);
                  formik.setFieldTouched(`subjects.${index}.primaryTeacher`, true, false);
                }}
                getError={getError}
              />
            </Grid>

            {[
              { label: 'Learning Goals', field: 'learningGoal' },
              { label: 'Prerequisites', field: 'prerequisites' },
              { label: 'Description', field: 'description' },
            ].map((section) => (
              <Grid key={section.field} size={{ xs: 12 }}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {section.label}
                  </Typography>
                </Box>
                <ShakingTextField error={!!getError(section.field)}>
                  <Editor
                    onChange={(value) => handleChange(section.field, value)}
                    value={
                      ((subject as unknown as Record<string, unknown>)[section.field] as string) ||
                      ''
                    }
                    placeholder={`Enter ${section.label.toLowerCase()}...`}
                    error={!!getError(section.field)}
                    sx={{
                      borderRadius: 1,
                      border: (theme) =>
                        `1px solid ${
                          getError(section.field) ? theme.palette.error.main : theme.palette.divider
                        }`,
                      '&:hover': { borderColor: 'text.secondary' },
                      '&:focus-within': { borderColor: 'primary.main', borderWidth: 2 },
                      maxHeight: 250,
                      overflow: 'hidden',
                    }}
                  />
                  {getError(section.field) && (
                    <FormHelperText error sx={{ ml: 1 }}>
                      {getError(section.field)}
                    </FormHelperText>
                  )}
                </ShakingTextField>
              </Grid>
            ))}

            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <CustomUpload
                multiple
                previewCount={6}
                onChange={(files) => onFileUpload(files, index)}
                value={subject.documents}
                label="Attach Support Documents"
                outputFormat="file"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <CustomDialog
        open={previewDialog.value}
        handleClose={() => {
          setPreviewFile(null);
          previewDialog.onFalse();
        }}
        title={previewFile ? fileData(previewFile).name : ''}
        maxWidth="sm"
      >
        <Scrollbar sx={{ height: 600, maxHeight: '100%' }}>
          {previewFile && <SingleFilePreview file={previewFile} />}
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default SubjectCard;
