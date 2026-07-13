import type { DashboardSummaryCardProps } from 'src/types/dashboard';

import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Typography } from '@mui/material';

export const DashboardSummaryCard = ({
  icon,
  title,
  count,
  color,
  href = '',
  labels = [],
}: DashboardSummaryCardProps) => (
  <Box
    component={Link}
    href={href}
    sx={{ textDecoration: 'none', height: '100%', display: 'block' }}
  >
    <Card
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z1 || 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: (theme) =>
          theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z8 || 4,
          borderColor: 'transparent',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.75rem',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {count}
          </Typography>
          {labels.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                pt: 1.5,
                borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                mt: 'auto',
              }}
            >
              {labels.map((label, labelIndex) => (
                <Box key={labelIndex} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 4,
                      height: 16,
                      bgcolor: (theme) => {
                        const colorKey = label.color === 'default' ? 'primary' : label.color;
                        return theme.palette[colorKey as 'primary']?.main || label.color;
                      },
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {label.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            color: (theme) =>
              color
                ? theme.palette[color.split('.')[0] as 'primary']?.main || color
                : 'text.primary',
            bgcolor: (theme) =>
              alpha(
                theme.palette[color.split('.')[0] as 'primary']?.main ||
                  theme.palette.background.paper,
                0.08
              ),
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={32} />
        </Box>
      </Box>
    </Card>
  </Box>
);

export const StudentEnrollmentCard = DashboardSummaryCard;
