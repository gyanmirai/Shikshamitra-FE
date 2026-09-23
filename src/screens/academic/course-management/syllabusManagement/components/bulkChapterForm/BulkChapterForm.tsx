'use client';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import ChapterImportPanel from './ChapterImportPanel';
import BulkChapterContextHeader from './BulkChapterContextHeader';
import { useBulkChapterImportForm } from './useBulkChapterImportForm';

import type { IBulkChapterFormProps } from './type';

const BulkChapterForm = ({
  open,
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

  const closeAndReset = () => {
    formik.resetForm();
    onClose();
  };

  const handleCancel = () => {
    if (formik.dirty && !window.confirm('Are you sure you want to leave this page?')) return;
    closeAndReset();
  };

  return (
    <CustomDialog
      open={open}
      title="Bulk add chapters"
      handleClose={closeAndReset}
      maxWidth="lg"
      hasUnsavedChanges={formik.dirty}
      paperProps={{
        sx: {
          maxHeight: { xs: '100%', sm: 'calc(100vh - 48px)' },
        },
      }}
    >
      <DialogScrollContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <BulkChapterContextHeader className={className} subject={subject} />
          <ChapterImportPanel
            academicYear={currentYear ?? undefined}
            reservedChapterNumbers={reservedChapterNumbers}
            onImport={handleImport}
          />
        </Box>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          color="inherit"
          disabled={isSaving}
          onClick={handleCancel}
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
          onClick={() => formik.submitForm()}
        >
          Assign {chapterCount > 0 ? `${chapterCount} ` : ''}Chapter
          {chapterCount === 1 ? '' : 's'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default BulkChapterForm;
