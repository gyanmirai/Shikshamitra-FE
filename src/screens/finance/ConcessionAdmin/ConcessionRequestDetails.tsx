'use client';

import type { RootState } from 'src/redux/store';
import type { StudentBasicDetails } from 'src/redux/finance/ConcessionManagement/types';

import { useId } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Stack, Alert, Drawer, Button, Skeleton, Typography, IconButton } from '@mui/material';
import { ConcessionRequestStatusEnum as Status } from 'src/redux/finance/ConcessionManagement/types';
import {
  useGetConcessionRequestByIdQuery,
  useGetConcessionApprovalContextQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import ConcessionRequestEvidence from './ConcessionRequestEvidence';
import ConcessionRequestFeeBreakdown from './ConcessionRequestFeeBreakdown';
import {
  concessionStatusColor,
  concessionStatusLabel,
} from '../Concession/Components/concessionTablePresentation';

import type { IConcessionRequestItem } from './type';

export default function ConcessionRequestDetails({
  open,
  onClose,
  item,
  student,
  academicYear,
}: {
  open: boolean;
  onClose: () => void;
  item: IConcessionRequestItem;
  student?: StudentBasicDetails;
  academicYear?: string;
}) {
  const titleId = useId();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, financePermissions.fees.concessionActions.view);
  const canViewDocuments = hasGrantedPermission(
    permissions,
    financePermissions.fees.concessionActions.viewDocument
  );
  const requestId = item.studentConcessionTypeRequestId || item.id || '';
  const detailQuery = useGetConcessionRequestByIdQuery(
    { concessionRequestId: requestId },
    { skip: !open || !requestId || !canView }
  );
  const detail = detailQuery.currentData?.data;
  const approved =
    !!detail &&
    [Status.APPROVED, Status.PARTIALLY_REVERSED, Status.REVERSED].includes(detail.status);
  const needsContext =
    !!detail && (approved || [Status.DRAFT, Status.PENDING].includes(detail.status));
  const contextQuery = useGetConcessionApprovalContextQuery(requestId, {
    skip: !open || !requestId || !canView || !needsContext,
  });
  const title = detail?.concessionTypeName || item.concessionTypeName;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: {
            width: { xs: '100%', sm: 'min(840px, 96vw)' },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography id={titleId} variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          {detail && !detailQuery.isError && canView && (
            <Label color={concessionStatusColor(detail.status)}>
              {concessionStatusLabel(detail.status)}
            </Label>
          )}
          <InfoTooltipIcon
            title="Review the saved concession request, fee-head and instalment amounts and supporting evidence. This view is read-only."
            label={`${title} information`}
          />
        </Stack>
        <IconButton
          size="small"
          aria-label={`Close ${title}`}
          onClick={onClose}
          sx={{ '@media (pointer: coarse)': { width: 44, height: 44 } }}
        >
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
          {!canView ? (
            <Alert severity="warning">
              You do not have access to view this concession request.
            </Alert>
          ) : detailQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => detailQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load this concession request. Try again.
            </Alert>
          ) : !detail ? (
            <Stack spacing={2} aria-label="Loading concession request" aria-busy="true">
              <Skeleton variant="rounded" height={140} />
              <Skeleton variant="rounded" height={200} />
              <Skeleton variant="rounded" height={240} />
            </Stack>
          ) : (
            <>
              <DetailSection
                title="Student Information"
                icon={GlobalIcons.assigned}
                helpText="Student identity and academic year for this concession request."
              >
                <DetailGrid desktopColumns={4} desktopMinWidth={680}>
                  <DetailField
                    label="Student name (GR no.)"
                    value={
                      student?.grNumber
                        ? `${detail.studentName  } (${  student.grNumber  })`
                        : detail.studentName
                    }
                  />
                  <DetailField label="Roll number" value={student?.rollNo} />
                  <DetailField
                    label="Class / division"
                    value={
                      student
                        ? [student.standardName || '—', student.divisionName || '—'].join(' / ')
                        : undefined
                    }
                  />
                  <DetailField label="Academic year" value={academicYear} />
                </DetailGrid>
              </DetailSection>
              <DetailSection
                title="Concession Details"
                icon={GlobalIcons.receiptIcon}
                helpText="The saved policy version and requested and approved amounts for this request."
              >
                <DetailGrid desktopColumns={4} desktopMinWidth={680}>
                  <DetailField label="Policy" value={detail.concessionPolicyName} />
                  <DetailField
                    label="Policy code / version"
                    value={`${detail.concessionPolicyCode} / v${detail.concessionPolicyVersion}`}
                  />
                  <DetailField
                    label="Requested on"
                    value={fDateTime(detail.createdAt, 'DD MMM YYYY, h:mm a')}
                  />
                  <DetailField
                    label="Requested amount"
                    value={formatNumber(detail.totalRequestedConcessionAmount, 'INR')}
                  />
                  {approved && (
                    <DetailField
                      label="Approved amount"
                      value={formatNumber(detail.totalApprovedConcessionAmount, 'INR')}
                    />
                  )}
                  {detail.totalReversedConcessionAmount > 0 && (
                    <>
                      <DetailField
                        label="Reversed amount"
                        value={formatNumber(detail.totalReversedConcessionAmount, 'INR')}
                      />
                      <DetailField
                        label="Net approved amount"
                        value={formatNumber(detail.netApprovedConcessionAmount, 'INR')}
                      />
                    </>
                  )}
                </DetailGrid>
              </DetailSection>
              <DetailSection
                title="Fee Breakdown"
                icon={GlobalIcons.notebook}
                helpText="Approved requests show stored allocations per fee head and instalment. Pending amounts are requested or proposed; original fees are shown only where available."
              >
                {needsContext && contextQuery.isError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button
                        size="small"
                        aria-label="Retry fee breakdown"
                        onClick={() => contextQuery.refetch()}
                      >
                        Retry
                      </Button>
                    }
                  >
                    Unable to load the fee breakdown. Try again.
                  </Alert>
                ) : needsContext && !contextQuery.currentData ? (
                  <Stack spacing={1} aria-label="Loading fee breakdown" aria-busy="true">
                    <Skeleton variant="rounded" height={160} />
                    <Skeleton variant="rounded" height={120} />
                  </Stack>
                ) : (
                  <ConcessionRequestFeeBreakdown
                    detail={detail}
                    context={needsContext ? contextQuery.currentData : undefined}
                  />
                )}
              </DetailSection>
              <ConcessionRequestEvidence
                key={requestId}
                detail={detail}
                canViewDocuments={canViewDocuments}
              />
            </>
          )}
        </Stack>
      </Scrollbar>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
