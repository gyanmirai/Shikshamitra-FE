'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { Box, Card, Stack, Button, Tooltip, Divider, Typography, IconButton } from '@mui/material';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import { useCreateConcessionRefundRequestsMutation } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import { canDecideConcession } from '../Concession/concessionDecisionEligibility';

import type { IConcessionRequestItem } from './type';

interface IConcessionCardProps {
  item: IConcessionRequestItem;
  onEdit: (item: IConcessionRequestItem) => void;
  onApprove: (item: IConcessionRequestItem) => void;
  onReject: (item: IConcessionRequestItem) => void;
  onCancel: (item: IConcessionRequestItem) => void;
  onOpenDocs: (item: IConcessionRequestItem) => void;
  onDelete: (item: IConcessionRequestItem) => void;
}

const ConcessionItemCard: React.FC<IConcessionCardProps> = ({
  item,
  onEdit,
  onApprove,
  onReject,
  onCancel,
  onOpenDocs,
  onDelete,
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const actions = financePermissions.fees.concessionActions;
  const canApprove = hasGrantedPermission(permissions, actions.approve);
  const canReject = hasGrantedPermission(permissions, actions.reject);
  const canEdit = hasGrantedPermission(permissions, actions.edit);
  const canReverse = hasGrantedPermission(permissions, actions.reverse);
  const canDelete = hasGrantedPermission(permissions, actions.delete);
  const canViewDocuments = hasGrantedPermission(permissions, actions.viewDocument);
  const canUploadDocuments = hasGrantedPermission(permissions, actions.uploadDocument);
  const canCreateRefund = hasGrantedPermission(
    permissions,
    financePermissions.fees.refundActions.add
  );
  const [createRefundRequests, { isLoading: isCreatingRefund }] =
    useCreateConcessionRefundRequestsMutation();
  const refundCommandKey = useRef('');
  const [refundCreated, setRefundCreated] = useState(false);
  const handleCreateRefundRequests = async () => {
    if (isCreatingRefund || refundCreated) return;
    try {
      await createRefundRequests({
        concessionRequestId: item.studentConcessionTypeRequestId || item.id || '',
        body: {
          requestConcurrencyStamp: item.concurrencyStamp || '',
          idempotencyKey: (refundCommandKey.current ||= window.crypto.randomUUID()),
        },
      }).unwrap();
      setRefundCreated(true);
      shikshaMitraToast.success({
        message: 'Linked refund requests created for separate review and payout.',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
    }
  };
  const serverAllows = (action: string) =>
    !item.availableActions?.length || item.availableActions.includes(action);
  const isApproved = item.status === ConcessionStatusType.Approved;
  const isPartiallyReversed = item.status === ConcessionStatusType.PartiallyReversed;
  const isRejected = item.status === ConcessionStatusType.Rejected;
  const isCancelled = item.status === ConcessionStatusType.Cancelled;
  const isDraft = item.status === ConcessionStatusType.Draft;
  const isPending = isDraft || item.status === ConcessionStatusType.Pending;
  const decisionAllowed = canDecideConcession(currentUserId, item.requesterId, item.submittedById);
  const decisionBlockReason =
    !currentUserId || !item.requesterId
      ? 'Decision identity is unavailable'
      : 'You cannot approve or reject your own request';
  const statusLabel = isPending
    ? 'Pending'
    : (ConcessionStatusType[item.status] as keyof typeof ConcessionStatusType);
  const statusColor = isPending
    ? ConcessionStatusTypeColors[ConcessionStatusType.Pending]
    : (ConcessionStatusTypeColors[item.status as ConcessionStatusType] as LabelColor);

  // Use requiredDocuments if available, otherwise fall back to submittedDocuments
  const requiredDocs = item.requiredDocuments || [];
  const uploadedDocs = requiredDocs.filter((d) => d.isUploaded && d.url);
  const mandatoryDocs = requiredDocs.filter((document) => document.isRequired ?? true);
  const allMandatoryDocsUploaded = mandatoryDocs.every((document) => document.isUploaded);
  const pendingCount = mandatoryDocs.filter((document) => !document.isUploaded).length;

  // For cards with no requiredDocuments, fall back to checking submittedDocuments
  const hasRequiredDocs = requiredDocs.length > 0;
  const displayDocs = hasRequiredDocs ? uploadedDocs : item.submittedDocuments || [];

  // Approve should be disabled if any required document is not uploaded
  const approveDisabled = !isPending || !allMandatoryDocsUploaded || !decisionAllowed;

  return (
    <Card
      component="article"
      variant="outlined"
      aria-label={`${item.concessionTypeName} request`}
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, boxShadow: 'none', minWidth: 0 }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.concessionTypeName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Requested on {fDate(item.createdAt)}
            </Typography>
          </Box>
          <Label color={statusColor} sx={{ flexShrink: 0 }}>
            {statusLabel}
          </Label>
        </Stack>

        <Box sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Requested amount
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatNumber(item.totalRequestedAmount ?? item.totalAmount, 'INR')}
          </Typography>
          {!isPending && (
            <Typography variant="caption" color="text.secondary" display="block">
              {item.totalReversedAmount > 0 ? 'Net approved' : 'Approved amount'}:{' '}
              {formatNumber(
                item.totalReversedAmount > 0 ? item.netApprovedAmount : item.totalApprovedAmount,
                'INR'
              )}
            </Typography>
          )}
        </Box>

        {(item.paidConcessionAmount ?? 0) > 0 && (
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2">
              Paid concession: {formatNumber(item.paidConcessionAmount ?? 0, 'INR')}. Refund request
              creation: {item.autoCreateRefund ? 'Automatic' : 'Manual'}.
            </Typography>
            {item.canCreateRefundRequests && !refundCreated && canCreateRefund && (
              <LoadingButton
                size="small"
                variant="outlined"
                loading={isCreatingRefund}
                onClick={handleCreateRefundRequests}
              >
                Create refund requests
              </LoadingButton>
            )}
          </Stack>
        )}
        {!!item.refundRequests?.length && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Refund requests from this concession
            </Typography>
            {item.refundRequests.map((refund) => (
              <Stack
                key={refund.refundRequestId}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {refund.voucherNumber} · {formatNumber(refund.amount, 'INR')}
                </Typography>
                <Label color={refund.status === 'Processed' ? 'success' : 'info'}>
                  {refund.status}
                </Label>
              </Stack>
            ))}
          </Stack>
        )}

        <Box component="section" aria-label="Supporting documents">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            mb={0.5}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography component="h4" variant="caption" color="text.secondary" fontWeight={600}>
                Supporting documents
              </Typography>
              <Label
                color={
                  hasRequiredDocs ? (allMandatoryDocsUploaded ? 'success' : 'warning') : 'default'
                }
              >
                {hasRequiredDocs
                  ? `${uploadedDocs.length}/${requiredDocs.length}`
                  : displayDocs.length}
              </Label>
            </Stack>
            {hasRequiredDocs &&
              (canViewDocuments || (canUploadDocuments && serverAllows('upload-document'))) && (
                <Button size="small" color="inherit" onClick={() => onOpenDocs(item)}>
                  See All
                </Button>
              )}
          </Stack>
          {displayDocs.length > 0 ? (
            <Stack divider={<Divider />}>
              {displayDocs.map((doc) => (
                <Stack
                  key={doc.documentId}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                  sx={{ py: 0.5, minWidth: 0 }}
                >
                  <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                    {doc.documentName}
                  </Typography>
                  <Tooltip title={`View ${doc.documentName}`}>
                    <IconButton
                      size="small"
                      aria-label={`View ${doc.documentName}`}
                      onClick={() => setPreviewDoc({ url: doc.url || '', name: doc.documentName })}
                      sx={{ flexShrink: 0, color: 'text.secondary', width: 44, height: 44 }}
                    >
                      <Iconify icon={GlobalIcons.eye} width={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              color={hasRequiredDocs ? 'text.secondary' : 'text.disabled'}
            >
              {hasRequiredDocs
                ? 'No documents uploaded — click See All to upload'
                : 'No documents required'}
            </Typography>
          )}
          {displayDocs.length > 0 && hasRequiredDocs && pendingCount > 0 && (
            <Typography variant="caption" color="warning.dark" display="block" mt={0.5}>
              {pendingCount} document{pendingCount === 1 ? '' : 's'} pending — click See All to
              upload
            </Typography>
          )}
        </Box>

        <Divider />
        <Stack component="footer" spacing={1}>
          {item.message && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {isApproved ? 'Approved message:' : 'Remark:'}
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {item.message}
              </Typography>
            </Box>
          )}
          {isApproved && item.approvedAt && (
            <Typography variant="caption" color="text.secondary">
              Approved on {fDate(item.approvedAt)}
            </Typography>
          )}
          {!!item.timeline?.length && (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Activity
              </Typography>
              <Stack spacing={0.5} mt={0.5}>
                {item.timeline.slice(-3).map((event, index) => (
                  <Stack
                    key={`${event.action}-${event.occurredAt}-${index}`}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    gap={{ xs: 0.25, sm: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'capitalize', overflowWrap: 'anywhere' }}
                    >
                      {event.action}
                      {event.amount ? ` · ${formatNumber(event.amount, 'INR')}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fDateTime(event.occurredAt, 'DD/MM/YYYY, h:mm:ss a')}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            {canEdit && isDraft && serverAllows('edit') && (
              <Tooltip title="Edit concession request">
                <IconButton
                  size="small"
                  color="inherit"
                  aria-label="Edit concession request"
                  sx={{ width: 44, height: 44 }}
                  onClick={() => onEdit(item)}
                >
                  <Iconify icon={GlobalIcons.edit} width={18} />
                </IconButton>
              </Tooltip>
            )}
            {canApprove && serverAllows('approve') && (
              <Tooltip
                title={
                  !decisionAllowed
                    ? decisionBlockReason
                    : !allMandatoryDocsUploaded && !isApproved && !isRejected && !isCancelled
                      ? 'Upload all mandatory documents first — click "See All" to upload pending documents'
                      : ''
                }
                placement="top"
                arrow
              >
                <span style={{ display: 'inline-flex' }}>
                  <LoadingButton
                    size="small"
                    variant={isApproved ? 'soft' : 'contained'}
                    color="success"
                    disabled={approveDisabled}
                    onClick={() => onApprove(item)}
                  >
                    Approve
                  </LoadingButton>
                </span>
              </Tooltip>
            )}
            {canReject && serverAllows('reject') && (
              <Tooltip title={!decisionAllowed ? decisionBlockReason : ''} placement="top" arrow>
                <span style={{ display: 'inline-flex' }}>
                  <LoadingButton
                    size="small"
                    variant="soft"
                    color="error"
                    disabled={!isPending || !decisionAllowed}
                    onClick={() => onReject(item)}
                  >
                    Reject
                  </LoadingButton>
                </span>
              </Tooltip>
            )}
            {canReverse && serverAllows('reverse') && (
              <LoadingButton
                size="small"
                variant="soft"
                color="warning"
                disabled={!isApproved && !isPartiallyReversed}
                onClick={() => onCancel(item)}
              >
                Reverse
              </LoadingButton>
            )}
            {canDelete && serverAllows('delete') && (
              <Tooltip title="Delete concession request">
                <span style={{ display: 'inline-flex' }}>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Delete concession request"
                    sx={{ width: 44, height: 44 }}
                    disabled={item.status !== ConcessionStatusType.Draft}
                    onClick={() => onDelete(item)}
                  >
                    <Iconify icon={GlobalIcons.delete} width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Stack>
      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url || ''}
        documentName={previewDoc?.name}
        directUrl
      />
    </Card>
  );
};

export default ConcessionItemCard;
