import type { ReactNode } from 'react';

import { Box, Grid, Stack } from '@mui/material';
import { FormFieldSpacing } from 'src/components/form-section-card';

import { hasBoardClassOptions } from '../admission-academic-options';
import { parseFieldConfiguration } from '../form-dialog/form-field-presets';

type Field = {
  code: string;
  fieldType: number;
  validationJson?: string | null;
  optionsJson?: string | null;
};
type Props<T extends Field> = {
  fields: T[];
  columns: number;
  spacing?: number;
  fullWidthFieldTypes?: readonly number[];
  renderField: (field: T) => ReactNode;
};

export function AdmissionSectionFields<T extends Field>({
  fields,
  columns,
  spacing = 2,
  fullWidthFieldTypes = [1],
  renderField,
}: Props<T>) {
  if (!fields.length) return null;
  const photos = fields.filter(
    (field) => parseFieldConfiguration(field.validationJson).format === 'photo'
  );
  const ordinaryFields = fields.filter((field) => !photos.includes(field));
  const count = Math.max(1, Math.min(columns, 4));
  // Segmented identity inputs need room for all characters and their group gaps.
  // Let the grid use fewer columns rather than squeezing adjacent identifiers.
  const minimumFieldWidth = ordinaryFields.reduce((minimum, field) => {
    const { format } = parseFieldConfiguration(field.validationJson);
    return Math.max(minimum, format === 'aadhaar' ? 420 : format === 'pan' ? 340 : 240);
  }, 240);

  return (
    <Grid component={FormFieldSpacing} size={{ xs: 12 }} sx={{ minWidth: 0 }}>
      <Grid container spacing={spacing} alignItems="flex-start">
        {!!photos.length && (
          <Grid size={{ xs: 12, md: 3, lg: 2.4 }} aria-label="Profile photos" sx={{ minWidth: 0 }}>
            <Stack spacing={spacing} alignItems={{ xs: 'flex-start', md: 'center' }}>
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
                gap: spacing,
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: `repeat(auto-fit, minmax(min(100%, max(${minimumFieldWidth}px, calc((100% - ${theme.spacing((count - 1) * spacing)}) / ${count}))), 1fr))`,
                },
              })}
            >
              {ordinaryFields.map((field) => (
                <Box
                  key={field.code}
                  sx={{
                    minWidth: 0,
                    gridColumn:
                      fullWidthFieldTypes.includes(field.fieldType) || hasBoardClassOptions(field)
                        ? '1 / -1'
                        : undefined,
                  }}
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
