'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { uuidv4 } from 'src/utils/uuidv4';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Alert,
  Button,
  Divider,
  Typography,
  DialogActions,
} from '@mui/material';
import { useAddChapterMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import ChapterCard from './ChapterCard';
import { getBulkChapterValidationSchema } from './validationSchema';

import type { IBulkChapterEntry, IBulkChapterFormProps } from './type';

// ---------------------------------------------------------------------------

const EMPTY_CHAPTERS: IBulkChapterEntry[] = [];

const createEntry = (partial?: Partial<IBulkChapterEntry>): IBulkChapterEntry => ({
  uid: uuidv4(),
  chapterId: undefined,
  chapterNo: '',
  chapterName: '',
  description: '',
  startDate: null,
  endDate: null,
  documents: [],
  ...partial,
});

// ---------------------------------------------------------------------------

const BulkChapterForm: React.FC<IBulkChapterFormProps> = ({
  onClose,
  className,
  subject,
  classId,
  subjectId,
  existingChapters = [],
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [localFileNames, setLocalFileNames] = useState<Record<string, string>>({});

  // ── API hooks ──────────────────────────────────────────────────────────

  const [addChapter, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChapterMutation,
  });

  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  // ── Formik ─────────────────────────────────────────────────────────────

  const formik = useFormik<{ chapters: IBulkChapterEntry[] }>({
    initialValues: { chapters: EMPTY_CHAPTERS },
    validationSchema: getBulkChapterValidationSchema(currentYear),
    onSubmit: async (values) => {
      if (!classId || !subjectId) {
        shikshaMitraToast.error({
          message: 'Class and Subject must be selected before saving chapters.',
        });
        return;
      }

      // Detect duplicate chapter numbers within this batch
      const numbers = values.chapters.map((c) => Number(c.chapterNo));
      const hasDuplicates = numbers.some((n, i) => numbers.indexOf(n) !== i);
      if (hasDuplicates) {
        shikshaMitraToast.error({
          message:
            'Duplicate chapter numbers found in the batch. Each chapter number must be unique.',
        });
        return;
      }

      // Detect conflicts with existing chapters
      const existingNumbers = new Set(existingChapters.map((ch) => ch.chapterNumber));
      const conflicts = values.chapters.filter((c) => existingNumbers.has(Number(c.chapterNo)));
      if (conflicts.length > 0) {
        const conflictNos = conflicts.map((c) => c.chapterNo).join(', ');
        shikshaMitraToast.error({
          message: `Chapter number(s) ${conflictNos} already exist for this subject.`,
        });
        return;
      }

      try {
        const chaptersList = values.chapters.map((entry) => {
          const formattedStartDate = datePickerToDateTimeOffset(entry.startDate);
          const formattedEndDate = datePickerToDateTimeOffset(entry.endDate);

          if (!formattedStartDate || !formattedEndDate) {
            throw new Error('Chapter start and end dates are required.');
          }
          return {
            assignedSubjectId: subjectId,
            chapterNo: Number(entry.chapterNo),
            chapterName: entry.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: entry.description,
            documents: (entry.documents ?? []).filter(
              (doc): doc is string => typeof doc === 'string' && Boolean(doc)
            ),
            publishStatus: 'Draft',
            reviewStatus: 'Not Submitted',
            coverageStatus: 'Not Started',
            resourceStatus: entry.documents?.length ? 'Ready' : 'Missing',
            lessonPlanStatus: 'Not Mapped',
            homeworkStatus: 'Not Mapped',
            assessmentStatus: 'Not Mapped',
            visibility: 'Teacher',
            difficultyLevel: 'Medium',
            bloomLevel: 'Understand',
            healthScore: entry.documents?.length ? 35 : 20,
            questionCount: 0,
            versionLabel: 'v1',
          };
        });

        await addChapter({
          standardId: classId,
          subjectId,
          body: chaptersList,
        }).unwrap();

        shikshaMitraToast.success({
          message: `${values.chapters.length} chapter${values.chapters.length > 1 ? 's' : ''} assigned successfully.`,
        });
        onClose(null, true);
      } catch (error) {
        shikshaMitraToast.error({ message: 'Failed to save chapters. Please try again.' });
      }
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────

  const handleEntryChange = useCallback(
    (uid: string, field: string, value: unknown) => {
      formik.setFieldValue(
        'chapters',
        formik.values.chapters.map((ch) => (ch.uid === uid ? { ...ch, [field]: value } : ch))
      );
    },
    [formik]
  );

  const handleEntryBlur = useCallback(
    (uid: string, field: string) => {
      const index = formik.values.chapters.findIndex((ch) => ch.uid === uid);
      if (index !== -1) {
        formik.setFieldTouched(`chapters[${index}].${field}`, true, true);
      }
    },
    [formik]
  );

  const handleRemoveEntry = useCallback(
    (uid: string) => {
      formik.setFieldValue(
        'chapters',
        formik.values.chapters.filter((ch) => ch.uid !== uid)
      );
      if (activeEntryId === uid) setActiveEntryId(null);
    },
    [formik, activeEntryId]
  );

  const handleAccordionToggle = useCallback(
    (uid: string) => setActiveEntryId((prev) => (prev === uid ? null : uid)),
    []
  );

  const handleFileUpload = useCallback(
    async (uid: string, droppedFiles: any[]) => {
      const newFiles = droppedFiles.filter((f): f is File => f instanceof File);
      const existingFiles = droppedFiles
        .filter((f) => !(f instanceof File))
        .map((f) => (typeof f === 'string' ? f : f.url || f.filePath || ''))
        .filter(Boolean);

      if (newFiles.length === 0) {
        formik.setFieldValue(
          'chapters',
          formik.values.chapters.map((ch) =>
            ch.uid === uid ? { ...ch, documents: existingFiles } : ch
          )
        );
        return;
      }

      try {
        const uploadPromises = newFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('File', file);
          const response = await uploadCurriculumFile(formData).unwrap();
          return { data: response.data, name: file.name };
        });

        const results = await Promise.all(uploadPromises);

        const newDocs = [...existingFiles];
        const nameUpdates: Record<string, string> = {};

        results.forEach((res) => {
          if (res.data) {
            newDocs.push(res.data);
            nameUpdates[res.data] = res.name;
          }
        });

        setLocalFileNames((prev) => ({ ...prev, ...nameUpdates }));
        formik.setFieldValue(
          'chapters',
          formik.values.chapters.map((ch) => (ch.uid === uid ? { ...ch, documents: newDocs } : ch))
        );
        shikshaMitraToast.success({ message: 'Document(s) uploaded successfully' });
      } catch (error) {
        console.error('Upload failed:', error);
        shikshaMitraToast.error({ message: 'Upload failed' });
      }
    },
    [formik, uploadCurriculumFile]
  );

  const handleAddManual = () => {
    const newEntry = createEntry();
    formik.setFieldValue('chapters', [...formik.values.chapters, newEntry]);
    setActiveEntryId(newEntry.uid);
  };

  // ── Errors ─────────────────────────────────────────────────────────────

  const getEntryErrors = (index: number): Record<string, string> | undefined => {
    const err = (formik.errors.chapters as any)?.[index];
    return err && typeof err === 'object' ? err : undefined;
  };

  const getEntryTouched = (index: number): Record<string, boolean> | undefined => {
    const touch = (formik.touched.chapters as any)?.[index];
    return touch && typeof touch === 'object' ? touch : undefined;
  };

  const hasTopLevelError = typeof formik.errors.chapters === 'string' && formik.touched.chapters;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            {/* ── Context Header ─────────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: (t) => `rgba(${t.vars.palette.primary.mainChannel} / 0.06)`,
                border: (t) => `1px solid rgba(${t.vars.palette.primary.mainChannel} / 0.18)`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Iconify
                icon="mdi:book-education-outline"
                width={22}
                sx={{ color: 'primary.main', flexShrink: 0 }}
              />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Class
                </Typography>
                <Chip label={className} size="small" color="primary" variant="soft" />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Subject
                </Typography>
                <Chip label={subject} size="small" color="secondary" variant="soft" />
              </Stack>
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  size="small"
                  variant="soft"
                  color="info"
                  label="Bulk Assignment"
                  icon={<Iconify icon="mdi:layers-plus" width={14} />}
                />
              </Box>
            </Paper>

            {/* ── Top-level validation error ──────────────────────────── */}
            {hasTopLevelError && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
                {formik.errors.chapters as string}
              </Alert>
            )}

            {/* ── Chapter Cards ──────────────────────────────────────── */}
            {formik.values.chapters.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  mb={2}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify
                      icon="mdi:format-list-numbered"
                      width={18}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Chapters to Assign
                    </Typography>
                    <Chip
                      label={formik.values.chapters.length}
                      size="small"
                      color="primary"
                      variant="soft"
                      sx={{ height: 20, fontSize: '0.72rem' }}
                    />
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddManual}
                  >
                    Add Chapter
                  </Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                {formik.values.chapters.map((entry, index) => (
                  <ChapterCard
                    key={entry.uid}
                    entry={entry}
                    index={index}
                    classId={classId}
                    isExpanded={activeEntryId === entry.uid}
                    onToggle={handleAccordionToggle}
                    onRemove={handleRemoveEntry}
                    onChange={handleEntryChange}
                    onBlur={handleEntryBlur}
                    onFileUpload={handleFileUpload}
                    onPreviewDocument={(url) => setPreviewDoc(url)}
                    localFileNames={localFileNames}
                    errors={getEntryErrors(index)}
                    touched={getEntryTouched(index)}
                  />
                ))}
              </Paper>
            )}

            {/* ── Empty state ────────────────────────────────────────── */}
            {formik.values.chapters.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  borderStyle: 'dashed',
                }}
              >
                <Iconify icon="mdi:book-plus-outline" width={48} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No chapters added yet. Click &quot;Add Chapter&quot; to begin.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddManual}
                >
                  Add Chapter
                </Button>
              </Paper>
            )}
          </Scrollbar>

          {/* ── Sticky Footer ─────────────────────────────────────────── */}
          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
              boxShadow: 'var(--shadows-10)',
              bgcolor: 'background.paper',
            }}
          >
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{ transition: 'all 0.2s ease', '&:hover': { boxShadow: 2 } }}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={isAddLoading || formik.isSubmitting}
              type="submit"
              size="small"
              variant="contained"
              disabled={formik.values.chapters.length === 0}
              startIcon={<Iconify icon="mdi:layers-plus" width={18} />}
              sx={{ minWidth: 160, transition: 'all 0.2s ease', '&:hover': { boxShadow: 4 } }}
            >
              Assign {formik.values.chapters.length > 0 ? `${formik.values.chapters.length} ` : ''}
              Chapter{formik.values.chapters.length !== 1 ? 's' : ''}
            </LoadingButton>
          </DialogActions>

          <DocumentPreviewDialog
            open={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            url={previewDoc || ''}
            documentName={previewDoc ? previewDoc.split('/').pop() || '' : ''}
          />
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default BulkChapterForm;
