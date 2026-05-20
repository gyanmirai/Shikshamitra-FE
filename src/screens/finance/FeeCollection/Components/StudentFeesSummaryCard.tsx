import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Stack, Avatar, Divider, Typography } from '@mui/material';

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

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        ml: 0.25,
        mt: 0.25,
        mb: 1,
        p: { xs: 1.5, md: 1.75 },
        boxShadow: (t) => `0 6px 18px ${alpha(t.palette.common.black, 0.05)}`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.7)}`,
      }}
    >
      {showHeader && (
        <Grid container spacing={1.75} alignItems="center">
          {/* ── Student identity column ── */}
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              borderRight: (t) => ({ md: `1px solid ${alpha(t.palette.divider, 0.7)}` }),
              borderBottom: (t) => ({
                xs: `1px solid ${alpha(t.palette.divider, 0.7)}`,
                md: 'none',
              }),
              pr: { md: 2 },
              pb: { xs: 1.5, md: 0 },
              mb: { xs: 0.5, md: 0 },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    border: (t) => `1.5px solid ${alpha(t.palette.primary.main, 0.2)}`,
                    boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.07)}`,
                  }}
                >
                  {(student.name || 'Aarav Sharma')?.charAt(0).toUpperCase()}
                </Avatar>
              </motion.div>

              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '1rem', letterSpacing: '-0.01em' }}
                >
                  {student.name || 'Aarav Sharma'}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {student.grNumber || 'GR001'}
                  </Typography>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, alignSelf: 'center' }}
                  />

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {`${student.className || '10'}-${student.division || 'A'}`}
                  </Typography>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, alignSelf: 'center' }}
                  />

                  <Box
                    sx={{
                      px: 0.9,
                      py: 0.3,
                      borderRadius: 999,
                      bgcolor: (t) => alpha(t.palette.action.selected, 0.55),
                      border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Roll No : {student.rollNumber || '01'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* ── Summary stats column ── */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={1.25}
            >
              {[
                {
                  label: 'Total Fee',
                  value: student.totalFees || 45000,
                  color: 'primary' as const,
                },
                {
                  label: 'Paid',
                  value: student.paidFees || 30000,
                  color: 'success' as const,
                },
                {
                  label: 'Pending',
                  value: student.pendingFees || 15000,
                  color: 'warning' as const,
                },
                {
                  label: 'Concession',
                  value: student.concessionAmount || 2500,
                  color: 'info' as const,
                },
              ].map((item, index) => (
                <Box
                  component={motion.div}
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                  whileHover={{ y: -2, transition: { duration: 0.18 } }}
                  sx={{
                    p: 1.1,
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
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        fontSize: '0.68rem',
                        mb: 0.35,
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: (t) => t.palette[item.color].main,
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.2,
                      }}
                    >
                      {formatNumber(item.value ?? 0, 'INR')}
                    </Typography>
                  </Box>
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
