import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import React, { useRef, useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import BonofiedCertificateTemplate1 from 'src/templates/student-certificates/bonofied-certificate-1';
import {
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Drawer,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';

import LeavingForm from './forms/LeavingForm';
import BonafideForm from './forms/BonafideForm';
import CharacterForm from './forms/CharacterForm';
import FirstTrialForm from './forms/FirstTrialForm';

import type { FormRef } from './forms/BonafideForm';
import type { CertType } from './CertificateActionsPanel';
import type { SelectedStudent } from './StudentSearchPanel';

// ── Config ─────────────────────────────────────────────────────────────────────

interface CertConfig {
  label: string;
  icon: string;
  prefix: string;
  description: string;
}

const CERT_CONFIG: Record<CertType, CertConfig> = {
  bonafide: {
    label: 'Bonafide Certificate',
    icon: 'tdesign:certificate',
    prefix: 'BON',
    description:
      'Verifies that the student is officially enrolled in the institution and serves as proof of academic status.',
  },
  character: {
    label: 'Character Certificate',
    icon: 'la:certificate',
    prefix: 'CHA',
    description:
      "Attests to the student's conduct and behavior during their time at the institution.",
  },
  leaving: {
    label: 'Leaving Certificate',
    icon: 'streamline-cyber:wedding-certificate',
    prefix: 'LC',
    description:
      'Issued to students upon leaving the institution, confirming their enrollment period and academic details.',
  },
  firstTrial: {
    label: 'First Trial Certificate',
    icon: 'ph:certificate-light',
    prefix: 'FT',
    description:
      'Documents eligibility for a first examination attempt with relevant examination details.',
  },
};

// ── Auto cert number ───────────────────────────────────────────────────────────

const generateCertNo = (prefix: string) => {
  const year = dayjs().year();
  const seq = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
  return `${prefix}-${year}-${seq}`;
};

// ── Student info row ───────────────────────────────────────────────────────────

const StudentBadge = ({ student }: { student: SelectedStudent }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 1.5,
      py: 0.75,
      borderRadius: 1.5,
      bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
      border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
    }}
  >
    <Avatar
      src={student.photo}
      sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}
    >
      {student.name.charAt(0)}
    </Avatar>
    <Box>
      <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
        {student.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        GR: {student.grNo || '—'} &nbsp;·&nbsp; {student.className} {student.divisionName}
      </Typography>
    </Box>
    <Chip
      size="small"
      label="Pre-filled"
      color="primary"
      variant="soft"
      sx={{ ml: 'auto', flexShrink: 0 }}
    />
  </Box>
);

// ── Quick action bar ───────────────────────────────────────────────────────────

const QuickActions = () => (
  <Stack direction="row" spacing={0.75}>
    <Tooltip title="Print">
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:printer-outline" width={16} />}
        sx={{ minWidth: 0, px: 1.5, fontSize: 12 }}
      >
        Print
      </Button>
    </Tooltip>
    <Tooltip title="Download PDF">
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:download-outline" width={16} />}
        sx={{ minWidth: 0, px: 1.5, fontSize: 12 }}
      >
        PDF
      </Button>
    </Tooltip>
    <Tooltip title="Send by Email">
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:email-outline" width={16} />}
        sx={{ minWidth: 0, px: 1.5, fontSize: 12 }}
      >
        Email
      </Button>
    </Tooltip>
    <Tooltip title="Duplicate Certificate">
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:content-copy" width={16} />}
        sx={{ minWidth: 0, px: 1.5, fontSize: 12 }}
      >
        Duplicate
      </Button>
    </Tooltip>
  </Stack>
);

// ── Main drawer ────────────────────────────────────────────────────────────────

interface CertificateDrawerProps {
  open: boolean;
  onClose: () => void;
  certType: CertType | null;
  student: SelectedStudent | null;
}

const CertificateDrawer: React.FC<CertificateDrawerProps> = ({
  open,
  onClose,
  certType,
  student,
}) => {
  const formRef = useRef<FormRef>(null);

  const certNo = useMemo(() => {
    if (!certType) return '';
    return generateCertNo(CERT_CONFIG[certType].prefix);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certType, open]);

  if (!certType || !student) return null;

  const config = CERT_CONFIG[certType];

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  const handleSuccess = () => {
    shikshaMitraToast.success({
      message: `${config.label} generated successfully for ${student.name}`,
    });
    onClose();
  };

  const renderForm = () => {
    const commonProps = { student, certNo, onSuccess: handleSuccess, ref: formRef };
    switch (certType) {
      case 'bonafide':
        return <BonafideForm {...commonProps} />;
      case 'character':
        return <CharacterForm {...commonProps} />;
      case 'leaving':
        return <LeavingForm {...commonProps} />;
      case 'firstTrial':
        return <FirstTrialForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '92vw', lg: '85vw' },
          maxWidth: 1200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Drawer Header ───────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={config.icon} width={22} sx={{ color: 'primary.main' }} />
        </Box>

        {/* Title */}
        <Box flex={1} minWidth={0}>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {config.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {config.description}
          </Typography>
        </Box>

        {/* Quick actions */}
        <QuickActions />

        {/* Close */}
        <IconButton onClick={onClose} size="small" sx={{ ml: 1, flexShrink: 0 }}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Box>

      {/* ── Student badge row ────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <StudentBadge student={student} />
      </Box>

      {/* ── Split view: Form | PDF Preview ───────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left — Form */}
        <Box
          sx={{
            width: { xs: '100%', md: '38%' },
            borderRight: (t) => ({ md: `1px solid ${t.palette.divider}` }),
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: 10, letterSpacing: 0.8 }}
            >
              Certificate Details
            </Typography>
          </Box>
          <Scrollbar sx={{ flex: 1, px: 2, pb: 2 }}>{renderForm()}</Scrollbar>
        </Box>

        {/* Right — PDF Preview */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Iconify icon="mdi:file-eye-outline" width={16} sx={{ color: 'text.secondary' }} />
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: 10, letterSpacing: 0.8 }}
            >
              Live PDF Preview
            </Typography>
            <Chip
              size="small"
              label="Auto-updates"
              variant="soft"
              color="success"
              sx={{ ml: 'auto', height: 18, fontSize: 10 }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            <BonofiedCertificateTemplate1 />
          </Box>
        </Box>
      </Box>

      {/* ── Footer actions ───────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon="mdi:close" width={16} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          startIcon={<Iconify icon="mdi:check" width={16} />}
        >
          Generate &amp; Submit
        </Button>
      </Box>
    </Drawer>
  );
};

export default CertificateDrawer;
