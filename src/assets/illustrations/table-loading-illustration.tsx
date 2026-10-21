import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';

import { TableLoadingScene } from './table-loading-scene';

export function TableLoadingIllustration({ sx }: { sx?: SxProps<Theme> }) {
  const theme = useTheme();
  const { palette } = theme.vars;

  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
      sx={[
        {
          width: 1,
          maxWidth: 160,
          height: 'auto',
          flexShrink: 0,
          '--student-search-accent': palette.primary.main,
          '--student-search-surface': palette.background.paper,
          '--student-search-outline': palette.text.primary,
          '--student-search-detail': palette.text.secondary,
          '--student-search-grid': palette.divider,
          '--student-search-backdrop': palette.background.neutral,
          '--student-loader-accent': palette.primary.main,
          '--student-loader-table': palette.background.paper,
          '--student-loader-border': palette.text.primary,
          '--student-loader-header': varAlpha(palette.primary.mainChannel, 0.12),
          '--student-loader-grid': palette.divider,
          '--student-loader-lens': palette.background.paper,
          '--student-loader-highlight': palette.text.secondary,
          '--student-loader-track': varAlpha(palette.primary.mainChannel, 0.15),
          ...theme.applyStyles('dark', {
            '--student-search-surface': palette.grey[100],
            '--student-search-outline': palette.grey[800],
            '--student-search-detail': palette.grey[600],
            '--student-search-grid': palette.grey[400],
            '--student-search-backdrop': varAlpha(palette.primary.mainChannel, 0.12),
            '--student-loader-accent': '#A4E279',
            '--student-loader-table': '#13232F',
            '--student-loader-border': '#718C9E',
            '--student-loader-header': '#183D3F',
            '--student-loader-grid': '#344A5B',
            '--student-loader-lens': '#132C37',
            '--student-loader-highlight': '#B4F4E4',
            '--student-loader-track': '#2A3A36',
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <TableLoadingScene />
    </Box>
  );
}
