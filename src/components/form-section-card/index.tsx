import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { Card, Stack } from '@mui/material';

import { FormSectionHeader, type FormSectionHeaderProps } from './section-header';

export { FormFieldSpacing } from './field-spacing';
export { FormSectionHeader } from './section-header';

interface FormSectionCardProps extends FormSectionHeaderProps {
  children?: ReactNode;
  contentSpacing?: number;
  contentSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
}

export function FormSectionCard({
  icon,
  iconSize,
  iconContainerSize,
  title,
  titleTypographyProps,
  description,
  descriptionTooltip,
  action,
  actionFullWidthOnMobile,
  children,
  contentSpacing = 2,
  contentSx,
  sx,
}: FormSectionCardProps) {
  return (
    <Card
      component="section"
      variant="outlined"
      sx={[{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack spacing={contentSpacing} sx={contentSx}>
        <FormSectionHeader
          icon={icon}
          iconSize={iconSize}
          iconContainerSize={iconContainerSize}
          title={title}
          titleTypographyProps={titleTypographyProps}
          description={description}
          descriptionTooltip={descriptionTooltip}
          action={action}
          actionFullWidthOnMobile={actionFullWidthOnMobile}
        />
        {children}
      </Stack>
    </Card>
  );
}
