import { startCase } from 'lodash';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import type { IParams } from '../types';

interface FilterChipsProps {
  filters: IParams['filters'];
  onRemoveFilter: (index: number) => void;
  onClearAll: () => void;
}

export const FilterChips = ({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) => {
  if (filters.length === 0) return null;

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Active Filters:
      </Typography>

      {filters.map((filter, index) => (
        <Chip
          key={index}
          size="small"
          variant="soft"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {filter.label} →
              </Box>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {startCase(filter.type)} →
              </Box>
              <Box component="span" sx={{ color: 'text.primary' }}>
                {filter.value}
              </Box>
            </Box>
          }
          onDelete={() => onRemoveFilter(index)}
          sx={{ borderRadius: 1 }}
        />
      ))}

      <Button
        size="small"
        color="error"
        startIcon={
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: '16px', height: '16px' }} />
        }
        onClick={onClearAll}
        sx={{ alignItems: 'center', height: '100%' }}
      >
        {`Clear (${filters.length})`}
      </Button>
    </Stack>
  );
};
