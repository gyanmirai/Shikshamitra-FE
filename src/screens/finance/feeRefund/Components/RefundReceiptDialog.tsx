'use client';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import { Alert, Stack, Button, Skeleton, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useDownloadRefundReceiptPdfMutation } from 'src/redux/finance/RefundManagement/feeRefundManage';

interface Props {
  refundId: string;
  provisional: boolean;
  onClose: () => void;
}

export default function RefundReceiptDialog({ refundId, provisional, onClose }: Props) {
  const [download] = useDownloadRefundReceiptPdfMutation();
  const [document, setDocument] = useState<{ url: string; fileName: string } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const title = provisional ? 'Provisional Refund Receipt' : 'Refund Receipt';

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    setDocument(null);
    setError(false);
    download(refundId)
      .unwrap()
      .then(({ blob, fileName }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setDocument({ url: objectUrl, fileName });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [download, refundId, provisional, attempt]);

  return (
    <CustomDialog
      open
      title={title}
      titleInfo="Preview and download the saved refund payment document."
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        {error ? (
          <Alert
            severity="error"
            action={<Button onClick={() => setAttempt((value) => value + 1)}>Retry</Button>}
          >
            Unable to load the refund receipt. Please try again.
          </Alert>
        ) : document ? (
          <PdfPreview url={document.url} title={title} showPageText={false} />
        ) : (
          <Stack spacing={2} role="status" aria-label="Loading refund receipt">
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={350} />
          </Stack>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button
          component="a"
          href={document?.url}
          download={document?.fileName}
          disabled={!document}
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:download" />}
        >
          Download PDF
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
