import type { FileData } from 'src/components/custom-upload';

import { Iconify } from 'src/components/iconify';
import FileUploader from 'src/components/custom-upload';
import { Box, Paper, Stack, Divider, Typography } from '@mui/material';

interface ChapterAttachmentsSectionProps {
  documents: (File | FileData)[];
  onChange: (files: (File | FileData)[]) => void;
  onPreview: (file: File | FileData) => void;
}

export function ChapterAttachmentsSection({
  documents,
  onChange,
  onPreview,
}: ChapterAttachmentsSectionProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
      }}
    >
      <Stack spacing={0.5} mb={2}>
        <Typography component="h2" variant="subtitle1" fontWeight={700}>
          Attachments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add supporting files and review everything attached to this chapter.
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(260px, 0.85fr) minmax(0, 1.15fr)',
          },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <Box
          component="section"
          aria-labelledby="chapter-upload-heading"
          sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start" mb={1.5}>
            <Iconify
              icon="solar:upload-minimalistic-linear"
              width={20}
              sx={{ color: 'text.secondary' }}
            />
            <Box>
              <Typography
                id="chapter-upload-heading"
                component="h3"
                variant="subtitle2"
                fontWeight={700}
              >
                Upload files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PDF, PNG or JPG · up to 5 MB each
              </Typography>
            </Box>
          </Stack>

          <FileUploader
            multiple
            value={[]}
            onChange={(files) => onChange([...documents, ...files])}
            onPreview={onPreview}
            primaryText="Drop files here or browse"
            secondaryText="You can select multiple files"
            dragProps={{ sx: { minHeight: 144, bgcolor: 'action.hover' } }}
          />
        </Box>

        <Box
          component="section"
          aria-labelledby="chapter-files-heading"
          sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start" mb={1.5}>
            <Iconify icon="solar:documents-linear" width={20} sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography
                id="chapter-files-heading"
                component="h3"
                variant="subtitle2"
                fontWeight={700}
              >
                View attachments
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {documents.length === 0
                  ? 'Files you add will appear here'
                  : `${documents.length} ${documents.length === 1 ? 'file' : 'files'} attached`}
              </Typography>
            </Box>
          </Stack>

          {documents.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ minHeight: 144, borderRadius: 1.5, bgcolor: 'action.hover', px: 2 }}
            >
              <Iconify
                icon="solar:document-text-linear"
                width={28}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No files attached yet
              </Typography>
            </Stack>
          ) : (
            <FileUploader
              multiple
              hideDropzone
              showVisibleDocumentCount={6}
              onChange={onChange}
              onPreview={onPreview}
              value={documents}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
