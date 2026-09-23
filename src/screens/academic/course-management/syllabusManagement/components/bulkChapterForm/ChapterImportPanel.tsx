'use client';

import type { ChangeEvent } from 'react';

import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';

import ChapterImportPreview from './ChapterImportPreview';
import ChapterImportControls from './ChapterImportControls';
import { readChapterImportFile, downloadChapterImportTemplate } from './chapterImport';

import type { ChapterImportDraft, ChapterImportResult } from './chapterImport';

type AcademicYear = {
  startDate?: string;
  endDate?: string;
};

interface ChapterImportPanelProps {
  reservedChapterNumbers: number[];
  academicYear?: AcademicYear;
  onImport: (entries: ChapterImportDraft[]) => void;
}

type ImportPreviewState = Pick<ChapterImportResult, 'rows' | 'errors'> & { fileName: string };

const EMPTY_PREVIEW: ImportPreviewState = { fileName: '', rows: [], errors: [] };

const ChapterImportPanel = ({
  reservedChapterNumbers,
  academicYear,
  onImport,
}: ChapterImportPanelProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewState>(EMPTY_PREVIEW);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    setPreview((current) => ({ ...current, errors: [] }));

    try {
      await downloadChapterImportTemplate();
    } catch {
      setPreview({
        fileName: '',
        rows: [],
        errors: ['The template could not be downloaded. Please try again.'],
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsImporting(true);
    setPreview(EMPTY_PREVIEW);
    onImport([]);

    try {
      const result = await readChapterImportFile(file, reservedChapterNumbers, {
        academicYearStart: academicYear?.startDate,
        academicYearEnd: academicYear?.endDate,
      });
      setPreview({ fileName: file.name, rows: result.rows, errors: result.errors });

      if (result.errors.length === 0) onImport(result.entries);
    } catch {
      setPreview({
        fileName: file.name,
        rows: [],
        errors: ['The file could not be read. Download a fresh template and try again.'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <ChapterImportControls
        isImporting={isImporting}
        isDownloading={isDownloading}
        errors={preview.errors}
        showErrors={preview.errors.length > 0 && preview.rows.length === 0}
        onDownload={handleDownloadTemplate}
        onFileChange={handleFileChange}
      />

      {preview.rows.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <ChapterImportPreview fileName={preview.fileName} rows={preview.rows} />
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            p: 3,
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            borderRadius: 1.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Upload a completed template to preview and validate every chapter before assignment.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ChapterImportPanel;
