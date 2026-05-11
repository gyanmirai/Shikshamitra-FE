'use client';

import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const StyledLegendItem = styled(Box)(({ theme }) => ({
  gap: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: theme.typography.fontWeightMedium,
}));

export const StyledLegendDot = styled(Box)(() => ({
  width: 10,
  height: 10,
  flexShrink: 0,
  borderRadius: 3,
  backgroundColor: 'currentColor',
}));

// ----------------------------------------------------------------------

type Props = StackProps & {
  labels?: string[];
  colors?: string[];
  values?: (string | number)[];
  sublabels?: string[];
  icons?: React.ReactNode[];
};

export function ChartLegend({
  labels = [],
  colors = [],
  values,
  sublabels,
  icons,
  ...other
}: Props) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={2} {...other}>
      {labels.map((label, index) => (
        <Stack key={`${label}-${index}`} spacing={0.5}>
          <StyledLegendItem>
            {icons?.[index] ? (
              <Box
                component="span"
                sx={{ color: colors[index], '& svg, & img': { width: 18, height: 18 } }}
              >
                {icons[index]}
              </Box>
            ) : (
              <StyledLegendDot as="span" sx={{ color: colors[index] }} />
            )}
            <Box component="span" sx={{ flexShrink: 0, color: 'text.primary' }}>
              {label}
              {sublabels?.[index] && (
                <Box
                  component="span"
                  sx={{ ml: 0.5, color: 'text.disabled', typography: 'caption' }}
                >
                  ({sublabels[index]})
                </Box>
              )}
            </Box>
          </StyledLegendItem>
          {values?.[index] !== undefined && (
            <Box sx={{ typography: 'subtitle2', color: 'text.primary' }}>{values[index]}</Box>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
