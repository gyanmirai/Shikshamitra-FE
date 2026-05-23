'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import {
  Box,
  Chip,
  Avatar,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@mui/material';

import type { IStudentFee } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CounterModeLayoutProps {
  isActive: boolean;
  student: IStudentFee | null;
  grandTotal: number;
  selectedCount: number;
  onToggle: () => void;
  onCollect: () => void;
  onStudentSearch?: (query: string) => void;
  children?: React.ReactNode; // optional embedded form content
}

// ─── Component ────────────────────────────────────────────────────────────────

const CounterModeLayout = ({
  isActive,
  student,
  grandTotal,
  selectedCount,
  onToggle,
  onCollect,
  onStudentSearch,
  children,
}: CounterModeLayoutProps) => {
  const theme = useTheme();

  // Counter mode floating badge (always visible)
  const toggleButton = (
    <Tooltip title={isActive ? 'Exit Counter Mode (F6)' : 'Enter Counter Mode (F6)'} arrow>
      <Chip
        icon={<Iconify icon={isActive ? 'solar:monitor-bold' : 'solar:monitor-bold'} width={14} />}
        label={isActive ? 'Exit Counter Mode' : 'Counter Mode'}
        size="small"
        color={isActive ? 'error' : 'default'}
        variant={isActive ? 'filled' : 'outlined'}
        onClick={onToggle}
        sx={{
          fontWeight: 700,
          height: 26,
          borderRadius: 1.25,
          fontSize: '0.72rem',
          cursor: 'pointer',
        }}
      />
    </Tooltip>
  );

  if (!isActive) {
    return <>{toggleButton}</>;
  }

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        key="counter-mode"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1400,
          bgcolor: (t) => t.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header bar ──────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Iconify icon="solar:cash-out-bold" width={22} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={800}>
              Counter Mode
            </Typography>
            <Chip
              label="F6 to exit"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            />
          </Box>
          <IconButton onClick={onToggle} size="small">
            <Iconify icon="solar:close-circle-bold" width={22} />
          </IconButton>
        </Box>

        {/* ── Main area ───────────────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            p: 4,
            overflow: 'auto',
          }}
        >
          {/* Student search */}
          {onStudentSearch && (
            <Box sx={{ width: '100%', maxWidth: 480 }}>
              <TextField
                fullWidth
                autoFocus
                placeholder="Search by admission no., name, or phone…"
                variant="outlined"
                onChange={(e) => onStudentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify
                        icon="solar:magnifer-bold"
                        width={18}
                        sx={{ color: 'text.disabled' }}
                      />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, fontSize: '1rem', fontWeight: 600 },
                }}
              />
            </Box>
          )}

          {/* Student info */}
          {student && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                px: 3,
                py: 2,
                borderRadius: 2.5,
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.18)}`,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                maxWidth: 560,
                width: '100%',
              }}
            >
              <Avatar
                src={student.profileImage}
                sx={{ width: 60, height: 60, fontSize: '1.5rem', bgcolor: 'primary.main' }}
              >
                {student.name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {student.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.className} {student.division} · Adm: {student.grNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parent: {student.parentName} · {student.contactNumber}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Grand total display */}
          {student && grandTotal > 0 && (
            <Box
              component={motion.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              sx={{ textAlign: 'center' }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing="0.1em"
              >
                Amount to Collect
              </Typography>
              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  lineHeight: 1.1,
                  mt: 0.25,
                }}
              >
                ₹{formatNumber(grandTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {selectedCount} fee item{selectedCount !== 1 ? 's' : ''} selected
              </Typography>
            </Box>
          )}

          {/* Collect button */}
          {student && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={grandTotal === 0}
              startIcon={<Iconify icon="solar:cash-out-bold" width={22} />}
              onClick={onCollect}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.15rem',
                fontWeight: 900,
                borderRadius: 2.5,
                minWidth: 280,
                boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
                letterSpacing: '0.02em',
              }}
            >
              Collect Payment (Ctrl+Enter)
            </Button>
          )}

          {!student && (
            <Typography variant="body1" color="text.disabled" mt={2}>
              Search and select a student to begin collection
            </Typography>
          )}

          {/* Optional embedded content (e.g., fee selection) */}
          {children && <Box sx={{ width: '100%', maxWidth: 720, mt: 1 }}>{children}</Box>}
        </Box>
      </Box>
    </AnimatePresence>
  );
};

export default CounterModeLayout;
