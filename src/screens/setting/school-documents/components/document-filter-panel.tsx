import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Stack, Button } from '@mui/material';

import { documentCategories } from '../types';

type DocumentFilterPanelProps = {
  category: number | undefined;
  hasCriteria: boolean;
  onCategoryChange: (category: number | undefined) => void;
  onClear: () => void;
};

export function DocumentFilterPanel({
  category,
  hasCriteria,
  onCategoryChange,
  onClear,
}: DocumentFilterPanelProps) {
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="School document filters"
      sx={{ p: 1, mb: 1, borderRadius: 2, flexShrink: 0 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CustomSelect
            label="Category"
            name="category"
            size="small"
            fullWidth
            value={category ?? 'all'}
            options={[{ value: 'all', label: 'All categories' }, ...documentCategories]}
            onChange={(value) => onCategoryChange(value === 'all' ? undefined : Number(value))}
          />
        </Box>
        {hasCriteria && (
          <Button size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
            Clear Filters
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
