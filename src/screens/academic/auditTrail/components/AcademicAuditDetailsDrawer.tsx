'use client';

import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Button, Drawer, IconButton, Typography } from '@mui/material';

import AcademicAuditDetailsContent from './AcademicAuditDetailsContent';

type AcademicAuditDetailsDrawerProps = {
  event: AcademicAuditEvent | null;
  open: boolean;
  onClose: () => void;
};

export const AcademicAuditDetailsDrawer = ({
  event,
  open,
  onClose,
}: AcademicAuditDetailsDrawerProps) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    slotProps={{
      backdrop: {
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.44)',
          backdropFilter: 'blur(3px)',
        },
      },
    }}
    PaperProps={{
      sx: {
        width: { xs: '100%', sm: 520 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={0.75} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Audit Details
          </Typography>
          <CustomTooltip title="Audit trail event details" placement="right" arrow>
            <Iconify
              icon={GlobalIcons.info}
              color="info.main"
              width={16}
              height={16}
              sx={{ cursor: 'pointer' }}
            />
          </CustomTooltip>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {event?.occurredAtDisplay || event?.occurredAt || '-'}
        </Typography>
      </Stack>

      <IconButton
        aria-label="Close audit details"
        onClick={onClose}
        sx={{ p: 0.5, color: 'text.secondary' }}
      >
        <Iconify icon="mdi:close" />
      </IconButton>
    </Box>

    <Scrollbar sx={{ flex: 1, '& .simplebar-content': { p: 2 }, p: 1.5 }}>
      {event && <AcademicAuditDetailsContent event={event} />}
    </Scrollbar>

    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Button
        variant="outlined"
        startIcon={<Iconify icon="mdi:close" />}
        onClick={onClose}
        size="small"
      >
        Close
      </Button>
    </Box>
  </Drawer>
);

export default AcademicAuditDetailsDrawer;
