import type { Palette } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';

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
    <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
      <Card
        sx={{
          p: 2,
          cursor: 'pointer',
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'var(--shadows-8)',
            transform: 'scale(1.03)',
          },
        }}
      >
        {/* Title & Dropdown Section */}
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box flex={2}>
            <Iconify icon={icon} width={44} height={44} color={get(theme.palette, color, '')} />
          </Box>
          <Box flex={10}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography flex={3} variant="subtitle1">
                {title}
              </Typography>
              {selectOptions.length > 0 && onSelectChange && (
                <Box flex={2}>
                  <CustomSelect
                    label={dropdownLabel}
                    options={selectOptions}
                    value={selectedValue}
                    onChange={(e) => onSelectChange(e as string)}
                    formControlProps={{ fullWidth: false }}
                  />
                </Box>
              )}
            </Box>

            {/* Count Section */}
            <Box display="flex" gap={2} alignItems="center">
              <Typography
                display="flex"
                justifyContent="flex-start"
                alignContent="flex-start"
                alignItems="flex-start"
                variant="h3"
                color="black"
              >
                {count}
              </Typography>
              {attendance !== '' && (
                <Typography
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                  color="black"
                >
                  <Typography variant="h3" component="span" fontWeight={700}>
                    {`/ ${attendance}`}
                  </Typography>
                  <Typography variant="body2" component="span" fontWeight={500} mr={0.5}>
                    % (Today Attendance)
                  </Typography>
                </Typography>
              )}
            </Box>

            {/* Labels Section */}
            {labels.length > 0 && (
              <Box display="flex" justifyContent="flex-start" width="100%" mt={1}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                  {labels.map((label) => (
                    <Label key={label.name} color={label.color}>
                      {`${label.name} : ${label.value}`}
                    </Label>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
