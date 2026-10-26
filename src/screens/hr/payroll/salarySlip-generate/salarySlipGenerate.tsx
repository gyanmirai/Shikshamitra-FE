'use client';

import type { RootState } from 'src/redux/store';
import type { PayslipDocument } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { DatePicker } from '@mui/x-date-pickers';
import { skipToken } from '@reduxjs/toolkit/query';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeOptionsQuery } from 'src/redux/hr/employeeApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipPreviewPdfQuery,
} from 'src/redux/runPayroll/runPayrollApi';
import {
  Box,
  Stack,
  Alert,
  Button,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  useSendPayslipMutation,
  useGetPayslipDocumentsQuery,
  useGetPayslipDeliveriesQuery,
  useLazyGetPayslipDocumentPdfQuery,
} from 'src/redux/hr/payslip-api';

import { usePayslipActions } from './use-payslip-actions';
import { payslipActionError } from './payslip-action-error';
import PayslipCorrectionDialog from './payslip-correction-dialog';
import PayslipDocumentActionDialog from './payslip-document-action-dialog';
import EmployeeAccountEmailAction from '../../employee/employee-account-email-action';
import {
  buildPayslipSelection,
  payslipMatchesSelection,
  buildPayslipEmployeeSearch,
} from './payslip-selection';

const deliveryLabels = {
  QUEUED: 'Queued',
  PROCESSING: 'Sending',
  PROVIDER_ACCEPTED: 'Accepted by email provider',
  FAILED: 'Failed',
  UNCERTAIN: 'Send outcome unknown',
  SUPERSEDED: 'Document replaced',
};

const PayslipPdfViewer = dynamic(() => import('./payslip-pdf-viewer'), { ssr: false });

