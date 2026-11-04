import type { ConcessionRequestDetail } from 'src/redux/finance/ConcessionManagement/types';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { DetailSection } from 'src/components/detail-view';
import { Box, Stack, Tooltip, Typography, IconButton } from '@mui/material';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';

export default function ConcessionRequestEvidence({
  detail,
  canViewDocuments,
}: {
  detail: ConcessionRequestDetail;
  canViewDocuments: boolean;
}) {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const documents = [
    ...detail.requiredDocuments.map((requirement) => {
      const uploaded = detail.submittedDocuments.find(
        (doc) => doc.documentId === requirement.documentId
      );
      return { ...requirement, url: uploaded?.url || requirement.url };
    }),
    ...detail.submittedDocuments
      .filter(
        (doc) =>
          !detail.requiredDocuments.some((required) => required.documentId === doc.documentId)
      )
      .map((doc) => ({ ...doc, isRequired: false, isUploaded: true })),
  ];
  return (
    <>
      <DetailSection
        title="Supporting Documents"
        icon={GlobalIcons.doc}
        helpText="Required and uploaded evidence for this request. Document previews follow your access permissions."
      >
        <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {documents.map((doc) => (
            <Stack
              component="li"
              key={doc.documentId}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {doc.documentName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.isRequired ? 'Required' : 'Optional'}
                </Typography>
              </Box>
              <Label color={doc.isUploaded ? 'success' : doc.isRequired ? 'warning' : 'default'}>
                {doc.isUploaded ? 'Uploaded' : 'Not uploaded'}
              </Label>
              {doc.isUploaded && doc.url && canViewDocuments && (
                <Tooltip title={`View ${doc.documentName}`}>
                  <IconButton
                    size="small"
                    aria-label={`View ${doc.documentName}`}
                    onClick={() => setPreviewDoc({ url: doc.url!, name: doc.documentName })}
                    sx={{ '@media (pointer: coarse)': { width: 44, height: 44 } }}
                  >
                    <Iconify icon={GlobalIcons.eye} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          ))}
          {documents.length === 0 && (
            <Typography component="li" variant="body2" color="text.secondary">
              No supporting documents required.
            </Typography>
          )}
        </Stack>
      </DetailSection>
      {!!detail.refundRequests?.length && (
        <DetailSection
          title="Linked Refunds"
          icon={GlobalIcons.retrunIcon}
          helpText="Refund requests linked to this concession. Their approval and payout are handled separately."
        >
          <Stack spacing={1}>
            {detail.refundRequests.map((refund) => (
              <Stack
                key={refund.refundRequestId}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {refund.voucherNumber} · {formatNumber(refund.amount, 'INR')}
                </Typography>
                <Label color={refund.status === 'Processed' ? 'success' : 'default'}>
                  {refund.status}
                </Label>
              </Stack>
            ))}
          </Stack>
        </DetailSection>
      )}
      {canViewDocuments && (
        <DocumentPreviewDialog
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc?.url || ''}
          documentName={previewDoc?.name}
          directUrl
        />
      )}
    </>
  );
}
