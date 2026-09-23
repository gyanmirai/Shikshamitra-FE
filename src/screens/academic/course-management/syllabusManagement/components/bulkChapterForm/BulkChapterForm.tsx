'use client';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import ChapterImportPanel from './ChapterImportPanel';
import BulkChapterContextHeader from './BulkChapterContextHeader';
import { useBulkChapterImportForm } from './useBulkChapterImportForm';

import type { IBulkChapterFormProps } from './type';

const BulkChapterForm = ({
  onClose,
  className,
  subject,
  classId,
  subjectId,
  existingChapters = [],
}: IBulkChapterFormProps) => {
  const { formik, currentYear, handleImport, isSaving, reservedChapterNumbers } =
    useBulkChapterImportForm({ classId, subjectId, existingChapters, onClose });

  const chapterCount = formik.values.chapters.length;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%" minHeight={0}>
          <Scrollbar sx={{ height: '100%', minHeight: 0 }}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <BulkChapterContextHeader className={className} subject={subject} />
              <ChapterImportPanel
                academicYear={currentYear ?? undefined}
                reservedChapterNumbers={reservedChapterNumbers}
                onImport={handleImport}
              />
            </Box>
          </Scrollbar>

          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              borderTop: 1,
              borderColor: 'divider',
              boxShadow: 'var(--shadows-10)',
              bgcolor: 'background.paper',
            }}
          >
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              disabled={isSaving}
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={isSaving}
              type="submit"
              size="small"
              variant="contained"
              disabled={chapterCount === 0 || !formik.isValid}
              startIcon={<Iconify icon="mdi:layers-plus" width={18} />}
              sx={{ minWidth: 160 }}
            >
              Assign {chapterCount > 0 ? `${chapterCount} ` : ''}Chapter
              {chapterCount === 1 ? '' : 's'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default BulkChapterForm;
