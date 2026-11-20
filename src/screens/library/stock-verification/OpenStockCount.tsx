'use client';

import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hooks';
import { libraryPaths } from 'src/constants/library-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { toDateOnly, parseDateOnly, formatDateOnly } from 'src/utils/date-only';
import { Box, Grid, Alert, Stack, Button, TextField, Typography } from '@mui/material';

import { useOpenStockCount } from './useOpenStockCount';
import { StockLocationFields } from './StockLocationFields';
import { stockCopyStatus } from './stock-verification-labels';
import { CirculationDateField } from '../circulation/CirculationDateField';

export default function OpenStockCount() {
  const router = useRouter();
  const draft = useOpenStockCount((id) =>
    router.replace(`${libraryPaths.stockVerification}/${encodeURIComponent(id)}`)
  );
  const { formik, locations, busy, preview, retry } = draft;
  const guard = useUnsavedNavigation(formik.dirty && !draft.opened, {
    push: router.push,
    blockNavigation: busy,
    description: retry
      ? 'The count may already be open. Retry here or check the register before opening another count.'
      : undefined,
  });
  const disabled = busy || Boolean(retry) || draft.opened || !locations.data;
  const fieldError = (name: keyof typeof formik.values) =>
    Boolean(formik.touched[name]) && formik.errors[name];

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Open a Stock Count"
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Stock Verification', href: libraryPaths.stockVerification },
          { name: 'Open a Count' },
        ]}
        sx={{ px: 1 }}
      />
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        aria-busy={busy}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          {locations.isLoading && <Typography role="status">Loading count locations…</Typography>}
          {locations.isError && (
            <Alert severity="error" action={<Button onClick={locations.refetch}>Retry</Button>}>
              Could not load count locations.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...formik.getFieldProps('name')}
                label="Count name"
                required
                size="small"
                fullWidth
                disabled={disabled}
                error={Boolean(fieldError('name'))}
                helperText={fieldError('name')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CirculationDateField
                name="schoolDate"
                label="School date"
                value={parseDateOnly(formik.values.schoolDate)}
                required={!locations.data?.schoolDate}
                disabled={disabled}
                error={fieldError('schoolDate')}
                helperText={
                  locations.data?.schoolDate
                    ? `Default school date: ${formatDateOnly(locations.data.schoolDate)}`
                    : undefined
                }
                onChange={(value) => formik.setFieldValue('schoolDate', toDateOnly(value))}
                onBlur={() => formik.setFieldTouched('schoolDate', true)}
              />
            </Grid>
          </Grid>
          <StockLocationFields
            locations={locations.data?.sections ?? []}
            sectionId={formik.values.sectionId}
            shelfId={formik.values.shelfId}
            blankSection={locations.data?.canCountWholeSchool ? 'Whole school' : undefined}
            sectionError={fieldError('sectionId')}
            disabled={disabled}
            onChange={(sectionId, shelfId) =>
              formik.setValues({ ...formik.values, sectionId, shelfId })
            }
          />
          {draft.error && <Alert severity="error">{draft.error}</Alert>}
          {preview && (
            <Stack spacing={0.5} aria-live="polite">
              <Typography variant="subtitle2">
                {preview.expectedCopyCount} expected copies
              </Typography>
              <Typography variant="body2">
                School date {formatDateOnly(preview.schoolDate)}
              </Typography>
              {preview.statusTotals.map((row) => (
                <Typography key={row.copyStatus} variant="body2">
                  {stockCopyStatus(row.copyStatus)} · {row.count}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}
        >
          <Button
            disabled={busy}
            onClick={() =>
              guard.requestNavigation(() => router.push(libraryPaths.stockVerification))
            }
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="outlined"
            size="small"
            disabled={disabled}
            loading={draft.previewLoading}
          >
            Preview count
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="contained"
            size="small"
            disabled={!draft.canSubmit}
            loading={draft.openLoading}
            onClick={draft.open}
          >
            {retry ? 'Retry opening count' : 'Open count'}
          </LoadingButton>
        </Stack>
      </Box>
      {guard.confirmation}
    </Box>
  );
}
