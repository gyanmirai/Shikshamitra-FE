import { Box, Grid, Typography } from '@mui/material';
import DocumentCard from 'src/components/preview-document/DocumentCard';

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

  if (documents.length === 0) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No documents uploaded for this chapter.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Grid container spacing={1}>
        {documents.map((docPath, index: number) => {
          const doc = {
            name: getFileNameFromUrl(docPath),
            url: docPath,
            size: '',
          };
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <DocumentCard file={doc} />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ChapterDocuments;
