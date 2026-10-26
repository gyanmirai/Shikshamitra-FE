import type { ReactNode } from 'react';

import { Grid } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function SubstitutionFormSection({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <FormSectionCard title={title} icon={icon} descriptionTooltip={description}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </FormSectionCard>
  );
}
