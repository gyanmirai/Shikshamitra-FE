import type { ReactNode, MouseEvent } from 'react';
import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import Link from 'next/link';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Box, Chip, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import { ApplicantTitleTransition } from './enrollment-route-transition';
import { formatApplicantContact, formatEnrollmentDate } from './enrollment-display';

type Props = {
  lead?: AdmissionCrmLeadDto;
  returnHref: string;
  lifecycleStatusLabel?: string;
  pipelineColumnLabel?: string;
  journeyStatusLabel: string;
  nextAction?: string;
  primaryAction?: ReactNode;
  slaDueAt: dayjs.Dayjs | null;
  isClosed: boolean;
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function ApplicantFact({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Stack direction="row" gap={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          width: 34,
          height: 34,
          borderRadius: 1.25,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          color: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        })}
      >
        <Iconify icon={icon} width={18} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function ApplicantInquiryHeaderSkeleton() {
  return (
    <Stack component="header" spacing={1.25} aria-label="Loading applicant summary">
      <Skeleton variant="text" width={150} height={32} />
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.25 }, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width="min(420px, 80%)" height={46} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={48} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={92} />
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
  returnHref,
  lifecycleStatusLabel,
  pipelineColumnLabel,
  journeyStatusLabel,
  nextAction,
  primaryAction,
  slaDueAt,
  isClosed,
  onBack,
}: Props) {
  if (!lead) {
    return <ApplicantInquiryHeaderSkeleton />;
  }

  const contact = formatApplicantContact(lead.primaryContactNo, lead.email);
  const source = lead.inquirySourceSnapshot || getAdmissionCrmChannelLabel(lead.channel);
  const slaOverdue = Boolean(slaDueAt?.isBefore(dayjs()));

  return (
    <Stack component="header" spacing={1.25}>
      <Button
        component={Link}
        href={returnHref}
        onClick={onBack}
        color="inherit"
        size="small"
        startIcon={<Iconify icon="eva:arrow-back-fill" />}
        sx={{ alignSelf: 'flex-start', color: 'text.secondary', minHeight: 40 }}
      >
        Back to Pipeline
      </Button>

      <Paper
        variant="outlined"
        sx={(theme) => ({
          p: { xs: 1.5, sm: 2.25 },
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)}, ${alpha(
            theme.palette.background.paper,
            0.96
          )} 46%)`,
        })}
      >
        <Stack spacing={2}>
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
                Inquiry {lead.id.slice(0, 8).toUpperCase()}
              </Typography>
              <ApplicantTitleTransition leadId={lead.id}>
                <Typography
                  component="h1"
                  variant="h4"
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
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
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
            />
          </Box>

          {!isClosed ? (
            <Paper
              variant="outlined"
              sx={(theme) => ({
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.045),
              })}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                gap={1.25}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="info.main">
                    Next Best Action
                  </Typography>
                  <Typography variant="subtitle1" sx={{ textWrap: 'balance' }}>
                    {journeyStatusLabel}
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
            </Paper>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
