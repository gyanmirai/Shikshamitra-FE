import { Box, Grid, Typography } from '@mui/material';
import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { ISubjectDetail } from '../type';

export const documentsList: Array<{ name: string; url: string; size?: string }> = [];

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
const SubjectDocument = ({ subject }: { subject: ISubjectDetail | null }) => {
  const documents = subject?.documents || [];

  if (documents.length === 0) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No documents uploaded for this subject.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {documents.map((docItem: any, index: number) => {
          const docUrl =
            typeof docItem === 'string' ? docItem : docItem?.url || docItem?.filePath || '';
          const docName =
            typeof docItem === 'string' ? getFileNameFromUrl(docItem) : docItem?.name || 'Document';
          const doc = {
            name: docName,
            url: docUrl,
            size:
              typeof docItem === 'object' && docItem?.size
                ? `${(docItem.size / (1024 * 1024)).toFixed(2)} MB`
                : '',
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
export default SubjectDocument;
