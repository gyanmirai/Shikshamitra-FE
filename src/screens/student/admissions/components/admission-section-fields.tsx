import type { ReactNode } from 'react';

import { Box, Grid, Stack } from '@mui/material';

import { parseFieldConfiguration } from '../form-dialog/form-field-presets';

type Field = { code: string; fieldType: number; validationJson?: string | null };
type Props<T extends Field> = {
  fields: T[];
  columns: number;
  renderField: (field: T) => ReactNode;
};

export function AdmissionSectionFields<T extends Field>({
  fields,
  columns,
  renderField,
}: Props<T>) {
  if (!fields.length) return null;
  const photos = fields.filter(
    (field) => parseFieldConfiguration(field.validationJson).format === 'photo'
  );
  const ordinaryFields = fields.filter((field) => !photos.includes(field));
  const count = Math.max(1, Math.min(columns, 4));

  return (
    <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
      <Grid container spacing={1} alignItems="flex-start">
        {!!photos.length && (
          <Grid size={{ xs: 12, md: 3, lg: 2.4 }} aria-label="Profile photos" sx={{ minWidth: 0 }}>
            <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }}>
              {photos.map((field) => (
                <Box key={field.code}>{renderField(field)}</Box>
              ))}
            </Stack>
          </Grid>
        )}
        {!!ordinaryFields.length && (
          <Grid
            size={{ xs: 12, md: photos.length ? 9 : 12, lg: photos.length ? 9.6 : 12 }}
            aria-label="Form fields"
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={(theme) => ({
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: `repeat(auto-fit, minmax(min(100%, max(240px, calc((100% - ${theme.spacing(count - 1)}) / ${count}))), 1fr))`,
                },
              })}
            >
              {ordinaryFields.map((field) => (
                <Box
                  key={field.code}
                  sx={{ minWidth: 0, gridColumn: field.fieldType === 1 ? '1 / -1' : undefined }}
                >
                  {renderField(field)}
                </Box>
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
