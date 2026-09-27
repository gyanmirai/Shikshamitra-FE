'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { ISubjectDetail } from '../type';

export const SubjectDocumentSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: '100%', pb: 2, pr: 0.5 }}>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                  border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
                }}
              >
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Scrollbar>
    </Box>
  );
};

const getFileNameFromUrl = (file: string): string => {
  if (!file) return 'Document';

  const normalized = file.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  let rawName = decodeURIComponent(segments[segments.length - 1] || 'Document');

  if (rawName.length > 37 && rawName[36] === '_') {
    const maybeUuid = rawName.substring(0, 36);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(maybeUuid)) {
      rawName = rawName.substring(37);
    }
  }

  return rawName;
};

interface SubjectDocumentProps {
  subject: ISubjectDetail | null;
  isLoading?: boolean;
}

const SubjectDocument: React.FC<SubjectDocumentProps> = ({ subject, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return <SubjectDocumentSkeleton />;
  }

  const documents = subject?.documents || [];

  if (documents.length === 0) {
    return (
      <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            height: '100%',
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
            borderStyle: 'dashed',
          }}
        >
          <Iconify
            icon="solar:bill-list-bold-duotone"
            width={56}
            sx={{ display: 'block', mx: 'auto', color: 'text.disabled', mb: 1.5, opacity: 0.6 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            No Documents Uploaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no reference documents or study materials attached to this subject.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: '100%', pb: 2, pr: 0.5 }}>
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
                  ? typeof docItem.size === 'number'
                    ? `${(docItem.size / (1024 * 1024)).toFixed(2)} MB`
                    : String(docItem.size)
                  : '',
            };

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                <DocumentCard file={doc} />
              </Grid>
            );
          })}
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default React.memo(SubjectDocument);
