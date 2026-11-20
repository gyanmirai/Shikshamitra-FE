import { GlobalIcons } from 'src/utils/icons';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { useSectionDraft } from './useSectionDraft';

export function SectionIdentityFields({ draft }: { draft: ReturnType<typeof useSectionDraft> }) {
  const { formik, busy, changeCount } = draft;
  const feedback = (name: 'sectionName' | 'numberOfColumns') => ({
    error: Boolean((formik.touched[name] || formik.submitCount > 0) && formik.errors[name]),
    helperText: formik.touched[name] || formik.submitCount > 0 ? formik.errors[name] : undefined,
  });
  return (
    <FormSectionCard
      title="Section Information"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Configure the section name and draft shelf count. Saved shelf replacement remains subject to stock checks."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={feedback('sectionName').error}>
            <TextField
              label="Section name"
              name="sectionName"
              required
              fullWidth
              size="small"
              value={formik.values.sectionName}
              disabled={busy}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              {...feedback('sectionName')}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={feedback('numberOfColumns').error}>
            <NumericFormatCustom
              label="Number of shelves"
              name="numberOfColumns"
              required
              fullWidth
              size="small"
              prefix=""
              suffix=""
              decimalScale={0}
              roundToWholeRupees={false}
              allowNegative={false}
              valueIsNumericString
              value={formik.values.numberOfColumns}
              disabled={busy}
              onBlur={formik.handleBlur}
              isAllowed={({ value }) => value === '' || Number(value) <= 50}
              onValueChange={({ value }, source) => {
                if (source.source === 'event') changeCount(value);
              }}
              {...feedback('numberOfColumns')}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
