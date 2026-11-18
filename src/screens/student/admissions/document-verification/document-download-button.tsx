import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Button, MenuItem, IconButton } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useDownloadAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';

export function DocumentDownloadButton({
  evidenceId,
  fileName,
  studentId,
  compact = false,
  label = 'Download document',
  menu = false,
  disabled = false,
  onComplete,
}: {
  evidenceId: string;
  fileName: string;
  studentId?: string;
  compact?: boolean;
  label?: string;
  menu?: boolean;
  disabled?: boolean;
  onComplete?: () => void;
}) {
  const [download] = useDownloadAdmissionDocumentMutation();
  const [downloading, setDownloading] = useState(false);
  const pending = useRef(false);
  const run = async () => {
    if (pending.current || disabled) return;
    pending.current = true;
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
      pending.current = false;
      setDownloading(false);
      onComplete?.();
    }
  };
  if (menu) {
    return (
      <MenuItem disabled={disabled || downloading} onClick={run}>
        <Iconify icon="mdi:download" width={16} sx={{ mr: 1 }} />
        {downloading ? 'Downloading…' : 'Download'}
      </MenuItem>
    );
  }
  if (compact) {
    return (
      <CustomTooltip title={downloading ? 'Downloading…' : label} placement="right" arrow>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the busy tooltip reachable from the keyboard. */}
        <span tabIndex={downloading ? 0 : undefined}>
          <IconButton
            size="small"
            aria-label={label}
            disabled={disabled || downloading}
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
      disabled={disabled || downloading}
      onClick={run}
      startIcon={<Iconify icon="mdi:download" />}
    >
      {downloading ? 'Downloading…' : 'Download'}
    </Button>
  );
}
