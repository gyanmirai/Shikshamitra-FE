import CloseIcon from '@mui/icons-material/Close';
import FileUploader from 'src/components/custom-upload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import {
  Box,
  Chip,
  Tooltip,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useSubjectCard } from './hooks/useSubjectCard';
import { SubjectSetupSection } from './components/SubjectSetupSection';
import { LearningContentSection } from './components/LearningContentSection';

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
  const {
    primaryTeacherObj,
    setPrimaryTeacherObj,
    secondaryTeacherObjs,
    setSecondaryTeacherObjs,
    fetchPrimaryTeacherOptions,
    fetchSecondaryTeacherOptions,
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

  console.log('subject====', subject);

  const getFileNameFromUrl = (file: string | File): string => {
    if (!file) return '';
    if (typeof file !== 'string') return file.name;
    if (localFileNames && localFileNames[file]) return localFileNames[file];

    const normalized = file.split('?')[0];
    const segments = normalized.split('/').filter(Boolean);
    let rawName = decodeURIComponent(segments[segments.length - 1] || '');

    // Check if name has a standard UUID v4 prefix + underscore (36 chars + 1)
    if (rawName.length > 37 && rawName[36] === '_') {
      const maybeUuid = rawName.substring(0, 36);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(maybeUuid)) {
        rawName = rawName.substring(37);
      }
    }

    return rawName;
  };

  return (
    <>
      <Accordion
        expanded={isExpanded}
        onChange={() => onAccordionToggle(subject.subjectNo ?? '')}
        sx={{
          borderRadius: 1.5,
          border: (theme) =>
            `1px solid ${hasSubjectError ? theme.palette.error.main : theme.palette.divider}`,
          transition: (theme) =>
            theme.transitions.create(['box-shadow', 'border-color', 'background-color']),
          '&:before': { display: 'none' },
          mb: 2,
          overflow: 'hidden',
          '&.Mui-expanded': {
            m: 0,
            mb: 3,
            border: (theme) =>
              `1px solid ${hasSubjectError ? theme.palette.error.main : theme.palette.primary.main}`,
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
            '& .MuiAccordionSummary-content': { alignItems: 'center', display: 'flex', gap: 1 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
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
                {(primaryTeacherObj?.label || subject.primaryTeacher?.name) && (
                  <Chip
                    label={`Lead: ${primaryTeacherObj?.label || subject.primaryTeacher?.name}`}
                    size="small"
                    variant="soft"
                    color="info"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            )}
          </Box>

          {!isPublished && onRemove && (
            <Tooltip
              title={
                subject.subjectType === 1
                  ? "Can't remove, subject belongs to elective group"
                  : 'Remove subject'
              }
            >
              <span>
                <IconButton
                  component="span"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  disabled={subject.subjectType === 1}
                  sx={{
                    mr: 0.5,
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main', bgcolor: 'error.lighter' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </AccordionSummary>

        <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.disabled',
                  fontWeight: 700,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Subject Setup
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>
            <SubjectSetupSection
              index={index ?? 0}
              subjectCode={subject.subjectCode}
              primaryTeacherId={subject.primaryTeacherId}
              secondaryTeacherIds={subject.secondaryTeacherIds}
              primaryTeacherObj={primaryTeacherObj}
              secondaryTeacherObjs={secondaryTeacherObjs}
              fetchPrimaryTeacherOptions={fetchPrimaryTeacherOptions}
              fetchSecondaryTeacherOptions={fetchSecondaryTeacherOptions}
              onPrimaryChange={(newValue) => {
                setPrimaryTeacherObj(newValue);
                formik.setFieldValue(`subjects.${index}.primaryTeacherId`, newValue?.id ?? '');
                formik.setFieldTouched(`subjects.${index}.primaryTeacherId`, true, false);
                formik.setFieldTouched(`subjects.${index}.secondaryTeacherIds`, true, false);
              }}
              onSecondaryChange={(newValues) => {
                setSecondaryTeacherObjs(newValues);
                formik.setFieldValue(
                  `subjects.${index}.secondaryTeacherIds`,
                  newValues.map((item) => item.id)
                );
                formik.setFieldTouched(`subjects.${index}.secondaryTeacherIds`, true, false);
                formik.setFieldTouched(`subjects.${index}.primaryTeacherId`, true, false);
              }}
              getError={getError}
              onChange={handleChange}
              formik={formik}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.disabled',
                  fontWeight: 700,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Learning Content
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>
            <LearningContentSection subject={subject} getError={getError} onChange={handleChange} />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.disabled',
                  fontWeight: 700,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Attachments
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <FileUploader
              multiple
              showVisibleDocumentCount={6}
              value={subject.documents as any[]}
              onChange={handleDropzoneChange}
              onPreview={(file: any) => {
                const url =
                  file instanceof File
                    ? URL.createObjectURL(file)
                    : file?.url || file?.filePath || (typeof file === 'string' ? file : '');
                setPreviewDoc(url);
              }}
              primaryText="Drag & drop documents here, or click to upload"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

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
