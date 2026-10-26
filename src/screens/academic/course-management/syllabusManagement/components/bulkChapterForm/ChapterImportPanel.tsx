'use client';

import type { ChangeEvent } from 'react';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Skeleton } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';

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
    <FormSectionCard
      title="Import Chapters"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Upload an Excel or CSV file to preview and validate chapter details before assignment."
    >
      <ChapterImportControls
        isImporting={isImporting}
        isDownloading={isDownloading}
        errors={preview.errors}
        showErrors={preview.errors.length > 0 && preview.rows.length === 0}
        onDownload={handleDownloadTemplate}
        onFileChange={handleFileChange}
      />

      {isImporting ? (
        <Stack spacing={2} role="status" aria-label="Reading and validating chapter file" aria-busy>
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : preview.rows.length > 0 ? (
        <Box>
          <ChapterImportPreview fileName={preview.fileName} rows={preview.rows} />
        </Box>
      ) : preview.errors.length === 0 ? (
        <EmptyContent
          title={preview.fileName ? 'No chapter rows available.' : 'No chapter file selected.'}
          description="Upload a completed template to preview and validate every chapter before assignment."
        />
      ) : null}
    </FormSectionCard>
  );
};

export default ChapterImportPanel;
