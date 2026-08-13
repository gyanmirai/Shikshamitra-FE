import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';
import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Skeleton,
  Typography,
  Link as MuiLink,
} from '@mui/material';

import { ApplicantTitleTransition } from './enrollment-route-transition';
import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import {
  formatEnrollmentDate,
  formatApplicantNumber,
  formatApplicantContact,
} from './enrollment-display';

type Props = {
  lead?: AdmissionCrmLeadDto;
  lifecycleStatusLabel?: string;
  pipelineColumnLabel?: string;
  nextActionStepLabel: string;
  nextActionStatusLabel: string;
  nextActionStatusColor: LabelColor;
  nextAction?: string;
  primaryAction?: ReactNode;
  slaDueAt: dayjs.Dayjs | null;
  isClosed: boolean;
};

function ApplicantFact({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  href?: string;
}) {
  return (
    <Stack direction="row" gap={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          width: 30,
          height: 30,
          borderRadius: 1.25,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          color: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        })}
      >
        <Iconify icon={icon} width={16} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        {href ? (
          <MuiLink
            href={href}
            variant="body2"
            fontWeight={600}
            underline="hover"
            sx={{ display: 'inline-block', overflowWrap: 'anywhere' }}
          >
            {value}
          </MuiLink>
        ) : (
          <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function ApplicantInquiryHeaderSkeleton() {
  return (
    <Stack component="header" spacing={1.25} aria-label="Loading applicant summary">
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 1.75 }, borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="min(420px, 80%)" height={46} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1.5,
            }}
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={48} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={76} />
        </Stack>
      </Paper>
    </Stack>
  );
}

export function ApplicantInquiryLoadingState() {
  return (
    <Stack
      spacing={1.5}
      aria-label="Loading inquiry workspace"
      sx={{ width: '100%', maxWidth: 'xl', mx: 'auto', px: { xs: 1.5, sm: 2 }, pb: 2 }}
    >
      <Skeleton variant="rounded" height={84} />
      <ApplicantInquiryHeaderSkeleton />
      <Skeleton variant="rounded" height={116} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' },
          gap: 1.5,
        }}
      >
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={190} />
      </Box>
    </Stack>
  );
}

export function ApplicantInquiryHeader({
  lead,
  lifecycleStatusLabel,
  pipelineColumnLabel,
  nextActionStepLabel,
  nextActionStatusLabel,
  nextActionStatusColor,
  nextAction,
  primaryAction,
  slaDueAt,
  isClosed,
}: Props) {
  if (!lead) {
    return <ApplicantInquiryHeaderSkeleton />;
  }

  const contact = formatApplicantContact(lead.primaryContactNo, lead.email);
  const source = lead.inquirySourceSnapshot || getAdmissionCrmChannelLabel(lead.channel);
  const slaOverdue = Boolean(slaDueAt?.isBefore(dayjs()));

  return (
    <Stack component="header" spacing={1.25}>
      <Paper
        variant="outlined"
        sx={(theme) => ({
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderTopColor: alpha(theme.palette.primary.main, 0.45),
        })}
      >
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'flex-start' }}
            justifyContent="space-between"
            gap={1.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                color="primary.main"
                sx={{ fontWeight: 700, letterSpacing: 0.8 }}
              >
                Applicant ID {formatApplicantNumber(lead.applicantNumber)}
              </Typography>
              <ApplicantTitleTransition leadId={lead.id}>
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{ mt: 0.25, textWrap: 'balance', overflowWrap: 'anywhere' }}
                >
                  {getAdmissionCrmLeadName(lead)}
                </Typography>
              </ApplicantTitleTransition>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Review the inquiry, coordinate follow-up, and move the applicant forward with a
                clear audit trail.
              </Typography>
            </Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ flexShrink: 0 }}>
              <Chip
                size="small"
                color={isClosed ? 'default' : 'primary'}
                label={lifecycleStatusLabel}
              />
              {pipelineColumnLabel ? (
                <Chip size="small" variant="outlined" label={pipelineColumnLabel} />
              ) : null}
              {lead.registrationFormNumber ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Registration ${lead.registrationFormNumber}`}
                />
              ) : null}
              <Chip
                size="small"
                variant="outlined"
                color={slaOverdue ? 'warning' : 'default'}
                label={
                  slaDueAt
                    ? `${slaOverdue ? 'SLA overdue' : 'SLA due'} ${formatEnrollmentDate(
                        slaDueAt.toDate(),
                        true
                      )}`
                    : 'No SLA configured'
                }
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.25,
            }}
          >
            <ApplicantFact
              label="Target Grade"
              value={lead.desiredClassName || 'Not captured'}
              icon="solar:square-academic-cap-bold-duotone"
            />
            <ApplicantFact
              label="Inquiry Source"
              value={source}
              icon="solar:inbox-line-bold-duotone"
            />
            <ApplicantFact
              label="Guardian"
              value={lead.parentGuardianName || 'Not captured'}
              icon="solar:users-group-rounded-bold-duotone"
            />
            <ApplicantFact
              label="Contact"
              value={contact}
              icon="solar:phone-calling-bold-duotone"
              href={
                lead.primaryContactNo
                  ? `tel:${lead.primaryContactNo}`
                  : lead.email
                    ? `mailto:${lead.email}`
                    : undefined
              }
            />
          </Box>

          {!isClosed ? (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                alignItems: 'center',
                '& .MuiAlert-message': { width: '100%', minWidth: 0 },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                gap={1.25}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                    <Typography variant="caption" color="info.dark" fontWeight={700}>
                      Next Best Action
                    </Typography>
                    <Label color={nextActionStatusColor} variant="soft">
                      {nextActionStatusLabel}
                    </Label>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ mt: 0.25, textWrap: 'balance' }}>
                    {nextActionStepLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {nextAction ||
                      'Review the inquiry record and confirm the next admissions step.'}
                  </Typography>
                </Box>
                {primaryAction ? <Box sx={{ flexShrink: 0 }}>{primaryAction}</Box> : null}
              </Stack>
            </Alert>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
