import { Icon } from '@iconify/react';
import { Box, Card, Stack, Typography, CardContent, CardActionArea } from '@mui/material';

import type { ReportSubCategory } from './types';

export function ReportChoiceCard({ report, selected, onSelect }: {
  report: ReportSubCategory; selected: boolean; onSelect: (report: ReportSubCategory) => void;
}) {
  return <Card sx={{ mb: 1, border: '1px solid', borderColor: selected ? 'primary.main' : 'transparent', boxShadow: selected ? 4 : 1,
    transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
    <CardActionArea onClick={() => onSelect(report)} aria-pressed={selected} aria-label={report.name}
      sx={{ '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 } }}>
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ borderRadius: 1, color: selected ? 'primary.main' : 'text.primary', display: 'flex' }}>
            <Icon icon="proicons:document" width={24} />
          </Box>
          <Stack spacing={0} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ px: 1, maxWidth: '100%', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {report.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ pl: 1, display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {report.description}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>;
}
