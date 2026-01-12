import type { LabelColor } from 'src/components/label';
import type { Palette, PaletteColorOptions } from '@mui/material/styles';

import React from 'react';
import Link from 'next/link';
import { get } from 'lodash';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

interface IPrincipalDashboardCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: keyof Palette;
  href?: string;
  labels?: { name: string; color: LabelColor; value: number | string }[];
  selectOptions?: { value: string; label: string }[];
  selectedValue?: string;
  onSelectChange?: (value: string) => void;
  dropdownLabel?: string;
  attendance?: string;
}

export function PrincipalDashboardCard({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  selectOptions = [],
  selectedValue = '',
  onSelectChange,
  dropdownLabel = '',
  attendance = '',
}: IPrincipalDashboardCardProps) {
  const theme = useTheme();

  return (
    <Box
      component={Link}
      href={href}
      sx={{ textDecoration: 'none', height: '100%', display: 'block' }}
    >
      <Card
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: 'transparent',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              color: get(theme.palette, color, 'primary.main'),
              bgcolor: bgColor === 'primary' ? 'primary.lighter' : `${bgColor}.lighter`,
              boxShadow: `0 8px 16px 0 ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.24)' : theme.palette.augmentColor({ color: { main: get(theme.palette, color, '#000') } as PaletteColorOptions }).main}33`,
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={32} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header / Title + Dropdown */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.75rem',
                  mt: 0.5,
                }}
              >
                {title}
              </Typography>

              {selectOptions.length > 0 && onSelectChange && (
                <Box sx={{ minWidth: 120 }}>
                  <CustomSelect
                    label={dropdownLabel}
                    options={selectOptions}
                    value={selectedValue}
                    onChange={(e) => onSelectChange(e as string)}
                    formControlProps={{
                      fullWidth: true,
                      size: 'small',
                      sx: { '& .MuiInputBase-root': { fontSize: '0.8125rem' } },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Main Value */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {count}
              </Typography>

              {attendance && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    color: 'text.secondary',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    / {attendance}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    % (Today)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Labels / Footer */}
            {labels.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  pt: 2,
                  borderTop: `1px dashed ${theme.palette.divider}`,
                  mt: 'auto',
                }}
              >
                {labels.map((label) => (
                  <Label
                    key={label.name}
                    color={label.color}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 1,
                    }}
                  >
                    {label.name}: {label.value}
                  </Label>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
