import type { CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import { fDate, formatStr } from 'src/utils/format-time';
import { Box, Stack, Paper, Typography } from '@mui/material';

export default function CertificateDocumentPreview({
  certificate,
}: {
  certificate: CertificateResponse;
}) {
  const document = certificate?.template.document;
  const banner = certificate.branding?.bannerDataUrl;
  const logo = certificate.branding?.logoDataUrl;
  const number = certificate?.certificateId ? certificate.certificateNo : 'Assigned on generation';
  const header = certificate
    ? certificate.certificateId
      ? certificate.template.renderedHeaderContent
      : certificate.template.renderedHeaderContent.replaceAll(certificate.certificateNo, number)
    : '';
  const showNumber = !header.includes(number);
  const issueDateLabel = certificate ? fDate(certificate.issueDate, formatStr.split.date) : null;
  const showDate =
    certificate &&
    !header.includes(certificate.certificateData.IssueDate || certificate.issueDate.slice(0, 10)) &&
    (!issueDateLabel || !header.includes(issueDateLabel));
  return (
    <Paper
      variant="outlined"
      aria-label={`Certificate preview for ${certificate.student.studentName}`}
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: 'common.white',
        color: 'grey.900',
        borderColor: 'grey.300',
        borderRadius: 0.5,
        width: 1,
        maxWidth: 794,
        mx: 'auto',
        aspectRatio: '210 / 297',
        display: 'flex',
        flexDirection: 'column',
        overflowWrap: 'anywhere',
        colorScheme: 'light',
      }}
    >
      {(banner || logo) && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={(banner || logo)!}
            alt={banner ? 'School letterhead' : 'School logo'}
            sx={
              banner
                ? { width: 1, maxHeight: 144, objectFit: 'contain' }
                : { width: 72, height: 72, objectFit: 'contain' }
            }
          />
        </Box>
      )}
      {document ? (
        <Stack spacing={2} useFlexGap sx={{ flex: 1 }}>
          {!banner && (
            <>
              <Typography variant="h5" align="center">
                {certificate.organization?.organizationName ||
                  certificate.certificateData.OrganizationName}
              </Typography>
              {certificate.organization?.address && (
                <Typography variant="body2" align="center" sx={{ color: 'grey.600' }}>
                  {certificate.organization.address}
                </Typography>
              )}
            </>
          )}
          <Typography
            variant="h6"
            align="center"
            sx={{
              borderTop: 1,
              borderColor: 'grey.400',
              pt: 2,
              textTransform: 'uppercase',
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: 0.5,
            }}
          >
            {document.title}
          </Typography>
          <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Typography variant="caption">Certificate no: {number}</Typography>
            <Typography variant="caption">
              Issue date: {issueDateLabel || certificate.issueDate.slice(0, 10)}
            </Typography>
          </Stack>
          {certificate.template.headerContent !==
            `{{OrganizationName}}\n${document.title}\nCertificate No: {{CertificateNo}}\nIssue Date: {{IssueDate}}` && (
            <Typography sx={{ whiteSpace: 'pre-line' }}>{header}</Typography>
          )}
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            {document.body}
          </Typography>
          <Box component="dl" sx={{ m: 0 }}>
            {document.particulars.map((field) => (
              <Box
                key={field.label}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, .95fr) minmax(0, 1fr)' },
                  gap: 1,
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: 'grey.300',
                }}
              >
                <Typography component="dt" variant="body2" sx={{ color: 'grey.600' }}>
                  {field.label}
                </Typography>
                <Typography
                  component="dd"
                  variant="body2"
                  sx={{ m: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
                >
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Box>
          {certificate.template.footerContent !== 'Reason: {{Reason}}\nPrincipal Signature' && (
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {certificate.template.renderedFooterContent}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" gap={2} sx={{ pt: 5, mt: 'auto' }}>
            <Typography variant="body2">School seal</Typography>
            <Typography variant="body2" sx={{ borderTop: 1, borderColor: 'grey.400', pt: 1 }}>
              Principal / authorised signatory
            </Typography>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Typography variant="h6" align="center" sx={{ whiteSpace: 'pre-line' }}>
            {header}
          </Typography>
          {(showNumber || showDate) && (
            <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
              {showNumber && <Typography variant="body2">Certificate number: {number}</Typography>}
              {showDate && (
                <Typography variant="body2">
                  Issue date: {issueDateLabel || certificate.issueDate.slice(0, 10)}
                </Typography>
              )}
            </Stack>
          )}
          <Typography variant="body1" sx={{ lineHeight: 2 }}>
            Student: <strong>{certificate.student.studentName}</strong>
            <br />
            GR number: {certificate.student.grNo || certificate.certificateData.GRNo || '—'}
            <br />
            Class: {certificate.student.className || '—'} · Division:{' '}
            {certificate.student.divisionName || '—'}
            <br />
            Academic year: {certificate.certificateData.AcademicYear || '—'}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', pt: 3 }}>
            {certificate.template.renderedFooterContent}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
