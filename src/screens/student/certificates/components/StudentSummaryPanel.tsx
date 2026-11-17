import React from 'react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Avatar, Skeleton, Typography } from '@mui/material';

import type { SelectedStudent } from './StudentSearchPanel';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CertificateHistoryRow {
  certNo: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  status: 'Issued' | 'Duplicate' | 'Cancelled';
}

interface StudentSummaryPanelProps {
  selectedStudent: SelectedStudent | null;
  isLoading?: boolean;
  /* eslint-disable react/no-unused-prop-types -- Preserve the legacy caller's callback contract. */
  onDuplicate?: (row: CertificateHistoryRow) => void;
  onView?: (row: CertificateHistoryRow) => void;
  onDownload?: (row: CertificateHistoryRow) => void;
  onPrint?: (row: CertificateHistoryRow) => void;
  /* eslint-enable react/no-unused-prop-types */
}

// ── Info row helper ────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline', minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0 }}>
      {label}:
    </Typography>
    <Typography variant="caption" fontWeight={600} noWrap color="text.primary">
      {value || '—'}
    </Typography>
  </Box>
);

// ── Empty state ────────────────────────────────────────────────────────────────

const EmptyState = () => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      p: 4,
      border: (t) => `2px dashed ${alpha(t.palette.primary.main, 0.2)}`,
      bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Iconify icon="mdi:account-search" width={40} sx={{ color: 'primary.main' }} />
    </Box>
    <Box textAlign="center">
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        No Student Selected
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5} maxWidth={280}>
        Select a student from the left panel to view their profile.
      </Typography>
    </Box>
  </Card>
);

// ── Skeleton loader ────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Skeleton variant="circular" width={56} height={56} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={22} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width={100} height={36} />
        ))}
      </Stack>
    </Box>
  </Card>
);

// ── Main component ─────────────────────────────────────────────────────────────

const StudentSummaryPanel: React.FC<StudentSummaryPanelProps> = ({
  selectedStudent,
  isLoading,
}) => {
  if (isLoading) return <ProfileSkeleton />;
  if (!selectedStudent) return <EmptyState />;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Student Profile Card ──────────────────────────────────────────── */}
      <Box
        sx={{
          p: 1.5,
          background: (t) =>
            t.palette.mode === 'dark'
              ? alpha(t.palette.primary.dark, 0.2)
              : alpha(t.palette.primary.lighter || t.palette.primary.light, 0.12),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Avatar
              src={selectedStudent.photo}
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.main',
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {selectedStudent.name.charAt(0)}
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {selectedStudent.name}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 0.25,
                  mt: 0.5,
                }}
              >
                <InfoRow label="GR No" value={selectedStudent.grNo} />
                <InfoRow label="Admission" value={selectedStudent.admissionNo} />
                <InfoRow
                  label="Class"
                  value={`${selectedStudent.className} ${selectedStudent.divisionName}`}
                />
                <InfoRow label="Gender" value={selectedStudent.gender} />
                <InfoRow
                  label="DOB"
                  value={
                    selectedStudent.dateOfBirth
                      ? dayjs(selectedStudent.dateOfBirth).format('DD-MMM-YYYY')
                      : undefined
                  }
                />
                <InfoRow label="Org" value={selectedStudent.organizationName} />
              </Box>
            </Box>
          </Stack>
          <Label variant="soft" color="success" sx={{ flexShrink: 0, mt: 0.5 }}>
            Active
          </Label>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography role="status" variant="body2" color="text.secondary">
          Certificate history is unavailable in this view.
        </Typography>
      </Box>
    </Card>
  );
};

export default StudentSummaryPanel;
