import type { LibraryStockSource } from 'src/redux/library/receiving-types';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { FormSectionCard } from 'src/components/form-section-card';
import { Grid, Alert, Stack, Button, TextField } from '@mui/material';

import { receivingSources } from '../receiving-field-state';
import { CirculationDateField } from '../../circulation/CirculationDateField';

import type { useStockImportDraft } from './useStockImportDraft';

export function StockImportFields({
  draft,
  disabled,
}: {
  draft: ReturnType<typeof useStockImportDraft>;
  disabled: boolean;
}) {
  const { formik, options, yearId } = draft;
  const { values } = formik;
  const available = options.isError ? undefined : options.currentData;
  const shelves =
    available?.sections.find((section) => section.id === values.sectionId)?.shelfDetails || [];
  const fieldError = (field: 'sectionId' | 'shelfId' | 'receivedOn' | 'source' | 'sourceName') =>
    formik.touched[field] ? formik.errors[field] : undefined;
  return (
    <FormSectionCard title="Destination and receipt" icon={GlobalIcons.calendar}>
      <Stack spacing={1.5}>
        {!yearId && (
          <Alert severity="info">
            Select an academic year in the application header to load destinations.
          </Alert>
        )}
        {options.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => options.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load the selected year’s destinations and categories.
          </Alert>
        )}
        {available && !available.sections.length && (
          <Alert severity="info">
            Choose an academic year with a section and shelf, or set up a location in Library
            Settings.
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              name="academicYearId"
              label="Academic year"
              fullWidth
              size="small"
              required
              value={yearId}
              labelKey="name"
              valueKey="id"
              options={options.data?.years || []}
              disabled={disabled || !options.data?.years.length}
              onChange={(value) =>
                formik.setValues({
                  ...values,
                  academicYearId: String(value),
                  sectionId: '',
                  shelfId: '',
                  categoryId: '',
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              name="sectionId"
              label="Section"
              fullWidth
              size="small"
              required
              value={values.sectionId}
              labelKey="sectionName"
              valueKey="id"
              options={available?.sections || []}
              disabled={disabled || !available?.sections.length}
              isLoading={options.isFetching}
              onChange={(value) =>
                formik.setValues({ ...values, sectionId: String(value), shelfId: '' })
              }
              onBlur={() => formik.setFieldTouched('sectionId', true)}
              error={Boolean(fieldError('sectionId'))}
              helperText={fieldError('sectionId')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              name="shelfId"
              label="Shelf"
              fullWidth
              size="small"
              required
              value={values.shelfId}
              labelKey="shelfName"
              valueKey="id"
              options={shelves}
              disabled={disabled || !shelves.length}
              onChange={(value) => formik.setFieldValue('shelfId', String(value))}
              onBlur={() => formik.setFieldTouched('shelfId', true)}
              error={Boolean(fieldError('shelfId'))}
              helperText={fieldError('shelfId')}
            />
          </Grid>
          {available?.canCreateTitles && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                name="categoryId"
                label="Category for new titles"
                fullWidth
                size="small"
                value={values.categoryId}
                labelKey="name"
                valueKey="id"
                disabled={disabled}
                options={[{ id: '', name: 'Choose a category' }, ...available.categories]}
                onChange={(value) => formik.setFieldValue('categoryId', String(value))}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CirculationDateField
              name="receivedOn"
              label="Default received on"
              value={parseDateOnly(values.receivedOn)}
              disabled={disabled}
              onChange={(date) => formik.setFieldValue('receivedOn', toDateOnly(date))}
              onBlur={() => formik.setFieldTouched('receivedOn', true)}
              error={fieldError('receivedOn')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              name="source"
              label="Stock source"
              required
              fullWidth
              size="small"
              value={values.source ?? ''}
              options={receivingSources}
              labelKey="name"
              valueKey="id"
              disabled={disabled}
              onChange={(value) =>
                formik.setFieldValue(
                  'source',
                  value === '' ? null : (Number(value) as LibraryStockSource)
                )
              }
              onBlur={() => formik.setFieldTouched('source', true)}
              error={Boolean(fieldError('source'))}
              helperText={fieldError('source')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              {...formik.getFieldProps('sourceName')}
              label="Supplier or donor"
              fullWidth
              size="small"
              disabled={disabled}
              error={Boolean(fieldError('sourceName'))}
              helperText={fieldError('sourceName')}
              slotProps={{ htmlInput: { maxLength: 256 } }}
            />
          </Grid>
        </Grid>
      </Stack>
    </FormSectionCard>
  );
}
