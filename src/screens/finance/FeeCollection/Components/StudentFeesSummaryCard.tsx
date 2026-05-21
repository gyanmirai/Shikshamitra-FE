import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Avatar, Divider, Typography } from '@mui/material';

import type { IStudentFee } from './type';

export const StudentFeeSummaryCard: React.FC<{
  student: IStudentFee | null;
  showHeader?: boolean;
}> = ({ student, showHeader = true }) => {
  const theme = useTheme();

  if (!student) {
    return (
      <Card
        sx={{
          p: 2,
          textAlign: 'center',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No student data available
        </Typography>
      </Card>
    );
  }

  const feeStatusLabel = student.pendingFees === 0 ? 'Paid' : 'Pending';
  const feeStatusColor: LabelColor = feeStatusLabel === 'Paid' ? 'success' : 'warning';

  const kpis = [
    {
      label: 'Total Due',
      value: student.pendingFees || 0,
      color: 'primary' as const,
      icon: 'solar:wallet-bold',
    },
    {
      label: 'Paid This Year',
      value: student.paidFees || 0,
      color: 'success' as const,
      icon: 'solar:check-circle-bold',
    },
    {
      label: 'Upcoming Fees',
      value: Math.max(student.totalFees - student.paidFees - student.pendingFees, 0),
      color: 'warning' as const,
      icon: 'solar:calendar-bold',
    },
  ];

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: 2.75,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.25, md: 1.5 },
        boxShadow: (t) => `0 10px 24px ${alpha(t.palette.common.black, 0.06)}`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
      }}
    >
      {showHeader && (
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid
            size={{ xs: 12, lg: 4 }}
            sx={{
              borderRight: (t) => ({ lg: `1px solid ${alpha(t.palette.divider, 0.7)}` }),
              borderBottom: (t) => ({
                xs: `1px solid ${alpha(t.palette.divider, 0.7)}`,
                lg: 'none',
              }),
              pr: { lg: 1.75 },
              pb: { xs: 1.2, lg: 0 },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.4}>
              <Avatar
                src={student.profileImage}
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  border: (t) => `1.5px solid ${alpha(t.palette.primary.main, 0.2)}`,
                  boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.07)}`,
                }}
              >
                {(student.name || 'Aarav Sharma')?.charAt(0).toUpperCase()}
              </Avatar>

              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '1.03rem', letterSpacing: '-0.01em' }}
                  >
                    {student.name || 'Aarav Sharma'}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.6 }}
                >
                  Grade: {`${student.className || '10'}-${student.division || 'A'}`} • Admission:{' '}
                  {student.grNumber || 'GR001'}
                </Typography>

                <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Roll: {student.rollNumber || '01'}
                  </Typography>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, alignSelf: 'center' }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Parent: {student.parentName || 'N/A'}
                  </Typography>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, alignSelf: 'center' }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Contact: {student.contactNumber || 'N/A'}
                  </Typography>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, alignSelf: 'center' }}
                  />
                  <Label
                    color={feeStatusColor}
                    variant="soft"
                    sx={{ fontWeight: 700, lineHeight: 1 }}
                  >
                    {feeStatusLabel}
                  </Label>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              }}
              gap={1.05}
            >
              {kpis.map((item, index) => (
                <Box
                  component={motion.div}
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                  whileHover={{ y: -2, transition: { duration: 0.18 } }}
                  sx={{
                    p: 1.15,
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette[item.color].main, 0.05),
                    border: (t) => `1px solid ${alpha(t.palette[item.color].main, 0.16)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    cursor: 'default',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      boxShadow: (t) => `0 6px 16px ${alpha(t.palette[item.color].main, 0.12)}`,
                      borderColor: (t) => alpha(t.palette[item.color].main, 0.24),
                    },
                  }}
                >
                  <Box minWidth={0}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        fontSize: '0.7rem',
                        mb: 0.35,
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: (t) => t.palette[item.color].main,
                        fontWeight: 900,
                        fontSize: '1rem',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.2,
                      }}
                    >
                      {formatNumber(item.value ?? 0, 'INR')}
                    </Typography>
                  </Box>
                  <Iconify
                    icon={item.icon}
                    width={18}
                    sx={{ color: (t) => t.palette[item.color].main }}
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
        p: 2.25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
        boxShadow: (t) => `0 6px 18px ${alpha(t.palette.common.black, 0.05)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
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
