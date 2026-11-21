import { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Button, TextField } from '@mui/material';

import type { CatalogView } from './catalog-query';

function CatalogSearch({
  initialValue,
  onSearch,
}: {
  initialValue: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (value === initialValue) return undefined;
    const timer = window.setTimeout(() => onSearch(value), 400);
    return () => window.clearTimeout(timer);
  }, [initialValue, onSearch, value]);
  return (
    <TextField
      fullWidth
      size="small"
      label="Search by title, author, or ISBN"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

export function CatalogControls({
  search,
  alphabet,
  view,
  update,
}: {
  search: string;
  alphabet: string;
  view: CatalogView;
  update: (changes: Record<string, string | number>) => void;
}) {
  return (
    <Box sx={{ p: 1, flexShrink: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
        <CatalogSearch
          key={search}
          initialValue={search}
          onSearch={(value) => update({ search: value, page: 1 })}
        />
        <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
          <CustomSelect
            label="View"
            name="catalogView"
            value={view}
            onChange={(value) => update({ view: String(value) })}
            options={[
              { value: 'list', label: 'List' },
              { value: 'cover', label: 'Cover' },
              { value: 'summary', label: 'Summary' },
            ]}
          />
        </Box>
      </Stack>
      <Box
        role="group"
        aria-label="Filter books by first letter"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
      >
        {['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => (
          <Button
            key={letter}
            type="button"
            size="small"
            color="inherit"
            aria-pressed={alphabet === letter}
            variant={alphabet === letter ? 'contained' : 'text'}
            onClick={() => update({ alphabet: letter, page: 1 })}
          >
            {letter === 'ALL' ? 'All' : letter}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
