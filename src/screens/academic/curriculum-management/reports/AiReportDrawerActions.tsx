
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';

import { isAiReportBusyStage } from './ai-report-activity-config';

import type { AiReportStage } from './hooks/useAiCurriculumReport';

interface Props {
  stage: AiReportStage;
  hasAcademicContext: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
  onEditRequest: () => void;
  onGenerate: () => void;
}

export function AiReportDrawerActions({
  stage,
  hasAcademicContext,
  isDownloading,
  onClose,
  onDownload,
  onEditRequest,
  onGenerate,
}: Props) {
  const isWorking = isAiReportBusyStage(stage);
  if (isWorking) return null;

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {stage === 'planned' ? (
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-new-square-linear" />}
            onClick={onEditRequest}
          >
            Edit request
          </Button>
        ) : (
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="solar:close-circle-linear" />}
            onClick={onClose}
            disabled={isDownloading}
          >
            {stage === 'ready' ? 'Close' : 'Cancel'}
          </Button>
        )}

        {stage === 'ready' ? (
          <LoadingButton
            type="button"
            size="small"
            variant="contained"
            loading={isDownloading}
            startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
            onClick={onDownload}
          >
            Download PDF
          </LoadingButton>
        ) : stage === 'planned' ? (
          <LoadingButton
            type="button"
            size="small"
            variant="contained"
            startIcon={<Iconify icon="solar:document-add-bold" />}
            onClick={onGenerate}
          >
            Generate PDF
          </LoadingButton>
        ) : (
          <LoadingButton
            form="shikshamitra-ai-report-form"
            type="submit"
            size="small"
            variant="contained"
            disabled={!hasAcademicContext}
            startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
          >
            Create report plan
          </LoadingButton>
        )}
      </Stack>
    </Box>
  );
}
