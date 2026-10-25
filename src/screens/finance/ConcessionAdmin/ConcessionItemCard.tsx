'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { ThreeDotsDirectAction } from 'src/components/three-dots-actions/types';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { FormSectionHeader } from 'src/components/form-section-card';
import { isFinanceAdministratorSession } from 'src/utils/finance-admin-auto-approval';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { Box, Card, Stack, Button, Tooltip, Typography, IconButton } from '@mui/material';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';

import { canDecideConcession } from '../Concession/concessionDecisionEligibility';

import type { IConcessionRequestItem } from './type';

interface IConcessionCardProps {
  item: IConcessionRequestItem;
  onEdit: (item: IConcessionRequestItem) => void;
  onApprove: (item: IConcessionRequestItem) => void;
  onReject: (item: IConcessionRequestItem) => void;
  onOpenDocs: (item: IConcessionRequestItem) => void;
  onDelete: (item: IConcessionRequestItem) => void;
}

const ConcessionItemCard: React.FC<IConcessionCardProps> = ({
  item,
  onEdit,
  onApprove,
  onReject,
  onOpenDocs,
  onDelete,
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.sub as string | undefined;
  const isAdministrator = isFinanceAdministratorSession({ profile: currentUser });
  const actions = financePermissions.fees.concessionActions;
  const canApprove = hasGrantedPermission(permissions, actions.approve);
  const canReject = hasGrantedPermission(permissions, actions.reject);
  const canEdit = hasGrantedPermission(permissions, actions.edit);
  const canDelete = hasGrantedPermission(permissions, actions.delete);
  const canViewDocuments = hasGrantedPermission(permissions, actions.viewDocument);
  const canUploadDocuments = hasGrantedPermission(permissions, actions.uploadDocument);
  const serverAllows = (action: string) =>
    item.availableActions == null || item.availableActions.includes(action);
  const isApproved = item.status === ConcessionStatusType.Approved;
  const isDraft = item.status === ConcessionStatusType.Draft;
  const isPending = isDraft || item.status === ConcessionStatusType.Pending;
  const decisionAllowed = canDecideConcession(
    currentUserId,
    item.requesterId,
    item.submittedById,
    isAdministrator
  );
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
  const hasRequestedAmount = (item.totalRequestedAmount ?? item.totalAmount) > 0;
  const approveDisabled =
    !serverAllows('approve') ||
    !allMandatoryDocsUploaded ||
    !decisionAllowed ||
    !hasRequestedAmount;
  const decisionUnavailableReason = !decisionAllowed
    ? decisionBlockReason
    : 'This decision is unavailable for this request. Refresh to check its current state.';

  const restriction =
    isPending &&
    ((canApprove && (!decisionAllowed || !serverAllows('approve'))) ||
      (canReject && (!decisionAllowed || !serverAllows('reject'))))
      ? decisionUnavailableReason
      : '';
  const cardActions: ThreeDotsDirectAction[] = [];
  if (canEdit && isDraft && serverAllows('edit'))
    cardActions.push({
      id: 'edit',
      label: 'Edit concession request',
      icon: GlobalIcons.edit,
      onClick: () => onEdit(item),
    });
  if (canApprove && isPending)
    cardActions.push({
      id: 'approve',
      label: 'Approve',
      icon: GlobalIcons.approveDecision,
      color: 'success.main',
      disabled: approveDisabled,
      tooltip:
        !decisionAllowed || !serverAllows('approve')
          ? decisionUnavailableReason
          : !allMandatoryDocsUploaded
            ? 'Upload all mandatory documents before approval.'
            : !hasRequestedAmount
              ? 'A positive requested concession amount is required before approval.'
              : 'Approve',
      onClick: () => onApprove(item),
    });
  if (canReject && isPending)
    cardActions.push({
      id: 'reject',
      label: 'Reject',
      icon: GlobalIcons.rejectDecision,
      color: 'error.main',
      disabled: !decisionAllowed || !serverAllows('reject'),
      tooltip: !decisionAllowed || !serverAllows('reject') ? decisionUnavailableReason : 'Reject',
      onClick: () => onReject(item),
    });
  if (canDelete && serverAllows('delete'))
    cardActions.push({
      id: 'delete',
      label: 'Delete concession request',
      icon: GlobalIcons.delete,
      color: 'error.main',
      disabled: !isDraft,
      onClick: () => onDelete(item),
    });
  const documents = (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Typography variant="caption" color="text.secondary">
            Supporting documents
          </Typography>
          <Label
            color={hasRequiredDocs ? (allMandatoryDocsUploaded ? 'success' : 'warning') : 'default'}
          >
            {hasRequiredDocs ? `${uploadedDocs.length}/${requiredDocs.length}` : displayDocs.length}
          </Label>
        </Stack>
        {(hasRequiredDocs || displayDocs.length > 0) &&
          (canViewDocuments || (canUploadDocuments && serverAllows('upload-document'))) && (
            <Button
              type="button"
              size="small"
              color="inherit"
              aria-label="See all supporting documents"
              startIcon={<Iconify icon={GlobalIcons.doc} width={16} />}
              onClick={() => onOpenDocs(item)}
            >
              See all
            </Button>
          )}
      </Stack>
      <Box
        component="ul"
        aria-label="Uploaded supporting documents"
        tabIndex={0}
        sx={{ m: 0, p: 0, listStyle: 'none', height: 64, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {displayDocs.length > 0 ? (
          displayDocs.map((doc) => (
            <Stack
              component="li"
              key={doc.documentId}
              direction="row"
              alignItems="center"
              gap={0.75}
              sx={{ minWidth: 0, minHeight: 32 }}
            >
              <Iconify
                icon={GlobalIcons.doc}
                width={16}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                {doc.documentName}
              </Typography>
              {canViewDocuments && (
                <Tooltip title={`View ${doc.documentName}`}>
                  <IconButton
                    size="small"
                    aria-label={`View ${doc.documentName}`}
                    sx={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      color: 'text.secondary',
                      '@media (pointer: coarse)': { width: 44, height: 44 },
                    }}
                    onClick={() => setPreviewDoc({ url: doc.url || '', name: doc.documentName })}
                  >
                    <Iconify icon={GlobalIcons.eye} width={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          ))
        ) : (
          <Typography component="li" variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
            {hasRequiredDocs
              ? 'No documents uploaded. Select See all to upload.'
              : 'No documents required'}
          </Typography>
        )}
      </Box>
      {hasRequiredDocs && pendingCount > 0 && (
        <Typography variant="caption" color="warning.dark">
          {pendingCount} mandatory document{pendingCount === 1 ? '' : 's'} pending.
        </Typography>
      )}
    </Stack>
  );

  return (
    <Card
      component="article"
      variant="outlined"
      aria-label={`${item.concessionTypeName} request`}
      sx={{
        height: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        component="header"
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: 'background.neutral',
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiIconButton-root': {
            width: 28,
            height: 28,
            '@media (pointer: coarse)': { width: 44, height: 44 },
          },
        }}
      >
        <FormSectionHeader
          title={item.concessionTypeName}
          titleTypographyProps={{
            variant: 'subtitle2',
            component: 'h3',
            sx: { overflowWrap: 'anywhere' },
          }}
          description={`Requested on ${fDate(item.createdAt)}`}
          descriptionTooltip="Saved concession request and supporting documents. Available actions follow the request state and your permissions."
          action={<Label color={statusColor}>{statusLabel}</Label>}
        />
      </Box>
      <Stack spacing={1} sx={{ p: 1.5, flex: 1 }}>
        <Box sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Typography variant="body2" color="text.secondary">
            Requested amount
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
          >
            {formatNumber(item.totalRequestedAmount ?? item.totalAmount, 'INR')}
          </Typography>
          {!isPending && (
            <Typography variant="caption" color="text.secondary">
              {item.totalReversedAmount > 0 ? 'Net approved' : 'Approved amount'}:{' '}
              {formatNumber(
                item.totalReversedAmount > 0 ? item.netApprovedAmount : item.totalApprovedAmount,
                'INR'
              )}
            </Typography>
          )}
        </Box>
        <Box component="section" aria-label="Supporting documents">
          {documents}
        </Box>
        {(item.paidConcessionAmount ?? 0) > 0 && (
          <Typography variant="body2">
            Paid concession: {formatNumber(item.paidConcessionAmount ?? 0, 'INR')}. Refund request
            creation: {item.autoCreateRefund ? 'Automatic' : 'Manual'}.
          </Typography>
        )}
        {!!item.refundRequests?.length && (
          <Typography variant="caption" color="text.secondary">
            {item.refundRequests.length} linked refund request
            {item.refundRequests.length === 1 ? '' : 's'}.
          </Typography>
        )}
        {item.message && (
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {isApproved ? 'Approved message' : 'Remark'}: {item.message}
          </Typography>
        )}
        {restriction && (
          <Typography role="status" variant="caption" color="text.secondary">
            {restriction}
          </Typography>
        )}
      </Stack>
      <Box
        component="footer"
        sx={{
          px: 1.5,
          py: 0.5,
          bgcolor: 'background.neutral',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <ThreeDotsActions
          showThreeDots={false}
          directActions={cardActions}
          sx={{
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            '& .MuiIconButton-root': {
              width: 32,
              height: 32,
              '@media (pointer: coarse)': { width: 44, height: 44 },
            },
          }}
        />
      </Box>
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
