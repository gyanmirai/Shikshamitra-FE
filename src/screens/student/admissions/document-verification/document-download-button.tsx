import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Button, IconButton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useDownloadAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';

export function DocumentDownloadButton({
  evidenceId,
  fileName,
  studentId,
  compact = false,
  label = 'Download document',
}: {
  evidenceId: string;
  fileName: string;
  studentId?: string;
  compact?: boolean;
  label?: string;
}) {
  const [download] = useDownloadAdmissionDocumentMutation();
  const [downloading, setDownloading] = useState(false);
  const run = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await download({ evidenceId, fileName, studentId }).unwrap();
    } catch (failure) {
      const { detail } = parseApiProblemDetail(failure);
      shikshaMitraToast.error({
        message:
          detail === 'Something went wrong'
            ? 'Unable to download the document. Please try again.'
            : detail,
      });
    } finally {
      setDownloading(false);
    }
  };
  if (compact) {
    return (
      <CustomTooltip title={downloading ? 'Downloading…' : label} placement="right" arrow>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the busy tooltip reachable from the keyboard. */}
        <span tabIndex={downloading ? 0 : undefined}>
          <IconButton
            size="small"
            aria-label={label}
            disabled={downloading}
            onClick={run}
            sx={{ p: 0, width: 30, height: 30 }}
          >
            <Iconify icon="mdi:download" width={16} />
          </IconButton>
        </span>
      </CustomTooltip>
    );
  }
  return (
    <Button
      size="small"
      disabled={downloading}
      onClick={run}
      startIcon={<Iconify icon="mdi:download" />}
    >
      {downloading ? 'Downloading…' : 'Download'}
    </Button>
  );
}
