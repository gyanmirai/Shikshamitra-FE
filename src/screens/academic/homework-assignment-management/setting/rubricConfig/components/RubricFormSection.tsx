import type { ReactNode } from 'react';

import { FormSectionCard } from 'src/components/form-section-card';

export const RubricFormSection = ({
  title,
  caption,
  icon,
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <FormSectionCard
    title={title}
    icon={icon}
    descriptionTooltip={caption}
    action={action}
    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    actionFullWidthOnMobile
  >
    {children}
  </FormSectionCard>
);
