import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Stack, Avatar, Divider, Typography } from '@mui/material';

import type { IStudentFee } from './type';

export const StudentFeeSummaryCard: React.FC<{
  student: IStudentFee | null;
  showHeader?: boolean;
}> = ({ student, showHeader = true }) => {
  if (!student) {
    return (
      <Card sx={{ p: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No student data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        ml: 0.5,
        mt: 0.5,
        mb: 1,
        p: 1,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {showHeader && (
        <Grid container spacing={1} alignItems="center">
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              borderRight: (theme) => ({ md: `1px dashed ${theme.palette.divider}` }),
              borderBottom: (theme) => ({ xs: `1px dashed ${theme.palette.divider}`, md: 'none' }),
              pr: { md: 1 },
              pb: { xs: 1, md: 0 },
              mb: { xs: 1, md: 0 },
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                  }}
                >
                  {student.name?.charAt(0).toUpperCase()}
                </Avatar>
              </motion.div>

              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {student.name}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {student.grNumber}
                    </Typography>
                  </Stack>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 14, alignSelf: 'center' }}
                  />

                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {student.className && student.division
                        ? `${student.className}-${student.division}`
                        : 'N/A'}
                    </Typography>
                  </Stack>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 14, alignSelf: 'center' }}
                  />

                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 0.5,
                        bgcolor: 'action.selected',
                        color: 'text.secondary',
                      }}
                    >
                      Roll No : {student.rollNumber ?? '-'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={2}
            >
              {[
                {
                  label: 'Total Fee',
                  value: student.totalFees,
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                  icon: 'solar:wallet-money-outline',
                },
                {
                  label: 'Paid',
                  value: student.paidFees,
                  color: 'success.main',
                  bgcolor: 'success.lighter',
                  icon: 'solar:verified-check-outline',
                },
                {
                  label: 'Pending',
                  value: student.pendingFees,
                  color: 'warning.main',
                  bgcolor: 'warning.lighter',
                  icon: 'solar:clock-circle-outline',
                },
                {
                  label: 'Concession',
                  value: student.concessionAmount,
                  color: 'info.main',
                  bgcolor: 'info.lighter',
                  icon: 'solar:verified-check-outline',
                },
              ].map((item, index) => (
                <Box
                  component={motion.div}
                  key={index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
                  whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      alpha((theme.palette as any)[item.color.split('.')[0]].main, 0.04),
                    borderLeft: (theme) =>
                      `3px solid ${(theme.palette as any)[item.color.split('.')[0]].main}`,
                    boxShadow: (theme) => theme.customShadows?.z1 || 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'default',
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        mb: 0.5,
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1rem' }}
                    >
                      {formatNumber(item.value ?? 0, 'INR')}
                    </Typography>
                  </Box>

                  <Iconify
                    icon={item.icon}
                    width={25}
                    sx={{
                      color: item.color,
                      filter: (theme) =>
                        `drop-shadow(0 4px 8px ${alpha((theme.palette as any)[item.color.split('.')[0]].main, 0.24)})`,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
    </Card>
  );
};

interface ILabel {
  name: string;
  color: LabelColor;
}

export interface IStudentEnrollmentCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: ILabel[];
  index?: number;
}

export const FinanceCollectionCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  index,
}: IStudentEnrollmentCardProps) => (
  <Box
    component={Link}
    href={href}
    sx={{ textDecoration: 'none', width: '100%', minWidth: '200px' }}
  >
    <Card
      sx={{
        p: 2.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z8 || 4,
          borderColor: color,
        },
      }}
    >
      <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
          {count}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {labels.map((label, idx) => (
            <Label
              key={idx}
              color={label.color}
              variant="filled"
              sx={{
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          bgcolor: (theme) => alpha(color, 0.12),
        }}
      >
        <Iconify icon={icon} width={28} />
      </Box>

      {/* Decorative background circle */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(color, 0.04),
          pointerEvents: 'none',
        }}
      />
    </Card>
  </Box>
);
