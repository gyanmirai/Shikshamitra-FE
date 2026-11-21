import type { StockLocation } from 'src/redux/library/stock-verification-api';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

export function StockLocationFields({
  locations,
  sectionId,
  shelfId,
  blankSection,
  blankShelf = 'All shelves',
  sectionError,
  disabled,
  onChange,
}: {
  locations: StockLocation[];
  sectionId: string;
  shelfId: string;
  blankSection?: string;
  blankShelf?: string;
  sectionError?: string | false;
  disabled: boolean;
  onChange: (section: string, shelf: string) => void;
}) {
  const sections = blankSection
    ? [{ id: '', sectionName: blankSection, shelfDetails: [] }, ...locations]
    : locations;
  const shelves = locations.find((row) => row.id === sectionId)?.shelfDetails ?? [];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          name="sectionId"
          label="Section"
          fullWidth
          size="small"
          required={!blankSection}
          value={sectionId}
          options={sections}
          labelKey="sectionName"
          valueKey="id"
          disabled={disabled}
          error={Boolean(sectionError)}
          helperText={sectionError || undefined}
          onChange={(value) => onChange(String(value), '')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          name="shelfId"
          label="Shelf"
          fullWidth
          size="small"
          value={shelfId}
          options={[{ id: '', shelfName: blankShelf }, ...shelves]}
          labelKey="shelfName"
          valueKey="id"
          disabled={disabled || !sectionId}
          onChange={(value) => onChange(sectionId, String(value))}
        />
      </Grid>
    </Grid>
  );
}
