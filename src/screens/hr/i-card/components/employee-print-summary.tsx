import type {
  IdentityCardLayout,
  IdentityCardPrintSettings,
} from 'src/components/identity-card-designer';

import { GlobalIcons } from 'src/utils/icons';
import { Alert, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { getIdentityCardSheetLayout } from 'src/components/identity-card-designer';

export function EmployeePrintSummary({
  layout,
  settings,
  backSideEnabled,
}: {
  layout: IdentityCardLayout;
  settings: IdentityCardPrintSettings;
  backSideEnabled: boolean;
}) {
  const sheet = getIdentityCardSheetLayout(layout, settings);
  return (
    <FormSectionCard
      title="Print Output"
      icon={GlobalIcons.printer}
      descriptionTooltip="Card size is fixed in millimetres. Sheet capacity changes with margins, gaps, and bleed."
    >
      <Stack spacing={1}>
        <Typography variant="body2">
          Trim size: {layout.widthMm} × {layout.heightMm} mm
        </Typography>
        <Typography variant="body2">
          {settings.pageSize === 'Card'
            ? `One card per page. PDF page size: ${(layout.widthMm + settings.bleedMm * 2).toFixed(2)} × ${(layout.heightMm + settings.bleedMm * 2).toFixed(2)} mm, including ${settings.bleedMm} mm bleed on each edge.`
            : `${sheet.columns} columns × ${sheet.rows} rows; ${sheet.effectiveCardsPerPage} cards per A4 sheet (capacity ${sheet.capacity}).`}
        </Typography>
        <Typography variant="body2">
          Sides:{' '}
          {settings.sideMode === 'front' || !backSideEnabled
            ? 'Front only'
            : settings.sideMode === 'back'
              ? 'Back only'
              : 'Front and back'}
          .
        </Typography>
        {backSideEnabled && (
          <Typography variant="caption" color="text.secondary">
            Duplex: {settings.duplexFlip}, back rotation {settings.backRotation}°, offset{' '}
            {settings.backOffsetXmm} / {settings.backOffsetYmm} mm.
          </Typography>
        )}
        {sheet.errors.map((error) => (
          <Alert key={error} severity="error">
            {error}
          </Alert>
        ))}
        {!backSideEnabled && settings.sideMode === 'back' && (
          <Alert severity="error">
            Enable the back side or choose front output before exporting.
          </Alert>
        )}
      </Stack>
    </FormSectionCard>
  );
}