export default function PaySlipGenerationScreen({
  hideHeading = false,
}: {
  hideHeading?: boolean;
}) {
  const printContentRef = useRef<HTMLDivElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const retrySelection = useRef<string | null>(null);
  const [renderedPdfUrl, setRenderedPdfUrl] = useState<string | null>(null);
  const [printError, setPrintError] = useState(false);
  const printPdf = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: 'Payslip',
    pageStyle: '@page { size: A4; margin: 0; } @media print { body { margin: 0; } }',
    onPrintError: () => setPrintError(true),
  });
  const [employee, setEmployee] = useState<{ id: string; label: string } | null>(null);
  const [month, setMonth] = useState<dayjs.Dayjs | null>(dayjs());
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.generateSalarySlip}.View`
  );
  const canSend = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.generateSalarySlip}.Add`
  );
  const canCorrect =
    canSend &&
    hasGrantedPermission(permissions, `${hrPermissions.payroll.runPayroll}.View`) &&
    hasGrantedPermission(permissions, hrPermissions.payroll.runPayrollAdjustments);
  const canReviewCorrection =
    canCorrect && hasGrantedPermission(permissions, `${hrPermissions.payroll.runPayroll}.Add`);
  const canApplyCorrection =
    canCorrect && hasGrantedPermission(permissions, hrPermissions.payroll.runPayrollLock);
  const [correctionDocument, setCorrectionDocument] = useState<PayslipDocument | null>(null);
  const [searchEmployees] = useLazyGetEmployeeOptionsQuery();
  const fetchEmployees = useCallback(
    async (query: string, page: number) => {
      const result = await searchEmployees(buildPayslipEmployeeSearch(query, page)).unwrap();
      return {
        data: result.items.map((item) => ({ id: item.id, label: item.fullName })),
        hasMore: result.hasMore,
      };
    },
    [searchEmployees]
  );
  const selection = buildPayslipSelection(employee?.id, month);
  const args =
    selection && canView
      ? { employeeId: selection.employeeId, monthYear: selection.monthYear }
      : skipToken;
  const slips = useGetEmployeeSalarySlipQuery(args);
  const versions = useGetPayslipDocumentsQuery(args, { refetchOnMountOrArgChange: true });
  const documentStatusKnown = versions.isSuccess && !versions.isFetching && !versions.isError;
  const selectionKey = selection?.key;
  const [deniedSelections, setDeniedSelections] = useState<
    Map<
      string,
      { documentRequestId?: string; deliveryRequestId?: string; summaryRequestId?: string }
    >
  >(() => new Map());
  const documentReadDenied =
    versions.isError &&
    !!versions.error &&
    'status' in versions.error &&
    (versions.error.status === 401 || versions.error.status === 403);
  const recordedDenial = selectionKey ? deniedSelections.get(selectionKey) : undefined;
  const documentAccessRestored =
    !!recordedDenial &&
    documentStatusKnown &&
    !!versions.requestId &&
    versions.requestId !== recordedDenial.documentRequestId;
  const documentQueryAccessDenied =
    documentReadDenied || (!!recordedDenial && !documentAccessRestored);
  const summaryReadDenied =
    slips.isError &&
    !!slips.error &&
    'status' in slips.error &&
    (slips.error.status === 401 || slips.error.status === 403) &&
    (!documentAccessRestored || slips.requestId !== recordedDenial?.summaryRequestId);
  const unknownDocumentStatus = versions.isFetching ? 'Refreshing status' : 'Status unavailable';
  const slip = payslipMatchesSelection(slips.currentData, selection) ? slips.currentData : null;
  const currentDocument = versions.currentData?.find((version) => version.isCurrent);
  const [viewedVersion, setViewedVersion] = useState<{ selection: string; id: string } | null>(
    null
  );
  const displayedDocument =
    viewedVersion && viewedVersion.selection === selection?.key
      ? (versions.currentData?.find((version) => version.id === viewedVersion.id) ??
        currentDocument)
      : currentDocument;
  const viewingCurrent = !!displayedDocument?.isCurrent && documentStatusKnown;
  const [action, setAction] = useState<{
    document: PayslipDocument;
    mode: 'payment' | 'replace';
  } | null>(null);
  const [resendConfirmation, setResendConfirmation] = useState<string | null>(null);
  const dialogOpener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (
      action ||
      correctionDocument ||
      resendConfirmation ||
      !documentStatusKnown ||
      !dialogOpener.current
    )
      return undefined;
    const frame = requestAnimationFrame(() => {
      const target = dialogOpener.current;
      if (!target?.isConnected) {
        dialogOpener.current = null;
        return;
      }
      if (target.disabled) return;
      dialogOpener.current = null;
      if (document.activeElement === document.body) target.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [action, correctionDocument, resendConfirmation, documentStatusKnown]);
  const deliveries = useGetPayslipDeliveriesQuery(
    canView && !documentQueryAccessDenied && !summaryReadDenied
      ? (currentDocument?.salarySlipId ?? skipToken)
      : skipToken,
    {
      pollingInterval: 5000,
      skipPollingIfUnfocused: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const deliveryReadDenied =
    deliveries.isError &&
    !!deliveries.error &&
    'status' in deliveries.error &&
    (deliveries.error.status === 401 || deliveries.error.status === 403) &&
    (!documentAccessRestored || deliveries.requestId !== recordedDenial?.deliveryRequestId);
  const documentAccessDenied = documentQueryAccessDenied || deliveryReadDenied || summaryReadDenied;
  const canReadDocument = canView && !documentAccessDenied;
  const canMutateCurrent = canReadDocument && canSend && viewingCurrent;
  useEffect(() => {
    if (!selectionKey) return;
    if (documentReadDenied || deliveryReadDenied || summaryReadDenied) {
      setDeniedSelections((previous) => {
        const existing = previous.get(selectionKey);
        const deliveryRequestId = deliveries.requestId ?? existing?.deliveryRequestId;
        const summaryRequestId = slips.requestId ?? existing?.summaryRequestId;
        if (
          existing &&
          existing.documentRequestId === versions.requestId &&
          existing.deliveryRequestId === deliveryRequestId &&
          existing.summaryRequestId === summaryRequestId
        )
          return previous;
        const next = new Map(previous);
        next.set(selectionKey, {
          documentRequestId: versions.requestId,
          deliveryRequestId,
          summaryRequestId,
        });
        return next;
      });
    } else if (
      documentAccessRestored &&
      slips.isSuccess &&
      !slips.isFetching &&
      (!currentDocument || (deliveries.isSuccess && !deliveries.isFetching))
    ) {
      setDeniedSelections((previous) => {
        if (!previous.has(selectionKey)) return previous;
        const next = new Map(previous);
        next.delete(selectionKey);
        return next;
      });
    }
  }, [
    selectionKey,
    documentReadDenied,
    deliveryReadDenied,
    summaryReadDenied,
    documentAccessRestored,
    currentDocument,
    versions.requestId,
    slips.requestId,
    slips.isSuccess,
    slips.isFetching,
    deliveries.requestId,
    deliveries.isSuccess,
    deliveries.isFetching,
  ]);
  const [loadDocument] = useLazyGetPayslipDocumentPdfQuery();
  const [loadPreview] = useLazyGetEmployeeSalarySlipPreviewPdfQuery();
  const [send, sending] = useSendPayslipMutation();
  const unconfirmedSendKeys = useRef(new Map<string, string>());
  const currentDocumentId = displayedDocument?.id;
  const selectedEmployeeId = selection?.employeeId;
  const selectedMonth = selection?.monthYear;
  const hasSlip = !!slip && documentStatusKnown;
  const canLoadPreview = !currentDocumentId && hasSlip;
  const loadPdf = useCallback(async () => {
    if (currentDocumentId) return loadDocument(currentDocumentId).unwrap();
    if (selectedEmployeeId && selectedMonth && canLoadPreview)
      return loadPreview({ employeeId: selectedEmployeeId, monthYear: selectedMonth }).unwrap();
    return null;
  }, [
    currentDocumentId,
    loadDocument,
    loadPreview,
    selectedEmployeeId,
    selectedMonth,
    canLoadPreview,
  ]);
  const documentKey = canReadDocument
    ? (displayedDocument?.id ?? (canLoadPreview ? (selectionKey ?? null) : null))
    : null;
  const actions = usePayslipActions({
    selectionKey: documentKey,
    loadPdf: documentKey ? loadPdf : null,
    fileName: `Payslip_${month?.format('YYYY-MM') ?? ''}_${displayedDocument ? `R${displayedDocument.revision}` : 'Preview'}.pdf`,
  });
  useEffect(() => {
    if (!retrySelection.current) return undefined;
    if (retrySelection.current !== selectionKey || !canView) {
      retrySelection.current = null;
      return undefined;
    }
    if (!documentStatusKnown || !slips.isSuccess || documentAccessDenied) return undefined;
    const hasDocument = !!displayedDocument || !!slip;
    if (hasDocument && (!actions.pdfUrl || renderedPdfUrl !== actions.pdfUrl)) return undefined;
    const frame = requestAnimationFrame(() => {
      retrySelection.current = null;
      const target = hasDocument
        ? printButtonRef.current
        : document.getElementById('payslip-staff-member');
      if (document.activeElement === document.body) target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [
    selectionKey,
    canView,
    documentStatusKnown,
    slips.isSuccess,
    documentAccessDenied,
    displayedDocument,
    slip,
    actions.pdfUrl,
    renderedPdfUrl,
  ]);
  const previousAttempts =
    deliveries.currentData?.filter((attempt) => attempt.documentId === currentDocument?.id) ?? [];
  const queued = previousAttempts.some((attempt) =>
    ['QUEUED', 'PROCESSING'].includes(attempt.status)
  );
  const sendBlocked =
    !canMutateCurrent ||
    !currentDocument?.recipientEmail ||
    queued ||
    sending.isLoading ||
    deliveries.isFetching ||
    deliveries.isError;
  const documentActionDisabledReason = (documentId: string) => {
    if (!canView || !canSend) return 'You do not have permission to change payslips.';
    if (versions.isFetching) return 'Refreshing payslip status.';
    if (!documentStatusKnown) return 'Refresh the payslip before saving.';
    if (currentDocument?.id !== documentId)
      return 'This revision is no longer current. Close this form to select the current revision.';
    return null;
  };
  const retryDocumentStatus =
    versions.isError && canView
      ? () => {
          versions.refetch();
        }
      : undefined;

  const handleSend = async () => {
    if (!currentDocument || sendBlocked) return;
    const pendingKey = unconfirmedSendKeys.current.get(currentDocument.id);
    const acknowledged = previousAttempts.some((attempt) => attempt.idempotencyKey === pendingKey);
    const key = pendingKey && !acknowledged ? pendingKey : crypto.randomUUID();
    unconfirmedSendKeys.current.set(currentDocument.id, key);
    try {
      const result = await send({ documentId: currentDocument.id, idempotencyKey: key }).unwrap();
      if (
        !result?.id ||
        result.documentId !== currentDocument.id ||
        result.idempotencyKey !== key ||
        !Object.hasOwn(deliveryLabels, result.status)
      ) {
        shikshaMitraToast.error({
          message:
            'The server response could not be confirmed. Check delivery history and try again.',
        });
        return;
      }
      if (unconfirmedSendKeys.current.get(currentDocument.id) === key)
        unconfirmedSendKeys.current.delete(currentDocument.id);
      setResendConfirmation(null);
      if (result.status === 'PROVIDER_ACCEPTED') {
        shikshaMitraToast.success({
          message: 'This payslip request was already accepted by the email provider.',
        });
      } else if (result.status === 'QUEUED' || result.status === 'PROCESSING') {
        shikshaMitraToast.success({ message: 'Payslip queued for email.' });
      } else {
        const message =
          result.status === 'FAILED'
            ? 'This delivery attempt failed. Review delivery history before resending.'
            : result.status === 'UNCERTAIN'
              ? 'The send outcome is unknown. Confirm receipt before resending.'
              : 'This delivery attempt was replaced. Refresh the payslip before resending.';
        shikshaMitraToast.error({ message });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: payslipActionError(error, 'Payslip could not be queued.'),
      });
    }
  };

  return (
    <Stack spacing={1}>
      {!hideHeading && (
        <CustomBreadcrumbs
          heading="Payslips"
          links={[
            { name: 'Payroll Management', href: hrPaths.payroll.root },
            { name: 'Payslips' },
          ]}
        />
      )}
      {!canView ? (
        <HrNotice role="alert" severity="info">You do not have access to payslips.</HrNotice>
      ) : (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
            <PaginatedSearchSelect
              id="payslip-staff-member"
              label="Staff member"
              value={employee}
              size="small"
              sx={{ width: { xs: '100%', md: 320 } }}
              minChars={2}
              debounceMs={400}
              fetchOptions={fetchEmployees}
              filterOptions={(options) => options}
              onChange={(_, value) => setEmployee(value)}
              getOptionLabel={(option: { label: string }) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <DatePicker
              label="Pay period"
              views={['month', 'year']}
              value={month}
              onChange={setMonth}
              slotProps={{ textField: { size: 'small' } }}
              sx={{ width: { xs: '100%', md: 220 } }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ ml: { md: 'auto' } }}>
              <Button
                ref={printButtonRef}
                size="small"
                disabled={!actions.pdfUrl || renderedPdfUrl !== actions.pdfUrl}
                onClick={() => {
                  setPrintError(false);
                  printPdf();
                }}
              >
                Print
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!actions.pdfUrl}
                onClick={actions.handleDownload}
              >
                Download
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={sendBlocked}
                onClick={(event) => {
                  if (previousAttempts.length && currentDocument) {
                    dialogOpener.current = event.currentTarget;
                    setResendConfirmation(currentDocument.id);
                  } else handleSend();
                }}
              >
                {previousAttempts.length ? 'Resend' : 'Send'}
              </Button>
            </Stack>
          </Stack>
          {canReadDocument && displayedDocument && (
            <Typography variant="body2" color="text.secondary">
              Revision {displayedDocument.revision} ·{' '}
              {documentStatusKnown
                ? displayedDocument.isCurrent
                  ? 'Current'
                  : 'Replaced'
                : unknownDocumentStatus}
              {documentStatusKnown && (
                <>
                  {' '}
                  · {currentDocument?.paymentStatus === 'Paid' ? 'Paid' : 'Finalized, unpaid'}
                  {currentDocument?.recipientEmail
                    ? ` · Email: ${currentDocument.recipientEmail}`
                    : ' · Add an employee email address to send.'}
                </>
              )}
            </Typography>
          )}
          {employee && canReadDocument && currentDocument && (
            <EmployeeAccountEmailAction
              key={employee.id}
              employeeId={employee.id}
              disabled={sending.isLoading || !documentStatusKnown}
            />
          )}
          {canReadDocument && currentDocument && displayedDocument?.isCurrent && canSend && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {currentDocument.paymentStatus === 'Finalized' && (
                <Button
                  size="small"
                  disabled={!canMutateCurrent}
                  onClick={(event) => {
                    dialogOpener.current = event.currentTarget;
                    setAction({ document: currentDocument, mode: 'payment' });
                  }}
                >
                  Record payment
                </Button>
              )}
              <Button
                size="small"
                disabled={!canMutateCurrent}
                onClick={(event) => {
                  dialogOpener.current = event.currentTarget;
                  setAction({ document: currentDocument, mode: 'replace' });
                }}
              >
                Replace document details
              </Button>
              {canCorrect && ['Finalized', 'Paid'].includes(currentDocument.paymentStatus) && (
                <Button
                  size="small"
                  disabled={!canMutateCurrent}
                  onClick={(event) => {
                    dialogOpener.current = event.currentTarget;
                    setCorrectionDocument(currentDocument);
                  }}
                >
                  Correct payroll
                </Button>
              )}
            </Stack>
          )}
          {(slips.isError || versions.isError || documentAccessDenied) && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  onClick={() => {
                    if (selection) {
                      retrySelection.current = selection.key;
                      slips.refetch();
                      versions.refetch();
                    }
                  }}
                >
                  Retry
                </Button>
              }
            >
              {documentAccessDenied
                ? 'You do not have access to this payslip.'
                : 'The payslip could not be loaded.'}
            </Alert>
          )}
          {actions.error && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  onClick={() => {
                    retrySelection.current = selectionKey ?? null;
                    actions.retry();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {actions.error}
            </Alert>
          )}
          {!selection && (
            <Typography variant="body2" color="text.secondary">
              Select a staff member and pay period.
            </Typography>
          )}
          {selection &&
            (slips.isLoading ||
              versions.isLoading ||
              (versions.isFetching && (!displayedDocument || !canReadDocument)) ||
              actions.isLoading) && (
              <Box aria-busy="true" aria-label="Loading payslip">
                <Typography variant="body2" color="text.secondary">
                  Loading payslip preview...
                </Typography>
                <Skeleton variant="rounded" height={96} />
              </Box>
            )}
          {printError && (
            <Alert severity="error">
              The print window could not be opened. Retry printing or download the PDF.
            </Alert>
          )}
          {canReadDocument && actions.pdfUrl && (
            <PayslipPdfViewer
              key={actions.pdfUrl}
              url={actions.pdfUrl}
              title={
                displayedDocument
                  ? `Official payslip PDF, revision ${displayedDocument.revision}`
                  : 'Draft payslip PDF'
              }
              contentRef={printContentRef}
              onReady={setRenderedPdfUrl}
            />
          )}
          {canReadDocument && currentDocument && (
            <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Delivery history</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {deliveries.isError && (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={() => deliveries.refetch()}>
                        Retry
                      </Button>
                    }
                  >
                    History could not be loaded.
                  </Alert>
                )}
                {deliveries.isFetching && !deliveries.currentData && (
                  <Skeleton aria-label="Loading delivery history" height={48} />
                )}
                {!deliveries.isError &&
                  !deliveries.isFetching &&
                  !deliveries.currentData?.length && (
                    <Typography variant="body2">No delivery attempts.</Typography>
                  )}
                {deliveries.currentData?.map((attempt) => (
                  <Stack
                    key={attempt.id}
                    sx={{
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <Typography variant="body2">
                      Revision {attempt.revision} · {deliveryLabels[attempt.status]} ·{' '}
                      {attempt.recipient || 'Employee email not resolved'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(attempt.requestedAt).format('DD MMM YYYY HH:mm')}
                      {` · Requested by: ${attempt.requestedByDisplayName?.trim() || (attempt.requestedBy ? 'Unavailable' : 'Not recorded')}`}
                      {attempt.errorCategory
                        ? ` · ${attempt.errorCategory === 'EMPLOYEE_EMAIL_REQUIRED' ? 'Update the employee email and retry.' : attempt.errorCategory === 'RECIPIENT_CHANGED' ? 'The employee email changed. Check the recipient before resending.' : attempt.errorCategory === 'SEND_OUTCOME_UNKNOWN' ? 'Confirm receipt before deliberately resending.' : 'Review employee access or document status.'}`
                        : ''}
                    </Typography>
                  </Stack>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
          {canReadDocument && !!versions.currentData?.length && (
            <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Document versions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {versions.currentData.map((version) => (
                  <Stack
                    key={version.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ py: 1 }}
                  >
                    <Box flex={1}>
                      <Typography variant="body2">
                        Revision {version.revision} ·{' '}
                        {documentStatusKnown
                          ? version.isCurrent
                            ? 'Current'
                            : 'Replaced'
                          : unknownDocumentStatus}{' '}
                        · {dayjs(version.issuedAt).format('DD MMM YYYY HH:mm')}
                      </Typography>
                      {version.replacementReason && (
                        <Typography variant="body2" color="text.secondary">
                          {version.replacementReason}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      size="small"
                      disabled={displayedDocument?.id === version.id}
                      onClick={() => {
                        if (selection)
                          setViewedVersion({ selection: selection.key, id: version.id });
                      }}
                    >
                      View
                    </Button>
                  </Stack>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
      {canReadDocument && action && (
        <PayslipDocumentActionDialog
          key={`${action.document.id}-${action.mode}`}
          document={action.document}
          mode={action.mode}
          disabledReason={documentActionDisabledReason(action.document.id)}
          onRetry={retryDocumentStatus}
          onClose={() => setAction(null)}
        />
      )}
      {canReadDocument && correctionDocument && (
        <PayslipCorrectionDialog
          key={correctionDocument.id}
          document={correctionDocument}
          disabledReason={documentActionDisabledReason(correctionDocument.id)}
          onRetry={retryDocumentStatus}
          canEdit={canCorrect}
          canReview={canReviewCorrection}
          canApply={canApplyCorrection}
          onClose={() => setCorrectionDocument(null)}
        />
      )}
      <ConfirmDialog
        open={canReadDocument && !!currentDocument && resendConfirmation === currentDocument.id}
        title="Resend payslip?"
        icon={null}
        disableCancel={sending.isLoading}
        disableBackdropClick={sending.isLoading}
        onClose={() => {
          if (!sending.isLoading) setResendConfirmation(null);
        }}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              {documentStatusKnown
                ? `Send revision ${currentDocument?.revision ?? ''} again to ${currentDocument?.recipientEmail ?? ''}? Confirm receipt first if an earlier send outcome is unknown.`
                : versions.isFetching
                  ? 'Refreshing payslip status.'
                  : 'Refresh the payslip before resending.'}
            </Typography>
            {retryDocumentStatus && (
              <Button size="small" onClick={retryDocumentStatus}>
                Retry
              </Button>
            )}
          </Stack>
        }
        action={
          <Button size="small" variant="contained" disabled={sendBlocked} onClick={handleSend}>
            Resend
          </Button>
        }
      />
    </Stack>
  );
}
