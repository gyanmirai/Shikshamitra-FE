import { useId } from 'react';
import { Box, Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionCard } from 'src/components/form-section-card';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';

import { useSubjectCard } from './hooks/useSubjectCard';
import { getSubjectDocumentName } from './subjectDocumentName';
import { SubjectCardHeader } from './components/SubjectCardHeader';
import { SubjectSetupSection } from './components/SubjectSetupSection';
import { LearningContentSection } from './components/LearningContentSection';
import { SubjectAttachmentsSection } from './components/SubjectAttachmentsSection';

import type { ISubjectCardProps } from '../type';

const SubjectCard: React.FC<ISubjectCardProps> = ({
  formik,
  subject,
  isPublished,
  onSubjectChange,
  index,
  onFileUpload,
  activeSubjectId,
  onAccordionToggle,
  onRemove,
}) => {
  const headerId = useId();
  const contentId = `${headerId}-content`;
  const {
    teacherObjs,
    setTeacherObjs,
    fetchTeacherOptions,
    previewDoc,
    setPreviewDoc,
    handleDropzoneChange,
    handleRemoveFile,
    localFileNames,
    isUploading,
    isExpanded,
    handleChange,
    getError,
    hasSubjectError,
  } = useSubjectCard({
    formik,
    subject,
    index,
    onSubjectChange,
    activeSubjectId,
  });

  const getFileNameFromUrl = (file: string | File) => getSubjectDocumentName(file, localFileNames);

  return (
    <>
      <Box
        sx={{
          border: 1,
          borderColor: hasSubjectError ? 'error.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CustomAccordion
          title={subject.subjectName || 'Untitled Subject'}
          expanded={isExpanded}
          onChange={() => onAccordionToggle(subject.subjectNo ?? '')}
          summary={
            <SubjectCardHeader
              id={headerId}
              aria-controls={contentId}
              subject={subject}
              expanded={isExpanded}
              isPublished={isPublished}
              onToggle={() => onAccordionToggle(subject.subjectNo ?? '')}
              onRemove={onRemove}
            />
          }
          content={
            <Stack spacing={2}>
              <FormSectionCard
                title="Subject Setup"
                icon={GlobalIcons.assigned}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Set the subject code and select its teaching team for this class."
              >
                <SubjectSetupSection
                  subjectCode={subject.subjectCode}
                  teacherObjs={teacherObjs}
                  fetchTeacherOptions={fetchTeacherOptions}
                  onTeachersChange={(newValues) => {
                    formik.setStatus(undefined);
                    setTeacherObjs(newValues);
                    formik.setFieldValue(
                      `subjects.${index}.teacherIds`,
                      newValues.map((item) => item.id)
                    );
                    formik.setFieldValue(
                      `subjects.${index}.teachers`,
                      newValues.map(({ id, name, employeeCode }) => ({ id, name, employeeCode }))
                    );
                    formik.setFieldTouched(`subjects.${index}.teacherIds`, true, false);
                  }}
                  getError={getError}
                  onChange={handleChange}
                />
              </FormSectionCard>

              <FormSectionCard
                title="Learning Content"
                icon={GlobalIcons.notebook}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Describe the learning goals, prerequisites, and scope for this subject."
              >
                <LearningContentSection
                  subject={subject}
                  getError={getError}
                  onChange={handleChange}
                />
              </FormSectionCard>

              <SubjectAttachmentsSection
                documents={subject.documents}
                getFileName={getFileNameFromUrl}
                onChange={handleDropzoneChange}
                isUploading={isUploading}
                onPreview={setPreviewDoc}
              />
            </Stack>
          }
        />
      </Box>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc || ''}
        documentName={previewDoc ? getFileNameFromUrl(previewDoc) : ''}
      />
    </>
  );
};

export default SubjectCard;
