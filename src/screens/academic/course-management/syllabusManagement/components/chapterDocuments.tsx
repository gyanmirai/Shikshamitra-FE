import { Grid, Stack } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';

import type { IChapter } from '../type';

const getFileNameFromUrl = (file: string): string => {
  if (!file) return '';

  const normalized = file.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  let rawName = decodeURIComponent(segments[segments.length - 1] || '');

  if (rawName.length > 37 && rawName[36] === '_') {
    const maybeUuid = rawName.substring(0, 36);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(maybeUuid)) {
      rawName = rawName.substring(37);
    }
  }

  return rawName;
};

// Documents panel content
const ChapterDocuments = ({ chapter }: { chapter: IChapter | null }) => {
  const documents = chapter?.documents || [];

  return (
    <Stack spacing={2}>
      <FormSectionHeader
        title="Chapter Documents"
        icon="mdi:file-document-outline"
        descriptionTooltip="Files saved with this chapter are available to preview and download."
      />
      {documents.length === 0 ? (
        <EmptyContent title="No documents uploaded for this chapter" sx={{ py: 2 }} />
      ) : (
        <Grid container spacing={2}>
          {documents.map((docPath, index: number) => {
            const doc = {
              name: getFileNameFromUrl(docPath),
              url: docPath,
              size: '',
            };
            return (
              <Grid size={{ xs: 12 }} key={index}>
                <DocumentCard file={doc} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
};

export default ChapterDocuments;
