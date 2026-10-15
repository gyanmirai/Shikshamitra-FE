import type { ReactNode } from 'react';

import { Card, Stack } from '@mui/material';

import { FormSectionHeader, type FormSectionHeaderProps } from './section-header';

export { FormSectionHeader } from './section-header';

interface FormSectionCardProps extends FormSectionHeaderProps {
  children?: ReactNode;
}

export function FormSectionCard({
  icon,
  iconSize,
  title,
  titleTypographyProps,
  description,
  descriptionTooltip,
  descriptionTooltipLabel,
  action,
  actionFullWidthOnMobile,
  children,
}: FormSectionCardProps) {
  return (
    <Card
      component="section"
      aria-labelledby={titleTypographyProps?.id}
      variant="outlined"
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
    >
      <Stack spacing={2}>
        <FormSectionHeader
          icon={icon}
          iconSize={iconSize}
          title={title}
          titleTypographyProps={titleTypographyProps}
          description={description}
          descriptionTooltip={descriptionTooltip}
          descriptionTooltipLabel={descriptionTooltipLabel}
          action={action}
          actionFullWidthOnMobile={actionFullWidthOnMobile}
        />
        {children}
      </Stack>
    </Card>
  );
}
