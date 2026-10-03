'use client';

import type { RootState } from 'src/redux/store';
import type { PayslipDocument } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { ExpandMore } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { skipToken } from '@reduxjs/toolkit/query';
import { useRef, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Box, Stack, Alert, Button, Skeleton, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';
import { useGetEmployeeSalarySlipQuery, useLazyGetEmployeeSalarySlipPreviewPdfQuery } from 'src/redux/runPayroll/runPayrollApi';
import { useSendPayslipMutation, useGetPayslipDocumentsQuery, useGetPayslipDeliveriesQuery, useLazyGetPayslipDocumentPdfQuery } from 'src/redux/hr/payslip-api';

import PayslipSettingsForm from './payslip-settings-form';
import { usePayslipActions } from './use-payslip-actions';
import PayslipCorrectionDialog from './payslip-correction-dialog';
import PayslipDocumentActionDialog from './payslip-document-action-dialog';
import { buildPayslipSelection, payslipMatchesSelection, buildPayslipEmployeeSearch } from './payslip-selection';

const deliveryLabels = {
  QUEUED: 'Queued', PROCESSING: 'Sending', PROVIDER_ACCEPTED: 'Accepted by email provider',
  FAILED: 'Failed', UNCERTAIN: 'Send outcome unknown', SUPERSEDED: 'Document replaced',
};

const PayslipPdfViewer = dynamic(() => import('./payslip-pdf-viewer'), { ssr: false });

export default function PaySlipGenerationScreen() {
  const printContentRef = useRef<HTMLDivElement>(null);
  const [renderedPdfUrl, setRenderedPdfUrl] = useState<string | null>(null);
  const [printError, setPrintError] = useState(false);
  const printPdf = useReactToPrint({ contentRef: printContentRef,
    documentTitle: 'Payslip',
    pageStyle: '@page { size: A4; margin: 0; } @media print { body { margin: 0; } }',
    onPrintError: () => setPrintError(true),
  });
  const [employee, setEmployee] = useState<{ id: string; label: string } | null>(null);
  const [month, setMonth] = useState<dayjs.Dayjs | null>(dayjs());
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, `${hrPermissions.payroll.generateSalarySlip}.View`);
  const canSend = hasGrantedPermission(permissions, `${hrPermissions.payroll.generateSalarySlip}.Add`);
  const canCorrect = canSend && hasGrantedPermission(permissions, `${hrPermissions.payroll.runPayroll}.View`)
    && hasGrantedPermission(permissions, hrPermissions.payroll.runPayrollAdjustments);
  const canReviewCorrection = canCorrect && hasGrantedPermission(permissions, `${hrPermissions.payroll.runPayroll}.Add`);
  const canApplyCorrection = canCorrect && hasGrantedPermission(permissions, hrPermissions.payroll.runPayrollLock);
  const [correctionDocument, setCorrectionDocument] = useState<PayslipDocument | null>(null);
  const [searchEmployees] = useLazyGetEmployeeQuery();
  const selection = buildPayslipSelection(employee?.id, month);
  const args = selection && canView ? { employeeId: selection.employeeId, monthYear: selection.monthYear } : skipToken;
  const slips = useGetEmployeeSalarySlipQuery(args);
  const versions = useGetPayslipDocumentsQuery(args);
  const slip = payslipMatchesSelection(slips.currentData, selection) ? slips.currentData : null;
  const currentDocument = versions.currentData?.find((version) => version.isCurrent);
  const [viewedVersion, setViewedVersion] = useState<{ selection: string; id: string } | null>(null);
  const displayedDocument = viewedVersion && viewedVersion.selection === selection?.key
    ? versions.currentData?.find((version) => version.id === viewedVersion.id) ?? currentDocument : currentDocument;
  const viewingCurrent = !!displayedDocument?.isCurrent;
  const [action, setAction] = useState<{ documentId: string; mode: 'payment' | 'replace' } | null>(null);
  const [resendConfirmation, setResendConfirmation] = useState<string | null>(null);
  const deliveries = useGetPayslipDeliveriesQuery(currentDocument?.salarySlipId ?? skipToken, {
    pollingInterval: 5000, skipPollingIfUnfocused: true,
  });
  const [loadDocument] = useLazyGetPayslipDocumentPdfQuery();
  const [loadPreview] = useLazyGetEmployeeSalarySlipPreviewPdfQuery();
  const [send, sending] = useSendPayslipMutation();
  const [sendKey, setSendKey] = useState<{ documentId: string; key: string } | null>(null);
	const currentDocumentId = displayedDocument?.id;
	const selectedEmployeeId = selection?.employeeId;
	const selectedMonth = selection?.monthYear;
	const hasSlip = !!slip && versions.isSuccess && !versions.isError;
  const loadPdf = useCallback(async () => {
    if (currentDocumentId) return loadDocument(currentDocumentId).unwrap();
    if (selectedEmployeeId && selectedMonth && hasSlip) return loadPreview({ employeeId: selectedEmployeeId, monthYear: selectedMonth }).unwrap();
    return null;
  }, [currentDocumentId, loadDocument, loadPreview, selectedEmployeeId, selectedMonth, hasSlip]);
  const documentKey = displayedDocument?.id ?? (hasSlip ? selection?.key ?? null : null);
  const actions = usePayslipActions({ selectionKey: documentKey, loadPdf: documentKey ? loadPdf : null,
    fileName: `Payslip_${month?.format('YYYY-MM') ?? ''}_${displayedDocument ? `R${displayedDocument.revision}` : 'Preview'}.pdf` });
  const previousAttempts = deliveries.currentData?.filter((attempt) => attempt.documentId === currentDocument?.id) ?? [];
  const queued = previousAttempts.some((attempt) => ['QUEUED', 'PROCESSING'].includes(attempt.status));

  const handleSend = async () => {
    if (!currentDocument || !viewingCurrent || sending.isLoading || queued) return;
    const key = sendKey?.documentId === currentDocument.id ? sendKey.key : crypto.randomUUID();
    setSendKey({ documentId: currentDocument.id, key });
    try {
      await send({ documentId: currentDocument.id, idempotencyKey: key }).unwrap();
      setSendKey(null);
      setResendConfirmation(null);
      shikshaMitraToast.success({ message: 'Payslip queued for email.' });
    } catch (error) { shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Payslip could not be queued.' }); }
  };

  return (
    <Stack spacing={1}>
      <CustomBreadcrumbs heading="Payslips" links={[{ name: 'HR/Staff', href: hrPaths.dashboard },
        { name: 'Payroll Management', href: hrPaths.payroll.runPayroll }, { name: 'Payslips' }]} />
      {!canView ? <Alert severity="info">You do not have access to payslips.</Alert> : <>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <PaginatedSearchSelect label="Employee" value={employee} size="small"
            sx={{ width: { xs: '100%', md: 320 } }} minChars={2} debounceMs={400}
            fetchOptions={async (query, page) => {
              const result = await searchEmployees(buildPayslipEmployeeSearch(query, page)).unwrap();
              return { data: result.items.map((item: { id: string; fullName: string }) => ({ id: item.id, label: item.fullName })),
                hasMore: result.currentPage !== result.totalPages };
            }} onChange={(_, value) => setEmployee(value)} getOptionLabel={(option: { label: string }) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id} />
          <DatePicker label="Pay period" views={['month', 'year']} value={month} onChange={setMonth}
            slotProps={{ textField: { size: 'small' } }} sx={{ width: { xs: '100%', md: 220 } }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ ml: { md: 'auto' } }}>
            <Button size="small" disabled={!actions.pdfUrl || renderedPdfUrl !== actions.pdfUrl}
              onClick={() => { setPrintError(false); printPdf(); }}>Print</Button>
            <Button size="small" variant="outlined" disabled={!actions.pdfUrl} onClick={actions.handleDownload}>Download</Button>
            <Button size="small" variant="contained" disabled={!canSend || !viewingCurrent || !currentDocument?.recipientEmail || queued || sending.isLoading || deliveries.isFetching || deliveries.isError}
              onClick={() => { if (previousAttempts.length && currentDocument) setResendConfirmation(currentDocument.id); else handleSend(); }}>
              {previousAttempts.length ? 'Resend' : 'Send'}</Button>
          </Stack>
        </Stack>
        {displayedDocument && <Typography variant="body2" color="text.secondary">
          Revision {displayedDocument.revision} · {viewingCurrent ? 'Current' : 'Replaced'} · {currentDocument?.paymentStatus === 'Paid' ? 'Paid' : 'Finalized, unpaid'}
          {currentDocument?.recipientEmail ? ` · Email: ${currentDocument.recipientEmail}` : ' · Add an employee email address to send.'}
        </Typography>}
        {currentDocument && viewingCurrent && canSend && <Stack direction="row" spacing={1} flexWrap="wrap">
          {currentDocument.paymentStatus === 'Finalized' && <Button size="small"
            onClick={() => setAction({ documentId: currentDocument.id, mode: 'payment' })}>Record payment</Button>}
          <Button size="small" onClick={() => setAction({ documentId: currentDocument.id, mode: 'replace' })}>Replace document details</Button>
          {canCorrect && ['Finalized', 'Paid'].includes(currentDocument.paymentStatus) && <Button size="small" onClick={() => setCorrectionDocument(currentDocument)}>Correct payroll</Button>}
        </Stack>}
        {(slips.isError || versions.isError) && <Alert severity="error" action={<Button size="small" onClick={() => {
          if (selection) { slips.refetch(); versions.refetch(); }
        }}>Retry</Button>}>The payslip could not be loaded.</Alert>}
        {actions.error && <Alert severity="error" action={<Button size="small" onClick={actions.retry}>Retry</Button>}>{actions.error}</Alert>}
        {!selection && <Typography variant="body2" color="text.secondary">Select an employee and pay period.</Typography>}
        {(slips.isLoading || versions.isLoading || actions.isLoading) && <Box aria-busy="true" aria-label="Loading payslip">
          <Skeleton width="45%" height={36} /><Skeleton variant="rounded" height={560} />
        </Box>}
        {printError && <Alert severity="error">The print window could not be opened. Retry printing or download the PDF.</Alert>}
        {actions.pdfUrl && <PayslipPdfViewer key={actions.pdfUrl} url={actions.pdfUrl}
          title={displayedDocument ? `Official payslip PDF, revision ${displayedDocument.revision}` : 'Draft payslip PDF'}
          contentRef={printContentRef} onReady={setRenderedPdfUrl} />}
        {currentDocument && <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Delivery history</Typography></AccordionSummary>
          <AccordionDetails>
            {deliveries.isError && <Alert severity="error" action={<Button size="small" onClick={() => deliveries.refetch()}>Retry</Button>}>History could not be loaded.</Alert>}
            {deliveries.isFetching && !deliveries.currentData && <Skeleton aria-label="Loading delivery history" height={48} />}
            {!deliveries.isError && !deliveries.isFetching && !deliveries.currentData?.length && <Typography variant="body2">No delivery attempts.</Typography>}
            {deliveries.currentData?.map((attempt) => <Stack key={attempt.id} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body2">Revision {attempt.revision} · {deliveryLabels[attempt.status]} · {attempt.recipient || 'Employee email not resolved'}</Typography>
              <Typography variant="caption" color="text.secondary">{dayjs(attempt.requestedAt).format('DD MMM YYYY HH:mm')}
                {attempt.errorCategory ? ` · ${attempt.errorCategory === 'EMPLOYEE_EMAIL_REQUIRED' ? 'Update the employee email and retry.' : attempt.errorCategory === 'RECIPIENT_CHANGED' ? 'The employee email changed. Check the recipient before resending.' : attempt.errorCategory === 'SEND_OUTCOME_UNKNOWN' ? 'Confirm receipt before deliberately resending.' : 'Review employee access or document status.'}` : ''}</Typography>
            </Stack>)}
          </AccordionDetails>
        </Accordion>}
        {!!versions.currentData?.length && <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Document versions</Typography></AccordionSummary>
          <AccordionDetails>{versions.currentData.map((version) => <Stack key={version.id} direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
            <Box flex={1}><Typography variant="body2">Revision {version.revision} · {version.isCurrent ? 'Current' : 'Replaced'} · {dayjs(version.issuedAt).format('DD MMM YYYY HH:mm')}</Typography>
              {version.replacementReason && <Typography variant="body2" color="text.secondary">{version.replacementReason}</Typography>}
            </Box>
            <Button size="small" disabled={displayedDocument?.id === version.id} onClick={() => {
              if (selection) setViewedVersion({ selection: selection.key, id: version.id });
            }}>View</Button>
          </Stack>)}</AccordionDetails>
        </Accordion>}
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Payslip settings</Typography></AccordionSummary>
          <AccordionDetails><PayslipSettingsForm canEdit={canSend} /></AccordionDetails>
        </Accordion>
      </>}
      {currentDocument && action?.documentId === currentDocument.id && <PayslipDocumentActionDialog
        key={`${action.documentId}-${action.mode}`} document={currentDocument} mode={action.mode} onClose={() => setAction(null)} />}
      {correctionDocument && <PayslipCorrectionDialog key={correctionDocument.id} document={correctionDocument}
        canEdit={canCorrect} canReview={canReviewCorrection} canApply={canApplyCorrection} onClose={() => setCorrectionDocument(null)} />}
      <ConfirmDialog open={!!currentDocument && resendConfirmation === currentDocument.id} title="Resend payslip?" icon={null}
        disableCancel={sending.isLoading} disableBackdropClick={sending.isLoading} onClose={() => { if (!sending.isLoading) setResendConfirmation(null); }}
        content={`Send revision ${currentDocument?.revision ?? ''} again to ${currentDocument?.recipientEmail ?? ''}? Confirm receipt first if an earlier send outcome is unknown.`}
        action={<Button variant="contained" disabled={sending.isLoading || queued || !viewingCurrent} onClick={handleSend}>Resend</Button>} />
    </Stack>
  );
}
