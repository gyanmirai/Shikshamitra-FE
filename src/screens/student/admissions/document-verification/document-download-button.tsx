import { useState } from 'react';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useDownloadAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';

export function DocumentDownloadButton({
  evidenceId,
  fileName,
  studentId,
}: {
  evidenceId: string;
  fileName: string;
  studentId?: string;
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
