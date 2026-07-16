import type { IColumn } from 'src/components/customizabaleTable/types';

import React from 'react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  Tooltip,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import type { SelectedStudent } from './StudentSearchPanel';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CertificateHistoryRow {
  certNo: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  status: 'Issued' | 'Duplicate' | 'Cancelled';
}

interface CertificateStat {
  label: string;
  icon: string;
  count: number;
}

interface StudentSummaryPanelProps {
  selectedStudent: SelectedStudent | null;
  isLoading?: boolean;
  onDuplicate?: (row: CertificateHistoryRow) => void;
  onView?: (row: CertificateHistoryRow) => void;
  onDownload?: (row: CertificateHistoryRow) => void;
  onPrint?: (row: CertificateHistoryRow) => void;
}

// ── Mock history data ──────────────────────────────────────────────────────────

const MOCK_HISTORY: CertificateHistoryRow[] = [
  {
    certNo: 'BON-2026-00012',
    type: 'Bonafide',
    generatedDate: '17-Jun-2026',
    generatedBy: 'Admin',
    status: 'Issued',
  },
  {
    certNo: 'CHA-2026-00045',
    type: 'Character',
    generatedDate: '10-May-2026',
    generatedBy: 'Admin',
    status: 'Issued',
  },
  {
    certNo: 'BON-2026-00008',
    type: 'Bonafide',
    generatedDate: '02-Apr-2026',
    generatedBy: 'Admin',
    status: 'Duplicate',
  },
  {
    certNo: 'FT-2026-00001',
    type: 'First Trial',
    generatedDate: '15-Mar-2026',
    generatedBy: 'Admin',
    status: 'Issued',
  },
];

// ── Stats config ───────────────────────────────────────────────────────────────

const CERT_STATS: CertificateStat[] = [
  { label: 'Bonafide', icon: 'tdesign:certificate', count: 5 },
  { label: 'Character', icon: 'la:certificate', count: 2 },
  { label: 'Leaving', icon: 'streamline-cyber:wedding-certificate', count: 0 },
  { label: 'First Trial', icon: 'ph:certificate-light', count: 1 },
];

// ── Status color map ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  Issued: 'success',
  Duplicate: 'warning',
  Cancelled: 'error',
};

// ── Table columns ──────────────────────────────────────────────────────────────

const buildColumns = (
  onDuplicate?: (row: CertificateHistoryRow) => void,
  onView?: (row: CertificateHistoryRow) => void,
  onDownload?: (row: CertificateHistoryRow) => void,
  onPrint?: (row: CertificateHistoryRow) => void
): IColumn[] => [
  {
    label: 'Cert No',
    id: 'certNo',
    align: 'left',
    minWidth: '130px',
    render: (_v, row) => (
      <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
        {row.certNo}
      </Typography>
    ),
  },
  {
    label: 'Type',
    id: 'type',
    align: 'left',
    minWidth: '90px',
    render: (_v, row) => <Chip size="small" label={row.type} variant="soft" />,
  },
  {
    label: 'Generated',
    id: 'generatedDate',
    align: 'left',
    minWidth: '100px',
  },
  {
    label: 'By',
    id: 'generatedBy',
    align: 'left',
    minWidth: '70px',
  },
  {
    label: 'Status',
    id: 'status',
    align: 'left',
    minWidth: '80px',
    render: (_v, row) => (
      <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
        {row.status}
      </Label>
    ),
  },
  {
    label: 'Actions',
    id: '_actions',
    sticky: true,
    align: 'left',
    isFilter: false,
    isSort: false,
    minWidth: '120px',
    render: (_v, row) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="View">
          <IconButton size="small" onClick={() => onView?.(row as CertificateHistoryRow)}>
            <Iconify icon="mdi:eye-outline" width={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download PDF">
          <IconButton size="small" onClick={() => onDownload?.(row as CertificateHistoryRow)}>
            <Iconify icon="mdi:download-outline" width={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print">
          <IconButton size="small" onClick={() => onPrint?.(row as CertificateHistoryRow)}>
            <Iconify icon="mdi:printer-outline" width={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={() => onDuplicate?.(row as CertificateHistoryRow)}>
            <Iconify icon="mdi:content-copy" width={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  },
];

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
        Select a student from the left panel to view their certificate history or generate a new
        certificate.
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
  onDuplicate,
  onView,
  onDownload,
  onPrint,
}) => {
  if (isLoading) return <ProfileSkeleton />;
  if (!selectedStudent) return <EmptyState />;

  const columns = buildColumns(onDuplicate, onView, onDownload, onPrint);

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

      {/* ── Certificate Statistics ────────────────────────────────────────── */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: 10, letterSpacing: 0.8 }}
        >
          Certificates Generated
        </Typography>
        <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" gap={1}>
          {CERT_STATS.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: (t) => `1px solid ${t.palette.divider}`,
                minWidth: 0,
              }}
            >
              <Iconify
                icon={stat.icon}
                width={14}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {stat.label}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: 'text.primary', ml: 0.25 }}
              >
                {stat.count}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── Certificate History ───────────────────────────────────────────── */}
      <Box sx={{ p: 1 }}>
        <Box sx={{ px: 1, pt: 1, pb: 0.5 }}>
          <Typography variant="subtitle2" color="text.primary">
            Certificate History
          </Typography>
        </Box>
        <CustomizableTable
          tableId="student-certificate-history"
          tableTitle=""
          columns={columns}
          data={MOCK_HISTORY}
          noDataText="No certificates generated yet for this student"
          serverSide={false}
        />
      </Box>
    </Card>
  );
};

export default StudentSummaryPanel;
