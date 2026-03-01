'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import Typography from '@mui/material/Typography';
import { studentPaths } from 'src/constants/student-menu';
import { financePaths } from 'src/constants/finance-menu';
import { libraryPaths } from 'src/constants/library-menus';
import { transportPaths } from 'src/constants/transport-menu';

// ----------------------------------------------------------------------

const ACTION_REQUIRED = [
  {
    title: 'Pending Admission Approvals',
    module: 'Student Enrollment',
    count: 14,
    icon: 'solar:user-plus-bold',
    color: 'info' as const,
    path: studentPaths.enrollment.admission,
  },
  {
    title: 'Pending Fee Reconciliation',
    module: 'Finance',
    count: 8,
    icon: 'solar:bill-list-bold',
    color: 'warning' as const,
    path: financePaths.reconciliation,
  },
  {
    title: 'Staff Leave Approvals',
    module: 'HR',
    count: 6,
    icon: 'solar:calendar-bold',
    color: 'error' as const,
    path: hrPaths.attendance.leaveManagement,
  },
  {
    title: 'Transport Applications',
    module: 'Transport',
    count: 11,
    icon: 'solar:bus-bold',
    color: 'primary' as const,
    path: transportPaths.applicationManagement,
  },
  {
    title: 'Library Fine Approvals',
    module: 'Library',
    count: 5,
    icon: 'solar:book-2-bold',
    color: 'success' as const,
    path: libraryPaths.charges,
  },
];

// ----------------------------------------------------------------------

type ActionCardProps = (typeof ACTION_REQUIRED)[0];

function ActionRequiredCard({ title, module: mod, count, icon, color, path }: ActionCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on tooltip
    if ((e.target as HTMLElement).closest('.tooltip-icon')) return;

    if (path) {
      setIsLoading(true);
      router.push(path);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          p: 2,
          height: '100%',
          borderRadius: '16px',
          border: `1px solid`,
          borderColor: `${color}.lighter`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            bgcolor: `${color}.main`,
            borderRadius: '16px 0 0 16px',
          },
        }}
      >
        <Stack spacing={1.5}>
          {/* Top row: icon + badge */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                borderRadius: '12px',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${color}.main`,
                bgcolor: (t: any) => {
                  const ch = t.palette[color]?.mainChannel || '37 99 235';
                  return `rgba(${ch} / 0.12)`;
                },
              }}
            >
              <Iconify icon={icon} width={24} />
            </Box>
            <Chip
              label={`${count} Pending`}
              size="small"
              color={color}
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Stack>

          {/* Title + module */}
          <Stack spacing={0.25}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {mod}
            </Typography>
          </Stack>

          {/* Action button */}
          <LoadingButton
            size="small"
            variant="soft"
            color={color}
            fullWidth
            onClick={handleClick}
            sx={{ borderRadius: '10px', mt: 'auto' }}
            endIcon={<Iconify icon="solar:arrow-right-bold" width={14} />}
            loading={isLoading}
          >
            Review Now
          </LoadingButton>
        </Stack>
      </Card>
    </motion.div>
  );
}

// ----------------------------------------------------------------------

const AdminActionRequired = () => (
  <Box
    sx={{
      display: 'grid',
      gap: 1,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(5, 1fr)',
      },
    }}
  >
    {ACTION_REQUIRED.map((item, idx) => (
      <ActionRequiredCard key={idx} {...item} />
    ))}
  </Box>
);

export default AdminActionRequired;
